import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, fontFamily, fontSize, spacing } from '@/theme';
import { formatDateBR, maskDateInput, parseDateBR, toISODate } from '@/utils/format';

import { TextField } from './TextField';

export type DateFieldProps = {
  label?: string;
  /** Data no formato do backend (AAAA-MM-DD). */
  value?: string;
  /** Recebe AAAA-MM-DD quando a data é válida, ou '' enquanto incompleta. */
  onChange?: (isoDate: string) => void;
  error?: string;
  hint?: string;
  /** Aviso abaixo do campo (ex.: "Feriado de Tiradentes"). */
  notice?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

/**
 * Porte do `CampoData` do site: máscara DD/MM/AAAA + validação de data real
 * e espaço para o aviso de feriado vindo da BrasilAPI.
 * Funciona no Android, iOS e web sem picker nativo.
 */
export function DateField({
  label = 'Data',
  value,
  onChange,
  error,
  hint,
  notice,
  required = false,
  disabled = false,
  placeholder = 'DD/MM/AAAA',
  containerStyle,
}: DateFieldProps) {
  const [text, setText] = useState(() => (value ? formatDateBR(value) : ''));
  const [touched, setTouched] = useState(false);
  const lastEmitted = useRef<string | null>(null);

  // Só sobrescreve o que a pessoa digitou quando o valor vem de fora.
  useEffect(() => {
    const next = value ?? '';
    if (next === lastEmitted.current) return;
    lastEmitted.current = next;
    setText(next ? formatDateBR(next) : '');
  }, [value]);

  const complete = text.length === 10;
  const invalid = touched && complete && !parseDateBR(text);
  const message = error ?? (invalid ? 'Data inválida. Use DD/MM/AAAA.' : undefined);

  function handleChange(raw: string) {
    const masked = maskDateInput(raw);
    setText(masked);

    const date = parseDateBR(masked);
    const iso = date ? toISODate(date) : '';
    lastEmitted.current = iso;
    onChange?.(iso);
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <TextField
        label={label}
        value={text}
        onChangeText={handleChange}
        onBlur={() => setTouched(true)}
        placeholder={placeholder}
        keyboardType="number-pad"
        inputMode="numeric"
        maxLength={10}
        error={message}
        hint={hint}
        required={required}
        editable={!disabled}
        autoComplete="off"
      />

      {notice ? <Text style={styles.notice}>{notice}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  notice: {
    marginTop: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.accentLight,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.xs,
    color: colors.accentDark,
  },
});
