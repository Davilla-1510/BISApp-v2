ca sur git hubtout er # Architecture BISApp - Application de Tutorat Braille (Révisée)

## 1. Vue d'Ensemble

ssu# Architecture BISApp - Application de Tutorat Braille

## 1. Vue d'Ensemble

BISApp est une application mobile React Native/Expo destinee a l'apprentissage accessible du Braille et de l'informatique. Elle utilise une architecture 3-tiers avec un backend Node.js/Express et une base de donnees MongoDB.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        ARCHITECTURE BISApp                              │
└─────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────┐
    │   Application      │
    │   Mobile/Web       │
    │   (Expo/React      │
    │    Native)         │
    └──────────┬──────────┘
               │ HTTP/HTTPS + JWT
               ▼
    ┌─────────────────────┐
    │   Backend API       │
    │   (Node.js/Express) │
    └──────────┬──────────┘
               │ Mongoose ODM
               ▼
    ┌─────────────────────┐
    │   MongoDB          │
    │   Database          │
    └─────────────────────┘
```

---

## 2. Stack Technique

### 2.1 Frontend (Actualisé 2025)

| Technologie            | Version  | Rôle                                    |
| ---------------------- | -------- | ---------------------------------------- |

| React Native           | 0.74.x   | UI native                                |
| TypeScript             | ^5.6.0   | Typage end-to-end                        |
| Expo Router            | ~3.5.0   | Navigation type-safe                     |
| Reanimated             | ~3.10.0  | Animations fluides                       |
| expo-speech            | ~13.0.0  | TTS multilingue (fr/en)                  |
| expo-av                | ~15.0.0  | Audio feedback                           |
| NativeWind (Tailwind)  | ^4.0.1   | Styling responsive                       |
| Zustand                | ^4.5.0   | State management                         |
### 2.2 Backend (Node.js API)


| ----------- | ------- | -------------------------------- |
| Node.js     | 22.x    | Runtime serverless               |
| Express     | ^4.19.0 | API REST scalable                |
| MongoDB     | Atlas   | Database cloud scalable          |
| Mongoose    | ^8.5.0  | ODM avec validation              |
| jsonwebtoken| ^9.0.0  | JWT auth sécurisé                |
| bcryptjs    | ^2.4.3  | Hashing sécurisé                 |
| cors        | ^2.8.5  | CORS management                  |
| helmet      | ^7.1.0  | Sécurité headers                 |
---

## 3. Structure du Projet

### 3.1 Organisation des Dossiers

```
braille-tutor-app/
├── app/                          # Frontend Expo Router
│   ├── (auth)/                  # Routes authentification
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (app)/                   # Routes application
│   │   └── _layout.tsx
│   ├── (tabs)/                  # Navigation par onglets
│   │   ├── _layout.tsx
│   │   ├── index.tsx           # Accueil apprentissage
│   │   ├── achievements.tsx    # Badges/succes
│   │   └── profile.tsx         # Profil utilisateur
│   ├── _layout.tsx             # Layout racine
│   ├── index.tsx               # Page d'index
│   ├── splash.tsx              # Ecran de chargement
│   ├── visitor-welcome.tsx     # Welcome sans connexion
│   ├── login.tsx               # Connexion (legacy)
│   ├── signup.tsx              # Inscription (legacy)
│   ├── home.tsx                # Accueil principal
│   ├── dashboard.tsx           # Tableau de bord
│   ├── admin.tsx               # Interface admin
│   ├── about.tsx               # A propos
│   ├── modules-selection.tsx   # Selection module
│   ├── levels-selection.tsx    # Selection niveau
│   ├── chapters-selection.tsx  # Selection chapitre
│   ├── lessons.tsx             # Liste lecons
│   ├── exercise.tsx            # Exercices interactifs
│   ├── quiz.tsx                # Quiz de validation
│   ├── profile.tsx             # Profil (legacy)
│   ├── AchievementsScreen.tsx  # Ecran succes
│   └── BadgeCard.tsx           # Carte badge
│
├── backend/                     # Serveur Node.js
│   └── src/
│       ├── config/
│       │   └── database.ts     # Connexion MongoDB
│       ├── models/             # Schemas Mongoose
│       │   ├── User.ts
│       │   ├── Module.ts
│       │   ├── Level.ts
│       │   ├── Chapter.ts
│       │   ├── Lesson.ts
│       │   ├── Exercise.ts
│       │   ├── Quiz.ts
│       │   ├── UserProgress.ts
│       │   ├── Badge.ts
│       │   ├── UserBadge.ts
│       │   ├── Subscription.ts
│       │   └── Notification.ts
│       ├── routes/             # Routes API
│       │   ├── authRoutes.ts
│       │   ├── adminRoutes.ts
│       │   ├── contentRoutes.ts
│       │   ├── progressRoutes.ts
│       │   ├── badgeRoutes.ts
│       │   └── notificationRoutes.ts
│       ├── controllers/        # Logique metier
│       │   ├── authController.ts
│       │   ├── adminController.ts
│       │   ├── contentController.ts
│       │   └── progressController.ts
│       ├── middleware/         # Middleware Express
│       │   ├── auth.ts         # JWT authentication
│       │   └── validation.ts   # Input validation
│       ├── services/           # Services metier
│       │   ├── badgeService.ts
│       │   ├── emailService.ts
│       │   └── notificationService.ts
│       ├── script/             # Scripts utilitaires
│       │   ├── seedData.ts
│       │   ├── seedDataComplete.ts
│       │   ├── createAdmin.ts
│       │   └── createAdminSimple.ts
│       └── server.ts           # Point d'entree
│
├── components/                  # Composants React
│   ├── ui/                     # Composants UI thematiques
│   │   ├── collapsible.tsx
│   │   └── icon-symbol.tsx
│   ├── AccessibilityMenu.tsx   # Menu accessibilite
│   ├── voice.tsx              # Assistant vocal
│   ├── haptic-tab.tsx
│   ├── parallax-scroll-view.tsx
│   ├── themed-text.tsx
│   ├── themed-view.tsx
│   └── external-link.tsx
│
├── context/                    # Context API React
│   ├── AuthContext.tsx        # Authentification
│   └── AccessibilityContext.tsx # Accessibilite
│
├── hooks/                      # Hooks personnalises
│   ├── useTTS.ts              # Synthese vocale
│   ├── useAccessibilitySettings.ts
│   ├── useAccessibleTheme.ts
│   ├── useContentCache.ts
│   ├── use-color-scheme.ts
│   ├── use-color-scheme.web.ts
│   └── use-theme-color.ts
│
├── services/                   # Services externes
│   └── api.ts                 # Client API Axios
│
├── constants/                  # Constantes
│   ├── brailleAlphabet.ts     # Alphabet Braille
│   └── theme.ts               # Theme couleurs
│
├── assets/                     # Ressources statiques
│   └── images/
│
└── package.json               # Dependencies frontend
```

---

## 4. Flux Utilisateur Principal

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      FLUX UTILISATEUR                                   │
└─────────────────────────────────────────────────────────────────────────┘

    [Splash Screen]
           │
           ▼
    [Visitor Welcome] ──(question accessibilite)──► [Mode Accessible]
           │                                                 │
           ▼                                                 ▼
    [Login / Signup] ◄────────────────────────────────────┘
           │
           ▼
    [(Tabs) Home] ────┬──► [Apprentissage] ──► Module ──► Niveau
           │          │                            │              │
           │          │                            │              ▼
           │          │                            │         Chapitre
           │          │                            │              │
           │          │                            │              ▼
           │          │                            │           Lecon
           │          │                            │              │
           │          │                            │              ▼
           │          │                            │         Exercice
           │          │                            │              │
           │          │                            │              ▼
           │          │                            │           Quiz
           │          │                            │              │
           ▼          ▼                            ▼              ▼
    [Succes] ◄─────────────────────────────────────────────────┘
       │
       ▼
    [Profil]
```

### 4.1 Etapes Detaillees

| Etape | Ecran           | Description                                       |
| ----- | --------------- | ------------------------------------------------- |
| 1     | Splash          | Logo, verification token JWT                      |
| 2     | Visitor Welcome | Question accessibilite visuelle                   |
| 3     | Login/Signup    | Authentification utilisateur                      |
| 4     | (Tabs)          | Navigation principale (Apprendre, Succes, Profil) |
| 5     | Modules         | Selection Braille / Informatique                  |
| 6     | Niveaux         | Selection Basique / Moyen / Avance                |
| 7     | Chapitres       | Liste des chapitres                               |
| 8     | Lecons          | Contenu pedagogique                               |
| 9     | Exercices       | Pratique interactive                              |
| 10    | Quiz            | Validation des connaissances                      |

---

## 5. Systeme d'Authentification

### 5.1 Architecture JWT

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    AUTHENTIFICATION JWT                                  │
└─────────────────────────────────────────────────────────────────────────┘

    [Frontend]                           [Backend]
         │                                     │
         │──── POST /login ──────────────────►│
         │                                     │
         │◄─── { user, token } ──────────────│
         │                                     │
         │                                    ┌─────────────────────┐
         │                                    │ JWT Secret Key      │
         │                                    │ (env.JWT_SECRET)    │
         │                                    └─────────────────────┘
         │                                            │
         │  ┌────────────────────────────────────────┘
         │  ▼
    [AsyncStorage]
    - authToken
    - refreshToken
         │
         │ ┌────────────────────────────────────────────────────────┐
         │ │  Header: Authorization: Bearer <token>                │
         │ └────────────────────────────────────────────────────────┘
         ▼
    [Toutes les requetes API]
```

### 5.2 Roles Utilisateurs

| Role    | Description    | Acces                                       |
| ------- | -------------- | ------------------------------------------- |
| student | Apprenant      | Contenu pedagogique, progression, badges    |
| admin   | Administrateur | Gestion contenu, utilisateurs, statistiques |

---

## 6. Systeme d'Accessibilite

### 6.1 Niveaux d'Accessibilite

| Niveau  | Code                   | Description    |
| ------- | ---------------------- | -------------- |
| Normal  | `no-visual-impairment` | Vision normale |
| Partiel | `partial`              | Malvoyance     |
| Total   | `total`                | Cecite         |

### 6.2 Fonctionnalites

- **Text-to-Speech (TTS)**: Lecture automatique du contenu
- **Reconnaissance vocale**: Commandes vocales
- **Retour haptique**: Vibrations sur actions
- **Contraste eleve**: Mode haute visibilite
- **Taille police**: Ajustable (small/medium/large/extra-large)

### 6.3 Context API

```typescript
// AccessibilityContext.tsx
interface AccessibilitySettings {
  textToSpeech: boolean;
  speechToText: boolean;
  fontSize: "small" | "medium" | "large" | "extra-large";
  highContrast: boolean;
  darkMode: boolean;
  language: "fr" | "en";
}
```

---

## 7. Modele de Donnees

### 7.1 Entites Principales

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    User      │────►│UserProgress  │◄────│   Module     │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id           │     │ user_id      │     │ id           │
│ email        │     │ module_id    │     │ name         │
│ password     │     │ level_id     │     │ title        │
│ firstName    │     │ chapter_id   │     │ description  │
│ lastName     │     │ lesson_id    │     │ icon         │
│ role         │     │ status       │     └──────┬───────┘
│ accessibility│     │ score        │            │
│ audioMode    │     │ attempts     │            │ 1:N
│ subscription │     │ completedAt  │            ▼
└──────────────┘     └──────────────┘     ┌──────┬───────┐
                                             │              │
                                         ┌───▼───┐     ┌──▼────┐
                                         │ Level │     │ Badge │
                                         ├───────┤     ├───────┤
                                         │ id    │     │ id    │
                                         │ name  │     │ name  │
                                         │ order │     │ icon  │
                                         └───┬───┘     │ criteria
                                             │         └────────
                                             │ 1:N
                                             ▼
                                         ┌───┴───────┐
                                         │  Chapter  │
                                         ├───────────┤
                                         │ id        │
                                         │ title     │
                                         │ level_id  │
                                         │ order     │
                                         └─────┬─────┘
                                               │ 1:N
                                               ▼
                                         ┌─────┴─────┐
                                         │  Lesson   │
                                         ├───────────┤
                                         │ id        │
                                         │ title     │
                                         │ content   │
                                         │ chapter_id│
                                         │ audioUrl  │
                                         └─────┬─────┘
                                               │ 1:N
                                               ▼
                                         ┌─────┴─────┐
                                         │ Exercise  │
                                         ├───────────┤
                                         │ id        │
                                         │ type      │
                                         │ question  │
                                         │ options   │
                                         │ correctAns│
                                         │ maxAttempts
                                         └───────────┘
```

---

## 8. API Endpoints

### 8.1 Authentification

| Methode | Endpoint              | Description        | Auth |
| ------- | --------------------- | ------------------ | ---- |
| POST    | /api/auth/signup      | Inscription        | Non  |
| POST    | /api/auth/login       | Connexion          | Non  |
| POST    | /api/auth/admin-login | Connexion admin    | Non  |
| GET     | /api/auth/profile     | Profil utilisateur | JWT  |
| PUT     | /api/auth/profile     | Mise a jour profil | JWT  |

### 8.2 Contenu Pedagogique

| Methode | Endpoint                           | Description      | Auth  |
| ------- | ---------------------------------- | ---------------- | ----- |
| GET     | /api/content/modules               | Liste modules    | Non\* |
| GET     | /api/content/modules/:id/levels    | Niveaux module   | Non\* |
| GET     | /api/content/levels/:id/chapters   | Chapitres niveau | Non\* |
| GET     | /api/content/chapters/:id/lessons  | Lecons chapitre  | Non\* |
| GET     | /api/content/lessons/:id/exercises | Exercices lecon  | Non\* |
| GET     | /api/content/levels/:id/quiz       | Quiz niveau      | Non\* |

\*Routes publiques temporairement pour tests

### 8.3 Progression

| Methode | Endpoint               | Description                   | Auth |
| ------- | ---------------------- | ----------------------------- | ---- |
| GET     | /api/progress          | Progression utilisateur       | JWT  |
| GET     | /api/progress/stats    | Statistiques                  | JWT  |
| POST    | /api/progress/lesson   | Sauvegarder progression lecon | JWT  |
| POST    | /api/progress/exercise | Sauvegarder exercice          | JWT  |
| POST    | /api/progress/quiz     | Sauvegarder quiz              | JWT  |

### 8.4 Administration

| Methode | Endpoint               | Description           | Auth  |
| ------- | ---------------------- | --------------------- | ----- |
| GET     | /api/admin/modules     | Liste modules         | Admin |
| POST    | /api/admin/modules     | Creer module          | Admin |
| PUT     | /api/admin/modules/:id | Modifier module       | Admin |
| DELETE  | /api/admin/modules/:id | Supprimer module      | Admin |
| GET     | /api/admin/stats       | Statistiques globales | Admin |

---

## 9. Composants UI

### 9.1 Navigation

- **Stack Navigator**: Navigation principale (push/pop)
- **Tab Navigator**: Navigation par onglets (bas d'ecran)

### 9.2 Composants Clés

| Composant         | Description                 |
| ----------------- | --------------------------- |
| ThemedText        | Texte avec support theme    |
| ThemedView        | Vue avec support theme      |
| BadgeCard         | Carte d'affichage badge     |
| AccessibilityMenu | Menu accessibilite flottant |
| VoiceAssistant    | Assistant vocal             |

---

## 10. Services Backend

### 10.1 BadgeService

- Attribution automatique de badges
- Verification des criteres
- Gestion des recompenses

### 10.2 EmailService

- Envoi d'emails transactionnels
- Confirmation d'inscription
- Notifications

### 10.3 NotificationService

- Rappels d'inactivite (cron job)
- Notifications de progression

---

## 11. Variables d'Environnement

### 11.1 Backend (.env)

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/bisapp
JWT_SECRET=votre_cle_secrete
JWT_EXPIRE=7d
ADMIN_SECRET_KEY=cle_admin
NODE_ENV=development
```

### 11.2 Frontend

```env
REACT_APP_API_URL=http://localhost:3000/api
```

---

## 12. Deploiement

### 12.1 Development

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
npm install
npx expo start
```

### 12.2 Production

- Build Android: `expo run:android`
- Build iOS: `expo run:ios`
- Backend: `npm run build && npm start`

---

_Document mis a jour pour BISApp v1.0.0_
