# BISApp - Documentation Complète

## 📱 Vue d'ensemble

BISApp est une **application mobile de tutoring accessible** conçue spécifiquement pour les personnes malvoyantes ou déficientes visuelles. Elle offre deux modules principaux:

1. **Module Braille** - Apprentissage du système Braille
2. **Module Informatique** - Informatique adaptée aux déficients visuels

## 🎯 Objectifs Principaux

- ✅ Accessibilité numérique totale
- ✅ Apprentissage personnalisé avec suivi de progression
- ✅ Mode audio intégré (Text-to-Speech)
- ✅ Mode hors ligne
- ✅ Premium avec transcription Braille 
- ✅ Système de quiz et exercices
- ✅ Tableau de bord administrateur 

## 🏗️ Architecture Générale

```
┌─────────────────────────────────────────────────────┐
│                  Client (React Native)              │
│  (Android / iOS avec Expo)                          │
└──────────────────┬──────────────────────────────────┘
                   │ (Axios API Calls)
                   │
┌──────────────────▼──────────────────────────────────┐
│            Backend API (Express.js)                 │
│  - Authentification (JWT)                           │
│  - Gestion du contenu                               │
│  - Gestion admin                                    │
└──────────────────┬──────────────────────────────────┘
                   │ (Mongoose)
                   │
┌──────────────────▼──────────────────────────────────┐
│           Base de Données (MongoDB)                 │
│  - Users, Modules, Levels, Chapters                 │
│  - Lessons, Exercises, Quizzes                      │
└─────────────────────────────────────────────────────┘
```

## 📂 Structure du Projet

```
braille-tutor-app/
├── app/                           # Frontend (React Native/Expo)
│   ├── (auth)/                    # Écrans authentification
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (app)/                     # Écrans principales
│   │   ├── _layout.tsx
│   │   ├── home.tsx
│   │   ├── modules-selection.tsx
│   │   ├── levels-selection.tsx
│   │   ├── chapters.tsx
│   │   ├── lessons.tsx
│   │   ├── exercise.tsx
│   │   ├── quiz.tsx
│   │   └── dashboard.tsx
│   ├── (admin)/                   # Écrans admin
│   │   ├── admin-login.tsx
│   │   └── admin-dashboard.tsx
│   ├── splash.tsx
│   └── _layout.tsx
├── context/                       # Context API
│   └── AuthContext.tsx
├── services/                      # Services API
│   └── api.ts
├── backend/                       # Backend Node.js
│   ├── src/
│   │   ├── models/               # Modèles Mongoose
│   │   ├── routes/               # Routes Express
│   │   ├── controllers/          # Logique métier
│   │   ├── middleware/           # Middlewares
│   │   ├── services/             # Services
│   │   ├── config/               # Configuration
│   │   └── server.ts             # Point d'entrée
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env
│   └── README.md
├── ARCHITECTURE.md                # Ce document
└── README.md
```

## 🔄 Flux Utilisateur Principal

### 1️⃣ **Authentification**

```
App Démarre
    ↓
[Splash Screen] (Logo BISApp + chargement 3s)
    ↓
Vérification du token stocké
    ├→ Token valide → [Accueil]
    └→ Pas de token → [Login/Signup]
```

### 2️⃣ **Inscription (Signup)**

```
Step 1: Identité (Prénom, Nom)
Step 2: Email
Step 3: Mot de passe (chiffré)
Step 4: Niveau d'accessibilité (Sélection)
Step 5: Vérification des données
    ↓
[POST /api/auth/signup]
    ↓
Token JWT généré + Stockage local
    ↓
[Redirection vers Accueil]
```

### 3️⃣ **Connexion (Login)**

```
[Saisir Email + Password]
    ↓
[POST /api/auth/login]
    ↓
Vérification des identifiants
    ├→ Correct → JWT généré
    └→ Incorrect → Erreur
    ↓
Token stocké + [Redirection Accueil]
```

### 4️⃣ **Parcours d'Apprentissage**

```
[Accueil] → "Commencer Maintenant"
    ↓
[Sélection Module]
    ├→ 📚 Braille
    └→ 💻 Informatique
    ↓
[Sélection Niveau]
    ├→ 🟢 Basique
    ├→ 🟡 Moyen
    └→ 🔴 Avancé
    ↓
[Sélection Chapitre]
    ↓
[Sélection Leçon]
    ↓
[Lecture Leçon + Mode Audio optionnel]
    ↓
[Exercice - Max 3 essais]
    ├→ Réussi → Chapitre déverrouillé
    └→ Échoué → Rejouez
    ↓
[À la fin du niveau → Quiz Récapitulatif]
    ├→ Score ≥ 70% → Déblocage niveau suivant
    └→ Score < 70% → Revoir contenu
```

## 🗄️ Modèles de Données (MongoDB)

### **User**

```typescript
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed with bcryptjs),
  accessibilityLevel: 'no-visual-impairment' | 'partial' | 'total',
  audioMode: Boolean,
  role: 'student' | 'admin',
  subscriptionStatus: 'free' | 'premium',
  subscriptionExpiresAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### **Module**

```typescript
{
  _id: ObjectId,
  name: 'braille' | 'informatique',
  title: String,
  description: String,
  icon: String
}
```

### **Level**

```typescript
{
  _id: ObjectId,
  module: ObjectId (ref: Module),
  name: 'basique' | 'moyen' | 'avance',
  title: String,
  description: String,
  order: Number
}
```

### **Chapter**

```typescript
{
  _id: ObjectId,
  level: ObjectId (ref: Level),
  title: String,
  description: String,
  order: Number
}
```

### **Lesson**

```typescript
{
  _id: ObjectId,
  chapter: ObjectId (ref: Chapter),
  title: String,
  content: String,
  audioUrl: String (optionnel),
  order: Number
}
```

### **Exercise**

```typescript
{
  _id: ObjectId,
  lesson: ObjectId (ref: Lesson),
  title: String,
  type: 'text' | 'multiple-choice' | 'braille-conversion' | 'matching',
  question: String,
  options: [{ text: String, isCorrect: Boolean }],
  correctAnswer: String,
  brailleText: String (optionnel),
  maxAttempts: 3,
  order: Number
}
```

### **Quiz**

```typescript
{
  _id: ObjectId,
  level: ObjectId (ref: Level),
  title: String,
  exercises: ObjectId[] (ref: Exercise[]),
  passingScore: 70 (%)
}
```

### **UserProgress**

```typescript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  module: ObjectId (ref: Module),
  level: ObjectId (ref: Level),0
  chapter: ObjectId (ref: Chapter),
  lesson: ObjectId (ref: Lesson),
  exercise: ObjectId (ref: Exercise),
  status: 'not-started' | 'in-progress' | 'completed' | 'passed',
  attempts: Number,
  score: Number,
  completedAt: Date
}
```

## 🔐 Sécurité

### Authentification

- **JWT (JSON Web Tokens)** pour les sessions
- **Durée d'expiration**: 7 jours par défaut
- **Token stocké** localement avec AsyncStorage

### Chiffrement des Données

- **Mots de passe**: bcryptjs (salage automatique 10 rounds)
- **Données sensibles**: chiffrées en transit (HTTPS)
- **Validation** côté serveur et client

### Autorisation

- **Role-based Access Control (RBAC)**
- Admin: accès complet aux CRUD
- Student: lecture seule du contenu, soumission d'exercices

## 📱 Fonctionnalités Principales

### Pour les Étudiants

- ✅ Apprentissage structuré (Module → Niveau → Chapitre → Leçon)
- ✅ Exercices avec limite de 3 essais
- ✅ Quiz récapitulatif pour déblocage du niveau suivant
- ✅ Tableau de bord personnalisé
  - Progression par module
  - Temps d'apprentissage
  - Scores d'exercices
  - Capacité à faire les 2 modules simultanément
- ✅ Mode audio (TTS)
- ✅ Mode hors ligne (données pré-téléchargées)
- ✅ Notifications (progression, rappels)
- ✅ Premium: Transcription Texte → Braille

### Pour les Admins

- 📊 Dashboard avec statistiques
  - Nombre d'utilisateurs inscrits
  - Contenu disponible
  - Taux de complétion
- 🎓 Gestion du contenu
  - Créer/Modifier/Supprimer Modules
  - Créer/Modifier/Supprimer Niveaux
  - Créer/Modifier/Supprimer Chapitres
  - Créer/Modifier/Supprimer Leçons
  - Créer/Modifier/Supprimer Exercices
  - Créer/Modifier/Supprimer Quiz
- 👥 Gestion des utilisateurs
  - Voir les statistiques
  - Contacter les utilisateurs

## 🎨 Accessibilité

### Niveaux d'Accessibilité

1. **No Visual Impairment** - Vision normale
2. **Partial** - Vision partielle (malvoyance)
3. **Total** - Cécité totale

### Fonctionnalités Accessibles

- 🔊 **Mode Audio**: Text-to-Speech intégré
- ♿ **Navigation au Clavier**: Tab + Enter
- 🎨 **Contraste**: Palette de couleurs optimisée (WCAG AA minimum)
- 📏 **Police Ajustable**: Tailles configurable
- 📱 **Lecteur d'écran**: Compatible VoiceOver (iOS) et TalkBack (Android)
- 🎯 **Labeling**: Tous les éléments ont des accessibilityLabel

## 💳 Système de Paiement (Premium)

### Modèle

- **Payant par**: Numéro de téléphone
- **Intégration SMS**: Confirmation par SMS
- **Durée**: Abonnement mensuel renouvelable
- **Fonctionnalités Premium**:
  - Transcription Texte → Braille
  - Fonctionnalités avancées (à définir)

## 📡 API Endpoints

### Auth

```
POST   /api/auth/signup              # Inscription
POST   /api/auth/login               # Connexion
POST   /api/auth/admin-login         # Connexion admin
GET    /api/auth/profile             # Profil utilisateur
PUT    /api/auth/profile             # Mise à jour profil
```

### Content

```
GET    /api/content/modules          # Tous les modules
GET    /api/content/modules/:id/levels
GET    /api/content/levels/:id/chapters
GET    /api/content/chapters/:id/lessons
GET    /api/content/lessons/:id/exercises
GET    /api/content/levels/:id/quiz
```

### Admin

```
# Modules
POST   /api/admin/modules
PUT    /api/admin/modules/:id
DELETE /api/admin/modules/:id

# Levels
POST   /api/admin/levels
PUT    /api/admin/levels/:id
DELETE /api/admin/levels/:id

# Chapters
POST   /api/admin/chapters
PUT    /api/admin/chapters/:id
DELETE /api/admin/chapters/:id

# Lessons
POST   /api/admin/lessons
PUT    /api/admin/lessons/:id
DELETE /api/admin/lessons/:id

# Exercises
POST   /api/admin/exercises
PUT    /api/admin/exercises/:id
DELETE /api/admin/exercises/:id

# Quiz
POST   /api/admin/quiz
PUT    /api/admin/quiz/:id
DELETE /api/admin/quiz/:id

# Stats
GET    /api/admin/stats
```

## 🚀 Guide de Démarrage

### Installation Backend

```bash
cd backend
npm install
cp .env.example .env
# Éditer .env avec vos configuration
npm run dev
```

### Installation Frontend

```bash
# Assurez-vous que le backend fonctionne sur localhost:3000
npm install
npx expo start
```

### Configuration MongoDB

```bash
# Option 1: MongoDB local
mongod  # Assurez-vous que MongoDB est installé

# Option 2: MongoDB Atlas (Cloud)
# Créez un compte sur mongodb.com/atlas
# Configurez dans .env: MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/bisapp
```

## 📋 Checklist de Déploiement

- [ ] Variables d'environnement configurées (production)
- [ ] MongoDB Atlas connexion testée
- [ ] HTTPS activé
- [ ] JWT secret changé
- [ ] Admin secret key changé
- [ ] CORS configuré correctement
- [ ] Email de support mis à jour
- [ ] Build APK/IPA généré
- [ ] Tests d'accessibilité passés

## 🔧 Technologies Utilisées

### Frontend

- **React Native** + **Expo** - Framework mobile
- **TypeScript** - Typage statique
- **AsyncStorage** - Stockage local
- **Axios** - Requêtes HTTP
- **React Navigation** - Navigation entre écrans

### Backend

- **Node.js** + **Express** - Serveur API
- **MongoDB** + **Mongoose** - Base de données
- **JWT** - Authentification
- **bcryptjs** - Chiffrement des mots de passe
- **TypeScript** - Typage statique

## 📞 Support & Contact

- **Email**: support@bisapp.com
- **GitHub**: [lien à venir]
- **Documentation API**: `backend/README.md`

## 📄 Licences

- MIT License - Voir LICENSE file

---

**Dernière mise à jour**: Décembre 2025
