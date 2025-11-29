# Configuration Google Classroom pour Digipad

## État de l'implémentation

### ✅ Backend complet
L'intégration backend est **100% complète** et prête à fonctionner :

- ✅ Authentification Google OAuth 2.0 avec Passport.js
- ✅ Chiffrement des tokens (AES-256)
- ✅ Service Google Classroom API
- ✅ Routes API pour :
  - Connexion/Déconnexion Google
  - Récupération des classes
  - Récupération des étudiants
  - Création de devoirs dans Classroom
- ✅ Gestion automatique du refresh des tokens

### 🚧 Frontend à implémenter
Les composants Vue.js doivent encore être créés :

- ⬜ Bouton "Se connecter avec Google" sur la page d'accueil
- ⬜ Section "Mes classes Google Classroom" dans le tableau de bord
- ⬜ Modal de partage avec Google Classroom

## Configuration Google Cloud Platform

### Étape 1 : Créer un projet Google Cloud

1. Allez sur https://console.cloud.google.com/
2. Connectez-vous avec votre compte Google
3. Cliquez sur "Sélectionner un projet" en haut
4. Cliquez sur "Nouveau projet"
5. Donnez un nom : `Digipad Classroom`
6. Cliquez sur "Créer"

### Étape 2 : Activer l'API Google Classroom

1. Dans le menu à gauche, allez dans "APIs et services" > "Bibliothèque"
2. Recherchez "Google Classroom API"
3. Cliquez dessus et cliquez sur "Activer"
4. Attendez quelques secondes

### Étape 3 : Configurer l'écran de consentement OAuth

1. Dans le menu à gauche, allez dans "APIs et services" > "Écran de consentement OAuth"
2. Sélectionnez "Externe" (ou "Interne" si vous avez un Workspace)
3. Cliquez sur "Créer"
4. Remplissez les informations :
   - **Nom de l'application** : Digipad Classroom
   - **E-mail d'assistance utilisateur** : votre email
   - **Logo de l'application** : (optionnel)
   - **Domaine de l'application** : http://localhost:3000 (pour le développement)
   - **E-mail du développeur** : votre email
5. Cliquez sur "Enregistrer et continuer"
6. **Scopes** : Cliquez sur "Ajouter ou supprimer des champs d'application"
   - Recherchez et ajoutez :
     - `openid`
     - `profile`
     - `email`
     - `https://www.googleapis.com/auth/classroom.courses.readonly`
     - `https://www.googleapis.com/auth/classroom.rosters.readonly`
     - `https://www.googleapis.com/auth/classroom.coursework.students` (pour créer des devoirs)
7. Cliquez sur "Enregistrer et continuer"
8. **Utilisateurs de test** : Ajoutez votre adresse email Google
9. Cliquez sur "Enregistrer et continuer"

### Étape 4 : Créer les identifiants OAuth 2.0

1. Dans le menu à gauche, allez dans "APIs et services" > "Identifiants"
2. Cliquez sur "+ Créer des identifiants" en haut
3. Sélectionnez "ID client OAuth"
4. Type d'application : "Application Web"
5. Nom : "Digipad Web Client"
6. **Origines JavaScript autorisées** :
   ```
   http://localhost:3000
   ```
   (Plus tard, ajoutez votre domaine de production : `https://votre-domaine.com`)

7. **URI de redirection autorisés** :
   ```
   http://localhost:3000/auth/google/callback
   ```
   (Plus tard, ajoutez : `https://votre-domaine.com/auth/google/callback`)

8. Cliquez sur "Créer"
9. **IMPORTANT** : Copiez le **Client ID** et le **Client Secret**

### Étape 5 : Configurer les variables d'environnement

Modifiez le fichier `.env` dans `/src/digipad/src/.env` :

```env
# Remplacez par vos vraies credentials
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-votre_secret_ici
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
GOOGLE_CLASSROOM_ENABLED=true
ENCRYPTION_KEY=votre-cle-de-chiffrement-32-caracteres-aleatoires
```

**Pour générer une clé de chiffrement aléatoire** :
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Étape 6 : Redémarrer le serveur

```bash
cd ~/Documents/digipad-classroom/src/digipad/src
npm run dev
```

## Test de l'intégration

### 1. Tester l'authentification Google

Ouvrez votre navigateur et allez sur :
```
http://localhost:3000/auth/google
```

Vous devriez être redirigé vers Google pour autoriser l'application.

### 2. Tester la récupération des classes (avec Postman ou curl)

Après vous être connecté, testez l'API :

```bash
curl -X POST http://localhost:3000/api/google/classes \
  -H "Content-Type: application/json" \
  -H "Cookie: digipad=VOTRE_SESSION_COOKIE"
```

(Le cookie de session est stocké après la connexion)

### 3. Tester avec un compte enseignant Google Classroom

**IMPORTANT** : Pour voir vos classes, vous devez :
- Avoir un compte Google Workspace for Education
- OU avoir créé au moins une classe de test dans Google Classroom (https://classroom.google.com)

## Architecture des fichiers créés

```
src/digipad/src/
├── server/
│   ├── auth/
│   │   ├── google.js          ✅ Configuration Passport Google OAuth
│   │   └── crypto.js           ✅ Chiffrement/déchiffrement des tokens
│   ├── services/
│   │   └── classroom.js        ✅ Service Google Classroom API
│   ├── routes/
│   │   └── google-auth.js      ✅ Routes d'authentification et API
│   └── index.js                ✅ Modifié pour intégrer Passport
└── .env                         ✅ Variables d'environnement
```

## Routes API disponibles

### Authentification

**GET** `/auth/google`
- Démarre le processus d'authentification Google OAuth
- Redirige vers Google pour autoriser l'application
- Après autorisation, redirige vers `/auth/google/callback`

**GET** `/auth/google/callback`
- Callback après authentification Google
- Crée ou met à jour l'utilisateur
- Crée une session
- Redirige vers `/u/{identifiant}`

**POST** `/api/google/disconnect`
- Déconnecte le compte Google de l'utilisateur
- Supprime les tokens Google
- **Requiert** : Session authentifiée
- **Retourne** : `{ resultat: 1, message: "..." }`

### Google Classroom

**POST** `/api/google/classes`
- Récupère toutes les classes de l'enseignant
- Rafraîchit automatiquement le token si expiré
- **Requiert** : Session authentifiée + compte Google connecté
- **Retourne** :
  ```json
  {
    "resultat": 1,
    "classes": [
      {
        "id": "123456789",
        "name": "Mathématiques 3ème",
        "section": "Année 2024-2025",
        "ownerId": "...",
        "..."
      }
    ]
  }
  ```

**POST** `/api/google/students`
- Récupère les étudiants d'une classe spécifique
- **Requiert** : Session authentifiée + compte Google connecté
- **Body** : `{ "courseId": "123456789" }`
- **Retourne** :
  ```json
  {
    "resultat": 1,
    "students": [
      {
        "userId": "...",
        "profile": {
          "id": "...",
          "name": "John Doe",
          "emailAddress": "john@example.com",
          "photoUrl": "..."
        }
      }
    ]
  }
  ```

**POST** `/api/google/create-assignment`
- Crée un devoir dans Google Classroom
- **Requiert** : Session authentifiée + compte Google connecté
- **Body** :
  ```json
  {
    "courseId": "123456789",
    "title": "Exercice sur Digipad",
    "description": "Lien vers le pad : http://localhost:3000/p/abc123/token",
    "dueDate": {
      "year": 2025,
      "month": 11,
      "day": 20
    },
    "dueTime": {
      "hours": 23,
      "minutes": 59
    }
  }
  ```
- **Retourne** :
  ```json
  {
    "resultat": 1,
    "assignment": { ... }
  }
  ```

## Modèle de données Redis

### Utilisateur avec Google

```javascript
utilisateur:{identifiant} = {
  identifiant: "u1a2b3c4d5e6f7g8",
  nom: "John Doe",
  email: "john@example.com",
  motDePasse: null,  // Peut être null si authentification uniquement via Google
  statut: "utilisateur",

  // Nouvelles propriétés Google
  googleId: "1234567890",
  googleAccessToken: "ENCRYPTED_TOKEN",  // Chiffré avec AES-256
  googleRefreshToken: "ENCRYPTED_TOKEN",  // Chiffré avec AES-256
  googleTokenExpiry: 1699999999999,  // Timestamp

  pads: "[]",  // JSON array
  classes: "[...]"  // JSON array des classes Google Classroom
}

// Index pour retrouver un utilisateur par son googleId
google:{googleId} = "{identifiant}"
```

## Sécurité

### Chiffrement des tokens

Les tokens Google sont **TOUJOURS chiffrés** avant d'être stockés dans Redis :
- Algorithme : AES-256
- Clé : `ENCRYPTION_KEY` dans `.env`
- Les tokens ne sont jamais stockés en clair

### Rafraîchissement automatique

Le système vérifie automatiquement si le token est expiré :
- Si expiré : utilise le `refresh_token` pour obtenir un nouveau `access_token`
- Met à jour automatiquement dans Redis
- Transparent pour l'utilisateur

### Scopes OAuth

L'application demande uniquement les permissions **strictement nécessaires** :
- `openid`, `profile`, `email` : Informations de base
- `classroom.courses.readonly` : Lire les classes (pas de modification)
- `classroom.rosters.readonly` : Lire les listes d'étudiants (pas de modification)
- `classroom.coursework.students` : Créer des devoirs (optionnel)

## Prochaines étapes

### Phase 1 : Frontend (À implémenter)

#### 1. Bouton Google sur la page d'accueil

Modifier `pages/index.vue` pour ajouter un bouton "Se connecter avec Google" :

```vue
<template>
  <div id="actions">
    <span class="bouton" @click="afficherModaleConnexion">{{ $t('seConnecter') }}</span>
    <span class="bouton" @click="afficherModaleInscription">{{ $t('sInscrire') }}</span>

    <!-- NOUVEAU : Bouton Google -->
    <a href="/auth/google" class="bouton bouton-google">
      <img src="/img/google-logo.svg" alt="Google" width="20" height="20">
      Se connecter avec Google
    </a>

    <span class="bouton" @click="afficherModaleCreer">{{ $t('creerPad') }}</span>
  </div>
</template>
```

#### 2. Section Google Classroom dans le tableau de bord

Créer un composant `components/ClassroomManager.vue` :

```vue
<template>
  <div class="classroom-manager">
    <h2>Mes classes Google Classroom</h2>

    <button @click="syncClasses">Synchroniser les classes</button>

    <div v-if="loading">Chargement...</div>

    <div v-else class="classes-grid">
      <div v-for="classe in classes" :key="classe.id" class="classe-card">
        <h3>{{ classe.name }}</h3>
        <p>{{ classe.section }}</p>
        <p>{{ classe.students ? classe.students.length : 0 }} étudiants</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      classes: [],
      loading: false
    }
  },
  methods: {
    async syncClasses() {
      this.loading = true
      try {
        const response = await this.$axios.post('/api/google/classes')
        if (response.data.resultat === 1) {
          this.classes = response.data.classes
        }
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
```

#### 3. Modal de partage avec Google Classroom

Ajouter dans `pages/p/_id/_pad/pad.vue` :

```vue
<button @click="shareWithClassroom">Partager avec Google Classroom</button>
```

### Phase 2 : Tests

1. Tester avec un vrai compte Google Workspace for Education
2. Créer une classe de test dans Google Classroom
3. Ajouter des étudiants fictifs
4. Tester la création de devoirs
5. Tester le partage de pads

### Phase 3 : Production

1. Obtenir un domaine (ex: digipad-votreetablissement.fr)
2. Mettre à jour les URIs autorisés dans Google Cloud Console
3. Passer l'application OAuth en "Production" (au lieu de "Test")
4. Configurer HTTPS (obligatoire pour OAuth en production)
5. Mettre à jour les variables d'environnement

## Dépannage

### Erreur "redirect_uri_mismatch"

**Cause** : L'URI de redirection ne correspond pas à celle configurée dans Google Cloud Console

**Solution** :
1. Vérifiez que `GOOGLE_CALLBACK_URL` dans `.env` correspond EXACTEMENT à l'URI configurée
2. Incluez le protocole (`http://` ou `https://`)
3. N'oubliez pas le port (`:3000`) en développement
4. Pas de slash `/` à la fin

### Erreur "invalid_client"

**Cause** : Les credentials Google sont incorrectes

**Solution** :
1. Vérifiez que `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` sont corrects
2. Pas d'espaces avant/après
3. Recopiez-les depuis Google Cloud Console

### Les classes ne s'affichent pas

**Cause** : Le compte Google n'est pas enseignant ou n'a pas de classes

**Solution** :
1. Allez sur https://classroom.google.com
2. Créez une classe de test
3. Ajoutez au moins un étudiant
4. Ré-essayez la synchronisation

### Token expiré

**Cause** : Le token d'accès a expiré et le refresh a échoué

**Solution** :
- Le système devrait le gérer automatiquement
- Si problème persistant : déconnectez et reconnectez le compte Google

## Support

Pour toute question ou problème, consultez :
- Documentation Google OAuth 2.0 : https://developers.google.com/identity/protocols/oauth2
- Documentation Google Classroom API : https://developers.google.com/classroom
- Documentation Passport.js : http://www.passportjs.org/

## Licence

Cette intégration est sous la même licence que Digipad (GNU GPLv3).
