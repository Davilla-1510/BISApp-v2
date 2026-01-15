# Architecture BISApp

## Stack Technique

- **Frontend**: React Native + Expo (TypeScript)
- **Backend**: Node.js + Express
- **Base de données**: MongoDB + Mongoose
- **Authentification**: JWT
- **Chiffrement**: bcryptjs pour les mots de passe
- **Paiements**: Intégration SMS (numéro téléphone)

## Structure du Projet

### Backend (Node.js + Express)

```
backend/
├── models/
│   ├── User.ts (étudiant + admin)
│   ├── Module.ts (braille/informatique)
│   ├── Chapter.ts
│   ├── Lesson.ts
│   ├── Exercise.ts
│   ├── Quiz.ts
│   ├── UserProgress.ts
│   └── Subscription.ts
├── routes/       
│   ├── auth.ts
│   ├── modules.ts
│   ├── admin.ts
│   ├── progress.ts
│   └── payments.ts
├── controllers/
├── middleware/
│   ├── auth.ts
│   └── validation.ts
├── services/
│   ├── email.ts
│   ├── sms.ts
│   ├── braille-converter.ts
│   └── notification.ts
└── server.ts
```

### Frontend (Expo/React Native)

```
app/
├── (auth)/
│   ├── login.tsx
│   ├── signup.tsx
│   └── accessibility-setup.tsx
├── (app)/
│   ├── home.tsx (écran accueil avec "Commencer")
│   ├── modules-selection.tsx (braille vs informatique)
│   ├── levels.tsx (basique, moyen, avancé)
│   ├── chapters.tsx
│   ├── lessons.tsx
│   ├── exercise.tsx
│   ├── quiz.tsx (récapitulatif)
│   └── dashboard.tsx (progression)
├── (admin)/
│   ├── admin-login.tsx
│   ├── admin-dashboard.tsx
│   ├── manage-chapters.tsx
│   ├── manage-lessons.tsx
│   └── manage-exercises.tsx
└── (settings)/
    ├── profile.tsx
    ├── accessibility.tsx
    └── offline-mode.tsx
```

## Flux Utilisateur Principal

1. **Splash Screen** → Logo BISApp
2. **Authentification** → Login/Signup
3. **Configuration Accessibilité** → Questions sur niveau d'accessibilité
4. **Accueil** → Message bienvenue + bouton "Commencer maintenant"
5. **Sélection Module** → Braille / Informatique
6. **Sélection Niveau** → Basique / Moyen / Avancé
7. **Parcours**: Chapitre → Leçons → Exercice (3 essais max) → Quiz
8. **Dashboard** → Suivi progression

## Sécurité & Chiffrement

- Mots de passe: bcryptjs (salage automatique)
- JWT pour sessions
- HTTPS obligatoire
- Validation côté serveur

## Fonctionnalités Premium

- Transcription texte → Braille
- Paiement par numéro téléphone (SMS)

## Accessibilité

- Mode audio (Text-to-Speech)
- Navigation au clavier
- Contraste amélioré
- Tailles de police ajustables

## Mode Hors Ligne

- Synchronisation des données téléchargées
- Fonctionnalités limitées sans connexion

## Notifications

- Progression (push)
- Mises à jour
- Rappels de cours
