<template>
	<div class="modal-overlay" @click.self="$emit('close')">
		<div class="modal-container">
			<div class="modal-header" :style="{ backgroundColor: courseColor }">
				<div class="header-content">
					<h2>{{ courseName }}</h2>
					<p class="student-count">{{ students.length }} élève{{ students.length > 1 ? 's' : '' }}</p>
				</div>
				<button class="close-button" @click="$emit('close')">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
						<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor" />
					</svg>
				</button>
			</div>

			<div class="modal-search">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
					<path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="#5f6368" />
				</svg>
				<input
					type="text"
					v-model="searchQuery"
					placeholder="Rechercher un élève..."
					class="search-input"
				>
			</div>

			<div class="modal-body">
				<div v-if="loading" class="loading-state">
					<div class="spinner" />
					<p>Chargement des élèves...</p>
				</div>

				<div v-else-if="filteredStudents.length === 0" class="empty-state">
					<svg width="48" height="48" viewBox="0 0 24 24" fill="none">
						<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#dadce0" />
					</svg>
					<p v-if="searchQuery">Aucun élève trouvé pour "{{ searchQuery }}"</p>
					<p v-else>Aucun élève dans cette classe</p>
				</div>

				<ul v-else class="students-list">
					<li v-for="(student, index) in filteredStudents" :key="student.id || index" class="student-item">
						<div class="student-avatar" :style="{ backgroundColor: getAvatarColor(student.profile?.name || 'Élève') }">
							{{ getInitials(student.profile?.name || 'Élève') }}
						</div>
						<div class="student-info">
							<span class="student-name">{{ student.profile?.name || 'Nom non disponible' }}</span>
							<span class="student-email" v-if="student.profile?.emailAddress">{{ student.profile.emailAddress }}</span>
						</div>
					</li>
				</ul>
			</div>

			<div class="modal-footer">
				<button class="btn-secondary" @click="$emit('close')">Fermer</button>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'StudentsModal',
	props: {
		students: {
			type: Array,
			default: () => []
		},
		courseName: {
			type: String,
			default: 'Classe'
		},
		courseColor: {
			type: String,
			default: '#1967D2'
		},
		loading: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			searchQuery: ''
		}
	},
	computed: {
		filteredStudents() {
			if (!this.searchQuery.trim()) {
				return this.students
			}
			const query = this.searchQuery.toLowerCase()
			return this.students.filter((student) => {
				const name = student.profile?.name?.toLowerCase() || ''
				const email = student.profile?.emailAddress?.toLowerCase() || ''
				return name.includes(query) || email.includes(query)
			})
		}
	},
	mounted() {
		// Empêcher le scroll du body quand la modal est ouverte
		document.body.style.overflow = 'hidden'
	},
	beforeDestroy() {
		document.body.style.overflow = ''
	},
	methods: {
		getInitials(name) {
			if (!name) {
				return '?'
			}
			const parts = name.split(' ')
			if (parts.length >= 2) {
				return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
			}
			return name.substring(0, 2).toUpperCase()
		},
		getAvatarColor(name) {
			const colors = [
				'#1967D2', '#0D652D', '#B80000', '#E37400',
				'#9334E6', '#C26401', '#0B804B', '#D50000',
				'#137333', '#185ABC', '#A50E0E', '#E8710A'
			]
			const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
			return colors[hash % colors.length]
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
	max-width: 500px;
	max-height: 80vh;
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

.student-count {
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

.modal-search {
	padding: 1rem 1.5rem;
	border-bottom: 1px solid #e8eaed;
	display: flex;
	align-items: center;
	gap: 0.75rem;
}

.search-input {
	flex: 1;
	border: none;
	outline: none;
	font-size: 1rem;
	color: #202124;
}

.search-input::placeholder {
	color: #9aa0a6;
}

.modal-body {
	flex: 1;
	overflow-y: auto;
	padding: 0;
}

.loading-state,
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 3rem 1.5rem;
	color: #5f6368;
}

.loading-state p,
.empty-state p {
	margin: 1rem 0 0 0;
	text-align: center;
}

.spinner {
	width: 32px;
	height: 32px;
	border: 3px solid #e8eaed;
	border-top-color: #1967D2;
	border-radius: 50%;
	animation: spin 0.8s linear infinite;
}

@keyframes spin {
	to { transform: rotate(360deg); }
}

.students-list {
	list-style: none;
	margin: 0;
	padding: 0;
}

.student-item {
	display: flex;
	align-items: center;
	gap: 1rem;
	padding: 0.875rem 1.5rem;
	border-bottom: 1px solid #f1f3f4;
	transition: background 0.15s;
}

.student-item:hover {
	background: #f8f9fa;
}

.student-item:last-child {
	border-bottom: none;
}

.student-avatar {
	width: 40px;
	height: 40px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	color: white;
	font-weight: 500;
	font-size: 0.875rem;
	flex-shrink: 0;
}

.student-info {
	display: flex;
	flex-direction: column;
	gap: 0.125rem;
	min-width: 0;
}

.student-name {
	font-weight: 500;
	color: #202124;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.student-email {
	font-size: 0.8125rem;
	color: #5f6368;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.modal-footer {
	padding: 1rem 1.5rem;
	border-top: 1px solid #e8eaed;
	display: flex;
	justify-content: flex-end;
	gap: 0.75rem;
}

.btn-secondary {
	padding: 0.625rem 1.25rem;
	border: none;
	border-radius: 0.5rem;
	font-size: 0.875rem;
	font-weight: 500;
	cursor: pointer;
	background: #f1f3f4;
	color: #3c4043;
	transition: background 0.2s;
}

.btn-secondary:hover {
	background: #e8eaed;
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

	.modal-search {
		padding: 0.875rem 1.25rem;
	}

	.student-item {
		padding: 0.75rem 1.25rem;
	}

	.modal-footer {
		padding: 0.875rem 1.25rem;
	}
}
</style>
