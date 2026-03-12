import { Redirect } from 'expo-router';

// Ce fichier sert de point d'entrée. Le RootLayout se chargera de la redirection.
// On redirige vers le splash screen qui gère la logique de navigation
export default function Index() {
  return <Redirect href="/splash" />;
}
