import { AlertMessage, Button, Screen, TextField } from "@/components/ui";
import { useAuth } from "@/store/auth";
import { colors, fontFamily, fontSize, radius, spacing } from "@/theme";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  type TextInputInstance,
} from "react-native";

export default function Login() {
  const router = useRouter();
  const { papel } = useLocalSearchParams<{ papel?: string }>();
  const entrar = useAuth((state) => state.entrar);
  const carregando = useAuth((state) => state.carregando);
  const erro = useAuth((state) => state.erro);
  const limparErro = useAuth((state) => state.limparErro);
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const senhaRef = useRef<TextInputInstance>(null);
  const proprietario = papel === "proprietario";

  useFocusEffect(useCallback(() => () => limparErro(), [limparErro]));

  function digitar(setter: (valor: string) => void) {
    return (valor: string) => {
      setter(valor);
      if (erro) limparErro();
    };
  }

  function handleEntrar() {
    entrar(usuario, senha, proprietario ? "proprietario" : "funcionario");
  }

  return (
    <Screen
      style={styles.screen}
      contentContainerStyle={styles.content}
      edges={["top", "bottom", "left", "right"]}
    >
      <Image
        source={require("../../../assets/logo-home.png")}
        style={styles.logo}
        resizeMode="contain"
        accessibilityLabel="Massa Mia"
      />
      <View style={styles.card}>
        <Text style={styles.label}>
          {proprietario ? "GESTÃO DO RESTAURANTE" : "ROTINA DO RESTAURANTE"}
        </Text>
        <Text style={styles.title}>
          Entrar como {proprietario ? "Proprietário" : "Funcionário"}
        </Text>
        <TextField
          label="Usuário"
          placeholder="Seu usuário"
          value={usuario}
          onChangeText={digitar(setUsuario)}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => senhaRef.current?.focus()}
        />
        <TextField
          ref={senhaRef}
          label="Senha"
          placeholder="Sua senha"
          value={senha}
          onChangeText={digitar(setSenha)}
          secureTextEntry={!mostrarSenha}
          returnKeyType="go"
          onSubmitEditing={handleEntrar}
        />
        <Text
          style={styles.mostrar}
          accessibilityRole="button"
          onPress={() => setMostrarSenha(!mostrarSenha)}
        >
          {mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
        </Text>
        {erro ? <AlertMessage variant="error" message={erro} /> : null}
        <Button
          label="Entrar"
          variant={proprietario ? "danger" : "primary"}
          size="lg"
          loading={carregando}
          onPress={handleEntrar}
        />
        {proprietario ? null : (
          <Text
            style={styles.link}
            accessibilityRole="link"
            onPress={() => router.push("/auth/cadastro")}
          >
            Ainda não tem conta?{" "}
            <Text style={styles.linkForte}>Criar conta</Text>
          </Text>
        )}
        <Button
          label="Voltar ao início"
          variant="outline"
          onPress={() => router.back()}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#FFEB88" },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  logo: { width: 200, height: 55, marginBottom: spacing.xl },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.md,
  },
  label: {
    fontFamily: fontFamily.bodyBold,
    fontSize: fontSize.xs,
    color: colors.danger,
    letterSpacing: 1,
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.xl,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  mostrar: {
    fontFamily: fontFamily.bodyBold,
    fontSize: fontSize.xs,
    color: colors.primary,
    alignSelf: "flex-end",
    marginTop: -spacing.xs,
  },
  link: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: "center",
    paddingVertical: spacing.xs,
  },
  linkForte: { fontFamily: fontFamily.bodyBold, color: colors.primary },
});
