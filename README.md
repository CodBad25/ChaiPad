# Digipad + Google Classroom

Version personnalisée de [Digipad](https://digipad.app/) avec intégration Google Classroom.

## Fonctionnalités

### Digipad Original
- Création de murs collaboratifs (pads)
- Collaboration en temps réel avec Socket.io
- Support multimédia (images, vidéos, fichiers)
- Gestion de comptes utilisateurs
- Partage de pads avec mot de passe

### Nouvelles fonctionnalités Google Classroom

#### ✅ Implémenté (Backend)
- Authentification via Google OAuth 2.0
- Synchronisation des classes Google Classroom
- Récupération de la liste des étudiants
- Création de devoirs dans Google Classroom
- Chiffrement sécurisé des tokens Google (AES-256)
- Rafraîchissement automatique des tokens

#### 🚧 À implémenter (Frontend)
- Bouton "Se connecter avec Google" sur la page d'accueil
- Interface de gestion des classes dans le tableau de bord
- Modal de partage d'un pad avec une classe Google Classroom
- Création de devoirs avec un pad directement depuis l'interface

## Architecture

```
digipad-classroom/
├── README.md                           # Ce fichier
├── PLAN_INTEGRATION_GOOGLE_CLASSROOM.md # Plan détaillé de l'intégration
├── GOOGLE_CLASSROOM_SETUP.md           # Guide de configuration Google Cloud
│
└── src/digipad/
    ├── Makefile
    ├── dockerfile
    └── src/
        ├── server/
        │   ├── index.js                # ✅ Modifié : intégration Passport
        │   ├── auth/
        │   │   ├── google.js           # ✅ Nouveau : Config OAuth Google
        │   │   └── crypto.js           # ✅ Nouveau : Chiffrement tokens
        │   ├── services/
        │   │   └── classroom.js        # ✅ Nouveau : Service Classroom API
        │   └── routes/
        │       └── google-auth.js      # ✅ Nouveau : Routes API Google
        │
        ├── components/                 # 🚧 À créer : composants Vue.js
        ├── pages/
        │   ├── index.vue               # 🚧 À modifier : bouton Google
        │   └── u/_utilisateur.vue      # 🚧 À modifier : section classes
        │
        ├── .env                        # ✅ Modifié : credentials Google
        ├── package.json                # ✅ Modifié : nouvelles dépendances
        └── nuxt.config.js
```

## Installation

### Prérequis

- Node.js v14+ (testé avec v24.11.0)
- Redis
- Compte Google Cloud Platform (pour les credentials OAuth)

### 1. Cloner le projet

Le projet est déjà cloné dans :
```
~/Documents/digipad-classroom/
```

### 2. Installer Redis

```bash
brew install redis
brew services start redis
```

### 3. Installer les dépendances

```bash
cd ~/Documents/digipad-classroom/src/digipad/src
npm install
```

Dépendances ajoutées pour Google Classroom :
- `passport` : Authentification
- `passport-google-oauth20` : Stratégie Google OAuth
- `googleapis` : API Google
- `crypto-js` : Chiffrement des tokens

### 4. Configurer Google Cloud Platform

**Suivez le guide complet** : [GOOGLE_CLASSROOM_SETUP.md](./GOOGLE_CLASSROOM_SETUP.md)

Résumé :
1. Créer un projet sur Google Cloud Console
2. Activer Google Classroom API
3. Configurer l'écran de consentement OAuth
4. Créer des identifiants OAuth 2.0
5. Copier Client ID et Client Secret

### 5. Configurer les variables d'environnement

Éditez le fichier `.env` :

```bash
cd ~/Documents/digipad-classroom/src/digipad/src
nano .env
```

Modifiez ces lignes :

```env
# Google OAuth & Classroom
GOOGLE_CLIENT_ID=VOTRE_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=VOTRE_CLIENT_SECRET
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
GOOGLE_CLASSROOM_ENABLED=true
ENCRYPTION_KEY=GENERER_UNE_CLE_ALEATOIRE_32_CHARS
```

Pour générer une clé de chiffrement :
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 6. Démarrer le serveur

```bash
npm run dev
```

Le serveur démarre sur http://localhost:3000

## Utilisation

### Authentification Google

#### Méthode 1 : Via l'URL directe (pour tester)

Ouvrez votre navigateur :
```
http://localhost:3000/auth/google
```

Vous serez redirigé vers Google pour autoriser l'application.

#### Méthode 2 : Via le frontend (à implémenter)

Un bouton "Se connecter avec Google" doit être ajouté sur la page d'accueil.

### API Google Classroom

Une fois authentifié, vous pouvez utiliser ces routes API :

#### Récupérer vos classes

```bash
curl -X POST http://localhost:3000/api/google/classes \
  -H "Content-Type: application/json" \
  -b "digipad=VOTRE_SESSION_COOKIE"
```

#### Récupérer les étudiants d'une classe

```bash
curl -X POST http://localhost:3000/api/google/students \
  -H "Content-Type: application/json" \
  -d '{"courseId": "123456789"}' \
  -b "digipad=VOTRE_SESSION_COOKIE"
```

#### Créer un devoir

```bash
curl -X POST http://localhost:3000/api/google/create-assignment \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "123456789",
    "title": "Exercice sur Digipad",
    "description": "Accédez au pad : http://localhost:3000/p/abc123/token"
  }' \
  -b "digipad=VOTRE_SESSION_COOKIE"
```

## Routes API

### Authentification

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/auth/google` | Démarre l'authentification Google |
| GET | `/auth/google/callback` | Callback OAuth (automatique) |
| POST | `/api/google/disconnect` | Déconnecte le compte Google |

### Google Classroom

| Méthode | Route | Description | Auth requise |
|---------|-------|-------------|--------------|
| POST | `/api/google/classes` | Liste les classes de l'enseignant | ✅ |
| POST | `/api/google/students` | Liste les étudiants d'une classe | ✅ |
| POST | `/api/google/create-assignment` | Crée un devoir dans Classroom | ✅ |

## Sécurité

### Chiffrement des tokens

Les tokens Google OAuth sont **TOUJOURS chiffrés** avant d'être stockés dans Redis :
- Algorithme : AES-256
- Clé : définie dans `ENCRYPTION_KEY` (`.env`)
- Les tokens ne sont jamais stockés en clair

### Scopes OAuth demandés

L'application demande uniquement les permissions nécessaires :
- `openid`, `profile`, `email` : Informations de base
- `classroom.courses.readonly` : Lire les classes (lecture seule)
- `classroom.rosters.readonly` : Lire les listes d'étudiants (lecture seule)
- `classroom.coursework.students` : Créer des devoirs

### RGPD

- Les données Google sont stockées dans Redis (local)
- Les tokens sont chiffrés
- L'utilisateur peut déconnecter son compte Google à tout moment
- Suppression des données possible via `/api/google/disconnect`

## Développement

### Structure des fichiers créés/modifiés

#### Backend (✅ Complet)

- [server/auth/google.js](./src/digipad/src/server/auth/google.js) - Configuration Passport Google OAuth
- [server/auth/crypto.js](./src/digipad/src/server/auth/crypto.js) - Chiffrement/déchiffrement
- [server/services/classroom.js](./src/digipad/src/server/services/classroom.js) - Service Classroom API
- [server/routes/google-auth.js](./src/digipad/src/server/routes/google-auth.js) - Routes API
- [server/index.js](./src/digipad/src/server/index.js) - Intégration Passport (lignes 107-128)

#### Frontend (🚧 À faire)

Composants Vue.js à créer :
- `components/GoogleLoginButton.vue` - Bouton de connexion Google
- `components/ClassroomManager.vue` - Gestion des classes
- `components/ShareWithClassroom.vue` - Modal de partage

Pages à modifier :
- `pages/index.vue` - Ajouter le bouton Google
- `pages/u/_utilisateur.vue` - Ajouter la section classes

### Scripts npm

```bash
npm run dev        # Démarrage en mode développement
npm run build      # Build pour production
npm run start      # Démarrage en mode production
```

## Tests

### Prérequis pour tester

1. Avoir un compte Google
2. Créer au moins une classe de test sur https://classroom.google.com
3. Ajouter quelques étudiants fictifs

### Tester l'authentification

1. Allez sur `http://localhost:3000/auth/google`
2. Autorisez l'application
3. Vous devriez être redirigé vers `/u/{votre-identifiant}`

### Tester la récupération des classes

Utilisez Postman ou curl après authentification.

## Production

### Avant de déployer en production

1. **Obtenir un domaine** (ex: digipad-ecole.fr)
2. **Configurer HTTPS** (obligatoire pour OAuth)
3. **Mettre à jour Google Cloud Console** :
   - Ajouter le domaine dans "Origines JavaScript autorisées"
   - Ajouter `https://votre-domaine.com/auth/google/callback` dans "URI de redirection"
4. **Passer l'app OAuth en mode "Production"**
5. **Mettre à jour `.env`** :
   ```env
   DOMAIN=https://votre-domaine.com
   GOOGLE_CALLBACK_URL=https://votre-domaine.com/auth/google/callback
   ```
6. **Générer une nouvelle clé de chiffrement** pour la production

## Documentation

- [Plan d'intégration détaillé](./PLAN_INTEGRATION_GOOGLE_CLASSROOM.md)
- [Guide de configuration Google Cloud](./GOOGLE_CLASSROOM_SETUP.md)
- [Documentation Digipad originale](https://ladigitale.dev/digipad/)

## Licence

GNU GPLv3 - Identique à Digipad original

## Crédits

- **Digipad original** : [La Digitale](https://ladigitale.dev/) - Emmanuel ZIMMERT
- **Intégration Google Classroom** : Version personnalisée

## Support

- Documentation Google OAuth : https://developers.google.com/identity/protocols/oauth2
- Documentation Google Classroom API : https://developers.google.com/classroom
- Code source Digipad : https://codeberg.org/ladigitale/digipad

## Changelog

### Version 0.9.10-classroom (Nov 2025)

#### Ajouté
- ✅ Authentification Google OAuth 2.0 avec Passport.js
- ✅ Intégration Google Classroom API
- ✅ Chiffrement sécurisé des tokens (AES-256)
- ✅ Routes API pour classes, étudiants, devoirs
- ✅ Rafraîchissement automatique des tokens
- ✅ Documentation complète

#### À faire
- 🚧 Interface frontend (composants Vue.js)
- 🚧 Bouton connexion Google
- 🚧 Gestion des classes dans le tableau de bord
- 🚧 Modal de partage avec Classroom
