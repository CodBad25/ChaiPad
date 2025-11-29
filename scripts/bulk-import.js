/**
 * Script d'import en masse des pads exportés de Digipad
 *
 * Usage:
 *   REDIS_URL=redis://... node scripts/bulk-import.js <dossier-exports> <identifiant-admin>
 *
 * Exemple:
 *   REDIS_URL="redis://chaipad-8937:PASSWORD@chaipad-8937.redis.c.osc-fr1.scalingo-dbs.com:32872" \
 *   node scripts/bulk-import.js ~/Downloads/digipad_exports macbelhaj.school@gmail.com
 */

const fs = require('fs-extra')
const path = require('path')
const extract = require('extract-zip')
const redis = require('redis')
const { promisify } = require('util')

// Configuration
const EXPORTS_DIR = process.argv[2] || path.join(process.env.HOME, 'Downloads/digipad_exports')
const ADMIN_IDENTIFIANT = process.argv[3] || 'admin'
const REDIS_URL = process.env.REDIS_URL || process.env.SCALINGO_REDIS_URL

if (!REDIS_URL) {
  console.error('❌ Erreur: Variable REDIS_URL requise')
  console.error('Usage: REDIS_URL=redis://... node scripts/bulk-import.js <dossier-exports> <identifiant>')
  process.exit(1)
}

// Connexion Redis
const db = redis.createClient({ url: REDIS_URL })

// Promisify Redis commands
const dbGet = promisify(db.get).bind(db)
const dbSet = promisify(db.set).bind(db)
const dbIncr = promisify(db.incr).bind(db)
const dbHmset = promisify(db.hmset).bind(db)
const dbSadd = promisify(db.sadd).bind(db)
const dbHset = promisify(db.hset).bind(db)
const dbZadd = promisify(db.zadd).bind(db)
const dbExists = promisify(db.exists).bind(db)

// Couleurs disponibles
const couleurs = ['#0891b2', '#3b82f6', '#059669', '#eab308', '#f59e0b', '#d97706', '#ef4444', '#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#6366f1', '#8b5cf6', '#71717a']

function choisirCouleur() {
  return couleurs[Math.floor(Math.random() * couleurs.length)]
}

function definirDossierFichiers(id) {
  // Pour ChaiPad, on utilise 'fichiers' par défaut
  return 'fichiers'
}

async function importerPad(zipPath, identifiant) {
  const tempDir = path.join('/tmp', 'chaipad-import-' + Math.random().toString(36).slice(2))

  try {
    // Extraction du ZIP
    await extract(zipPath, { dir: tempDir })

    // Lecture des données
    const donneesPath = path.join(tempDir, 'donnees.json')
    if (!await fs.pathExists(donneesPath)) {
      throw new Error('Fichier donnees.json manquant')
    }

    const donnees = await fs.readJson(donneesPath)

    // Vérification des données
    if (!donnees.pad || !donnees.blocs) {
      throw new Error('Données corrompues')
    }

    // Obtenir le prochain ID de pad
    let currentPadId = await dbGet('pad')
    if (!currentPadId) {
      currentPadId = 0
    }
    const newPadId = parseInt(currentPadId) + 1

    console.log(`  📝 Import pad "${donnees.pad.titre}" (ancien ID: ${donnees.pad.id} → nouveau ID: ${newPadId})`)

    // Import des blocs
    const blocsMapping = {}
    for (let i = 0; i < donnees.blocs.length; i++) {
      const bloc = donnees.blocs[i]
      if (!bloc || Object.keys(bloc).length === 0) continue

      const newBlocId = 'bloc-id-' + Date.now() + Math.random().toString(16).slice(10)
      blocsMapping[bloc.bloc] = newBlocId

      // Mise à jour du chemin de la vignette
      let vignette = bloc.vignette || ''
      if (vignette !== '') {
        // Remplacer l'ancien chemin par le nouveau
        const oldFolder = definirDossierFichiers(donnees.pad.id)
        const newFolder = definirDossierFichiers(newPadId)
        vignette = vignette.replace(`/${oldFolder}/${donnees.pad.id}`, `/${newFolder}/${newPadId}`)
      }

      const date = new Date().toISOString()

      // Insérer le bloc dans Redis
      await dbHmset(`pad-${newPadId}:${newBlocId}`,
        'id', bloc.id || i.toString(),
        'bloc', newBlocId,
        'titre', bloc.titre || '',
        'texte', bloc.texte || '',
        'media', bloc.media || '',
        'iframe', bloc.iframe || '',
        'type', bloc.type || 'texte',
        'source', bloc.source || '',
        'vignette', vignette,
        'date', date,
        'identifiant', bloc.identifiant || identifiant,
        'commentaires', (bloc.listeCommentaires?.length || bloc.commentaires || 0).toString(),
        'evaluations', (bloc.listeEvaluations?.length || bloc.evaluations || 0).toString(),
        'colonne', (bloc.colonne || 0).toString(),
        'visibilite', bloc.visibilite || 'visible'
      )

      // Ajouter au sorted set des blocs
      await dbZadd(`blocs:${newPadId}`, i, newBlocId)

      // Import des commentaires
      if (bloc.listeCommentaires && bloc.listeCommentaires.length > 0) {
        for (const commentaire of bloc.listeCommentaires) {
          if (commentaire.id && commentaire.identifiant && commentaire.date && commentaire.texte) {
            await dbZadd(`commentaires:${newBlocId}`, commentaire.id, JSON.stringify(commentaire))
          }
        }
      }

      // Import des évaluations
      if (bloc.listeEvaluations && bloc.listeEvaluations.length > 0) {
        for (const evaluation of bloc.listeEvaluations) {
          if (evaluation.id && evaluation.identifiant && evaluation.date && evaluation.etoiles) {
            await dbZadd(`evaluations:${newBlocId}`, evaluation.id, JSON.stringify(evaluation))
          }
        }
      }
    }

    // Créer le pad
    const token = Math.random().toString(16).slice(2)
    const date = new Date().toISOString()
    const couleur = choisirCouleur()
    const code = Math.floor(1000 + Math.random() * 9000)

    // Mise à jour du fond si c'est un chemin local
    let fond = donnees.pad.fond || '#0891b2'
    if (fond.startsWith('/nfs') || fond.startsWith('/fichiers')) {
      // Le fichier ne sera pas accessible, utiliser une couleur par défaut
      fond = choisirCouleur()
    }

    await dbIncr('pad')

    await dbHmset(`pads:${newPadId}`,
      'id', newPadId.toString(),
      'token', token,
      'titre', donnees.pad.titre || 'Pad importé',
      'identifiant', identifiant,
      'fond', fond,
      'acces', donnees.pad.acces || 'public',
      'code', code.toString(),
      'contributions', donnees.pad.contributions || 'ouvertes',
      'affichage', donnees.pad.affichage || 'mur',
      'registreActivite', donnees.pad.registreActivite || 'active',
      'conversation', donnees.pad.conversation || 'desactivee',
      'listeUtilisateurs', donnees.pad.listeUtilisateurs || 'activee',
      'editionNom', donnees.pad.editionNom || 'desactivee',
      'fichiers', donnees.pad.fichiers || 'actives',
      'liens', donnees.pad.liens || 'actives',
      'documents', donnees.pad.documents || 'desactives',
      'commentaires', donnees.pad.commentaires || 'desactives',
      'evaluations', donnees.pad.evaluations || 'desactivees',
      'ordre', donnees.pad.ordre || 'croissant',
      'date', date,
      'colonnes', donnees.pad.colonnes || '[]',
      'bloc', (donnees.blocs.length).toString(),
      'activite', '0',
      'admins', '[]'
    )

    // Associer le pad à l'utilisateur
    await dbSadd(`pads-crees:${identifiant}`, newPadId)
    await dbSadd(`utilisateurs-pads:${newPadId}`, identifiant)
    await dbHset(`couleurs:${identifiant}`, `pad${newPadId}`, couleur)

    // Import de l'activité si disponible
    if (donnees.activite && donnees.activite.length > 0) {
      for (const activite of donnees.activite) {
        if (activite.bloc && activite.identifiant && activite.titre && activite.date && activite.type && activite.id) {
          // Mettre à jour le bloc ID
          const newBlocId = blocsMapping[activite.bloc] || activite.bloc
          activite.bloc = newBlocId
          await dbZadd(`activite:${newPadId}`, activite.id, JSON.stringify(activite))
        }
      }
    }

    // Nettoyage
    await fs.remove(tempDir)

    return { success: true, oldId: donnees.pad.id, newId: newPadId, titre: donnees.pad.titre }

  } catch (error) {
    await fs.remove(tempDir).catch(() => {})
    return { success: false, error: error.message, file: path.basename(zipPath) }
  }
}

async function main() {
  console.log('🚀 Démarrage de l\'import en masse')
  console.log(`📁 Dossier des exports: ${EXPORTS_DIR}`)
  console.log(`👤 Identifiant admin: ${ADMIN_IDENTIFIANT}`)
  console.log('')

  // Vérifier la connexion Redis
  db.on('error', (err) => {
    console.error('❌ Erreur Redis:', err.message)
    process.exit(1)
  })

  await new Promise((resolve) => {
    db.on('connect', () => {
      console.log('✅ Connecté à Redis')
      resolve()
    })
  })

  // Lister les fichiers ZIP
  const files = await fs.readdir(EXPORTS_DIR)
  const zipFiles = files.filter(f => f.endsWith('.zip') && f.startsWith('pad-'))

  console.log(`📦 ${zipFiles.length} fichiers ZIP trouvés\n`)

  const results = {
    success: [],
    failed: []
  }

  // Importer chaque pad
  for (let i = 0; i < zipFiles.length; i++) {
    const zipFile = zipFiles[i]
    const zipPath = path.join(EXPORTS_DIR, zipFile)

    console.log(`[${i + 1}/${zipFiles.length}] Import de ${zipFile}...`)

    const result = await importerPad(zipPath, ADMIN_IDENTIFIANT)

    if (result.success) {
      results.success.push(result)
      console.log(`  ✅ Succès: ${result.titre} (ID: ${result.newId})`)
    } else {
      results.failed.push(result)
      console.log(`  ❌ Échec: ${result.error}`)
    }
  }

  // Résumé
  console.log('\n' + '='.repeat(50))
  console.log('📊 RÉSUMÉ DE L\'IMPORT')
  console.log('='.repeat(50))
  console.log(`✅ Réussis: ${results.success.length}`)
  console.log(`❌ Échoués: ${results.failed.length}`)

  if (results.failed.length > 0) {
    console.log('\nPads échoués:')
    results.failed.forEach(r => console.log(`  - ${r.file}: ${r.error}`))
  }

  // Sauvegarder le mapping des IDs
  const mappingFile = path.join(EXPORTS_DIR, 'import-mapping.json')
  await fs.writeJson(mappingFile, {
    date: new Date().toISOString(),
    identifiant: ADMIN_IDENTIFIANT,
    success: results.success,
    failed: results.failed
  }, { spaces: 2 })
  console.log(`\n📄 Mapping sauvegardé: ${mappingFile}`)

  db.quit()
  console.log('\n✨ Import terminé!')
}

main().catch(err => {
  console.error('❌ Erreur fatale:', err)
  process.exit(1)
})
