#!/usr/bin/env node
/**
 * Script d'import en masse des pads Digipad
 *
 * Usage:
 *   node mass-import.js /chemin/vers/dossier/zips
 *
 * Le script va :
 * 1. Lire tous les fichiers .zip du dossier
 * 2. Les importer un par un dans votre instance locale
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Configuration
const CONFIG = {
    // URL de votre instance locale
    LOCAL_INSTANCE: process.env.LOCAL_INSTANCE || 'http://localhost:3000',

    // Identifiant de l'utilisateur cible (celui qui recevra les pads)
    USER_ID: process.env.USER_ID || 'u343d486ca0ad', // À modifier !

    // Délai entre chaque import (ms)
    DELAY: 2000
};

async function importPad(zipPath) {
    const FormData = (await import('form-data')).default;
    const fetch = (await import('node-fetch')).default;

    const form = new FormData();
    form.append('fichier', fs.createReadStream(zipPath));
    form.append('identifiant', CONFIG.USER_ID);

    const response = await fetch(`${CONFIG.LOCAL_INSTANCE}/api/importer-pad`, {
        method: 'POST',
        body: form,
        headers: form.getHeaders()
    });

    const result = await response.json();
    return result;
}

async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log(`
╔══════════════════════════════════════════════════════════════╗
║          Script d'import en masse - ChaiPad                  ║
╚══════════════════════════════════════════════════════════════╝

Usage:
  node mass-import.js <dossier_des_zips>

Exemple:
  node mass-import.js ~/Downloads/digipad_exports

Configuration (variables d'environnement):
  LOCAL_INSTANCE  URL de votre instance (défaut: http://localhost:3000)
  USER_ID         Identifiant utilisateur cible (défaut: ${CONFIG.USER_ID})

Exemple avec config:
  LOCAL_INSTANCE=http://localhost:3000 USER_ID=monid node mass-import.js ~/Downloads
`);
        process.exit(1);
    }

    const sourceDir = args[0];

    // Vérifier que le dossier existe
    if (!fs.existsSync(sourceDir)) {
        console.error(`❌ Dossier non trouvé: ${sourceDir}`);
        process.exit(1);
    }

    // Lister les fichiers .zip
    const files = fs.readdirSync(sourceDir)
        .filter(f => f.endsWith('.zip'))
        .map(f => path.join(sourceDir, f));

    if (files.length === 0) {
        console.error(`❌ Aucun fichier .zip trouvé dans: ${sourceDir}`);
        process.exit(1);
    }

    console.log(`
╔══════════════════════════════════════════════════════════════╗
║          Import en masse - ChaiPad                           ║
╚══════════════════════════════════════════════════════════════╝

📁 Dossier source: ${sourceDir}
📦 Fichiers trouvés: ${files.length}
🌐 Instance cible: ${CONFIG.LOCAL_INSTANCE}
👤 Utilisateur: ${CONFIG.USER_ID}

`);

    // Demander confirmation
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const answer = await new Promise(resolve => {
        rl.question('Continuer ? (o/n) ', resolve);
    });
    rl.close();

    if (answer.toLowerCase() !== 'o' && answer.toLowerCase() !== 'oui') {
        console.log('Annulé.');
        process.exit(0);
    }

    console.log('\n--- Début de l\'import ---\n');

    let success = 0;
    let errors = 0;
    const errorList = [];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filename = path.basename(file);

        process.stdout.write(`[${i + 1}/${files.length}] ${filename}... `);

        try {
            const result = await importPad(file);

            if (result.id) {
                console.log(`✓ Importé (ID: ${result.id})`);
                success++;
            } else if (result.message) {
                console.log(`⚠ ${result.message}`);
                errors++;
                errorList.push({ file: filename, error: result.message });
            } else {
                console.log(`✓ OK`);
                success++;
            }
        } catch (e) {
            console.log(`✗ Erreur: ${e.message}`);
            errors++;
            errorList.push({ file: filename, error: e.message });
        }

        // Pause entre les imports
        if (i < files.length - 1) {
            await new Promise(r => setTimeout(r, CONFIG.DELAY));
        }
    }

    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                      RÉSUMÉ                                  ║
╚══════════════════════════════════════════════════════════════╝

✓ Importés avec succès: ${success}
✗ Erreurs: ${errors}
`);

    if (errorList.length > 0) {
        console.log('Fichiers en erreur:');
        errorList.forEach(e => console.log(`  - ${e.file}: ${e.error}`));
    }

    console.log(`\n🎉 Import terminé ! Vos pads sont disponibles sur ${CONFIG.LOCAL_INSTANCE}`);
}

main().catch(console.error);
