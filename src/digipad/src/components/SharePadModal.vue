<template>
	<div class="modal-overlay" @click.self="$emit('close')">
		<div class="modal-container">
			<div class="modal-header" :style="{ backgroundColor: courseColor }">
				<div class="header-content">
					<h2>Partager avec {{ courseName }}</h2>
					<p class="header-subtitle">Sélectionnez un ou plusieurs pads à partager avec vos élèves</p>
				</div>
				<button class="close-button" @click="$emit('close')">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
						<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor" />
					</svg>
				</button>
			</div>

			<div class="modal-body">
				<!-- Option: Sélectionner un pad existant -->
				<div class="section">
					<div class="section-header">
						<h3 class="section-title">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
								<path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM14 17H7V15H14V17ZM17 13H7V11H17V13ZM17 9H7V7H17V9Z" fill="#1967D2"/>
							</svg>
							Choisir des pads existants
						</h3>
						<button v-if="pads.length > 0" class="btn-select-all" @click="toggleSelectAll">
							{{ selectedPads.length === pads.length ? 'Tout désélectionner' : 'Tout sélectionner' }}
						</button>
					</div>

					<div v-if="loadingPads" class="loading-state">
						<div class="spinner"></div>
						<p>Chargement de vos pads...</p>
					</div>

					<div v-else-if="pads.length === 0" class="empty-pads">
						<p>Vous n'avez pas encore de pads. Créez-en un nouveau ci-dessous.</p>
					</div>

					<div v-else class="pads-grid">
						<div
							v-for="pad in pads"
							:key="pad.id"
							class="pad-card"
							:class="{ selected: isPadSelected(pad.id) }"
							@click="togglePad(pad)"
						>
							<div class="checkbox-container">
								<div class="checkbox" :class="{ checked: isPadSelected(pad.id) }">
									<svg v-if="isPadSelected(pad.id)" width="14" height="14" viewBox="0 0 24 24" fill="none">
										<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="white"/>
									</svg>
								</div>
							</div>
							<div class="pad-icon" :style="{ backgroundColor: pad.couleur || '#1967D2' }">
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
									<path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM14 17H7V15H14V17ZM17 13H7V11H17V13ZM17 9H7V7H17V9Z" fill="white"/>
								</svg>
							</div>
							<div class="pad-info">
								<span class="pad-title">{{ pad.titre || 'Sans titre' }}</span>
								<span class="pad-date">{{ formatDate(pad.date) }}</span>
							</div>
						</div>
					</div>
				</div>

				<!-- Divider -->
				<div class="divider">
					<span>ou</span>
				</div>

				<!-- Option: Créer un nouveau pad -->
				<div class="section">
					<h3 class="section-title">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
							<path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="#0D652D"/>
						</svg>
						Créer un nouveau pad
					</h3>

					<div class="new-pad-form">
						<input
							type="text"
							v-model="newPadTitle"
							placeholder="Titre du nouveau pad"
							class="input-field"
							@keyup.enter="createAndShare"
						>
						<p class="form-hint">Laissez vide pour utiliser le nom de la classe</p>
					</div>
				</div>

				<!-- Message de partage -->
				<div v-if="selectedPads.length > 0 || newPadTitle" class="share-preview">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
						<path d="M18 16.08C17.24 16.08 16.56 16.38 16.04 16.85L8.91 12.7C8.96 12.47 9 12.24 9 12C9 11.76 8.96 11.53 8.91 11.3L15.96 7.19C16.5 7.69 17.21 8 18 8C19.66 8 21 6.66 21 5C21 3.34 19.66 2 18 2C16.34 2 15 3.34 15 5C15 5.24 15.04 5.47 15.09 5.7L8.04 9.81C7.5 9.31 6.79 9 6 9C4.34 9 3 10.34 3 12C3 13.66 4.34 15 6 15C6.79 15 7.5 14.69 8.04 14.19L15.16 18.35C15.11 18.56 15.08 18.78 15.08 19C15.08 20.61 16.39 21.92 18 21.92C19.61 21.92 20.92 20.61 20.92 19C20.92 17.39 19.61 16.08 18 16.08Z" fill="#5f6368"/>
					</svg>
					<span>
						<template v-if="selectedPads.length > 0">
							{{ selectedPads.length }} pad{{ selectedPads.length > 1 ? 's' : '' }} sélectionné{{ selectedPads.length > 1 ? 's' : '' }}
						</template>
						<template v-else>
							Un nouveau pad "{{ newPadTitle || courseName }}"
						</template>
						sera partagé{{ selectedPads.length > 1 ? 's' : '' }} avec {{ studentsCount }} élève{{ studentsCount > 1 ? 's' : '' }}
					</span>
				</div>
			</div>

			<div class="modal-footer">
				<button class="btn-secondary" @click="$emit('close')" :disabled="sharing">Annuler</button>
				<button
					class="btn-primary"
					:disabled="!canShare || sharing"
					@click="sharePad"
				>
					<div v-if="sharing" class="spinner-small"></div>
					<svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none">
						<path d="M18 16.08C17.24 16.08 16.56 16.38 16.04 16.85L8.91 12.7C8.96 12.47 9 12.24 9 12C9 11.76 8.96 11.53 8.91 11.3L15.96 7.19C16.5 7.69 17.21 8 18 8C19.66 8 21 6.66 21 5C21 3.34 19.66 2 18 2C16.34 2 15 3.34 15 5C15 5.24 15.04 5.47 15.09 5.7L8.04 9.81C7.5 9.31 6.79 9 6 9C4.34 9 3 10.34 3 12C3 13.66 4.34 15 6 15C6.79 15 7.5 14.69 8.04 14.19L15.16 18.35C15.11 18.56 15.08 18.78 15.08 19C15.08 20.61 16.39 21.92 18 21.92C19.61 21.92 20.92 20.61 20.92 19C20.92 17.39 19.61 16.08 18 16.08Z" fill="currentColor"/>
					</svg>
					<template v-if="sharing && shareTotal > 1">
						Partage {{ shareProgress }}/{{ shareTotal }}...
					</template>
					<template v-else-if="sharing">
						Partage en cours...
					</template>
					<template v-else-if="selectedPads.length > 1">
						Partager {{ selectedPads.length }} pads
					</template>
					<template v-else>
						Partager
					</template>
				</button>
			</div>
		</div>
	</div>
</template>

<script>
import axios from 'axios'

export default {
	name: 'SharePadModal',
	props: {
		courseId: {
			type: String,
			required: true
		},
		courseName: {
			type: String,
			default: 'Classe'
		},
		courseColor: {
			type: String,
			default: '#1967D2'
		},
		studentsCount: {
			type: Number,
			default: 0
		},
		userIdentifiant: {
			type: String,
			required: true
		},
		preselectedPads: {
			type: Array,
			default: () => []
		}
	},
	data() {
		return {
			pads: [],
			loadingPads: false,
			selectedPads: [],
			newPadTitle: '',
			sharing: false,
			shareProgress: 0,
			shareTotal: 0
		}
	},
	computed: {
		canShare() {
			return this.selectedPads.length > 0 || this.newPadTitle.trim()
		}
	},
	mounted() {
		document.body.style.overflow = 'hidden'
		// Initialiser avec les pads présélectionnés
		if (this.preselectedPads && this.preselectedPads.length > 0) {
			this.selectedPads = [...this.preselectedPads]
		}
		this.loadPads()
	},
	beforeDestroy() {
		document.body.style.overflow = ''
	},
	methods: {
		async loadPads() {
			this.loadingPads = true
			try {
				const response = await axios.post('/api/recuperer-donnees-utilisateur', {
					identifiant: this.userIdentifiant
				})
				if (response.data && response.data.padsCrees) {
					// Combiner tous les pads de l'utilisateur
					this.pads = [
						...response.data.padsCrees,
						...response.data.padsRejoints,
						...response.data.padsAdmins
					].filter(pad => pad && pad.id)
				}
			} catch (error) {
				console.error('Erreur lors du chargement des pads:', error)
			} finally {
				this.loadingPads = false
			}
		},

		isPadSelected(padId) {
			return this.selectedPads.some(p => p.id === padId)
		},

		togglePad(pad) {
			const index = this.selectedPads.findIndex(p => p.id === pad.id)
			if (index > -1) {
				this.selectedPads.splice(index, 1)
			} else {
				this.selectedPads.push(pad)
				this.newPadTitle = ''
			}
		},

		toggleSelectAll() {
			if (this.selectedPads.length === this.pads.length) {
				this.selectedPads = []
			} else {
				this.selectedPads = [...this.pads]
			}
		},

		formatDate(dateString) {
			if (!dateString) {
				return ''
			}
			const date = new Date(dateString)
			return date.toLocaleDateString('fr-FR', {
				day: 'numeric',
				month: 'short',
				year: 'numeric'
			})
		},

		async sharePad() {
			if (!this.canShare) {
				return
			}

			this.sharing = true
			const sharedPads = []
			let hasError = false

			try {
				// Collecter tous les pads à partager
				const padsToShare = [...this.selectedPads]

				// Si on crée un nouveau pad
				if (padsToShare.length === 0 && this.newPadTitle.trim()) {
					const createResponse = await axios.post('/api/creer-pad', {
						identifiant: this.userIdentifiant,
						titre: this.newPadTitle.trim() || this.courseName,
						fond: this.courseColor
					})

					if (createResponse.data && createResponse.data.id) {
						padsToShare.push({ ...createResponse.data, isNew: true })
					} else {
						throw new Error('Erreur lors de la création du pad')
					}
				}

				this.shareTotal = padsToShare.length
				this.shareProgress = 0

				// Partager chaque pad
				for (const pad of padsToShare) {
					try {
						const shareResponse = await axios.post('/api/google/share-pad', {
							courseId: this.courseId,
							padId: pad.id,
							padTitle: pad.titre || 'Pad partagé',
							courseName: this.courseName,
							courseColor: this.courseColor
						})

						if (shareResponse.data.resultat === 1) {
							sharedPads.push({
								pad: pad,
								courseId: this.courseId,
								courseName: this.courseName,
								isNewPad: pad.isNew || false
							})
						} else {
							hasError = true
							console.error(`Erreur pour le pad ${pad.titre}:`, shareResponse.data.message)
						}
					} catch (padError) {
						hasError = true
						console.error(`Erreur pour le pad ${pad.titre}:`, padError)
					}
					this.shareProgress++
				}

				if (sharedPads.length > 0) {
					this.$emit('shared', {
						pads: sharedPads,
						courseId: this.courseId,
						courseName: this.courseName,
						count: sharedPads.length
					})

					if (hasError) {
						alert(`${sharedPads.length} pad(s) partagé(s) avec succès. Certains pads n'ont pas pu être partagés.`)
					}
					this.$emit('close')
				} else {
					alert('Aucun pad n\'a pu être partagé. Veuillez réessayer.')
				}
			} catch (error) {
				console.error('Erreur lors du partage:', error)
				alert('Une erreur est survenue lors du partage. Veuillez réessayer.')
			} finally {
				this.sharing = false
				this.shareProgress = 0
				this.shareTotal = 0
			}
		},

		createAndShare() {
			if (this.newPadTitle.trim()) {
				this.selectedPads = []
				this.sharePad()
			}
		}
	}
}
</script>

<style scoped>
.modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 10000;
	animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
	from { opacity: 0; }
	to { opacity: 1; }
}

.modal-container {
	background: white;
	border-radius: 1rem;
	width: 90%;
	max-width: 600px;
	max-height: 85vh;
	display: flex;
	flex-direction: column;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
	animation: slideUp 0.3s ease;
	overflow: hidden;
}

@keyframes slideUp {
	from {
		opacity: 0;
		transform: translateY(20px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.modal-header {
	padding: 1.5rem;
	color: white;
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
}

.header-content h2 {
	margin: 0 0 0.25rem 0;
	font-size: 1.25rem;
	font-weight: 500;
}

.header-subtitle {
	margin: 0;
	opacity: 0.9;
	font-size: 0.875rem;
}

.close-button {
	background: rgba(255, 255, 255, 0.2);
	border: none;
	border-radius: 50%;
	width: 36px;
	height: 36px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	color: white;
	transition: background 0.2s;
}

.close-button:hover {
	background: rgba(255, 255, 255, 0.3);
}

.modal-body {
	flex: 1;
	overflow-y: auto;
	padding: 1.5rem;
}

.section {
	margin-bottom: 1.5rem;
}

.section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 1rem;
}

.section-title {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	margin: 0;
	font-size: 1rem;
	font-weight: 500;
	color: #202124;
}

.btn-select-all {
	background: none;
	border: none;
	color: #1967D2;
	font-size: 0.875rem;
	font-weight: 500;
	cursor: pointer;
	padding: 0.25rem 0.5rem;
	border-radius: 0.25rem;
	transition: background 0.2s;
}

.btn-select-all:hover {
	background: #e8f0fe;
}

.loading-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 2rem;
	color: #5f6368;
}

.loading-state p {
	margin: 1rem 0 0 0;
}

.spinner {
	width: 32px;
	height: 32px;
	border: 3px solid #e8eaed;
	border-top-color: #1967D2;
	border-radius: 50%;
	animation: spin 0.8s linear infinite;
}

.spinner-small {
	width: 16px;
	height: 16px;
	border: 2px solid rgba(255, 255, 255, 0.3);
	border-top-color: white;
	border-radius: 50%;
	animation: spin 0.8s linear infinite;
}

@keyframes spin {
	to { transform: rotate(360deg); }
}

.empty-pads {
	padding: 1.5rem;
	text-align: center;
	background: #f8f9fa;
	border-radius: 0.75rem;
	color: #5f6368;
}

.empty-pads p {
	margin: 0;
}

.pads-grid {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	max-height: 200px;
	overflow-y: auto;
}

.pad-card {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	padding: 0.875rem 1rem;
	background: #f8f9fa;
	border: 2px solid transparent;
	border-radius: 0.75rem;
	cursor: pointer;
	transition: all 0.2s;
}

.pad-card:hover {
	background: #e8f0fe;
	border-color: #c2dbff;
}

.pad-card.selected {
	background: #e8f0fe;
	border-color: #1967D2;
}

.checkbox-container {
	flex-shrink: 0;
}

.checkbox {
	width: 20px;
	height: 20px;
	border: 2px solid #9aa0a6;
	border-radius: 4px;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s;
}

.checkbox.checked {
	background: #1967D2;
	border-color: #1967D2;
}

.pad-card:hover .checkbox:not(.checked) {
	border-color: #1967D2;
}

.pad-icon {
	width: 40px;
	height: 40px;
	border-radius: 0.5rem;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.pad-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 0.125rem;
	min-width: 0;
}

.pad-title {
	font-weight: 500;
	color: #202124;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.pad-date {
	font-size: 0.8125rem;
	color: #5f6368;
}

.divider {
	display: flex;
	align-items: center;
	margin: 1.5rem 0;
}

.divider::before,
.divider::after {
	content: '';
	flex: 1;
	height: 1px;
	background: #e8eaed;
}

.divider span {
	padding: 0 1rem;
	color: #9aa0a6;
	font-size: 0.875rem;
}

.new-pad-form {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.input-field {
	padding: 0.875rem 1rem;
	border: 2px solid #e8eaed;
	border-radius: 0.5rem;
	font-size: 1rem;
	color: #202124;
	transition: border-color 0.2s;
}

.input-field:focus {
	outline: none;
	border-color: #1967D2;
}

.input-field::placeholder {
	color: #9aa0a6;
}

.form-hint {
	margin: 0;
	font-size: 0.8125rem;
	color: #5f6368;
}

.share-preview {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	padding: 1rem 1.25rem;
	background: #e8f0fe;
	border-radius: 0.75rem;
	margin-top: 1.5rem;
	color: #1967D2;
	font-size: 0.875rem;
}

.modal-footer {
	padding: 1rem 1.5rem;
	border-top: 1px solid #e8eaed;
	display: flex;
	justify-content: flex-end;
	gap: 0.75rem;
}

.btn-secondary,
.btn-primary {
	padding: 0.75rem 1.5rem;
	border: none;
	border-radius: 0.5rem;
	font-size: 0.875rem;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s;
	display: inline-flex;
	align-items: center;
	gap: 0.5rem;
}

.btn-secondary {
	background: #f1f3f4;
	color: #3c4043;
}

.btn-secondary:hover {
	background: #e8eaed;
}

.btn-primary {
	background: #1967D2;
	color: white;
}

.btn-primary:hover:not(:disabled) {
	background: #1557B0;
	box-shadow: 0 2px 8px rgba(25, 103, 210, 0.3);
}

.btn-primary:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}

/* Responsive */
@media (max-width: 600px) {
	.modal-container {
		width: 95%;
		max-height: 90vh;
		margin: 1rem;
	}

	.modal-header {
		padding: 1.25rem;
	}

	.modal-body {
		padding: 1.25rem;
	}

	.modal-footer {
		padding: 0.875rem 1.25rem;
	}

	.pads-grid {
		max-height: 150px;
	}
}
</style>
