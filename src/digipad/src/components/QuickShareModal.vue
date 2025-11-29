<template>
	<div class="quick-share-overlay" @click.self="$emit('close')">
		<div class="quick-share-modal">
			<div class="modal-header">
				<h2>
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
						<path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z" fill="currentColor" />
						<path d="M12 7C10.9 7 10 7.9 10 9C10 10.1 10.9 11 12 11C13.1 11 14 10.1 14 9C14 7.9 13.1 7 12 7Z" fill="currentColor" />
						<path d="M12 13C9.33 13 7 14.34 7 16V17H17V16C17 14.34 14.67 13 12 13Z" fill="currentColor" />
					</svg>
					Partager vers Google Classroom
				</h2>
				<button class="close-btn" @click="$emit('close')">
					<i class="material-icons">close</i>
				</button>
			</div>

			<div class="modal-body">
				<div class="pads-info">
					<span class="badge">{{ pads.length }}</span>
					<span>pad{{ pads.length > 1 ? 's' : '' }} sélectionné{{ pads.length > 1 ? 's' : '' }}</span>
				</div>

				<div class="search-container">
					<i class="material-icons">search</i>
					<input
						type="text"
						v-model="searchQuery"
						placeholder="Rechercher une classe..."
						ref="searchInput"
						@keydown.enter="shareToFirstMatch"
					/>
				</div>

				<div class="classes-list" v-if="!loading && !error">
					<div
						v-for="classe in filteredClasses"
						:key="classe.id"
						class="class-item"
						:class="{ selected: isSelected(classe.id) }"
						@click="toggleClass(classe)"
					>
						<div class="class-color" :style="{ backgroundColor: classe.color }"></div>
						<div class="class-info">
							<span class="class-name">{{ classe.name }}</span>
							<span class="class-section" v-if="classe.section">{{ classe.section }}</span>
						</div>
						<div class="class-check" v-if="isSelected(classe.id)">
							<i class="material-icons">check_circle</i>
						</div>
					</div>

					<div v-if="filteredClasses.length === 0 && searchQuery" class="no-results">
						Aucune classe ne correspond à "{{ searchQuery }}"
					</div>

					<div v-if="classes.length === 0" class="no-classes">
						<p>Aucune classe trouvée.</p>
						<p>Connectez votre compte Google Classroom.</p>
					</div>
				</div>

				<div v-if="loading" class="loading">
					<div class="spinner"></div>
					<span>Chargement des classes...</span>
				</div>

				<div v-if="error" class="error">
					<i class="material-icons">error_outline</i>
					<span>{{ error }}</span>
					<button @click="loadClasses">Réessayer</button>
				</div>
			</div>

			<div class="modal-footer">
				<div class="selected-count" v-if="selectedClasses.length > 0">
					{{ selectedClasses.length }} classe{{ selectedClasses.length > 1 ? 's' : '' }} sélectionnée{{ selectedClasses.length > 1 ? 's' : '' }}
				</div>
				<div class="actions">
					<button class="btn-cancel" @click="$emit('close')">Annuler</button>
					<button
						class="btn-share"
						:disabled="selectedClasses.length === 0 || sharing"
						@click="shareToSelectedClasses"
					>
						<span v-if="!sharing">
							<i class="material-icons">share</i>
							Partager
						</span>
						<span v-else class="sharing">
							<div class="spinner-small"></div>
							{{ shareProgress }}/{{ shareTotal }}
						</span>
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import axios from 'axios'

export default {
	name: 'QuickShareModal',
	props: {
		pads: {
			type: Array,
			required: true
		}
	},
	data() {
		return {
			classes: [],
			selectedClasses: [],
			searchQuery: '',
			loading: true,
			error: null,
			sharing: false,
			shareProgress: 0,
			shareTotal: 0
		}
	},
	computed: {
		filteredClasses() {
			if (!this.searchQuery.trim()) {
				return this.classes
			}
			const query = this.searchQuery.toLowerCase()
			return this.classes.filter(classe =>
				classe.name.toLowerCase().includes(query) ||
				(classe.section && classe.section.toLowerCase().includes(query))
			)
		}
	},
	mounted() {
		this.loadClasses()
		this.$nextTick(() => {
			if (this.$refs.searchInput) {
				this.$refs.searchInput.focus()
			}
		})
	},
	methods: {
		async loadClasses() {
			this.loading = true
			this.error = null

			try {
				const response = await axios.post('/api/google/classes')
				if (response.data.resultat === 1) {
					this.classes = response.data.classes || []
				} else {
					this.error = response.data.message || 'Erreur lors du chargement'
				}
			} catch (err) {
				console.error('Erreur:', err)
				this.error = 'Impossible de charger les classes'
			} finally {
				this.loading = false
			}
		},

		isSelected(classId) {
			return this.selectedClasses.some(c => c.id === classId)
		},

		toggleClass(classe) {
			const index = this.selectedClasses.findIndex(c => c.id === classe.id)
			if (index > -1) {
				this.selectedClasses.splice(index, 1)
			} else {
				this.selectedClasses.push(classe)
			}
		},

		shareToFirstMatch() {
			if (this.filteredClasses.length > 0 && this.selectedClasses.length === 0) {
				this.toggleClass(this.filteredClasses[0])
			}
			if (this.selectedClasses.length > 0) {
				this.shareToSelectedClasses()
			}
		},

		async shareToSelectedClasses() {
			if (this.selectedClasses.length === 0 || this.pads.length === 0) {
				return
			}

			this.sharing = true
			this.shareTotal = this.pads.length * this.selectedClasses.length
			this.shareProgress = 0

			const sharedPads = []

			try {
				for (const classe of this.selectedClasses) {
					for (const pad of this.pads) {
						try {
							const response = await axios.post('/api/google/share-pad', {
								courseId: classe.id,
								padId: pad.id,
								padTitle: pad.titre || 'Pad partagé',
								courseName: classe.name,
								courseColor: classe.color
							})

							if (response.data.resultat === 1) {
								sharedPads.push({
									pad,
									classe,
									isNewPad: false
								})

								// Émettre pour mise à jour locale
								this.$emit('pad-shared', {
									padId: pad.id,
									courseId: classe.id,
									courseName: classe.name,
									courseColor: classe.color
								})
							}
						} catch (e) {
							console.error(`Erreur partage pad ${pad.id} vers ${classe.name}:`, e)
						}
						this.shareProgress++
					}
				}

				// Émettre le succès
				this.$emit('shared', {
					pads: sharedPads,
					classes: this.selectedClasses,
					count: sharedPads.length
				})

				this.$emit('close')
			} catch (error) {
				console.error('Erreur lors du partage:', error)
				this.error = 'Erreur lors du partage'
			} finally {
				this.sharing = false
			}
		}
	}
}
</script>

<style scoped>
.quick-share-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
	padding: 1rem;
}

.quick-share-modal {
	background: white;
	border-radius: 1rem;
	width: 100%;
	max-width: 720px;
	max-height: 80vh;
	display: flex;
	flex-direction: column;
	box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
	animation: slideUp 0.2s ease;
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
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 1.25rem 1.5rem;
	border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	margin: 0;
	font-size: 1.125rem;
	font-weight: 600;
	color: #1967D2;
}

.modal-header svg {
	flex-shrink: 0;
}

.close-btn {
	background: none;
	border: none;
	cursor: pointer;
	color: #64748b;
	padding: 0.25rem;
	border-radius: 0.375rem;
	transition: all 0.15s;
}

.close-btn:hover {
	background: #f1f5f9;
	color: #0f172a;
}

.modal-body {
	flex: 1;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	padding: 1rem 1.5rem;
}

.pads-info {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.75rem 1rem;
	background: #f0fdfa;
	border-radius: 0.5rem;
	margin-bottom: 1rem;
	font-size: 0.875rem;
	color: #0f766e;
}

.pads-info .badge {
	background: #00ced1;
	color: white;
	padding: 0.125rem 0.5rem;
	border-radius: 1rem;
	font-weight: 600;
}

.search-container {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	padding: 0.75rem 1rem;
	background: #f8fafc;
	border: 2px solid #e2e8f0;
	border-radius: 0.75rem;
	margin-bottom: 1rem;
	transition: border-color 0.15s;
}

.search-container:focus-within {
	border-color: #1967D2;
}

.search-container i {
	color: #94a3b8;
}

.search-container input {
	flex: 1;
	border: none;
	background: none;
	outline: none;
	font-size: 0.9375rem;
	color: #0f172a;
}

.search-container input::placeholder {
	color: #94a3b8;
}

.classes-list {
	flex: 1;
	overflow-y: auto;
	margin: 0 -0.25rem;
	padding: 0 0.25rem;
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 0.5rem;
	align-content: start;
}

.class-item {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.625rem 0.75rem;
	border-radius: 0.625rem;
	cursor: pointer;
	transition: all 0.15s;
	border: 2px solid #e2e8f0;
	background: white;
}

.class-item:hover {
	background: #f8fafc;
}

.class-item.selected {
	background: #eff6ff;
	border-color: #1967D2;
}

.class-color {
	width: 12px;
	height: 12px;
	border-radius: 50%;
	flex-shrink: 0;
}

.class-info {
	flex: 1;
	min-width: 0;
}

.class-name {
	display: block;
	font-weight: 500;
	color: #0f172a;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.class-section {
	display: block;
	font-size: 0.8125rem;
	color: #64748b;
	margin-top: 0.125rem;
}

.class-check {
	color: #1967D2;
}

.no-results,
.no-classes {
	text-align: center;
	padding: 2rem 1rem;
	color: #64748b;
}

.no-classes p {
	margin: 0.5rem 0;
}

.loading {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 3rem 1rem;
	gap: 1rem;
	color: #64748b;
}

.spinner {
	width: 32px;
	height: 32px;
	border: 3px solid #e2e8f0;
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
	to {
		transform: rotate(360deg);
	}
}

.error {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 0.75rem;
	padding: 2rem 1rem;
	color: #ef4444;
	text-align: center;
}

.error button {
	margin-top: 0.5rem;
	padding: 0.5rem 1rem;
	background: #fef2f2;
	color: #ef4444;
	border: 1px solid #fecaca;
	border-radius: 0.5rem;
	cursor: pointer;
	font-weight: 500;
}

.error button:hover {
	background: #fee2e2;
}

.modal-footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 1rem 1.5rem;
	border-top: 1px solid #e2e8f0;
	background: #f8fafc;
	border-radius: 0 0 1rem 1rem;
}

.selected-count {
	font-size: 0.875rem;
	color: #1967D2;
	font-weight: 500;
}

.actions {
	display: flex;
	gap: 0.75rem;
}

.btn-cancel {
	padding: 0.625rem 1.25rem;
	background: white;
	color: #64748b;
	border: 1px solid #e2e8f0;
	border-radius: 0.5rem;
	cursor: pointer;
	font-weight: 500;
	transition: all 0.15s;
}

.btn-cancel:hover {
	background: #f1f5f9;
	color: #0f172a;
}

.btn-share {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.625rem 1.5rem;
	background: linear-gradient(135deg, #1967D2, #4285F4);
	color: white;
	border: none;
	border-radius: 0.5rem;
	cursor: pointer;
	font-weight: 600;
	transition: all 0.15s;
}

.btn-share:hover:not(:disabled) {
	transform: translateY(-1px);
	box-shadow: 0 4px 12px rgba(25, 103, 210, 0.4);
}

.btn-share:disabled {
	opacity: 0.6;
	cursor: not-allowed;
	transform: none;
}

.btn-share i {
	font-size: 1.125rem;
}

.sharing {
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

/* Responsive grid */
@media (max-width: 640px) {
	.classes-list {
		grid-template-columns: repeat(2, 1fr);
	}
	.quick-share-modal {
		max-width: 95%;
	}
}

@media (max-width: 480px) {
	.classes-list {
		grid-template-columns: 1fr;
	}
}
</style>
