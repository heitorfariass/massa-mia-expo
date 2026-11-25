import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';
import { formatCurrency } from '@/utils/format';

export type ItemRowProps = {
  produto: string;
  quantidade: number;
  subtotal: number;
  /** Preço unitário, exibido em “2 × R$ 30,00”. */
  precoUnitario?: number;
  onRemove?: () => void;
  onPress?: () => void;
  removeLabel?: string;
  /** Texto extra abaixo do produto (ex.: observação). */
  detalhe?: string;
};

/**
 * Linha de item reutilizada pelo buffet do evento (`ItensBuffet`) e pelo
 * formulário de venda: produto, quantidade, subtotal e remover.
 */
export function ItemRow({
  produto,
  quantidade,
  subtotal,
  precoUnitario,
  onRemove,
  onPress,
  removeLabel = 'Remover',
  detalhe,
}: ItemRowProps) {
  const meta =
    precoUnitario !== undefined
      ? `${quantidade} × ${formatCurrency(precoUnitario)}`
      : `${quantidade} ${quantidade === 1 ? 'unidade' : 'unidades'}`;

  const content = (
    <>
      <View style={styles.info}>
        <Text style={styles.produto} numberOfLines={2}>
          {produto}
        </Text>
        <Text style={styles.meta}>{meta}</Text>
        {detalhe ? (
          <Text style={styles.detalhe} numberOfLines={2}>
            {detalhe}
          </Text>
        ) : null}
      </View>

      <View style={styles.right}>
        <Text style={styles.subtotal}>{formatCurrency(subtotal)}</Text>
        {onRemove ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Remover ${produto}`}
            hitSlop={8}
            onPress={onRemove}
            style={({ pressed }) => [styles.remove, pressed ? styles.removePressed : null]}
          >
            <Text style={styles.removeText}>{removeLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${produto}, ${quantidade}, ${formatCurrency(subtotal)}`}
        onPress={onPress}
        style={({ pressed }) => [styles.row, pressed ? styles.pressed : null]}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`${produto}, ${quantidade}, ${formatCurrency(subtotal)}`}
    >
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    backgroundColor: colors.massaAzul[0],
  },
  info: {
    flex: 1,
    gap: 2,
  },
  produto: {
    fontFamily: fontFamily.bodyBold,
    fontSize: fontSize.md,
    color: colors.text,
  },
  meta: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  detalhe: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  right: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  subtotal: {
    fontFamily: fontFamily.bodyBold,
    fontSize: fontSize.md,
    color: colors.primaryDark,
  },
  remove: {
    paddingVertical: 2,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.sm,
  },
  removePressed: {
    backgroundColor: colors.dangerLight,
  },
  removeText: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.xs,
    color: colors.danger,
  },
});
