@echo off
REM Script de démarrage rapide BISApp pour Windows

echo  Demarrage BISApp - Tutoring Accessible
echo ==========================================
echo.

REM Verifier Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js n'est pas installe!
    pause
    exit /b 1
)

echo  Node.js detecte
for /f "tokens=*" %%i in ('node -v') do echo %%i
echo.

REM Demarrer le backend
echo 📦 Demarrage du Backend...
echo Assurez-vous que MongoDB est en cours d'execution!
echo.

cd backend
if not exist "node_modules" (
    echo 📥 Installation des dependances backend...
    call npm install
)

REM Verifier .env
if not exist ".env" (
    echo ⚙️  Creation du fichier .env...
    copy .env.example .env
    echo ⚠️  Configurez .env avant de continuer!
)

echo.
echo 🔄 Demarrage du serveur Express...
echo Backend URL: http://localhost:3000
echo.

REM Lancer backend dans une nouvelle fenetre
start "BISApp Backend" npm run dev

cd ..

timeout /t 3 /nobreak

REM Demarrer le frontend
echo.
echo 📱 Demarrage du Frontend Expo...
echo.

if not exist "node_modules" (
    echo 📥 Installation des dependances frontend...
    call npm install
)

echo 🎬 Lancement d'Expo...
echo Utilisez 'a' pour Android, 'i' pour iOS, 'w' pour Web
echo.

call npx expo start

pause
