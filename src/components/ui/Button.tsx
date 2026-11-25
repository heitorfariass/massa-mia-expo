import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';

export type ButtonVariant = 'primary' | 'danger' | 'outline';
export type ButtonSize = 'md' | 'lg';

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  /** Ocupa a largura toda (padrão). Use `false` em linhas de botões. */
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
};

/**
 * Botão do kit: primary (ação principal), danger (remover/cancelar)
 * e outline (ação secundária). Mostra spinner quando `loading`.
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = true,
  style,
  accessibilityHint,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const textColor = variant === 'outline' ? colors.primary : colors.textOnPrimary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        size === 'lg' ? styles.sizeLg : styles.sizeMd,
        variantStyles[variant],
        pressed && !isDisabled ? pressedStyles[variant] : null,
        fullWidth ? styles.fullWidth : null,
        isDisabled ? styles.disabled : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text
          numberOfLines={1}
          style={[styles.label, size === 'lg' && styles.labelLg, { color: textColor }]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderRadius: radius.md,
    borderWidth: 1.5,
    gap: spacing.sm,
  },
  sizeMd: {
    minHeight: 46,
    paddingHorizontal: spacing.lg,
  },
  sizeLg: {
    minHeight: 54,
    paddingHorizontal: spacing.xl,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontFamily: fontFamily.bodyBold,
    fontSize: fontSize.md,
  },
  labelLg: {
    fontSize: fontSize.lg,
  },
});

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  danger: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: colors.primary,
  },
});

const pressedStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  danger: {
    backgroundColor: colors.dangerDark,
    borderColor: colors.dangerDark,
  },
  outline: {
    backgroundColor: colors.primaryLight,
  },
});
