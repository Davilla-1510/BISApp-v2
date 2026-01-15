# 🎓 BISApp - Application de Tutoring Accessible

Une application mobile React Native conçue pour l'apprentissage accessible du Braille et de l'Informatique adaptée pour les personnes déficientes visuelles.

## ✨ Caractéristiques Principales

- **📚 Deux modules d'apprentissage**: Braille + Informatique
- **♿ Accessibilité totale**: Mode audio, navigation au clavier, contraste adapté
- **🎯 Parcours structuré**: Module → Niveau → Chapitre → Leçon → Exercice → Quiz
- **📊 Tableau de bord**: Suivi personnalisé de la progression
- **🔒 Sécurité**: Authentification JWT, mots de passe chiffrés (bcryptjs)
- **📱 Mode hors ligne**: Accès aux contenus téléchargés
- **🎁 Premium**: Transcription Texte → Braille
- **👨‍💼 Dashboard Admin**: Gestion complète du contenu

## 🏗️ Architecture

```
Frontend (React Native/Expo)
        ↓ (HTTP/HTTPS + JWT)
Backend (Node.js + Express)
        ↓ (Mongoose ODM)
Database (MongoDB)
```

## 📦 Structure du Projet

```
braille-tutor-app/
├── app/                    # Écrans React Native
├── context/                # Context API (Auth)
├── services/               # Client API (Axios)
├── backend/                # Serveur Node.js/Express
│   ├── src/
│   │   ├── models/        # Schémas Mongoose
│   │   ├── routes/        # Routes API
│   │   ├── controllers/   # Logique métier
│   │   └── middleware/    # Auth, Validation
│   └── package.json
├── DOCUMENTATION.md        # Documentation détaillée
└── ARCHITECTURE.md         # Vue d'ensemble technique
```

## 🚀 Démarrage Rapide

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Configurer .env avec vos paramètres
npm run dev
```

**Port**: `http://localhost:3000`

### Frontend

```bash
npm install
npx expo start
```

## 🔐 Authentification

### Signup (Inscription)

- Formulaire multi-étapes (5 étapes)
- Sélection du niveau d'accessibilité
- Mot de passe chiffré avec bcryptjs
- JWT token généré automatiquement

### Login (Connexion)

- Email + Mot de passe
- Validation côté serveur
- JWT token stocké localement (AsyncStorage)

### Admin Login

- Clé secrète admin requise
- Accès au dashboard admin

## 📚 Parcours d'Apprentissage

```
Accueil → Sélection Module
        → Sélection Niveau (Basique/Moyen/Avancé)
        → Chapitres
        → Leçons + Mode Audio optionnel
        → Exercices (max 3 essais)
        → Quiz Récapitulatif
        → Déblocage Niveau Suivant
```

## 🛠️ Stack Technique

### Frontend

- React Native + Expo
- TypeScript
- Axios (API client)
- AsyncStorage
- React Navigation

### Backend

- Node.js + Express
- MongoDB + Mongoose
- JWT (authentification)
- bcryptjs (sécurité)
- TypeScript

## 📋 Endpoints API Clés

| Méthode | Endpoint                          | Description               |
| ------- | --------------------------------- | ------------------------- |
| POST    | `/api/auth/signup`                | Inscription               |
| POST    | `/api/auth/login`                 | Connexion                 |
| GET     | `/api/content/modules`            | Liste des modules         |
| GET     | `/api/content/modules/:id/levels` | Niveaux d'un module       |
| POST    | `/api/admin/chapters`             | Créer un chapitre (admin) |
| POST    | `/api/admin/exercises`            | Créer un exercice (admin) |

## ♿ Accessibilité

### Niveaux Supportés

1. **Sans déficience visuelle** - Vision normale
2. **Malvoyance partielle** - Vision partielle
3. **Cécité totale** - Sans vision

### Fonctionnalités

- 🔊 Mode audio (Text-to-Speech)
- 🎨 Contraste WCAG AA
- ⌨️ Navigation au clavier
- 📝 Labels pour lecteur d'écran
- 📏 Police ajustable

## 💳 Premium

- **Transcription Texte → Braille**
- **Paiement par SMS** (numéro de téléphone)
- **Abonnement mensuel**

## 🔧 Configuration

### Variables d'Environnement Backend

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/bisapp
JWT_SECRET=votre_clé_secrète
ADMIN_SECRET_KEY=clé_admin
NODE_ENV=development
```

## 📱 Compatibilité

- ✅ Android (5.0+)
- ✅ iOS (12+)
- ✅ Web (Expo Web - optionnel)

## 🤝 Contribution

Les contributions sont bienvenues! Veuillez:

1. Fork le projet
2. Créer une branche (`git checkout -b feature/...`)
3. Commit les changements (`git commit -m '...'`)
4. Push vers la branche (`git push origin feature/...`)
5. Ouvrir une Pull Request

## 📄 License

MIT License - Voir [LICENSE](LICENSE)

## 📞 Support

- 📧 **Email**: support@bisapp.com
- 📚 **Documentation**: Voir [DOCUMENTATION.md](DOCUMENTATION.md)
- 🏗️ **Architecture**: Voir [ARCHITECTURE.md](ARCHITECTURE.md)

---

**Créé avec ❤️ pour l'accessibilité numérique**

_Dernière mise à jour: Décembre 2025_
