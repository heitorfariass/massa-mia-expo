import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useMassaFonts } from '@/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { loaded, error } = useMassaFonts();

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  // Segura a splash até as fontes (Fredoka/Nunito) carregarem.
  if (!loaded && !error) return null;

  return (
    <SafeAreaProvider>
      <Stack />
    </SafeAreaProvider>
  );
}
