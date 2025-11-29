<template>
	<main id="page">
		<div id="accueil">
			<!-- Navbar -->
			<nav id="navbar">
				<div class="nav-brand">
					<svg class="logo-icon" width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
						<rect width="40" height="40" rx="8" fill="url(#logoGradientHome)"/>
						<path d="M12 14C12 12.8954 12.8954 12 14 12H18C19.1046 12 20 12.8954 20 14V26C20 27.1046 19.1046 28 18 28H14C12.8954 28 12 27.1046 12 26V14Z" fill="white"/>
						<path d="M22 14C22 12.8954 22.8954 12 24 12H26C27.1046 12 28 12.8954 28 14V22C28 23.1046 27.1046 24 26 24H24C22.8954 24 22 23.1046 22 22V14Z" fill="white" fill-opacity="0.7"/>
						<defs>
							<linearGradient id="logoGradientHome" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
								<stop stop-color="#00ced1"/>
								<stop offset="1" stop-color="#00a5a8"/>
							</linearGradient>
						</defs>
					</svg>
					<span class="brand-text">ChaiPad</span>
				</div>
				<div id="langues" class="langue-selector">
					<span class="langue-current" @click="toggleLangueMenu">
						{{ langue.toUpperCase() }}
						<svg width="12" height="12" viewBox="0 0 24 24" fill="none">
							<path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
						</svg>
					</span>
					<div class="langue-dropdown" :class="{'open': langueMenuOpen}">
						<span role="button" tabindex="0" :class="{'selectionne': langue === 'fr'}" @click="modifierLangue('fr')">Francais</span>
						<span role="button" tabindex="0" :class="{'selectionne': langue === 'es'}" @click="modifierLangue('es')">Espanol</span>
						<span role="button" tabindex="0" :class="{'selectionne': langue === 'it'}" @click="modifierLangue('it')">Italiano</span>
						<span role="button" tabindex="0" :class="{'selectionne': langue === 'hr'}" @click="modifierLangue('hr')">Hrvatski</span>
						<span role="button" tabindex="0" :class="{'selectionne': langue === 'en'}" @click="modifierLangue('en')">English</span>
					</div>
				</div>
			</nav>

			<div id="conteneur">
				<!-- Hero Section -->
				<section id="hero">
					<div class="hero-content">
						<div class="hero-badge">
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
								<path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
							</svg>
							<span>Nouveau : Integration Google Classroom</span>
						</div>
						<h1>
							<span class="title-line">Creez des murs</span>
							<span class="title-line gradient-text">collaboratifs</span>
						</h1>
						<p class="hero-description" v-html="$t('slogan')" />

						<div id="actions">
							<div class="actions-row primary-actions">
								<a href="/auth/google" class="bouton bouton-google">
									<svg width="20" height="20" viewBox="0 0 48 48">
										<path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
										<path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
										<path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
										<path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
									</svg>
									<span>Continuer avec Google</span>
								</a>
								<span class="bouton bouton-primary" role="button" tabindex="0" @click="afficherModaleCreer">
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
										<path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
									</svg>
									{{ $t('creerPad') }}
								</span>
							</div>
							<div class="actions-divider">
								<span>ou</span>
							</div>
							<div class="actions-row secondary-actions">
								<span class="bouton bouton-secondary" role="button" tabindex="0" @click="afficherModaleConnexion">{{ $t('seConnecter') }}</span>
								<span class="bouton bouton-secondary" role="button" tabindex="0" @click="afficherModaleInscription">{{ $t('sInscrire') }}</span>
							</div>
						</div>
					</div>

					<!-- Features Cards -->
					<div class="features-grid">
						<div class="feature-card">
							<div class="feature-icon blue">
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
									<path d="M17 21V19C17 16.79 15.21 15 13 15H5C2.79 15 1 16.79 1 19V21M23 21V19C22.99 17.13 21.78 15.49 20 15M16 3C17.78 3.49 18.99 5.13 19 7C18.99 8.87 17.78 10.51 16 11M9 11C11.21 11 13 9.21 13 7C13 4.79 11.21 3 9 3C6.79 3 5 4.79 5 7C5 9.21 6.79 11 9 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
								</svg>
							</div>
							<h3>Collaboration</h3>
							<p>Travaillez ensemble en temps reel avec vos eleves</p>
						</div>
						<div class="feature-card">
							<div class="feature-icon green">
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
									<path d="M22 11.08V12C21.99 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2C13.31 2 14.56 2.25 15.72 2.71M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
								</svg>
							</div>
							<h3>Google Classroom</h3>
							<p>Partagez vos pads directement avec vos classes</p>
						</div>
						<div class="feature-card">
							<div class="feature-icon purple">
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
									<path d="M12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22ZM12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
								</svg>
							</div>
							<h3>Simple et rapide</h3>
							<p>Creez un pad en quelques secondes</p>
						</div>
					</div>
				</section>

				<div id="credits">
					<p><span class="mentions-legales" @click="modaleMentionsLegales = true">{{ $t('mentionsLegales') }}</span> - <a href="https://opencollective.com/ladigitale" target="_blank">{{ $t('soutien') }}</a></p>
					<p>{{ new Date().getFullYear() }} - <a href="https://ladigitale.dev" target="_blank" rel="noreferrer">La Digitale</a> - <a href="https://codeberg.org/ladigitale/digipad" target="_blank" rel="noreferrer">{{ $t('codeSource') }}</a> - <span class="hub" @click="ouvrirHub"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#5f6368" width="24px" height="24px"><path d="M0 0h24v24H0z" fill="none" /><path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z" /></svg></span></p>
				</div>
			</div>
		</div>

		<div class="conteneur-modale" v-if="modaleCreer">
			<div id="creation" class="modale">
				<div class="en-tete">
					<span class="titre">{{ $t('creerPad') }}</span>
					<span role="button" tabindex="0" class="fermer" @click="fermerModaleCreer"><i class="material-icons">close</i></span>
				</div>
				<div class="conteneur">
					<div class="contenu">
						<label for="champ-titre-pad">{{ $t('titrePad') }}</label>
						<input id="champ-titre-pad" type="text" maxlength="48" :value="titre" @input="titre = $event.target.value">
						<label for="champ-motdepasse-pad">{{ $t('motDePassePad') }}</label>
						<p class="information">{{ $t('infoMotDePassePad') }}</p>
						<input id="champ-motdepasse-pad" type="text" maxlength="48" :value="motDePassePad" @input="motDePassePad = $event.target.value" @keydown.enter="creerPad">
						<div class="actions">
							<span role="button" tabindex="0" class="bouton" @click="creerPad" v-if="!chargement">{{ $t('creer') }}</span>
							<div class="conteneur-chargement" v-else>
								<div class="chargement" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="conteneur-modale" v-if="modaleConnexion">
			<div id="connexion" class="modale">
				<div class="en-tete">
					<span class="titre">{{ $t('seConnecter') }}</span>
					<span role="button" tabindex="0" class="fermer" @click="fermerModaleConnexion"><i class="material-icons">close</i></span>
				</div>
				<div class="conteneur">
					<div class="contenu">
						<label for="champ-identifiant">{{ $t('identifiant') }}</label>
						<input id="champ-identifiant" type="text" maxlength="48" :value="identifiant" @input="identifiant = $event.target.value">
						<label for="champ-motdepasse">{{ $t('motDePasse') }}</label>
						<input id="champ-motdepasse" type="password" maxlength="48" :value="motDePasse" @input="motDePasse = $event.target.value" @keydown.enter="seConnecter">
						<div class="mot-de-passe-oublie" @click="afficherModaleMotDePasseOublie" v-html="$t('motDePasseOublie')" />
						<div class="actions">
							<span role="button" tabindex="0" class="bouton" @click="seConnecter" v-if="!chargement">{{ $t('valider') }}</span>
							<div class="conteneur-chargement" v-else>
								<div class="chargement" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="conteneur-modale" v-if="modaleMotDePasseOublie">
			<div class="modale">
				<div class="en-tete">
					<span class="titre">{{ $t('motDePasseOublie') }}</span>
					<span class="fermer" @click="fermerModaleMotDePasseOublie"><i class="material-icons">close</i></span>
				</div>
				<div class="conteneur">
					<div class="contenu">
						<label for="champ-identifiant">{{ $t('identifiant') }}</label>
						<input id="champ-identifiant" type="text" maxlength="48" :value="identifiant" @input="identifiant = $event.target.value">
						<label for="champ-email">{{ $t('email') }}</label>
						<input id="champ-email" type="text" :value="email" @input="email = $event.target.value" @keydown.enter="envoyerMotDePasse">
						<div class="actions">
							<span role="button" tabindex="0" class="bouton" @click="envoyerMotDePasse" v-if="!chargement">{{ $t('valider') }}</span>
							<div class="conteneur-chargement" v-else>
								<div class="chargement" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="conteneur-modale" v-if="modaleInscription">
			<div id="inscription" class="modale">
				<div class="en-tete">
					<span class="titre">{{ $t('sInscrire') }}</span>
					<span class="fermer" @click="fermerModaleInscription"><i class="material-icons">close</i></span>
				</div>
				<div class="conteneur">
					<div class="contenu">
						<label for="champ-identifiant">{{ $t('identifiant') }}</label>
						<p class="information">{{ $t('infoIdentifiant') }}</p>
						<input id="champ-identifiant" type="text" maxlength="48" :value="identifiant" @input="identifiant = $event.target.value">
						<label for="champ-motdepasse">{{ $t('motDePasse') }}</label>
						<p class="information">{{ $t('infoMotDePasse') }}</p>
						<input id="champ-motdepasse" type="password" maxlength="48" :value="motDePasse" @input="motDePasse = $event.target.value">
						<label for="champ-confirmation-motdepasse">{{ $t('confirmationMotDePasse') }}</label>
						<input id="champ-confirmation-motdepasse" type="password" maxlength="48" :value="confirmationMotDePasse" @input="confirmationMotDePasse = $event.target.value" @keydown.enter="sInscrire">
						<div class="actions">
							<span role="button" tabindex="0" class="bouton" @click="sInscrire" v-if="!chargement">{{ $t('valider') }}</span>
							<div class="conteneur-chargement" v-else>
								<div class="chargement" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="conteneur-modale" v-if="modaleMentionsLegales">
			<div id="mentions-legales" class="modale">
				<div class="en-tete">
					<span class="titre">{{ $t('mentionsLegales') }}</span>
					<span class="fermer" @click="modaleMentionsLegales = false"><i class="material-icons">close</i></span>
				</div>
				<div class="conteneur">
					<div class="contenu">
						<p>{{ $t('mentionsLegales1') }}</p>
						<label>{{ $t('administrationEtDeveloppement') }}</label>
						<p>La Digitale - Emmanuel ZIMMERT</p>
						<label>{{ $t('contact') }}</label>
						<p>{{ $t('courriel') }} ez@ladigitale.dev – {{ $t('siteWeb') }} https://ladigitale.dev</p>
						<label>{{ $t('proprieteIntellectuelle') }}</label>
						<p>{{ $t('mentionsLegales2') }}</p>
						<p>{{ $t('mentionsLegales3') }}</p>
						<label>{{ $t('politiqueConfidentialite') }}</label>
						<p>{{ $t('mentionsLegales4') }}</p>
						<p>{{ $t('mentionsLegales5') }}</p>
						<label>{{ $t('hebergement') }}</label>
						<p>{{ $t('mentionsLegales6') }}</p>
					</div>
				</div>
			</div>
		</div>

		<div id="hub" :class="{'ouvert': hub}">
			<span @click="fermerHub"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#fff" width="36px" height="36px"><path d="M0 0h24v24H0z" fill="none" /><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg></span>
			<iframe src="https://ladigitale.dev/hub.html" />
		</div>
	</main>
</template>

<script>
import axios from 'axios'

export default {
	name: 'Accueil',
	data () {
		return {
			chargement: false,
			titre: '',
			motDePassePad: '',
			modaleCreer: false,
			modaleConnexion: false,
			modaleInscription: false,
			modaleMotDePasseOublie: false,
			identifiant: '',
			motDePasse: '',
			confirmationMotDePasse: '',
			email: '',
			modaleMentionsLegales: false,
			hub: false,
			langueMenuOpen: false
		}
	},
	head () {
		return {
			title: 'ChaiPad - Murs collaboratifs'
		}
	},
	computed: {
		hote () {
			return this.$store.state.hote
		},
		langue () {
			return this.$store.state.langue
		},
		langues () {
			return this.$store.state.langues
		}
	},
	created () {
		const langue = this.$route.query.lang
		if (this.langues.includes(langue) === true) {
			this.$i18n.setLocale(langue)
			this.$store.dispatch('modifierLangue', langue)
			this.$socket.emit('modifierlangue', langue)
		} else {
			this.$i18n.setLocale(this.langue)
		}
	},
	mounted () {
		setTimeout(function () {
			document.getElementsByTagName('html')[0].setAttribute('lang', this.langue)
		}.bind(this), 100)
	},
	methods: {
		toggleLangueMenu () {
			this.langueMenuOpen = !this.langueMenuOpen
		},
		afficherModaleCreer () {
			this.modaleCreer = true
			this.$nextTick(function () {
				document.querySelector('input').focus()
			})
		},
		creerPad () {
			if (this.titre.trim() !== '' && this.motDePassePad.trim() !== '') {
				this.chargement = true
				axios.post(this.hote + '/api/creer-pad-sans-compte', {
					titre: this.titre.trim(),
					motdepasse: this.motDePassePad.trim()
				}).then(function (reponse) {
					const donnees = reponse.data
					if (donnees === 'erreur_creation') {
						this.chargement = false
						this.$store.dispatch('modifierAlerte', this.$t('erreurCreationPad'))
					} else {
						this.$store.dispatch('modifierUtilisateur', donnees)
						window.location = '/p/' + donnees.id + '/' + donnees.token
					}
				}.bind(this)).catch(function () {
					this.chargement = false
					this.$store.dispatch('modifierAlerte', this.$t('erreurCommunicationServeur'))
				}.bind(this))
			} else {
				this.$store.dispatch('modifierAlerte', this.$t('remplirChamps'))
			}
		},
		fermerModaleCreer () {
			this.modaleCreer = false
			this.titre = ''
		},
		afficherModaleConnexion () {
			this.modaleConnexion = true
			this.$nextTick(function () {
				document.querySelector('input').focus()
			})
		},
		seConnecter () {
			if (this.identifiant !== '' && this.motDePasse !== '') {
				this.chargement = true
				axios.post(this.hote + '/api/connexion', {
					identifiant: this.identifiant,
					motdepasse: this.motDePasse
				}).then(function (reponse) {
					this.chargement = false
					const donnees = reponse.data
					if (donnees === 'erreur_connexion') {
						this.$store.dispatch('modifierAlerte', this.$t('informationsConnexionIncorrectes'))
					} else {
						this.$store.dispatch('modifierUtilisateur', donnees)
						this.$router.push('/u/' + donnees.identifiant)
					}
				}.bind(this)).catch(function () {
					this.chargement = false
					this.$store.dispatch('modifierAlerte', this.$t('erreurCommunicationServeur'))
				}.bind(this))
			} else {
				this.$store.dispatch('modifierAlerte', this.$t('remplirChamps'))
			}
		},
		afficherModaleInscription () {
			this.modaleInscription = true
			this.$nextTick(function () {
				document.querySelector('input').focus()
			})
		},
		sInscrire () {
			if (this.identifiant.trim() !== '' && this.motDePasse.trim() !== '' && this.motDePasse.trim() === this.confirmationMotDePasse.trim()) {
				this.chargement = true
				axios.post(this.hote + '/api/inscription', {
					identifiant: this.identifiant.trim(),
					motdepasse: this.motDePasse.trim()
				}).then(function (reponse) {
					this.chargement = false
					const donnees = reponse.data
					if (donnees === 'utilisateur_existe_deja') {
						this.$store.dispatch('modifierAlerte', this.$t('identifiantExisteDeja', { identifiant: this.identifiant }))
					} else {
						this.$store.dispatch('modifierUtilisateur', donnees)
						this.$router.push('/u/' + donnees.identifiant)
					}
				}.bind(this)).catch(function () {
					this.chargement = false
					this.$store.dispatch('modifierAlerte', this.$t('erreurCommunicationServeur'))
				}.bind(this))
			} else if (this.identifiant.trim() === '' || this.motDePasse.trim() === '' || this.confirmationMotDePasse.trim() === '') {
				this.$store.dispatch('modifierAlerte', this.$t('remplirChamps'))
			} else if (this.motDePasse.trim() !== this.confirmationMotDePasse.trim()) {
				this.$store.dispatch('modifierAlerte', this.$t('motsDePassePasIdentiques'))
			}
		},
		afficherModaleMotDePasseOublie () {
			this.motDePasse = ''
			this.modaleConnexion = false
			this.modaleMotDePasseOublie = true
			this.$nextTick(function () {
				document.querySelector('input').focus()
			})
		},
		envoyerMotDePasse () {
			if (this.identifiant.trim() !== '' && this.email.trim() !== '' && this.$verifierEmail(this.email.trim()) === true) {
				this.chargement = true
				axios.post(this.hote + '/api/mot-de-passe-oublie', {
					identifiant: this.identifiant.trim(),
					email: this.email.trim()
				}).then(function (reponse) {
					this.chargement = false
					const donnees = reponse.data
					if (donnees === 'erreur') {
						this.$store.dispatch('modifierAlerte', this.$t('erreurCommunicationServeur'))
					} else if (donnees === 'identifiant_invalide') {
						this.$store.dispatch('modifierAlerte', this.$t('identifiantNonValide'))
					} else if (donnees === 'email_invalide') {
						this.$store.dispatch('modifierAlerte', this.$t('emailNonValide'))
					} else {
						this.fermerModaleMotDePasseOublie()
						this.$store.dispatch('modifierMessage', this.$t('emailEnvoye'))
					}
				}.bind(this)).catch(function () {
					this.chargement = false
					this.$store.dispatch('modifierAlerte', this.$t('erreurCommunicationServeur'))
				}.bind(this))
			} else if (this.identifiant.trim() === '' || this.email.trim() === '') {
				this.$store.dispatch('modifierAlerte', this.$t('remplirChamps'))
			} else if (this.$verifierEmail(this.email.trim()) === false) {
				this.$store.dispatch('modifierAlerte', this.$t('erreurEmail'))
			}
		},
		fermerModaleConnexion () {
			this.modaleConnexion = false
			this.identifiant = ''
			this.motDePasse = ''
		},
		fermerModaleInscription () {
			this.modaleInscription = false
			this.identifiant = ''
			this.motDePasse = ''
			this.confirmationMotDePasse = ''
		},
		fermerModaleMotDePasseOublie () {
			this.modaleMotDePasseOublie = false
			this.identifiant = ''
			this.email = ''
		},
		modifierLangue (langue) {
			this.langueMenuOpen = false
			if (this.langue !== langue) {
				axios.post(this.hote + '/api/modifier-langue', {
					identifiant: this.identifiant,
					langue: langue
				}).then(function () {
					this.$i18n.setLocale(langue)
					document.getElementsByTagName('html')[0].setAttribute('lang', langue)
					this.$store.dispatch('modifierLangue', langue)
					this.$store.dispatch('modifierMessage', this.$t('langueModifiee'))
				}.bind(this)).catch(function () {
					this.$store.dispatch('modifierAlerte', this.$t('erreurCommunicationServeur'))
				}.bind(this))
			}
		},
		ouvrirHub () {
			this.hub = true
		},
		fermerHub () {
			this.hub = false
		}
	}
}
</script>

<style scoped>
/* Base */
#page,
#accueil {
	width: 100%;
	min-height: 100vh;
}

#accueil {
	background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
	position: relative;
	overflow-x: hidden;
}

/* Decorative background elements */
#accueil::before {
	content: '';
	position: absolute;
	top: -50%;
	right: -20%;
	width: 80%;
	height: 100%;
	background: radial-gradient(circle, rgba(66, 133, 244, 0.08) 0%, transparent 70%);
	pointer-events: none;
}

#accueil::after {
	content: '';
	position: absolute;
	bottom: -30%;
	left: -20%;
	width: 60%;
	height: 80%;
	background: radial-gradient(circle, rgba(52, 168, 83, 0.06) 0%, transparent 70%);
	pointer-events: none;
}

/* Navbar */
#navbar {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 1rem 2rem;
	background: rgba(255, 255, 255, 0.9);
	backdrop-filter: blur(10px);
	border-bottom: 1px solid rgba(0, 0, 0, 0.05);
	z-index: 1000;
}

.nav-brand {
	display: flex;
	align-items: center;
	gap: 0.75rem;
}

.brand-text {
	font-size: 1.5rem;
	font-weight: 700;
	color: #202124;
	letter-spacing: -0.02em;
}

/* Sélecteur de langue discret */
.langue-selector {
	position: relative;
}

.langue-current {
	display: flex;
	align-items: center;
	gap: 0.375rem;
	padding: 0.5rem 0.75rem;
	font-size: 0.75rem;
	font-weight: 500;
	color: #5f6368;
	cursor: pointer;
	border-radius: 0.375rem;
	transition: all 0.2s;
}

.langue-current:hover {
	background: #f1f3f4;
	color: #202124;
}

.langue-current svg {
	transition: transform 0.2s;
}

.langue-dropdown {
	position: absolute;
	top: 100%;
	right: 0;
	margin-top: 0.25rem;
	background: white;
	border: 1px solid #e2e8f0;
	border-radius: 0.5rem;
	box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
	opacity: 0;
	visibility: hidden;
	transform: translateY(-8px);
	transition: all 0.2s ease;
	z-index: 1000;
	min-width: 120px;
}

.langue-dropdown.open {
	opacity: 1;
	visibility: visible;
	transform: translateY(0);
}

.langue-dropdown span {
	display: block;
	padding: 0.625rem 1rem;
	font-size: 0.8rem;
	color: #374151;
	cursor: pointer;
	transition: all 0.15s;
}

.langue-dropdown span:first-child {
	border-radius: 0.5rem 0.5rem 0 0;
}

.langue-dropdown span:last-child {
	border-radius: 0 0 0.5rem 0.5rem;
}

.langue-dropdown span:hover {
	background: #f8fafc;
}

.langue-dropdown span.selectionne {
	background: #f0fdfa;
	color: #0891b2;
	font-weight: 600;
}

/* Container */
#conteneur {
	position: relative;
	width: 100%;
	min-height: 100vh;
	display: flex;
	flex-direction: column;
	z-index: 1;
}

/* Hero Section */
#hero {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 8rem 2rem 4rem;
	max-width: 1200px;
	margin: 0 auto;
	width: 100%;
}

.hero-content {
	text-align: center;
	max-width: 700px;
	margin-bottom: 4rem;
}

.hero-badge {
	display: inline-flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.5rem 1rem;
	background: linear-gradient(135deg, #e8f5e9 0%, #e3f2fd 100%);
	border: 1px solid rgba(52, 168, 83, 0.2);
	border-radius: 2rem;
	color: #0d652d;
	font-size: 0.875rem;
	font-weight: 500;
	margin-bottom: 2rem;
	animation: fadeInUp 0.6s ease;
}

@keyframes fadeInUp {
	from {
		opacity: 0;
		transform: translateY(20px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

h1 {
	font-size: 3.5rem;
	font-weight: 700;
	line-height: 1.1;
	margin-bottom: 1.5rem;
	color: #202124;
	animation: fadeInUp 0.6s ease 0.1s backwards;
}

.title-line {
	display: block;
}

.gradient-text {
	background: linear-gradient(135deg, #4285F4 0%, #34A853 50%, #FBBC04 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
}

.hero-description {
	font-size: 1.25rem;
	line-height: 1.6;
	color: #5f6368;
	margin-bottom: 2.5rem;
	animation: fadeInUp 0.6s ease 0.2s backwards;
}

/* Actions */
#actions {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 1.5rem;
	animation: fadeInUp 0.6s ease 0.3s backwards;
}

.actions-row {
	display: flex;
	gap: 1rem;
	flex-wrap: wrap;
	justify-content: center;
}

.actions-divider {
	display: flex;
	align-items: center;
	gap: 1rem;
	color: #9aa0a6;
	font-size: 0.875rem;
}

.actions-divider::before,
.actions-divider::after {
	content: '';
	width: 60px;
	height: 1px;
	background: #dadce0;
}

/* Boutons */
.bouton {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 0.75rem;
	padding: 0.875rem 1.75rem;
	font-size: 1rem;
	font-weight: 500;
	border-radius: 0.75rem;
	cursor: pointer;
	transition: all 0.2s ease;
	text-decoration: none;
	border: 2px solid transparent;
}

.bouton-google {
	background: white;
	color: #3c4043;
	border-color: #dadce0;
	box-shadow: 0 1px 3px rgba(60, 64, 67, 0.1);
	min-width: 240px;
}

.bouton-google:hover {
	background: #f8f9fa;
	border-color: #4285F4;
	box-shadow: 0 4px 12px rgba(66, 133, 244, 0.2);
	transform: translateY(-2px);
}

.bouton-primary {
	background: linear-gradient(135deg, #4285F4 0%, #1967D2 100%);
	color: white;
	border-color: #4285F4;
	box-shadow: 0 2px 8px rgba(66, 133, 244, 0.3);
	min-width: 200px;
}

.bouton-primary:hover {
	background: linear-gradient(135deg, #5a95f5 0%, #2b7de9 100%);
	box-shadow: 0 6px 20px rgba(66, 133, 244, 0.4);
	transform: translateY(-2px);
}

.bouton-secondary {
	background: transparent;
	color: #5f6368;
	border-color: #dadce0;
}

.bouton-secondary:hover {
	background: #f1f3f4;
	border-color: #5f6368;
}

/* Features Grid */
.features-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 1.5rem;
	width: 100%;
	max-width: 900px;
	animation: fadeInUp 0.6s ease 0.4s backwards;
}

.feature-card {
	background: white;
	border-radius: 1rem;
	padding: 2rem;
	text-align: center;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
	border: 1px solid rgba(0, 0, 0, 0.05);
	transition: all 0.3s ease;
}

.feature-card:hover {
	transform: translateY(-4px);
	box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
}

.feature-icon {
	width: 56px;
	height: 56px;
	border-radius: 1rem;
	display: flex;
	align-items: center;
	justify-content: center;
	margin: 0 auto 1rem;
}

.feature-icon.blue {
	background: #e8f0fe;
	color: #1967D2;
}

.feature-icon.green {
	background: #e6f4ea;
	color: #0d652d;
}

.feature-icon.purple {
	background: #f3e8fd;
	color: #7c3aed;
}

.feature-card h3 {
	font-size: 1.125rem;
	font-weight: 600;
	color: #202124;
	margin-bottom: 0.5rem;
}

.feature-card p {
	font-size: 0.875rem;
	color: #5f6368;
	line-height: 1.5;
	margin: 0;
}

/* Credits */
#credits {
	padding: 2rem;
	text-align: center;
}

#credits p {
	font-size: 0.875rem;
	color: #5f6368;
	margin-bottom: 0.5rem;
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 0.5rem;
	flex-wrap: wrap;
}

#credits a {
	color: #1967D2;
	text-decoration: none;
}

#credits a:hover {
	text-decoration: underline;
}

#credits .mentions-legales {
	cursor: pointer;
	color: #1967D2;
}

#credits .hub {
	cursor: pointer;
	opacity: 0.6;
	transition: opacity 0.2s;
}

#credits .hub:hover {
	opacity: 1;
}

/* Hub */
#hub {
	position: fixed;
	visibility: hidden;
	opacity: 0;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: -1;
}

#hub.ouvert {
	visibility: visible;
	opacity: 1;
	animation: fonduEntrant linear 0.1s;
	z-index: 100000;
}

#hub iframe {
	width: 100%;
	height: 100%;
}

#hub span {
	font-size: 0;
	color: #fff;
	position: absolute;
	top: 15px;
	right: 15px;
	cursor: pointer;
}

/* Modales */
#mentions-legales {
	max-width: 700px;
	height: 500px;
	max-height: 90%;
}

#connexion #champ-motdepasse {
	margin-bottom: 10px;
}

.modale .contenu .mot-de-passe-oublie {
	font-size: 12px;
	margin-bottom: 20px;
	cursor: pointer;
}

/* Responsive */
@media screen and (max-width: 900px) {
	.features-grid {
		grid-template-columns: 1fr;
		max-width: 400px;
	}

	h1 {
		font-size: 2.5rem;
	}
}

@media screen and (max-width: 600px) {
	#navbar {
		padding: 0.75rem 1rem;
	}

	.brand-text {
		font-size: 1.25rem;
	}

	#hero {
		padding: 6rem 1rem 2rem;
	}

	h1 {
		font-size: 2rem;
	}

	.hero-description {
		font-size: 1rem;
	}

	.hero-badge {
		font-size: 0.75rem;
		padding: 0.375rem 0.75rem;
	}

	.bouton {
		padding: 0.75rem 1.25rem;
		font-size: 0.875rem;
		width: 100%;
		max-width: 280px;
	}

	.bouton-google,
	.bouton-primary {
		min-width: unset;
	}

	.actions-row {
		flex-direction: column;
		width: 100%;
		max-width: 280px;
	}

	.feature-card {
		padding: 1.5rem;
	}

}

@media screen and (max-width: 400px) {
	.hero-content {
		margin-bottom: 2rem;
	}
}

@media screen and (orientation: landscape) and (max-height: 600px) {
	#hero {
		padding-top: 5rem;
	}

	.hero-content {
		margin-bottom: 2rem;
	}

	.features-grid {
		grid-template-columns: repeat(3, 1fr);
		max-width: 100%;
	}

	h1 {
		font-size: 2rem;
		margin-bottom: 1rem;
	}

	.hero-description {
		margin-bottom: 1.5rem;
	}
}
</style>
