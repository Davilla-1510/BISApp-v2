# Guide de Déploiement BISApp

Ce guide explique comment déployer l'application BISApp (Braille Tutor) sur Vercel et comment générer les APK/AAB pour le Play Store et l'App Store.

---

## Table des Matières

1. Prérequis
2. Configuration pour Vercel
3. Déploiement Backend
4. Génération APK pour Play Store
5. Génération pour App Store
6. Variables d'Environnement

---

## Prérequis

### Outils nécessaires

- Node.js 18+
- npm ou yarn
- Expo CLI
- Git
- Compte Vercel
- Compte Google Play Console
- Compte Apple Developer

---

## Configuration pour Vercel

### 1. Préparation du projet

Le projet utilise Expo avec expo-router. Pour le déploiement web sur Vercel :

```bash
# Installer les dépendances
cd braille-tutor-app
npm install

# Construire pour le web
npm run web
```

### 2. Configuration Vercel

Créez un fichier `vercel.json` à la racine :

```json
{
  "buildCommand": "npm run web",
  "outputDirectory": "dist",
  "framework": "nextjs",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://votre-backend-api.com/api/:path*"
    }
  ]
}
```

### 3. Variables d'Environnement Vercel

Ajoutez ces variables dans le dashboard Vercel :

```
REACT_APP_API_URL=https://votre-backend-api.com/api
```

---

## Déploiement Backend

### Option 1: Vercel (Serverless Functions)

Créez un dossier `api` et déplacez les endpoints du backend.

### Option 2: Railway/Render (Recommandé)

Le backend nécessite MongoDB persistant :

1. **Railway** : https://railway.app
   - Créer un nouveau projet
   - Ajouter MongoDB et Node.js
   - Déployer le code backend

2. **Configuration** :
   - Modifier `MONGODB_URI` avec l'URL MongoDB de Railway

---

## Génération APK pour Play Store

### Étape 1: Configuration Expo

Modifiez `app.json` pour la production.

### Étape 2: Prébuild Android

```bash
# Générer le dossier android
npx expo prebuild --platform android

# Naviguer dans le dossier android
cd android
```

### Étape 3: Build Release APK

```bash
# Version Debug (pour test)
./gradlew assembleDebug

# Version Release (pour Play Store)
./gradlew assembleRelease

# Générer AAB (recommandé pour Play Store)
./gradlew bundleRelease
```

### Étape 4: Signature

Pour le Play Store, vous devez signer l'APK avec un keystore.

### Étape 5: Upload sur Play Console

1. Créer un compte Google Play Console (25$ unique)
2. Créer une nouvelle application
3. Uploader le fichier AAB généré
4. Remplir les informations de l'app
5. Soumettre pour révision

---

## Génération pour App Store

### Étape 1: Préparation iOS

```bash
# Générer le dossier ios
npx expo prebuild --platform ios
```

### Étape 2: Configuration Certificate

1. Apple Developer Account
2. Créer un App ID
3. Générer certificates de distribution
4. Créer provisioning profile

### Étape 3: Build Xcode

```bash
# Ouvrir dans Xcode
open ios/BISApp.xcworkspace

# Dans Xcode : Product > Archive > Distribute App
```

### Étape 4: Upload sur App Store Connect

1. Créer un compte Apple Developer (99$/an)
2. App Store Connect
3. Uploader via Xcode ou Transporter

---

## Variables d'Environnement à Configurer

### Backend (.env)

```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=votre-secret-securise
GMAIL_EMAIL=votre-email@gmail.com
GMAIL_PASSWORD=votre-app-password
PORT=3000
NODE_ENV=production
```

### Frontend

```
REACT_APP_API_URL=https://votre-api-production.com/api
```

---

## Checklist de Déploiement

### Avant soumission Play Store

- APK/AAB compilé et signé
- Package : com.bisapp.brailletutor
- Screenshots (min 2)
- Description de l'app
- Politique de confidentialité URL

### Avant soumission App Store

- Build Xcode généré
- App ID créé
- Screenshots (différentes tailles)
- Politique de confidentialité

---
_Document creer-le 12/03/26_