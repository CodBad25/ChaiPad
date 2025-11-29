<template>
	<div class="classroom-manager">
		<!-- Notification Toast -->
		<transition name="toast">
			<div v-if="successMessage" class="success-toast">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
					<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor" />
				</svg>
				<span>{{ successMessage }}</span>
			</div>
		</transition>

		<div class="header">
			<div class="title-section">
				<svg class="classroom-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z" fill="#1967D2"/>
					<path d="M12 7C10.9 7 10 7.9 10 9C10 10.1 10.9 11 12 11C13.1 11 14 10.1 14 9C14 7.9 13.1 7 12 7Z" fill="#1967D2"/>
					<path d="M12 13C9.33 13 7 14.34 7 16V17H17V16C17 14.34 14.67 13 12 13Z" fill="#1967D2"/>
				</svg>
				<div>
					<h2>Mes classes Google Classroom</h2>
					<p class="subtitle">Gérez vos classes et partagez des pads avec vos élèves</p>
				</div>
			</div>

			<button class="sync-button" @click="syncClasses" :disabled="loading">
				<svg v-if="!loading" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M12 4V1L8 5L12 9V6C15.31 6 18 8.69 18 12C18 13.01 17.75 13.97 17.3 14.8L18.76 16.26C19.54 15.03 20 13.57 20 12C20 7.58 16.42 4 12 4Z" fill="currentColor"/>
					<path d="M12 18C8.69 18 6 15.31 6 12C6 10.99 6.25 10.03 6.7 9.2L5.24 7.74C4.46 8.97 4 10.43 4 12C4 16.42 7.58 20 12 20V23L16 19L12 15V18Z" fill="currentColor"/>
				</svg>
				<div v-else class="spinner"></div>
				<span>{{ loading ? 'Synchronisation...' : 'Synchroniser' }}</span>
			</button>
		</div>

		<div v-if="error" class="error-banner">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
				<path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="#d93025"/>
			</svg>
			<span>{{ error }}</span>
			<button class="close-error" @click="error = null">×</button>
		</div>

		<div v-if="!googleConnected && !loading" class="not-connected">
			<svg width="64" height="64" viewBox="0 0 24 24" fill="none">
				<path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z" fill="#dadce0"/>
			</svg>
			<h3>Aucun compte Google connecté</h3>
			<p>Connectez-vous avec Google pour accéder à vos classes Google Classroom</p>
			<a href="/auth/google" class="connect-button">
				<svg width="18" height="18" viewBox="0 0 48 48">
					<path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
					<path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
					<path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
					<path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
				</svg>
				Se connecter avec Google
			</a>
		</div>

		<div v-else-if="classes.length === 0 && !loading" class="empty-state">
			<svg width="64" height="64" viewBox="0 0 24 24" fill="none">
				<path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z" fill="#dadce0"/>
				<path d="M12 17C12.55 17 13 16.55 13 16C13 15.45 12.55 15 12 15C11.45 15 11 15.45 11 16C11 16.55 11.45 17 12 17Z" fill="#5f6368"/>
				<path d="M13 13H11V7H13V13Z" fill="#5f6368"/>
			</svg>
			<h3>Aucune classe trouvée</h3>
			<p>Cliquez sur "Synchroniser" pour charger vos classes Google Classroom</p>
		</div>

		<div v-else-if="classes.length > 0" class="classes-grid">
			<div v-for="classe in classes" :key="classe.id" class="class-card">
				<div class="card-header" :style="{ backgroundColor: getClassColor(classe.id) }">
					<div class="class-info">
						<h3>{{ classe.name }}</h3>
						<p v-if="classe.section">{{ classe.section }}</p>
					</div>
					<div class="class-icon">
						<svg width="40" height="40" viewBox="0 0 24 24" fill="none">
							<circle cx="12" cy="12" r="10" fill="white" opacity="0.2"/>
							<path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z" fill="white"/>
						</svg>
					</div>
				</div>

				<div class="card-body">
					<div class="stat-row">
						<div class="stat">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
								<path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z" fill="#5f6368"/>
							</svg>
							<span class="stat-label">{{ studentsCount[classe.id] || '...' }} élèves</span>
						</div>
					</div>

					<div class="card-actions">
						<button class="action-button secondary" @click="viewStudents(classe.id)">
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
								<path d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z" fill="currentColor"/>
							</svg>
							Voir les élèves
						</button>
						<button class="action-button primary" @click="shareWithClass(classe)">
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
								<path d="M18 16.08C17.24 16.08 16.56 16.38 16.04 16.85L8.91 12.7C8.96 12.47 9 12.24 9 12C9 11.76 8.96 11.53 8.91 11.3L15.96 7.19C16.5 7.69 17.21 8 18 8C19.66 8 21 6.66 21 5C21 3.34 19.66 2 18 2C16.34 2 15 3.34 15 5C15 5.24 15.04 5.47 15.09 5.7L8.04 9.81C7.5 9.31 6.79 9 6 9C4.34 9 3 10.34 3 12C3 13.66 4.34 15 6 15C6.79 15 7.5 14.69 8.04 14.19L15.16 18.35C15.11 18.56 15.08 18.78 15.08 19C15.08 20.61 16.39 21.92 18 21.92C19.61 21.92 20.92 20.61 20.92 19C20.92 17.39 19.61 16.08 18 16.08Z" fill="currentColor"/>
							</svg>
							Partager un pad
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Modal des élèves -->
		<StudentsModal
			v-if="showStudentsModal"
			:students="currentStudents"
			:course-name="currentCourseName"
			:course-color="currentCourseColor"
			:loading="loadingStudents"
			@close="closeStudentsModal"
		/>

		<!-- Modal de partage de pad -->
		<SharePadModal
			v-if="showShareModal"
			:course-id="shareModalCourseId"
			:course-name="shareModalCourseName"
			:course-color="shareModalCourseColor"
			:students-count="shareModalStudentsCount"
			:user-identifiant="userIdentifiant"
			:preselected-pads="preselectedPads"
			@close="closeShareModal"
			@shared="onPadShared"
		/>
	</div>
</template>

<script>
import axios from 'axios'
import StudentsModal from './StudentsModal.vue'
import SharePadModal from './SharePadModal.vue'

export default {
	name: 'ClassroomManager',
	components: {
		StudentsModal,
		SharePadModal
	},
	props: {
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
			classes: [],
			studentsCount: {},
			loading: false,
			error: null,
			googleConnected: true,
			successMessage: '',
			// Modal élèves
			showStudentsModal: false,
			currentStudents: [],
			currentCourseName: '',
			currentCourseColor: '#1967D2',
			loadingStudents: false,
			// Modal partage de pad
			showShareModal: false,
			shareModalCourseId: '',
			shareModalCourseName: '',
			shareModalCourseColor: '#1967D2',
			shareModalStudentsCount: 0
		}
	},
	mounted() {
		// Charger automatiquement les classes au montage
		this.syncClasses()
	},
	methods: {
		async syncClasses() {
			this.loading = true
			this.error = null

			try {
				const response = await axios.post('/api/google/classes')

				if (response.data.resultat === 1) {
					this.classes = response.data.classes
					this.googleConnected = true

					// Charger le nombre d'élèves pour chaque classe
					this.classes.forEach(async (classe) => {
						await this.loadStudentsCount(classe.id)
					})
				} else {
					this.error = response.data.message || 'Erreur lors de la synchronisation'
					if (response.data.message === 'Compte Google non connecté') {
						this.googleConnected = false
					}
				}
			} catch (error) {
				console.error('Erreur:', error)
				this.error = 'Erreur réseau. Veuillez réessayer.'
			} finally {
				this.loading = false
			}
		},

		async loadStudentsCount(courseId) {
			try {
				const response = await axios.post('/api/google/students', { courseId })

				if (response.data.resultat === 1) {
					this.$set(this.studentsCount, courseId, response.data.students.length)
				}
			} catch (error) {
				console.error('Erreur lors du chargement des élèves:', error)
			}
		},

		async viewStudents(courseId) {
			// Trouver la classe pour récupérer le nom et la couleur
			const classe = this.classes.find(c => c.id === courseId)
			if (classe) {
				this.currentCourseName = classe.name + (classe.section ? ` - ${classe.section}` : '')
				this.currentCourseColor = this.getClassColor(courseId)
			}

			// Ouvrir la modal immédiatement en mode chargement
			this.showStudentsModal = true
			this.loadingStudents = true
			this.currentStudents = []

			try {
				const response = await axios.post('/api/google/students', { courseId })

				if (response.data.resultat === 1) {
					this.currentStudents = response.data.students
				} else {
					this.error = 'Impossible de charger les élèves'
					this.showStudentsModal = false
				}
			} catch (error) {
				console.error('Erreur:', error)
				this.error = 'Erreur lors du chargement des élèves'
				this.showStudentsModal = false
			} finally {
				this.loadingStudents = false
			}
		},

		closeStudentsModal() {
			this.showStudentsModal = false
			this.currentStudents = []
			this.currentCourseName = ''
		},

		shareWithClass(classe) {
			this.shareModalCourseId = classe.id
			this.shareModalCourseName = classe.name + (classe.section ? ` - ${classe.section}` : '')
			this.shareModalCourseColor = this.getClassColor(classe.id)
			this.shareModalStudentsCount = this.studentsCount[classe.id] || 0
			this.showShareModal = true
		},

		closeShareModal() {
			this.showShareModal = false
			this.shareModalCourseId = ''
			this.shareModalCourseName = ''
		},

		onPadShared(shareInfo) {
			// Gérer le partage multiple de pads
			const count = shareInfo.count || 1
			const pads = shareInfo.pads || []

			// Afficher la notification de succès
			if (count > 1) {
				this.successMessage = `${count} pads ont été partagés avec "${shareInfo.courseName}" !`
			} else if (pads.length > 0) {
				const padName = pads[0].pad.titre || 'Le pad'
				this.successMessage = `${padName} a été partagé avec "${shareInfo.courseName}" !`
			}

			// Émettre un événement pour chaque pad partagé
			for (const padInfo of pads) {
				if (padInfo.isNewPad && padInfo.pad) {
					// Nouveau pad créé
					const padWithClassInfo = {
						...padInfo.pad,
						googleClassroom: shareInfo.courseName
					}
					this.$emit('new-pad-created', padWithClassInfo)
				} else if (padInfo.pad) {
					// Pad existant mis à jour - émettre un événement pour rafraîchir les badges
					this.$emit('pad-shared', {
						padId: padInfo.pad.id,
						courseId: shareInfo.courseId,
						courseName: shareInfo.courseName,
						courseColor: this.shareModalCourseColor
					})
				}
			}

			// Masquer la notification après 5 secondes
			setTimeout(() => {
				this.successMessage = ''
			}, 5000)
		},

		getClassColor(classId) {
			// Génère une couleur unique pour chaque classe
			const colors = [
				'#1967D2', '#0D652D', '#B80000', '#E37400',
				'#9334E6', '#C26401', '#0B804B', '#D50000'
			]
			const hash = classId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
			return colors[hash % colors.length]
		}
	}
}
</script>

<style scoped>
.classroom-manager {
	max-width: 1200px;
	margin: 0 auto;
	padding: 2rem;
}

.header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 2rem;
	flex-wrap: wrap;
	gap: 1rem;
}

.title-section {
	display: flex;
	align-items: flex-start;
	gap: 1rem;
}

.classroom-icon {
	flex-shrink: 0;
	margin-top: 0.25rem;
}

.title-section h2 {
	margin: 0;
	font-size: 1.75rem;
	color: #202124;
	font-weight: 500;
}

.subtitle {
	margin: 0.25rem 0 0 0;
	color: #5f6368;
	font-size: 0.875rem;
}

.sync-button {
	display: inline-flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.75rem 1.5rem;
	background-color: #1967D2;
	color: white;
	border: none;
	border-radius: 0.5rem;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s;
	font-size: 0.875rem;
}

.sync-button:hover:not(:disabled) {
	background-color: #1557B0;
	box-shadow: 0 2px 8px rgba(25, 103, 210, 0.3);
}

.sync-button:disabled {
	opacity: 0.7;
	cursor: not-allowed;
}

.spinner {
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

.error-banner {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	padding: 1rem 1.25rem;
	background-color: #fce8e6;
	border-left: 4px solid #d93025;
	border-radius: 0.5rem;
	margin-bottom: 1.5rem;
	color: #5f0700;
}

.error-banner span {
	flex: 1;
	font-size: 0.875rem;
}

.close-error {
	background: none;
	border: none;
	font-size: 1.5rem;
	cursor: pointer;
	color: #5f0700;
	padding: 0;
	width: 24px;
	height: 24px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.not-connected,
.empty-state {
	text-align: center;
	padding: 4rem 2rem;
	background: #f8f9fa;
	border-radius: 1rem;
	border: 2px dashed #dadce0;
}

.not-connected svg,
.empty-state svg {
	margin-bottom: 1.5rem;
	opacity: 0.6;
}

.not-connected h3,
.empty-state h3 {
	margin: 0 0 0.5rem 0;
	color: #202124;
	font-size: 1.25rem;
	font-weight: 500;
}

.not-connected p,
.empty-state p {
	margin: 0 0 1.5rem 0;
	color: #5f6368;
	font-size: 0.875rem;
}

.connect-button {
	display: inline-flex;
	align-items: center;
	gap: 0.75rem;
	padding: 0.875rem 1.75rem;
	background: white;
	color: #3c4043;
	border: 2px solid #dadce0;
	border-radius: 0.5rem;
	font-weight: 500;
	text-decoration: none;
	transition: all 0.2s;
	box-shadow: 0 1px 3px rgba(60, 64, 67, 0.15);
}

.connect-button:hover {
	border-color: #4285f4;
	box-shadow: 0 2px 8px rgba(66, 133, 244, 0.25);
	transform: translateY(-1px);
}

.classes-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
	gap: 1.5rem;
}

.class-card {
	background: white;
	border-radius: 0.75rem;
	overflow: hidden;
	box-shadow: 0 1px 3px rgba(60, 64, 67, 0.15);
	transition: all 0.2s;
	border: 1px solid #dadce0;
}

.class-card:hover {
	box-shadow: 0 4px 12px rgba(60, 64, 67, 0.25);
	transform: translateY(-2px);
}

.card-header {
	padding: 1.5rem;
	color: white;
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	min-height: 120px;
}

.class-info h3 {
	margin: 0 0 0.5rem 0;
	font-size: 1.25rem;
	font-weight: 500;
	line-height: 1.3;
}

.class-info p {
	margin: 0;
	opacity: 0.9;
	font-size: 0.875rem;
}

.class-icon {
	flex-shrink: 0;
}

.card-body {
	padding: 1.25rem;
}

.stat-row {
	display: flex;
	gap: 1.5rem;
	margin-bottom: 1rem;
}

.stat {
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.stat-label {
	color: #5f6368;
	font-size: 0.875rem;
}

.card-actions {
	display: flex;
	gap: 0.75rem;
	margin-top: 1rem;
}

.action-button {
	flex: 1;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	padding: 0.625rem 1rem;
	border-radius: 0.5rem;
	font-size: 0.875rem;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s;
	border: none;
}

.action-button.secondary {
	background-color: #f1f3f4;
	color: #3c4043;
}

.action-button.secondary:hover {
	background-color: #e8eaed;
}

.action-button.primary {
	background-color: #1967D2;
	color: white;
}

.action-button.primary:hover {
	background-color: #1557B0;
	box-shadow: 0 2px 8px rgba(25, 103, 210, 0.3);
}

/* Toast notification */
.success-toast {
	position: fixed;
	top: 1.5rem;
	right: 1.5rem;
	display: flex;
	align-items: center;
	gap: 0.75rem;
	padding: 1rem 1.5rem;
	background: #0D652D;
	color: white;
	border-radius: 0.75rem;
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
	z-index: 10001;
	font-weight: 500;
}

.toast-enter-active {
	animation: slideInRight 0.3s ease;
}

.toast-leave-active {
	animation: slideOutRight 0.3s ease;
}

@keyframes slideInRight {
	from {
		opacity: 0;
		transform: translateX(100px);
	}
	to {
		opacity: 1;
		transform: translateX(0);
	}
}

@keyframes slideOutRight {
	from {
		opacity: 1;
		transform: translateX(0);
	}
	to {
		opacity: 0;
		transform: translateX(100px);
	}
}

/* Responsive */
@media (max-width: 768px) {
	.classroom-manager {
		padding: 1rem;
	}

	.header {
		flex-direction: column;
	}

	.classes-grid {
		grid-template-columns: 1fr;
	}

	.card-actions {
		flex-direction: column;
	}

	.success-toast {
		top: 1rem;
		right: 1rem;
		left: 1rem;
	}
}
</style>
