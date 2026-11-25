import { Redirect, Stack, usePathname } from 'expo-router';
import { AlertMessage, Screen } from '@/components/ui';
import { useAuth } from '@/store/auth';

export default function PrivateLayout() {
  const hidratado = useAuth((state) => state.hidratado);
  const usuario = useAuth((state) => state.usuario);
  const pathname = usePathname();
  const painelDev = __DEV__ && (pathname === '/proprietario' || pathname === '/funcionario');
  if (painelDev) return <Stack screenOptions={{ headerShown: false }} />;
  if (!hidratado) {
    return <Screen><AlertMessage variant="loading" message="Verificando sessão..." /></Screen>;
  }
  // Guarda provisória; alinhar o fluxo definitivo com a equipe de autenticação.
  if (!usuario) return <Redirect href="/" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
