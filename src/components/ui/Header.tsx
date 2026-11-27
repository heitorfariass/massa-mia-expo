import { useRouter, type Href } from 'expo-router';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, fontFamily, fontSize, logo, radius, spacing } from '@/theme';

export type HeaderProps = {
  /** Área do sistema, ex.: "Funcionário" ou "Proprietário". */
  area?: string;
  /** Rota do painel da área (usada no breadcrumb e no voltar). */
  painel?: Href;
  /** Página atual, ex.: "Vendas". */
  pagina?: string;
  /** Se informado, mostra o atalho "Sair". */
  onLogout?: () => void;
  /** Ação customizada do voltar; o padrão volta na navegação. */
  onBack?: () => void;
  /** Esconde o breadcrumb quando a tela já tem título próprio. */
  showBreadcrumb?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Cabeçalho compacto dos painéis principais. */
  variant?: 'default' | 'painel';
};

/**
 * Barra superior das telas internas: fundo amarelo, logo centralizada,
 * seta de voltar à esquerda e caminho "Área › Página" sob a logo.
 * A variante `painel` é a barra compacta usada nos painéis principais.
 */
export function Header({
  area,
  painel,
  pagina,
  onLogout,
  onBack,
  showBreadcrumb = true,
  style,
  variant = 'default',
}: HeaderProps) {
  const router = useRouter();
  const hasBreadcrumb = showBreadcrumb && (Boolean(area) || Boolean(pagina));

  function goBack() {
    if (onBack) {
      onBack();
      return;
    }
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(painel ?? '/');
  }

  if (variant === 'painel') {
    return (
      <View style={[styles.panelHeader, style]}>
        <Pressable accessibilityRole="link" accessibilityLabel="Massa Mia — ir para a tela inicial" onPress={() => router.replace('/')}>
          <Image source={logo} style={styles.panelLogo} resizeMode="contain" />
        </Pressable>
        <View style={styles.divider} />
        <Text style={styles.panelArea} numberOfLines={1}>{area}</Text>
        {onLogout ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Sair da conta" onPress={onLogout}
            style={({ pressed }) => [styles.panelLogout, pressed && styles.pressed]}>
            <Text style={styles.panelLogoutText}>⇥  Sair</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  return (
    <View style={[styles.header, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        hitSlop={8}
        onPress={goBack}
        style={({ pressed }) => [styles.side, pressed ? styles.pressed : null]}
      >
        <Text style={styles.backText}>←</Text>
      </Pressable>

      <Pressable
        accessibilityRole="link"
        accessibilityLabel="Massa Mia — ir para a tela inicial"
        hitSlop={8}
        onPress={() => router.replace('/')}
        style={styles.center}
      >
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        {hasBreadcrumb ? (
          <Text style={styles.breadcrumb} numberOfLines={1}>
            {area}
            {area && pagina ? ' › ' : null}
            {pagina ?? ''}
          </Text>
        ) : null}
      </Pressable>

      {onLogout ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sair da conta"
          hitSlop={8}
          onPress={onLogout}
          style={({ pressed }) => [styles.side, styles.sideRight, pressed ? styles.pressed : null]}
        >
          <Text style={styles.logoutText}>Sair</Text>
        </Pressable>
      ) : (
        <View style={styles.side} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panelHeader: { backgroundColor: '#FFEB88', flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: spacing.sm },
  panelLogo: { width: 100, height: 25 },
  divider: { height: 25, width: 1, backgroundColor: colors.massaAmarelo[7] },
  panelArea: { flex: 1, color: colors.danger, fontFamily: fontFamily.bodyBold, fontSize: fontSize.sm },
  panelLogout: { borderColor: colors.primary, borderWidth: 1, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  panelLogoutText: { color: colors.primary, fontFamily: fontFamily.bodyBold, fontSize: fontSize.sm },

  // Barra amarela com a logo centralizada.
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEB88',
    borderBottomWidth: 1,
    borderBottomColor: colors.massaAmarelo[7],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  side: {
    width: 44,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  sideRight: {
    alignItems: 'flex-end',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  logo: {
    width: 132,
    height: 33,
  },
  breadcrumb: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    color: colors.danger,
  },
  backText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 22,
    color: colors.danger,
  },
  logoutText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: fontSize.sm,
    color: colors.danger,
  },
  pressed: {
    opacity: 0.6,
  },
});
