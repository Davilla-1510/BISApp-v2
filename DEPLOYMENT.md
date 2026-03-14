# 🚀 Déploiement & Build (Vercel, Play Store, App Store)

Ce guide explique comment déployer la **version web** de l'application sur **Vercel** (avec un domaine personnalisé) et comment générer les **APK/AAB** pour Google Play et **IPA** pour l'App Store (via Expo / EAS).

---

## 1) Pré-requis (généraux)

- Compte **Vercel** (https://vercel.com)
- Compte **Google Play** (console de développeur) et accès pour publier
- Compte **Apple Developer** (programme payant) + accès à App Store Connect
- **Node.js** (recommandé 18+) + npm/yarn
- **Expo CLI** et/ou **EAS CLI** installés globalement :
  ```bash
  npm install -g expo-cli eas-cli
  ```
- Le projet doit être initialisé et fonctionnel localement (backend + frontend).

> 🗂️ Ce dépôt contient :
>
> - `app/` : l’app React Native/Expo
> - `backend/` : serveur Node/Express

---

## 2) Héberger la version Web sur Vercel

### 2.1) Préparer le projet pour le web (Expo)

1. Dans `package.json`, vérifiez que vous avez un script web :
   ```json
   "scripts": {
     "web": "expo start --web",
     "build:web": "expo export --platform web"
   }
   ```

> ⚠️ Depuis Expo CLI v54+, `expo build:web` n’est plus supporté en local. Si vous voyez : _"expo build:web is not supported in the local CLI"_, utilisez `expo export --platform web`.

2. Pour générer une version statique web (à déployer sur Vercel) :
   ```bash
   npm run build:web
   ```
   Cela produira un dossier `dist/` (ou `web-build/` selon le projet).

### 2.2) Configurer Vercel

1. Dans Vercel, créez un nouveau projet en pointant sur ce dépôt.
2. Dans les paramètres du projet Vercel :
   - **Framework Preset** : `Other` (si Expo ne figure pas) ou `Next.js` si vous utilisez un adaptateur.
   - **Build Command** : `npm run build:web` (ou `expo build:web`)
   - **Output Directory** : `web-build` (ou `dist` selon la sortie de `expo build:web`)

3. (Optionnel) Ajustez `vercel.json` pour rediriger les appels API vers votre backend :
   ```json
   {
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "https://VOTRE_BACKEND/api/:path*"
       }
     ]
   }
   ```

> ✅ Si votre backend tourne ailleurs (Heroku, Railway, etc.), remplacez `VOTRE_BACKEND` par son URL.

### 2.3) Configurer un domaine personnalisé

1. Dans Vercel, allez dans `Domains` → `Add` → entrez votre domaine.
2. Suivez les instructions DNS :
   - Ajoutez un enregistrement **A** (ou **CNAME**) qui pointe vers Vercel.
3. Une fois les enregistrements propagés, Vercel activera automatiquement HTTPS.

---

## 3) Générer l’APK/AAB pour Google Play (Android)

### 3.1) Préparer EAS (Expo Application Services)

1. Initialiser EAS dans le projet (depuis le répertoire racine) :

   ```bash
   eas build:configure
   ```

2. Créez/ouvrez `eas.json` et assurez-vous d’avoir une configuration `production` :
   ```json
   {
     "build": {
       "production": {
         "android": {
           "buildType": "app-bundle"
         }
       }
     }
   }
   ```

> ✅ `app-bundle` (AAB) est recommandé pour Google Play (meilleure taille et gestion des architectures).

### 3.2) Construire le binaire Android

```bash
eas build --platform android --profile production
```

1. Vous serez invité à vous connecter à Expo (ou utilisez `expo login`).
2. EAS gère la clé de signature (ou peut en générer une pour vous).
3. À la fin, vous obtiendrez une URL d’artefact pour télécharger le `.aab` (ou `.apk` si vous avez choisi `apk`).

### 3.3) Publier sur Google Play

1. Connectez-vous à [Google Play Console](https://play.google.com/console).
2. Créez une application (ou mettez à jour une existante).
3. Téléversez le `.aab` généré.
4. Remplissez :
   - Fiches Play Store (description, captures d’écran, icônes)
   - Politique de confidentialité
   - Contenu pour la classification d’âge
5. Lancez la revue (soumission pour publication).

---

## 4) Générer l’IPA pour l’App Store (iOS)

> ⚠️ Pour iOS, un compte Apple Developer payant est requis.

### 4.1) Préparer EAS pour iOS

1. Vérifiez que `eas.json` contient une configuration pour iOS :

   ```json
   {
     "build": {
       "production": {
         "ios": {
           "simulator": false
         }
       }
     }
   }
   ```

2. Assurez-vous que votre `app.json`/`app.config.js` contient :
   - `ios.bundleIdentifier` (ex: `com.monorganisation.bisapp`)
   - `ios.buildNumber` (ex: `1.0.0`)

### 4.2) Construire l’IPA

```bash
eas build --platform ios --profile production
```

EAS va :

- gérer les certificats (via Apple Developer)
- créer un provisioning profile
- générer l’IPA

> 📌 Vous pouvez choisir de laisser EAS gérer automatiquement les identifiants.

### 4.3) Soumettre sur App Store Connect

1. Connectez-vous à [App Store Connect](https://appstoreconnect.apple.com).
2. Créez une application ou mettez à jour l’existante.
3. Téléversez l’IPA via Transporter (Apple) ou directement via `eas submit` :

```bash
eas submit --platform ios --profile production
```

4. Remplissez les métadonnées (captures d’écran, description, mots clés, infos de contact, confidentialité).
5. Envoyez pour revue.

---

## 5) Notes spécifiques au backend

- Si votre backend est hébergé séparément (ex. : Railway, Heroku, VPS), assurez-vous que l’URL est bien configurée dans le frontend (`services/api.ts` ou variables d’environnement).
- En production, utilisez des variables d’environnement (`.env`) pour les URLs et les clés secrètes.

---

## 6) Conseils rapides

- 🍎 **iOS** : la première soumission peut prendre plusieurs jours.
- 🤖 **Android** : pensez à configurer les signatures d’app dans Google Play (clés de jeu).
- 📱 Vérifiez que tous les assets (icônes, splash) ont les bonnes tailles (Expo les génère automatiquement si bien configuré).
- 🧪 Testez toujours vos builds `eas build --local` (optionnel) avant envoi en production.

---

> ✅ Une fois ces étapes terminées, votre app sera :
>
> - disponible en ligne via votre domaine (Vercel)
> - téléchargeable sur Google Play et l’App Store
