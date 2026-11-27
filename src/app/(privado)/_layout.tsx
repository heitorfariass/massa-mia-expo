import { AlertMessage, Screen } from "@/components/ui";
import { useAuth } from "@/store/auth";
import { Redirect, Stack } from "expo-router";

export default function PrivateLayout() {
  const hidratado = useAuth((state) => state.hidratado);
  const usuario = useAuth((state) => state.usuario);
  if (!hidratado) {
    return (
      <Screen>
        <AlertMessage variant="loading" message="Verificando sessão..." />
      </Screen>
    );
  }
  if (!usuario) return <Redirect href="/" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
