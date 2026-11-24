import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';

export type SelectOption = {
  value: string;
  label: string;
  description?: string;
};

export type SelectFieldProps = {
  label?: string;
  /** Valor selecionado (null = nada escolhido). */
  value: string | null;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  /** Texto quando não há opções (ex.: nenhum produto cadastrado). */
  emptyMessage?: string;
  /** Título da lista; usa o `label` por padrão. */
  title?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

/**
 * Select do kit: abre uma lista em modal (funciona no Android, iOS e web,
 * sem depender de um picker nativo). Usado em forma de pagamento,
 * status, produto do buffet etc.
 */
export function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder = 'Selecione',
  error,
  hint,
  required = false,
  disabled = false,
  emptyMessage = 'Nenhuma opção disponível',
  title,
  containerStyle,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  function choose(option: SelectOption) {
    onChange(option.value);
    setOpen(false);
  }

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text style={styles.label}>
          {label}
          {required ? <Text style={styles.required}> *</Text> : null}
        </Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label ?? title ?? placeholder}
        accessibilityValue={{ text: selected?.label ?? placeholder }}
        accessibilityState={{ disabled, expanded: open }}
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.field,
          pressed && !disabled ? styles.fieldPressed : null,
          open ? styles.fieldFocused : null,
          error ? styles.fieldError : null,
          disabled ? styles.fieldDisabled : null,
        ]}
      >
        <Text
          numberOfLines={1}
          style={[styles.value, selected ? null : styles.placeholder]}
        >
          {selected?.label ?? placeholder}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.overlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            accessibilityLabel="Fechar lista de opções"
            onPress={() => setOpen(false)}
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle} numberOfLines={1}>
                {title ?? label ?? 'Selecione'}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Fechar"
                hitSlop={8}
                onPress={() => setOpen(false)}
              >
                <Text style={styles.close}>Fechar</Text>
              </Pressable>
            </View>

            {options.length === 0 ? (
              <Text style={styles.empty}>{emptyMessage}</Text>
            ) : (
              <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
                {options.map((option) => {
                  const isSelected = option.value === value;
                  return (
                    <Pressable
                      key={option.value}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      onPress={() => choose(option)}
                      style={({ pressed }) => [
                        styles.option,
                        isSelected ? styles.optionSelected : null,
                        pressed ? styles.optionPressed : null,
                      ]}
                    >
                      <View style={styles.optionText}>
                        <Text
                          style={[styles.optionLabel, isSelected ? styles.optionLabelSelected : null]}
                        >
                          {option.label}
                        </Text>
                        {option.description ? (
                          <Text style={styles.optionDescription}>{option.description}</Text>
                        ) : null}
                      </View>
                      {isSelected ? <Text style={styles.check}>✓</Text> : null}
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    fontFamily: fontFamily.bodyBold,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  required: {
    color: colors.danger,
  },
  field: {
    minHeight: 48,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  fieldPressed: {
    backgroundColor: colors.primaryLight,
  },
  fieldFocused: {
    borderColor: colors.primary,
  },
  fieldError: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerLight,
  },
  fieldDisabled: {
    backgroundColor: colors.disabled,
  },
  value: {
    flex: 1,
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
    color: colors.text,
  },
  placeholder: {
    color: colors.placeholder,
  },
  chevron: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  hint: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  error: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.xs,
    color: colors.danger,
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    maxHeight: '70%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  sheetTitle: {
    flex: 1,
    fontFamily: fontFamily.display,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  close: {
    fontFamily: fontFamily.bodyBold,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  list: {
    flexGrow: 0,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  optionSelected: {
    backgroundColor: colors.primaryLight,
  },
  optionPressed: {
    backgroundColor: colors.massaAzul[1],
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
    color: colors.text,
  },
  optionLabelSelected: {
    fontFamily: fontFamily.bodyBold,
    color: colors.primaryDark,
  },
  optionDescription: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  check: {
    fontFamily: fontFamily.bodyBold,
    fontSize: fontSize.md,
    color: colors.primary,
  },
  empty: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    paddingVertical: spacing.xl,
    textAlign: 'center',
  },
});
