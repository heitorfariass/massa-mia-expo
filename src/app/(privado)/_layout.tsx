import { Redirect, Stack } from 'expo-router';
import { AlertMessage, Screen } from '@/components/ui';
import { useAuth } from '@/store/auth';

export default function PrivateLayout() {
  const hidratado = useAuth((state) => state.hidratado);
  const usuario = useAuth((state) => state.usuario);
  // Em desenvolvimento as telas internas abrem direto: a tela de login ainda
  // não faz parte deste branch, então sem isso não dá para revisar as telas.
  if (__DEV__) return <Stack screenOptions={{ headerShown: false }} />;
  if (!hidratado) {
    return <Screen><AlertMessage variant="loading" message="Verificando sessão..." /></Screen>;
  }
  // Guarda provisória; alinhar o fluxo definitivo com a equipe de autenticação.
  if (!usuario) return <Redirect href="/" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
