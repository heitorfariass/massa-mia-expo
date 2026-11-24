import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';

export type AlertMessageVariant = 'error' | 'empty' | 'loading' | 'success';

export type AlertMessageProps = {
  variant?: AlertMessageVariant;
  message?: string;
  title?: string;
  style?: StyleProp<ViewStyle>;
};

const palettes = {
  error: { background: colors.dangerLight, border: colors.danger, text: colors.dangerDark },
  empty: { background: colors.massaAzul[0], border: colors.borderStrong, text: colors.textMuted },
  loading: { background: colors.primaryLight, border: colors.primary, text: colors.primaryDark },
  success: { background: colors.successLight, border: colors.success, text: colors.success },
} as const;

/**
 * Mensagem de estado: erro, lista vazia, carregando ou sucesso.
 * Use dentro de cartões e formulários no lugar de `alert()`.
 */
export function AlertMessage({
  variant = 'error',
  message,
  title,
  style,
}: AlertMessageProps) {
  const palette = palettes[variant];
  const isLoading = variant === 'loading';
  const text = message ?? (isLoading ? 'Carregando…' : undefined);

  return (
    <View
      accessibilityRole={variant === 'error' ? 'alert' : 'text'}
      accessibilityLiveRegion={variant === 'loading' ? 'polite' : undefined}
      style={[
        styles.container,
        { backgroundColor: palette.background, borderLeftColor: palette.border },
        style,
      ]}
    >
      {isLoading ? <ActivityIndicator size="small" color={palette.border} /> : null}
      <View style={styles.texts}>
        {title ? <Text style={[styles.title, { color: palette.text }]}>{title}</Text> : null}
        {text ? (
          <Text style={[styles.message, { color: palette.text }]}>{text}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderLeftWidth: 4,
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: fontFamily.bodyBold,
    fontSize: fontSize.sm,
  },
  message: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
  },
});
