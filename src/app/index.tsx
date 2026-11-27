import { Button, Screen } from "@/components/ui";
import { useAuth } from "@/store/auth";
import { colors, fontFamily, spacing } from "@/theme";
import { Redirect, useRouter } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";

export default function Home() {
  const router = useRouter();
  const usuario = useAuth((state) => state.usuario);
  if (usuario) {
    return <Redirect href="/funcionario" />;
  }
  return (
    <Screen
      style={styles.screen}
      contentContainerStyle={styles.content}
      edges={["top", "bottom", "left", "right"]}
    >
      <View style={styles.intro}>
        <Image
          source={require("../../assets/logo-home.png")}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Massa Mia"
        />
        <Text style={styles.subtitle}>Sistema de gestão da pizzaria</Text>
      </View>
      <View style={styles.actions}>
        <Text style={styles.prompt}>Quem vai entrar?</Text>
        <Button
          label="Proprietário"
          variant="danger"
          size="lg"
          style={styles.ownerButton}
          onPress={() =>
            router.push({
              pathname: "/auth/login",
              params: { papel: "proprietario" },
            })
          }
        />
        <Button
          label="Funcionário"
          size="lg"
          style={styles.employeeButton}
          onPress={() =>
            router.push({
              pathname: "/auth/login",
              params: { papel: "funcionario" },
            })
          }
        />
      </View>
    </Screen>
  );
}
const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#FFEB88",
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingBottom: spacing.lg,
  },
  intro: {
    width: "100%",
    alignItems: "center",
    marginBottom: 46,
  },
  logo: {
    width: 240,
    height: 66,
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 18,
    color: colors.danger,
    textAlign: "center",
  },
  prompt: {
    marginBottom: spacing.xs,
    fontFamily: fontFamily.displayBold,
    fontSize: 22,
    color: colors.text,
    textAlign: "center",
  },
  actions: {
    width: "100%",
    maxWidth: 400,
    gap: spacing.md,
  },
  ownerButton: {
    borderBottomWidth: 5,
    borderBottomColor: colors.dangerDark,
  },
  employeeButton: {
    borderBottomWidth: 5,
    borderBottomColor: colors.primaryDark,
  },
});
