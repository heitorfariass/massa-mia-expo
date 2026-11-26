import { AlertMessage, Button, Screen, TextField } from "@/components/ui";
import type { DadosCadastro } from "@/lib/auth";
import { useAuth } from "@/store/auth";
import { colors, fontFamily, fontSize, radius, spacing } from "@/theme";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export default function Cadastro() {
  const router = useRouter();
  const cadastrar = useAuth((state) => state.cadastrar);
  const carregando = useAuth((state) => state.carregando);
  const erro = useAuth((state) => state.erro);
  const limparErro = useAuth((state) => state.limparErro);
  const [dados, setDados] = useState<DadosCadastro>({
    nome: "",
    email: "",
    username: "",
    password: "",
  });

  function alterar(campo: keyof DadosCadastro) {
    return (valor: string) =>
      setDados((anterior) => ({ ...anterior, [campo]: valor }));
  }

  async function handleCadastrar() {
    const cadastrou = await cadastrar(dados);
    if (cadastrou) router.replace("/funcionario");
  }

  function voltarParaLogin() {
    limparErro();
    router.back();
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
        <Text style={styles.label}>ROTINA DO RESTAURANTE</Text>
        <Text style={styles.title}>Criar conta de funcionário</Text>
        <TextField
          label="Nome"
          placeholder="Seu nome completo"
          value={dados.nome}
          onChangeText={alterar("nome")}
          autoCapitalize="words"
        />
        <TextField
          label="E-mail"
          placeholder="seuemail@exemplo.com"
          value={dados.email}
          onChangeText={alterar("email")}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextField
          label="Usuário"
          placeholder="Escolha um usuário"
          value={dados.username}
          onChangeText={alterar("username")}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextField
          label="Senha"
          placeholder="Crie uma senha"
          value={dados.password}
          onChangeText={alterar("password")}
          secureTextEntry
          hint="Mínimo de 6 caracteres"
        />
        {erro ? <AlertMessage variant="error" message={erro} /> : null}
        <Button
          label="Criar conta"
          size="lg"
          loading={carregando}
          onPress={handleCadastrar}
        />
        <Text
          style={styles.link}
          accessibilityRole="link"
          onPress={voltarParaLogin}
        >
          Já tem conta? <Text style={styles.linkForte}>Entrar</Text>
        </Text>
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
  link: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: "center",
    paddingVertical: spacing.xs,
  },
  linkForte: { fontFamily: fontFamily.bodyBold, color: colors.primary },
});
