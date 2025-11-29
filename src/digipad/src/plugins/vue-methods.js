import Vue from 'vue'
import moment from 'moment'

// Charger les locales de manière sécurisée
try {
	require('moment/locale/fr')
	require('moment/locale/es')
	require('moment/locale/it')
	require('moment/locale/hr')
} catch (e) {
	console.warn('Moment locales not loaded:', e.message)
}

Vue.prototype.$formaterDate = function (date, langue) {
	let dateFormattee = ''
	switch (langue) {
	case 'fr':
		dateFormattee = moment(date).locale('fr').format('L') + ' à ' + moment(date).locale('fr').format('LT')
		break
	case 'es':
		dateFormattee = moment(date).locale('es').format('L') + ' a las ' + moment(date).locale('es').format('LT')
		break
	case 'it':
		dateFormattee = moment(date).locale('it').format('L') + ' alle ' + moment(date).locale('it').format('LT')
		break
	case 'hr':
		dateFormattee = moment(date).locale('hr').format('L') + ' u ' + moment(date).locale('hr').format('LT')
		break
	case 'en':
		dateFormattee = moment(date).locale('en').format('L') + ' at ' + moment(date).locale('en').format('LT')
		break
	}
	return dateFormattee
}

Vue.prototype.$formaterDateRelative = function (date, langue) {
	return moment(date).locale(langue).fromNow()
}

Vue.prototype.$verifierEmail = function (email) {
	const regexExp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/gi
	return regexExp.test(email)
}
