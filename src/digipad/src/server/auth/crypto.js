/**
 * Module de chiffrement pour les tokens Google
 * Utilise AES-256 pour chiffrer/déchiffrer les tokens sensibles
 */

const CryptoJS = require('crypto-js')

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production'

/**
 * Chiffre un texte avec AES-256
 * @param {string} text - Texte à chiffrer
 * @returns {string} Texte chiffré
 */
function encrypt(text) {
	if (!text) return null
	return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString()
}

/**
 * Déchiffre un texte chiffré avec AES-256
 * @param {string} encryptedText - Texte chiffré
 * @returns {string} Texte déchiffré
 */
function decrypt(encryptedText) {
	if (!encryptedText) return null
	try {
		const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY)
		return bytes.toString(CryptoJS.enc.Utf8)
	} catch (error) {
		console.error('Erreur de déchiffrement:', error)
		return null
	}
}

module.exports = {
	encrypt,
	decrypt
}
