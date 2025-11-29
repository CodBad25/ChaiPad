# Plan d'Intégration Google Classroom pour Digipad

## État actuel de Digipad

### Architecture
- **Backend** : Node.js + Express + Socket.io
- **Frontend** : Nuxt.js 2 (Vue.js)
- **Base de données** : Redis
- **Authentification** : Sessions Express + bcrypt

### Système d'authentification actuel
- Deux types d'utilisateurs :
  - `invite` : Utilisateur anonyme (nom généré aléatoirement)
  - `utilisateur` : Utilisateur inscrit avec identifiant/mot de passe
- Stockage des sessions dans Redis
- Identifiant unique : `u` + hash aléatoire

## Objectifs de l'intégration

1. Permettre l'authentification via Google (OAuth 2.0)
2. Synchroniser les classes de Google Classroom
3. Permettre le partage de pads avec des classes Google Classroom
4. Optionnel : Remonter des notes/activités vers Google Classroom

## Architecture proposée

### 1. Authentification Google OAuth 2.0

#### Dépendances à ajouter
```json
{
  "passport": "^0.7.0",
  "passport-google-oauth20": "^2.0.0",
  "googleapis": "^128.0.0"
}
```

#### Modifications nécessaires

##### A. Variables d'environnement (.env)
```env
# Google OAuth
GOOGLE_CLIENT_ID=votre_client_id
GOOGLE_CLIENT_SECRET=votre_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Google Classroom API
GOOGLE_CLASSROOM_ENABLED=true
```

##### B. Nouveau fichier : server/auth/google.js
- Configuration Passport.js
- Stratégie Google OAuth 2.0
- Gestion des tokens (access_token, refresh_token)
- Stockage des tokens dans Redis

##### C. Modification : server/index.js
- Ajout des routes OAuth :
  - GET `/auth/google` : Redirection vers Google
  - GET `/auth/google/callback` : Callback après authentification
  - POST `/auth/google/disconnect` : Déconnexion Google
- Middleware Passport

##### D. Extension du modèle utilisateur (Redis)
```javascript
utilisateur:{identifiant} = {
  identifiant: string,
  nom: string,
  email: string,
  motDePasse: string (hash bcrypt),
  statut: 'utilisateur',
  googleId: string (optionnel),
  googleAccessToken: string (optionnel, chiffré),
  googleRefreshToken: string (optionnel, chiffré),
  googleTokenExpiry: timestamp (optionnel),
  pads: [array of pad ids],
  classes: [array of classroom ids] // nouveau
}
```

### 2. Intégration Google Classroom API

#### Fonctionnalités

##### A. Synchronisation des classes
- Récupération des classes de l'enseignant via Classroom API
- Affichage dans l'interface utilisateur
- Stockage dans Redis :
  ```javascript
  classroom:{classId} = {
    id: string,
    name: string,
    section: string,
    ownerId: string,
    students: [array of student objects],
    synced_at: timestamp
  }
  ```

##### B. Partage de pads avec une classe
- Nouveau champ dans les pads : `classroomId` (optionnel)
- Génération automatique de liens pour les étudiants
- Option : Créer automatiquement un "devoir" dans Google Classroom avec le lien

##### C. Interface utilisateur

###### Modifications frontend nécessaires

**pages/index.vue**
- Ajouter bouton "Se connecter avec Google"
- Afficher les classes synchronisées

**pages/u/_utilisateur.vue**
- Section "Mes classes Google Classroom"
- Liste des classes avec nombre d'étudiants
- Bouton "Synchroniser les classes"

**pages/p/_id/_pad/pad.vue**
- Option "Partager avec une classe Google Classroom"
- Sélecteur de classe
- Option "Créer un devoir dans Classroom"

### 3. Flux d'authentification

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Utilisateur clique "Se connecter avec Google"            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Redirection vers Google OAuth                            │
│    Scopes demandés :                                         │
│    - openid                                                  │
│    - profile                                                 │
│    - email                                                   │
│    - https://www.googleapis.com/auth/classroom.courses.     │
│      readonly                                                │
│    - https://www.googleapis.com/auth/classroom.rosters.     │
│      readonly                                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Utilisateur autorise l'application                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Google redirige vers /auth/google/callback               │
│    avec code d'autorisation                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Backend échange le code contre des tokens                │
│    - Access token                                            │
│    - Refresh token                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Vérification si l'utilisateur existe                     │
│    - Si oui : lier le compte Google                         │
│    - Si non : créer un nouveau compte                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Stockage des tokens (chiffrés) dans Redis                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. Création de session et redirection vers tableau de bord  │
└─────────────────────────────────────────────────────────────┘
```

### 4. Flux de partage avec Google Classroom

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Enseignant crée/ouvre un pad                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Clique "Partager avec Google Classroom"                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Sélection de la classe                                   │
│    - Liste des classes synchronisées                        │
│    - Bouton "Rafraîchir" si besoin                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Options de partage                                        │
│    ☐ Créer un devoir dans Classroom                         │
│    ☐ Notifier les étudiants par email                       │
│    Date limite : [sélecteur de date] (si devoir)            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Backend génère le lien de partage                        │
│    - Format : /p/{padId}/{token}                            │
│    - Token spécifique à la classe                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Si "Créer un devoir" est coché                           │
│    - Appel à Classroom API (coursework.create)              │
│    - Titre : nom du pad                                     │
│    - Description : lien vers le pad                         │
│    - Type : ASSIGNMENT                                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Confirmation et affichage du lien                        │
└─────────────────────────────────────────────────────────────┘
```

## Étapes de développement

### Phase 1 : Authentification Google (Priorité HAUTE)
1. Installer les dépendances (passport, passport-google-oauth20, googleapis)
2. Créer le fichier de configuration Google OAuth
3. Ajouter les routes d'authentification
4. Modifier le modèle utilisateur dans Redis
5. Créer les composants frontend (bouton Google, gestion compte)
6. Tester le flux complet

### Phase 2 : Synchronisation Google Classroom (Priorité HAUTE)
1. Créer le service Classroom API
2. Implémenter la synchronisation des classes
3. Stocker les classes dans Redis
4. Créer l'interface de gestion des classes
5. Ajouter un bouton "Rafraîchir les classes"
6. Tester avec un compte enseignant Google Classroom

### Phase 3 : Partage de pads avec classes (Priorité MOYENNE)
1. Ajouter le champ `classroomId` au modèle pad
2. Créer le système de tokens de partage par classe
3. Implémenter l'interface de partage
4. Générer des liens uniques par classe
5. Tester l'accès depuis le côté étudiant

### Phase 4 : Création de devoirs (Priorité BASSE)
1. Implémenter l'API coursework.create
2. Ajouter l'option dans l'interface
3. Gérer les dates limites
4. Tester la création de devoirs

### Phase 5 : Fonctionnalités avancées (OPTIONNEL)
1. Remontée de notes vers Classroom
2. Notifications push
3. Tableau de bord enseignant avec statistiques
4. Export des contributions par étudiant

## Sécurité

### Gestion des tokens
- **Chiffrement** : Les tokens Google doivent être chiffrés avant stockage dans Redis
- **Refresh automatique** : Mettre en place un système de refresh des access tokens
- **Expiration** : Gérer l'expiration des tokens

### Permissions
- Vérifier que l'utilisateur a bien les droits sur les classes
- Valider que seul le propriétaire du pad peut le partager
- Contrôler l'accès aux pads partagés avec des tokens

### RGPD
- Informer les utilisateurs des données collectées
- Permettre la déconnexion du compte Google
- Permettre la suppression des données Google

## Fichiers à créer

```
src/
├── server/
│   ├── auth/
│   │   ├── google.js          # Configuration OAuth Google
│   │   └── crypto.js           # Chiffrement des tokens
│   ├── services/
│   │   └── classroom.js        # Service Google Classroom API
│   └── routes/
│       └── classroom.js        # Routes API Classroom
├── components/
│   ├── GoogleLoginButton.vue   # Bouton connexion Google
│   ├── ClassroomList.vue       # Liste des classes
│   └── ShareWithClassroom.vue  # Modal de partage
└── pages/
    └── classroom/
        └── classes.vue          # Page gestion des classes
```

## Fichiers à modifier

```
src/
├── server/
│   └── index.js                # Routes OAuth + Passport
├── pages/
│   ├── index.vue               # Bouton Google
│   ├── u/_utilisateur.vue      # Section classes
│   └── p/_id/_pad/pad.vue      # Partage avec classe
└── .env                         # Variables Google
```

## Configuration Google Cloud Platform

### Étapes nécessaires
1. Créer un projet sur Google Cloud Console
2. Activer Google Classroom API
3. Créer des identifiants OAuth 2.0
4. Configurer l'écran de consentement OAuth
5. Ajouter les scopes nécessaires
6. Ajouter les URIs de redirection autorisés

### Scopes requis
- `openid`
- `profile`
- `email`
- `https://www.googleapis.com/auth/classroom.courses.readonly`
- `https://www.googleapis.com/auth/classroom.rosters.readonly`
- `https://www.googleapis.com/auth/classroom.coursework.students` (pour devoirs)

## Tests

### Tests unitaires
- Test du service Google OAuth
- Test du service Classroom API
- Test du chiffrement des tokens

### Tests d'intégration
- Test du flux complet d'authentification
- Test de synchronisation des classes
- Test de partage de pad avec classe
- Test de création de devoir

### Tests manuels
- Tester avec plusieurs comptes Google
- Tester avec un compte enseignant ayant plusieurs classes
- Tester l'accès étudiant
- Tester la déconnexion

## Estimation du temps de développement

- **Phase 1** : 2-3 jours
- **Phase 2** : 2-3 jours
- **Phase 3** : 1-2 jours
- **Phase 4** : 1 jour
- **Tests et déboggage** : 2-3 jours

**Total estimé** : 8-12 jours de développement

## Notes importantes

1. **Compatibilité** : L'intégration doit être optionnelle et ne pas casser le fonctionnement actuel
2. **Fallback** : Si Google est indisponible, l'application doit continuer à fonctionner en mode normal
3. **Migration** : Les utilisateurs existants doivent pouvoir lier leur compte Google
4. **Multi-authentification** : Permettre aux utilisateurs d'avoir à la fois un compte local et Google

## Prochaines étapes immédiates

1. Créer un projet sur Google Cloud Console
2. Obtenir les identifiants OAuth 2.0
3. Installer les dépendances npm
4. Commencer par l'authentification Google OAuth
