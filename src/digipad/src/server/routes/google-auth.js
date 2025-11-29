/**
 * Routes d'authentification Google OAuth
 */

const classroomService = require('../services/classroom')
const { encrypt } = require('../auth/crypto')

/**
 * Configure les routes d'authentification Google
 * @param {object} app - Application Express
 * @param {object} passport - Instance Passport
 * @param {object} db - Client Redis
 */
function setupGoogleAuthRoutes(app, passport, db) {

	// Route de démarrage de l'authentification Google
	app.get('/auth/google',
		passport.authenticate('google', {
			scope: [
				'openid',
				'profile',
				'email',
				'https://www.googleapis.com/auth/classroom.courses.readonly',
				'https://www.googleapis.com/auth/classroom.rosters.readonly',
				'https://www.googleapis.com/auth/classroom.announcements'
			],
			accessType: 'offline',
			prompt: 'consent'
		})
	)

	// Callback après authentification Google
	app.get('/auth/google/callback',
		passport.authenticate('google', { failureRedirect: '/' }),
		(req, res) => {
			// Stocker les informations dans la session
			req.session.identifiant = req.user.identifiant
			req.session.nom = req.user.nom
			req.session.email = req.user.email
			req.session.statut = 'utilisateur'
			req.session.pads = JSON.parse(req.user.pads || '[]')
			req.session.cookie.expires = new Date(Date.now() + (parseInt(process.env.SESSION_DURATION) || 864000000))

			// Rediriger vers le tableau de bord
			res.redirect(`/u/${req.user.identifiant}`)
		}
	)

	// Déconnexion Google
	app.post('/api/google/disconnect', (req, res) => {
		const identifiant = req.session.identifiant

		if (!identifiant) {
			return res.json({ resultat: 0, message: 'Non authentifié' })
		}

		// Supprimer les informations Google de l'utilisateur
		db.hdel(`utilisateur:${identifiant}`,
			'googleId',
			'googleAccessToken',
			'googleRefreshToken',
			'googleTokenExpiry',
			'classes',
			(err) => {
				if (err) {
					return res.json({ resultat: 0, message: 'Erreur lors de la déconnexion' })
				}

				// Supprimer l'index google:id
				db.hget(`utilisateur:${identifiant}`, 'googleId', (err, googleId) => {
					if (!err && googleId) {
						db.del(`google:${googleId}`)
					}
				})

				res.json({ resultat: 1, message: 'Compte Google déconnecté' })
			}
		)
	})

	// Récupérer les classes Google Classroom
	app.post('/api/google/classes', async (req, res) => {
		const identifiant = req.session.identifiant

		if (!identifiant) {
			return res.json({ resultat: 0, message: 'Non authentifié' })
		}

		db.hgetall(`utilisateur:${identifiant}`, async (err, utilisateur) => {
			if (err || !utilisateur) {
				return res.json({ resultat: 0, message: 'Utilisateur non trouvé' })
			}

			if (!utilisateur.googleAccessToken) {
				return res.json({ resultat: 0, message: 'Compte Google non connecté' })
			}

			try {
				const { decrypt } = require('../auth/crypto')
				const accessToken = decrypt(utilisateur.googleAccessToken)
				const refreshToken = decrypt(utilisateur.googleRefreshToken)

				// Vérifier si le token est expiré
				const now = Date.now()
				const expiry = parseInt(utilisateur.googleTokenExpiry || 0)

				let currentAccessToken = accessToken

				if (now >= expiry) {
					// Rafraîchir le token
					const newTokens = await classroomService.refreshAccessToken(refreshToken)
					currentAccessToken = newTokens.accessToken

					// Mettre à jour dans Redis
					db.hmset(`utilisateur:${identifiant}`, {
						googleAccessToken: encrypt(currentAccessToken),
						googleTokenExpiry: newTokens.expiryDate
					})
				}

				// Récupérer les classes
				const courses = await classroomService.listCourses(currentAccessToken, refreshToken)

				// Sauvegarder dans Redis
				db.hset(`utilisateur:${identifiant}`, 'classes', JSON.stringify(courses))

				res.json({ resultat: 1, classes: courses })
			} catch (error) {
				console.error('Erreur lors de la récupération des classes:', error)
				res.json({ resultat: 0, message: 'Erreur lors de la récupération des classes' })
			}
		})
	})

	// Récupérer les étudiants d'une classe
	app.post('/api/google/students', async (req, res) => {
		const identifiant = req.session.identifiant
		const { courseId } = req.body

		if (!identifiant) {
			return res.json({ resultat: 0, message: 'Non authentifié' })
		}

		if (!courseId) {
			return res.json({ resultat: 0, message: 'ID de classe manquant' })
		}

		db.hgetall(`utilisateur:${identifiant}`, async (err, utilisateur) => {
			if (err || !utilisateur) {
				return res.json({ resultat: 0, message: 'Utilisateur non trouvé' })
			}

			if (!utilisateur.googleAccessToken) {
				return res.json({ resultat: 0, message: 'Compte Google non connecté' })
			}

			try {
				const { decrypt } = require('../auth/crypto')
				const accessToken = decrypt(utilisateur.googleAccessToken)
				const refreshToken = decrypt(utilisateur.googleRefreshToken)

				const students = await classroomService.listStudents(accessToken, refreshToken, courseId)

				res.json({ resultat: 1, students })
			} catch (error) {
				console.error('Erreur lors de la récupération des étudiants:', error)
				res.json({ resultat: 0, message: 'Erreur lors de la récupération des étudiants' })
			}
		})
	})

	// Partager un pad avec une classe Google Classroom
	app.post('/api/google/share-pad', async (req, res) => {
		const identifiant = req.session.identifiant
		const { courseId, padId, padTitle, courseName, courseColor } = req.body

		if (!identifiant) {
			return res.json({ resultat: 0, message: 'Non authentifié' })
		}

		if (!courseId || !padId) {
			return res.json({ resultat: 0, message: 'Données manquantes (courseId, padId)' })
		}

		db.hgetall(`utilisateur:${identifiant}`, async (err, utilisateur) => {
			if (err || !utilisateur) {
				return res.json({ resultat: 0, message: 'Utilisateur non trouvé' })
			}

			if (!utilisateur.googleAccessToken) {
				return res.json({ resultat: 0, message: 'Compte Google non connecté' })
			}

			try {
				const { decrypt } = require('../auth/crypto')
				const accessToken = decrypt(utilisateur.googleAccessToken)
				const refreshToken = decrypt(utilisateur.googleRefreshToken)

				// Construire l'URL du pad
				const domain = process.env.DOMAIN || 'http://localhost:3000'
				const padUrl = `${domain}/p/${padId}`

				// Créer une annonce dans Google Classroom avec le lien du pad
				const announcement = await classroomService.createAnnouncement(
					accessToken,
					refreshToken,
					courseId,
					{
						text: `Nouveau pad partagé : ${padTitle || 'Pad collaboratif'}\n\nAccédez au pad ici : ${padUrl}`,
						link: {
							url: padUrl,
							title: padTitle || 'Pad Digipad'
						}
					}
				)

				// Sauvegarder l'info Google Classroom dans le pad (tableau de classes)
				if (courseName) {
					// Récupérer les classes existantes
					db.hget(`pads:${padId}`, 'googleClassrooms', (err, existingClassrooms) => {
						let classrooms = []
						if (!err && existingClassrooms) {
							try {
								classrooms = JSON.parse(existingClassrooms)
							} catch (e) {
								classrooms = []
							}
						}

						// Vérifier si la classe n'est pas déjà ajoutée
						const alreadyAdded = classrooms.some(c => c.courseId === courseId)
						if (!alreadyAdded) {
							classrooms.push({
								courseId: courseId,
								name: courseName,
								color: courseColor || '#1967D2'
							})
							db.hset(`pads:${padId}`, 'googleClassrooms', JSON.stringify(classrooms))
						}

						// Pour rétrocompatibilité, mettre à jour aussi googleClassroom avec le dernier nom
						db.hset(`pads:${padId}`, 'googleClassroom', courseName)
					})
				}

				res.json({ resultat: 1, announcement, padUrl })
			} catch (error) {
				console.error('Erreur lors du partage du pad:', error)
				res.json({ resultat: 0, message: 'Erreur lors du partage du pad dans Google Classroom' })
			}
		})
	})

	// Créer un devoir dans Google Classroom
	app.post('/api/google/create-assignment', async (req, res) => {
		const identifiant = req.session.identifiant
		const { courseId, title, description, dueDate, dueTime } = req.body

		if (!identifiant) {
			return res.json({ resultat: 0, message: 'Non authentifié' })
		}

		if (!courseId || !title || !description) {
			return res.json({ resultat: 0, message: 'Données manquantes' })
		}

		db.hgetall(`utilisateur:${identifiant}`, async (err, utilisateur) => {
			if (err || !utilisateur) {
				return res.json({ resultat: 0, message: 'Utilisateur non trouvé' })
			}

			if (!utilisateur.googleAccessToken) {
				return res.json({ resultat: 0, message: 'Compte Google non connecté' })
			}

			try {
				const { decrypt } = require('../auth/crypto')
				const accessToken = decrypt(utilisateur.googleAccessToken)
				const refreshToken = decrypt(utilisateur.googleRefreshToken)

				const assignment = await classroomService.createAssignment(
					accessToken,
					refreshToken,
					courseId,
					{ title, description, dueDate, dueTime }
				)

				res.json({ resultat: 1, assignment })
			} catch (error) {
				console.error('Erreur lors de la création du devoir:', error)
				res.json({ resultat: 0, message: 'Erreur lors de la création du devoir' })
			}
		})
	})
}

module.exports = setupGoogleAuthRoutes
