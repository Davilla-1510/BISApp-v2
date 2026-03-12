import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack> 
      <Stack.Screen 
        name="tutor" 
        options={{ 
          headerShown: false // On cache l'en-tête pour l'écran du tuteur
        }} 
      />
      {/*  un tableau de bord */}
     <Stack.Screen
      name="dashboard"
     />
    </Stack>
  );
}