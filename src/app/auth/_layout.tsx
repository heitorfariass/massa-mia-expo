import { useAuth } from "@/store/auth";
import { Redirect, Stack } from "expo-router";

export default function AuthLayout() {
  const usuario = useAuth((state) => state.usuario);
  if (usuario) {
    return (
      <Redirect
        href={
          usuario.papel === "proprietario" ? "/proprietario" : "/funcionario"
        }
      />
    );
  }
  return <Stack screenOptions={{ headerShown: false }} />;
}
