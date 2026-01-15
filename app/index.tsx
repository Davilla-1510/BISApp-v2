import { Redirect } from 'expo-router';

// Ce fichier sert de point d'entrée. Le RootLayout se chargera de la redirection.
// On peut rediriger vers une route par défaut pour éviter l'erreur "Unmatched Route".
export default function Index() {
  return <Redirect href="/login" />;
}
