// https://docs.expo.dev/guides/using-eslint/ 
//Role : ce fichier configure ESLint pour le projet en utilisant la configuration d'Expo et en ignorant le dossier 'dist', car il contient des fichiers compilés qui n'ont pas besoin d'être lintés(veut dire vérifiés pour des erreurs de code).
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
]);
