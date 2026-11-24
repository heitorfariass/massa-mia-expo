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
};

/**
 * Porte do `Cabecalho` do site: logo, caminho "Área › Página",
 * atalho para voltar ao painel e sair.
 */
export function Header({
  area,
  painel,
  pagina,
  onLogout,
  onBack,
  showBreadcrumb = true,
  style,
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

  return (
    <View style={[styles.header, style]}>
      <View style={styles.topRow}>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Massa Mia — ir para a tela inicial"
          hitSlop={8}
          onPress={() => router.replace('/')}
        >
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </Pressable>

        {onLogout ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sair da conta"
            hitSlop={8}
            onPress={onLogout}
            style={({ pressed }) => [styles.logout, pressed ? styles.pressed : null]}
          >
            <Text style={styles.logoutText}>Sair</Text>
          </Pressable>
        ) : null}
      </View>

      {hasBreadcrumb ? (
        <View style={styles.bottomRow}>
          <Text style={styles.breadcrumb} numberOfLines={1}>
            {area ? (
              <Text
                style={styles.breadcrumbLink}
                accessibilityRole={painel ? 'link' : undefined}
                onPress={painel ? () => router.push(painel) : undefined}
              >
                {area}
              </Text>
            ) : null}
            {area && pagina ? ' › ' : null}
            {pagina ?? ''}
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar ao painel"
            hitSlop={8}
            onPress={goBack}
            style={({ pressed }) => [styles.back, pressed ? styles.pressed : null]}
          >
            <Text style={styles.backText}>← Voltar</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  logo: {
    width: 132,
    height: 33,
  },
  logout: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.danger,
  },
  logoutText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: fontSize.sm,
    color: colors.danger,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  breadcrumb: {
    flex: 1,
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  breadcrumbLink: {
    fontFamily: fontFamily.bodyBold,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  back: {
    paddingVertical: spacing.xs,
  },
  backText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: fontSize.xs,
    color: colors.primary,
  },
  pressed: {
    opacity: 0.6,
  },
});
