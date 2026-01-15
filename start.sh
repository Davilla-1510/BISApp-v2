#!/bin/bash
# Script de démarrage rapide BISApp

echo "🚀 Démarrage BISApp - Tutoring Accessible"
echo "=========================================="
echo ""

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé!"
    exit 1
fi

echo "✅ Node.js détecté: $(node -v)"
echo "✅ npm détecté: $(npm -v)"
echo ""

# Démarrer le backend
echo "📦 Démarrage du Backend..."
echo "Assurez-vous que MongoDB est en cours d'exécution!"
echo ""

cd backend
if [ ! -d "node_modules" ]; then
    echo "📥 Installation des dépendances backend..."
    npm install
fi

# Vérifier .env
if [ ! -f ".env" ]; then
    echo "⚙️  Création du fichier .env..."
    cp .env.example .env
    echo "⚠️  Configurez .env avant de continuer!"
fi

echo ""
echo "🔄 Démarrage du serveur Express..."
echo "Backend URL: http://localhost:4000"
echo ""

npm run dev &
BACKEND_PID=$!

cd ..

sleep 3

# Démarrer le frontend
echo ""
echo "📱 Démarrage du Frontend Expo..."
echo ""

if [ ! -d "node_modules" ]; then
    echo "📥 Installation des dépendances frontend..."
    npm install
fi

echo "🎬 Lancement d'Expo..."
echo "Utilisez 'a' pour Android, 'i' pour iOS, 'w' pour Web"
echo ""

npx expo start

# Cleanup
trap "kill $BACKEND_PID" EXIT
