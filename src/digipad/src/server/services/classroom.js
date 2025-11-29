/**
 * Service Google Classroom API
 * Gère les interactions avec l'API Google Classroom
 */

const { google } = require('googleapis')

/**
 * Crée un client OAuth2 authentifié
 * @param {string} accessToken - Token d'accès Google
 * @param {string} refreshToken - Token de rafraîchissement Google
 * @returns {object} Client OAuth2
 */
function createOAuth2Client(accessToken, refreshToken) {
	const oauth2Client = new google.auth.OAuth2(
		process.env.GOOGLE_CLIENT_ID,
		process.env.GOOGLE_CLIENT_SECRET,
		process.env.GOOGLE_CALLBACK_URL
	)

	oauth2Client.setCredentials({
		access_token: accessToken,
		refresh_token: refreshToken
	})

	return oauth2Client
}

// Couleurs Google Classroom (basées sur les thèmes disponibles)
const CLASSROOM_COLORS = [
	'#1967D2', // Bleu Google
	'#1E8E3E', // Vert
	'#E8710A', // Orange
	'#D93025', // Rouge
	'#9334E6', // Violet
	'#12B5CB', // Cyan
	'#E52592', // Rose
	'#F9AB00', // Jaune
	'#1A73E8', // Bleu clair
	'#34A853', // Vert clair
	'#EA8600', // Orange clair
	'#C5221F'  // Rouge foncé
]

/**
 * Génère une couleur cohérente basée sur l'ID de la classe
 * @param {string} courseId - ID de la classe
 * @returns {string} Couleur hexadécimale
 */
function getCourseColor(courseId) {
	// Utiliser un hash simple de l'ID pour obtenir un index cohérent
	let hash = 0
	for (let i = 0; i < courseId.length; i++) {
		hash = ((hash << 5) - hash) + courseId.charCodeAt(i)
		hash = hash & hash // Convert to 32bit integer
	}
	const index = Math.abs(hash) % CLASSROOM_COLORS.length
	return CLASSROOM_COLORS[index]
}

/**
 * Récupère la liste des classes d'un enseignant
 * @param {string} accessToken - Token d'accès Google
 * @param {string} refreshToken - Token de rafraîchissement Google
 * @returns {Promise<Array>} Liste des classes
 */
async function listCourses(accessToken, refreshToken) {
	try {
		const auth = createOAuth2Client(accessToken, refreshToken)
		const classroom = google.classroom({ version: 'v1', auth })

		const response = await classroom.courses.list({
			teacherId: 'me',
			courseStates: ['ACTIVE']
		})

		const courses = response.data.courses || []

		return courses.map(course => ({
			id: course.id,
			name: course.name,
			section: course.section || '',
			descriptionHeading: course.descriptionHeading || '',
			room: course.room || '',
			ownerId: course.ownerId,
			creationTime: course.creationTime,
			updateTime: course.updateTime,
			courseState: course.courseState,
			color: getCourseColor(course.id) // Couleur générée pour la classe
		}))
	} catch (error) {
		console.error('Erreur lors de la récupération des classes:', error)
		throw error
	}
}

/**
 * Récupère les étudiants d'une classe
 * @param {string} accessToken - Token d'accès Google
 * @param {string} refreshToken - Token de rafraîchissement Google
 * @param {string} courseId - ID de la classe
 * @returns {Promise<Array>} Liste des étudiants
 */
async function listStudents(accessToken, refreshToken, courseId) {
	try {
		const auth = createOAuth2Client(accessToken, refreshToken)
		const classroom = google.classroom({ version: 'v1', auth })

		const response = await classroom.courses.students.list({
			courseId: courseId
		})

		const students = response.data.students || []

		return students.map(student => ({
			userId: student.userId,
			profile: {
				id: student.profile.id,
				name: student.profile.name.fullName,
				emailAddress: student.profile.emailAddress,
				photoUrl: student.profile.photoUrl || ''
			}
		}))
	} catch (error) {
		console.error('Erreur lors de la récupération des étudiants:', error)
		throw error
	}
}

/**
 * Crée un devoir dans Google Classroom
 * @param {string} accessToken - Token d'accès Google
 * @param {string} refreshToken - Token de rafraîchissement Google
 * @param {string} courseId - ID de la classe
 * @param {object} assignment - Détails du devoir
 * @returns {Promise<object>} Devoir créé
 */
async function createAssignment(accessToken, refreshToken, courseId, assignment) {
	try {
		const auth = createOAuth2Client(accessToken, refreshToken)
		const classroom = google.classroom({ version: 'v1', auth })

		const coursework = {
			title: assignment.title,
			description: assignment.description,
			state: 'PUBLISHED',
			workType: 'ASSIGNMENT'
		}

		if (assignment.dueDate) {
			coursework.dueDate = {
				year: assignment.dueDate.year,
				month: assignment.dueDate.month,
				day: assignment.dueDate.day
			}
		}

		if (assignment.dueTime) {
			coursework.dueTime = {
				hours: assignment.dueTime.hours,
				minutes: assignment.dueTime.minutes
			}
		}

		const response = await classroom.courses.courseWork.create({
			courseId: courseId,
			requestBody: coursework
		})

		return response.data
	} catch (error) {
		console.error('Erreur lors de la création du devoir:', error)
		throw error
	}
}

/**
 * Crée une annonce dans Google Classroom avec un lien
 * @param {string} accessToken - Token d'accès Google
 * @param {string} refreshToken - Token de rafraîchissement Google
 * @param {string} courseId - ID de la classe
 * @param {object} announcement - Détails de l'annonce
 * @returns {Promise<object>} Annonce créée
 */
async function createAnnouncement(accessToken, refreshToken, courseId, announcement) {
	try {
		const auth = createOAuth2Client(accessToken, refreshToken)
		const classroom = google.classroom({ version: 'v1', auth })

		const announcementData = {
			text: announcement.text,
			state: 'PUBLISHED'
		}

		// Ajouter le lien si fourni
		if (announcement.link && announcement.link.url) {
			announcementData.materials = [{
				link: {
					url: announcement.link.url,
					title: announcement.link.title || 'Lien'
				}
			}]
		}

		const response = await classroom.courses.announcements.create({
			courseId: courseId,
			requestBody: announcementData
		})

		return response.data
	} catch (error) {
		console.error('Erreur lors de la création de l\'annonce:', error)
		throw error
	}
}

/**
 * Rafraîchit un token d'accès expiré
 * @param {string} refreshToken - Token de rafraîchissement
 * @returns {Promise<object>} Nouveaux tokens
 */
async function refreshAccessToken(refreshToken) {
	try {
		const oauth2Client = new google.auth.OAuth2(
			process.env.GOOGLE_CLIENT_ID,
			process.env.GOOGLE_CLIENT_SECRET,
			process.env.GOOGLE_CALLBACK_URL
		)

		oauth2Client.setCredentials({
			refresh_token: refreshToken
		})

		const { credentials } = await oauth2Client.refreshAccessToken()

		return {
			accessToken: credentials.access_token,
			expiryDate: credentials.expiry_date
		}
	} catch (error) {
		console.error('Erreur lors du rafraîchissement du token:', error)
		throw error
	}
}

module.exports = {
	listCourses,
	listStudents,
	createAssignment,
	createAnnouncement,
	refreshAccessToken
}
