# Session de travail ChaiPad - 30 novembre 2025

## Projet
**ChaiPad** - Version personnalisée de Digipad avec intégration Google Classroom
- URL production : https://chaipad.osc-fr1.scalingo.io
- Hébergement : Scalingo
- GitHub : https://github.com/CodBad25/ChaiPad.git

---

## Problèmes résolus

### 1. Erreur SSR panzoom (RÉSOLU)
**Erreur :** `ERROR require() of ES Module @panzoom/panzoom not supported`

**Solution :** Créé un plugin client-only `plugins/panzoom.client.js` qui charge Panzoom uniquement côté navigateur.

### 2. Erreur `this.pad is undefined` (RÉSOLU)
**Erreur :** Page blanche pour les élèves avec `TypeError: can't access property "affichage", this.pad is undefined`

**Solution :**
- Ajouté `return` après `context.redirect()` dans `asyncData`
- Ajouté vérification `if (!this.pad) return` dans `created()` et `mounted()`
- Ajouté `v-if="pad"` sur le template HTML
- Ajouté vérification null dans la computed property `admin`

### 3. Clé Redis incorrecte (RÉSOLU)
**Erreur :** `TypeError: Cannot set properties of null (setting 'googleAccessToken')`

**Solution :**
- Corrigé `utilisateur:` → `utilisateurs:` dans `server/auth/google.js`
- Ajouté gestion du cas où l'utilisateur Google n'existe pas (recréation automatique)

### 4. OAuth origine JavaScript manquante (RÉSOLU)
**Solution :** Ajouté `https://chaipad.osc-fr1.scalingo.io` dans les "Origines JavaScript autorisées" de Google Cloud Console.

---

## Problèmes en cours

### 1. Upload de fichiers impossible
**Symptôme :** Le bouton "AJOUTER UN FICHIER" ne répond pas

**Cause probable :** Sur Scalingo, le système de fichiers est éphémère. Les fichiers uploadés sont perdus à chaque redémarrage du container.

**Solution à implémenter :**
- Configurer un stockage externe (Scalingo Object Storage ou AWS S3)
- Ou utiliser des liens externes en attendant (Google Drive, Imgur, etc.)

### 2. Problèmes persistants pour les élèves
**À diagnostiquer :**
- Obtenir l'URL exacte utilisée par l'élève
- Obtenir l'erreur console du navigateur de l'élève
- Vérifier si c'est page blanche ou autre problème

---

## Fichiers modifiés

### `src/digipad/src/pages/p/_id/_pad/pad.js`
- Supprimé import statique de `@panzoom/panzoom`
- Ajouté vérifications `if (!this.pad)` dans `created()` et `mounted()`
- Modifié computed property `admin` pour gérer `pad` undefined
- Modifié utilisation de Panzoom pour utiliser `window.Panzoom`

### `src/digipad/src/pages/p/_id/_pad/pad.html`
- Ajouté `v-if="pad"` sur le `<main>` principal
- Ajouté fallback "Chargement en cours..." quand pad est undefined

### `src/digipad/src/plugins/panzoom.client.js` (NOUVEAU)
- Plugin Nuxt qui charge Panzoom uniquement côté client
- Expose `window.Panzoom` globalement

### `src/digipad/src/nuxt.config.js`
- Ajouté le plugin `panzoom.client.js`

### `src/digipad/src/server/auth/google.js`
- Corrigé clés Redis (`utilisateur:` → `utilisateurs:`)
- Ajouté recréation automatique de l'utilisateur si non trouvé
- Ajouté champs manquants au modèle utilisateur (id, motdepasse, date, langue, etc.)

---

## Configuration Scalingo

### Variables d'environnement configurées
- `DB_HOST` : chaipad-8937.redis.c.osc-fr1.scalingo-dbs.com
- `DB_PORT` : 32872
- `DB_PWD` : [configuré]
- `DOMAIN` : https://chaipad.osc-fr1.scalingo.io
- `GOOGLE_CALLBACK_URL` : https://chaipad.osc-fr1.scalingo.io/auth/google/callback
- `GOOGLE_CLASSROOM_ENABLED` : true
- `GOOGLE_CLIENT_ID` : [configuré]
- `GOOGLE_CLIENT_SECRET` : [configuré]
- `HOST` : 0.0.0.0
- `NODE_ENV` : production
- `PAD_LIMIT` : 1000
- `SCALINGO_REDIS_URL` : [configuré]

### Variables manquantes (pour upload fichiers)
```
UPLOAD_LIMIT=50
S3_BUCKET_NAME=...
S3_ENDPOINT=...
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
```

---

## Google Cloud Console

### Projet
- ID : x-cycling-469509-q9

### OAuth 2.0 Client
- Origines JS autorisées :
  - http://localhost:3000
  - https://chaipad.osc-fr1.scalingo.io
- URIs de redirection :
  - http://localhost:3000/auth/google/callback
  - https://chaipad.osc-fr1.scalingo.io/auth/google/callback

---

## Commandes utiles

### Développement local
```bash
cd ~/Documents/digipad-classroom/src/digipad/src
npm run dev
```

### Build production
```bash
cd ~/Documents/digipad-classroom/src/digipad/src
npm run build
```

### Déploiement
```bash
cd ~/Documents/digipad-classroom
git add -A && git commit -m "message" && git push origin main
```

### Voir logs Scalingo
```bash
scalingo -a chaipad logs --lines 100
```

---

## Prochaines étapes

1. **Tester avec un élève** - Obtenir erreur console exacte
2. **Configurer stockage fichiers** - S3 ou Scalingo Object Storage
3. **Vérifier permissions élèves** - S'assurer qu'ils ne voient pas les boutons admin

---

## État actuel

- Site accessible : ✅
- Page d'accueil : ✅
- Pads affichés : ✅
- Connexion Google prof : ✅
- Upload fichiers : ❌ (à configurer)
- Accès élèves : ⚠️ (à tester/diagnostiquer)
