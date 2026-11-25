import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import {
  colors,
  fontFamily,
  fontSize,
  radius,
  spacing,
  statusColors,
  type StatusType,
} from '@/theme';

export type StatusBadgeProps = {
  /** Servido, Cancelado, Agendado ou Realizado. */
  status: StatusType | (string & {});
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
};

const knownStatuses = Object.keys(statusColors) as StatusType[];
const neutral = { background: colors.disabled, text: colors.textMuted };

function findStatus(status: string): StatusType | undefined {
  const normalized = status.trim().toLowerCase();
  return knownStatuses.find((key) => key.toLowerCase() === normalized);
}

/** Etiqueta colorida de status (vendas e eventos). */
export function StatusBadge({ status, size = 'md', style }: StatusBadgeProps) {
  const key = findStatus(status);
  const palette = key ? statusColors[key] : neutral;

  return (
    <View
      accessibilityLabel={`Status: ${key ?? status}`}
      style={[
        styles.badge,
        size === 'sm' ? styles.sizeSm : styles.sizeMd,
        { backgroundColor: palette.background },
        style,
      ]}
    >
      <Text style={[styles.label, size === 'sm' && styles.labelSm, { color: palette.text }]}>
        {key ?? status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
  },
  sizeMd: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  sizeSm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  label: {
    fontFamily: fontFamily.bodyBold,
    fontSize: fontSize.sm,
  },
  labelSm: {
    fontSize: fontSize.xs,
  },
});
