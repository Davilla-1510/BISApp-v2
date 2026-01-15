# 🚀 Guide d'Installation - BISApp

## Prérequis

### Système Général

- **Node.js** (v16 ou plus)
- **npm** ou **yarn**
- **Git**

### Backend

- **MongoDB** (local ou Atlas Cloud)
- **Postman** (optionnel, pour tester les API)

### Frontend

- **Expo CLI** (`npm install -g expo-cli`)
- **Android Emulator** ou **iOS Simulator** (optionnel)
- **Expo Go App** sur téléphone (optionnel)

---

## 1️⃣ Installation Backend

### Étape 1: Naviguer au dossier backend

```bash
cd backend
```

### Étape 2: Installer les dépendances

```bash
npm install
```

### Étape 3: Configuration des variables d'environnement

```bash
cp .env.example .env
```

Puis éditez `.env`:

```env
# Backend
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/bisapp
# OU pour MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bisapp

# JWT
JWT_SECRET=your_super_secret_key_change_this_in_production
JWT_EXPIRE=7d

# Admin
ADMIN_SECRET_KEY=your_admin_secret_change_this

# Email (optionnel)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### Étape 4: Démarrer MongoDB

**Option A: MongoDB local**

```bash
# Sur Windows
mongod

# Sur macOS
brew services start mongodb-community

# Sur Linux
sudo systemctl start mongod
```

**Option B: MongoDB Atlas (Cloud)**

1. Créez un compte sur [mongodb.com/atlas](https://mongodb.com/atlas)
2. Créez un cluster gratuit
3. Copiez la chaîne de connexion
4. Collez-la dans `.env` (MONGODB_URI)

### Étape 5: Démarrer le serveur backend

```bash
npm run dev
```

**Résultat attendu:**

```
✅ MongoDB connecté avec succès
🚀 BISApp Backend démarré sur le port 3000
📝 API disponible sur http://localhost:3000/api
```

### Étape 6: Vérifier la connexion

```bash
curl http://localhost:3000/api/health
```

**Réponse attendue:**

```json
{
  "message": "Server is running ✅"
}
```

---

## 2️⃣ Installation Frontend

### Étape 1: Retour à la racine du projet

```bash
cd ..
```

### Étape 2: Installer les dépendances

```bash
npm install
```

### Étape 3: Configuration API (optionnel)

Si le backend n'est pas sur `localhost:3000`, créez un fichier `.env.local`:

```env
REACT_APP_API_URL=http://localhost:3000/api
```

### Étape 4: Démarrer l'application

```bash
npx expo start
```

**Résultat attendu:**

```
Expo DevTools is running at http://localhost:19002
Opening exp://localhost:19000 in a web browser.
```

### Étape 5: Lancer l'app

#### Option A: Expo Go (sur votre téléphone)

1. Téléchargez **Expo Go** depuis Google Play ou App Store
2. Scannez le QR code affiché dans le terminal
3. L'app s'ouvrira dans Expo Go

#### Option B: Android Emulator

```bash
# Dans le terminal Expo, appuyez sur 'a'
```

#### Option C: iOS Simulator (macOS uniquement)

```bash
# Dans le terminal Expo, appuyez sur 'i'
```

#### Option D: Web

```bash
# Dans le terminal Expo, appuyez sur 'w'
```

---

## 3️⃣ Données de Test

### Créer un utilisateur de test

Via Postman ou curl:

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "jean@example.com",
    "password": "password123",
    "confirmPassword": "password123",
    "accessibilityLevel": "partial",
    "audioMode": true
  }'
```

**Réponse:**

```json
{
  "message": "Inscription réussie",
  "user": {
    "id": "...",
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "jean@example.com",
    "accessibilityLevel": "partial",
    "audioMode": true,
    "role": "student"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Créer des données de contenu (Admin)

```bash
# Créer un module
curl -X POST http://localhost:3000/api/admin/modules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "name": "braille",
    "title": "Apprentissage du Braille",
    "description": "Maîtrisez le système de lecture et d'\''écriture Braille",
    "icon": "📚"
  }'
```

---

## 4️⃣ Dépannage

### Erreur: "Cannot GET /api/health"

**Cause**: Le backend n'est pas démarré
**Solution**:

```bash
cd backend
npm run dev
```

### Erreur: "MongoDB connection failed"

**Cause**: MongoDB n'est pas en cours d'exécution
**Solution**:

- Démarrez MongoDB local: `mongod`
- Ou vérifiez la chaîne MongoDB Atlas dans `.env`

### Erreur: "Port 3000 already in use"



**Solution**:

```bash
# Trouver le process utilisant le port 3000
lsof -i :3000

# Tuer le process (sur macOS/Linux)
kill -9 <PID>

# Ou démarrer sur un port différent
PORT=3001 npm run dev
```

### Erreur: "ECONNREFUSED 127.0.0.1:3000"

**Cause**: Le frontend ne peut pas atteindre le backend
**Solution**:

- Assurez-vous que le backend fonctionne sur `localhost:3000`
- Vérifiez votre pare-feu
- Sur Android Emulator, utilisez `10.0.2.2` au lieu de `localhost`

### Erreur: "Module not found"

**Solution**:

```bash
# Supprimez node_modules et réinstallez
rm -rf node_modules
npm install
```

---

## 5️⃣ Commandes Utiles

### Backend

```bash
# Démarrage en mode développement
npm run dev

# Build en mode production
npm run build

# Démarrage en mode production
npm start

# Tests (si configurés)
npm test
```

### Frontend

```bash
# Démarrer Expo
npx expo start

# Réinitialiser le cache
npx expo start --clear

# Nettoyer les dépendances
rm -rf node_modules package-lock.json
npm install
```

---

## 6️⃣ Checklist de Configuration Finale

### Backend

- [ ] MongoDB connectée et fonctionnelle
- [ ] Variables d'environnement définies dans `.env`
- [ ] Serveur démarre sans erreur sur le port 3000
- [ ] API health check répond

### Frontend

- [ ] Dépendances installées sans erreur
- [ ] Expo démarre correctement
- [ ] L'app se charge sur l'émulateur/téléphone
- [ ] Page de splash affiche le logo BISApp

### Base de Données

- [ ] Au moins 1 module créé (Braille ou Informatique)
- [ ] Au moins 1 niveau par module
- [ ] Au moins 1 chapitre par niveau
- [ ] Au moins 1 leçon par chapitre
- [ ] Au moins 1 exercice par leçon

---

## 7️⃣ Configuration pour la Production

### Backend

1. Créez un fichier `.env` avec les valeurs de production
2. Changez `JWT_SECRET` par une clé très sécurisée
3. Changez `ADMIN_SECRET_KEY`
4. Utilisez MongoDB Atlas avec authentification
5. Activez HTTPS
6. Déployez sur: Heroku, AWS, DigitalOcean, etc.

### Frontend

1. Mettez à jour `REACT_APP_API_URL` vers votre serveur de production
2. Générez un build: `eas build`
3. Distribuez via Google Play Store et Apple App Store

---

## 📞 Support

- **Backend**: Consultez [backend/README.md](backend/README.md)
- **Documentation générale**: Consultez [DOCUMENTATION.md](DOCUMENTATION.md)
- **Architecture**: Consultez [ARCHITECTURE.md](ARCHITECTURE.md)

---

**Vous êtes prêt! Lancez l'application et commencez à tester! 🚀**
