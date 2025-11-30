/**
 * Configuration Google OAuth 2.0 avec Passport.js
 */

const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const { encrypt, decrypt } = require('./crypto')

/**
 * Configure Passport avec la stratégie Google OAuth
 * @param {object} db - Client Redis
 */
function configureGoogleAuth(db) {
	// Sérialisation de l'utilisateur pour la session
	passport.serializeUser((user, done) => {
		done(null, user.identifiant)
	})

	// Désérialisation de l'utilisateur depuis la session
	passport.deserializeUser((identifiant, done) => {
		db.hgetall(`utilisateurs:${identifiant}`, (err, utilisateur) => {
			if (err) return done(err)
			if (!utilisateur) return done(null, false)

			// Déchiffrer les tokens si présents
			if (utilisateur.googleAccessToken) {
				utilisateur.googleAccessToken = decrypt(utilisateur.googleAccessToken)
			}
			if (utilisateur.googleRefreshToken) {
				utilisateur.googleRefreshToken = decrypt(utilisateur.googleRefreshToken)
			}

			done(null, utilisateur)
		})
	})

	// Configuration de la stratégie Google OAuth 2.0
	passport.use(new GoogleStrategy({
		clientID: process.env.GOOGLE_CLIENT_ID,
		clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		callbackURL: process.env.GOOGLE_CALLBACK_URL,
		scope: [
			'openid',
			'profile',
			'email',
			'https://www.googleapis.com/auth/classroom.courses.readonly',
			'https://www.googleapis.com/auth/classroom.rosters.readonly',
			'https://www.googleapis.com/auth/classroom.coursework.students'
		],
		accessType: 'offline',
		prompt: 'consent'
	},
	async (accessToken, refreshToken, profile, done) => {
		try {
			const googleId = profile.id
			const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null
			const nom = profile.displayName || 'Utilisateur Google'

			// Chercher si un utilisateur avec ce googleId existe déjà
			db.get(`google:${googleId}`, async (err, identifiant) => {
				if (err) return done(err)

				let utilisateur

				if (identifiant) {
					// Utilisateur existant - mettre à jour les tokens
					db.hgetall(`utilisateurs:${identifiant}`, async (err, user) => {
						if (err) return done(err)

						utilisateur = user

						// Mettre à jour les tokens
						const updates = {
							googleAccessToken: encrypt(accessToken),
							googleTokenExpiry: Date.now() + 3600000 // 1 heure
						}

						if (refreshToken) {
							updates.googleRefreshToken = encrypt(refreshToken)
						}

						db.hmset(`utilisateurs:${identifiant}`, updates, (err) => {
							if (err) return done(err)
							utilisateur.googleAccessToken = accessToken
							utilisateur.googleRefreshToken = refreshToken || utilisateur.googleRefreshToken
							done(null, utilisateur)
						})
					})
				} else {
					// Nouvel utilisateur - créer le compte
					const nouvelIdentifiant = 'u' + Math.random().toString(16).slice(3)
					const date = new Date().toISOString()

					utilisateur = {
						id: nouvelIdentifiant,
						identifiant: nouvelIdentifiant,
						nom: nom,
						email: email,
						googleId: googleId,
						googleAccessToken: encrypt(accessToken),
						googleRefreshToken: encrypt(refreshToken),
						googleTokenExpiry: Date.now() + 3600000,
						statut: 'utilisateur',
						motdepasse: '',
						date: date,
						langue: 'fr',
						affichage: 'liste',
						filtre: 'date-asc'
					}

					// Sauvegarder l'utilisateur dans Redis (format Digipad standard)
					db.hmset(`utilisateurs:${nouvelIdentifiant}`, utilisateur, (err) => {
						if (err) return done(err)

						// Créer l'index googleId -> identifiant
						db.set(`google:${googleId}`, nouvelIdentifiant, (err) => {
							if (err) return done(err)

							utilisateur.googleAccessToken = accessToken
							utilisateur.googleRefreshToken = refreshToken
							done(null, utilisateur)
						})
					})
				}
			})
		} catch (error) {
			console.error('Erreur lors de l\'authentification Google:', error)
			done(error)
		}
	}))

	return passport
}

module.exports = configureGoogleAuth
