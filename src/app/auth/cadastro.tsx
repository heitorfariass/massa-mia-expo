import { AlertMessage, Button, Screen, TextField } from "@/components/ui";
import type { DadosCadastro } from "@/lib/auth";
import { useAuth } from "@/store/auth";
import { colors, fontFamily, fontSize, radius, spacing } from "@/theme";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  type TextInputInstance,
} from "react-native";

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
  const [confirmacao, setConfirmacao] = useState("");
  const [erroConfirmacao, setErroConfirmacao] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const emailRef = useRef<TextInputInstance>(null);
  const usuarioRef = useRef<TextInputInstance>(null);
  const senhaRef = useRef<TextInputInstance>(null);
  const confirmacaoRef = useRef<TextInputInstance>(null);

  useFocusEffect(useCallback(() => () => limparErro(), [limparErro]));

  function alterar(campo: keyof DadosCadastro) {
    return (valor: string) => {
      setDados((anterior) => ({ ...anterior, [campo]: valor }));
      if (erro) limparErro();
    };
  }

  function alterarConfirmacao(valor: string) {
    setConfirmacao(valor);
    setErroConfirmacao("");
  }

  function handleCadastrar() {
    if (dados.password !== confirmacao) {
      setErroConfirmacao("As senhas não conferem.");
      return;
    }
    cadastrar(dados);
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
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => emailRef.current?.focus()}
        />
        <TextField
          ref={emailRef}
          label="E-mail"
          placeholder="seuemail@exemplo.com"
          value={dados.email}
          onChangeText={alterar("email")}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => usuarioRef.current?.focus()}
        />
        <TextField
          ref={usuarioRef}
          label="Usuário"
          placeholder="Escolha um usuário"
          value={dados.username}
          onChangeText={alterar("username")}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => senhaRef.current?.focus()}
        />
        <TextField
          ref={senhaRef}
          label="Senha"
          placeholder="Crie uma senha"
          value={dados.password}
          onChangeText={alterar("password")}
          secureTextEntry={!mostrarSenha}
          hint="Mínimo de 6 caracteres"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => confirmacaoRef.current?.focus()}
        />
        <TextField
          ref={confirmacaoRef}
          label="Confirmar senha"
          placeholder="Repita a senha"
          value={confirmacao}
          onChangeText={alterarConfirmacao}
          secureTextEntry={!mostrarSenha}
          error={erroConfirmacao || undefined}
          returnKeyType="go"
          onSubmitEditing={handleCadastrar}
        />
        <Text
          style={styles.mostrar}
          accessibilityRole="button"
          onPress={() => setMostrarSenha(!mostrarSenha)}
        >
          {mostrarSenha ? "Ocultar senhas" : "Mostrar senhas"}
        </Text>
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
          onPress={() => router.back()}
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
