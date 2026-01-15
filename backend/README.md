# BISApp Backend

Backend Node.js + Express pour l'application BISApp (Braille & Informatique Tutoring App).

## 📋 Prérequis

- Node.js (v16+)
- MongoDB (local ou Atlas)
- npm ou yarn

## ⚙️ Installation

1. **Installer les dépendances**

```bash
cd backend
npm install
```

2. **Configurer les variables d'environnement**

```bash
cp .env.example .env
```

Modifier `.env` avec vos configurations:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/bisapp
JWT_SECRET=your_secret_key
ADMIN_SECRET_KEY=your_admin_secret
```

## 🚀 Démarrage

### Mode développement

```bash
npm run dev
```

### Mode production

```bash
npm run build
npm start
```

## 📡 Endpoints API

### Authentication (`/api/auth`)

- `POST /signup` - Inscription
- `POST /login` - Connexion étudiant
- `POST /admin-login` - Connexion admin
- `GET /profile` - Récupérer le profil (nécessite token)
- `PUT /profile` - Mettre à jour le profil (nécessite token)

### Content (`/api/content`)

- `GET /modules` - Récupérer tous les modules
- `GET /modules/:moduleId/levels` - Niveaux d'un module
- `GET /levels/:levelId/chapters` - Chapitres d'un niveau
- `GET /chapters/:chapterId/lessons` - Leçons d'un chapitre
- `GET /lessons/:lessonId/exercises` - Exercices d'une leçon
- `GET /levels/:levelId/quiz` - Quiz d'un niveau

### Admin (`/api/admin`)

#### Modules

- `POST /modules` - Créer un module
- `PUT /modules/:moduleId` - Mettre à jour
- `DELETE /modules/:moduleId` - Supprimer

#### Levels

- `POST /levels` - Créer un niveau
- `PUT /levels/:levelId` - Mettre à jour
- `DELETE /levels/:levelId` - Supprimer

#### Chapters

- `POST /chapters` - Créer un chapitre
- `PUT /chapters/:chapterId` - Mettre à jour
- `DELETE /chapters/:chapterId` - Supprimer

#### Lessons

- `POST /lessons` - Créer une leçon
- `PUT /lessons/:lessonId` - Mettre à jour
- `DELETE /lessons/:lessonId` - Supprimer

#### Exercises

- `POST /exercises` - Créer un exercice
- `PUT /exercises/:exerciseId` - Mettre à jour
- `DELETE /exercises/:exerciseId` - Supprimer

#### Quiz

- `POST /quiz` - Créer un quiz
- `PUT /quiz/:quizId` - Mettre à jour
- `DELETE /quiz/:quizId` - Supprimer

#### Statistics

- `GET /stats` - Récupérer les statistiques admin

## 🔐 Authentification

Tous les endpoints protégés nécessitent un header `Authorization` avec le token JWT:

```
Authorization: Bearer <token>
```

## 📚 Structure

```
backend/
├── src/
│   ├── models/        # Modèles Mongoose
│   ├── routes/        # Routes API
│   ├── controllers/   # Logique métier
│   ├── middleware/    # Middlewares (auth, validation)
│   ├── services/      # Services utilitaires
│   ├── config/        # Configuration (BD, etc)
│   └── server.ts      # Point d'entrée
├── dist/              # Build JavaScript compilé
├── package.json
├── tsconfig.json
└── .env.example
```

## 🔄 Pipeline de données

1. **Signup**: L'utilisateur fournit ses données → Validation → Hash du mot de passe → Création en BD → Token JWT généré
2. **Login**: Email + Mot de passe → Vérification → Token JWT généré
3. **Content**: Token vérifié → Récupération des données → Envoi au client
4. **Admin**: Token vérifié + Vérification du rôle admin → Opération CRUD → Retour au client

## 🛡️ Sécurité

- ✅ Mot de passe hashé avec bcryptjs
- ✅ JWT pour l'authentification
- ✅ CORS configuré
- ✅ Validation des données côté serveur
- ✅ Autorisation basée sur les rôles (RBAC)

## 📝 Notes

- MongoDB doit être démarré avant le serveur
- En développement, utilisez MongoDB local ou Atlas
- La clé admin est requise pour l'accès administrateur
