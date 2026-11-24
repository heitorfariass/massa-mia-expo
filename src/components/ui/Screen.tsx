import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme';

export type ScreenProps = {
  children: ReactNode;
  /** Cabeçalho fixo (normalmente `<Header />`), fora da área rolável. */
  header?: ReactNode;
  /** `true` (padrão) = conteúdo rolável; use `false` em telas com FlatList. */
  scroll?: boolean;
  /** Padding horizontal/padrão do conteúdo. */
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Pull-to-refresh (telas de lista). */
  refreshing?: boolean;
  onRefresh?: () => void;
  edges?: Edge[];
};

/**
 * Base de todas as telas: SafeArea + teclado + scroll.
 * A barra de status fica a cargo do `edges` (padrão top/left/right,
 * deixando o rodapé livre para abas).
 */
export function Screen({
  children,
  header,
  scroll = true,
  padded = true,
  style,
  contentContainerStyle,
  refreshing = false,
  onRefresh,
  edges = ['top', 'left', 'right'],
}: ScreenProps) {
  const padding = padded ? styles.padded : null;

  return (
    <SafeAreaView style={[styles.safe, style]} edges={edges}>
      {header}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {scroll ? (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={[styles.scrollContent, padding, contentContainerStyle]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            refreshControl={
              onRefresh ? (
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={colors.primary}
                  colors={[colors.primary]}
                />
              ) : undefined
            }
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.flex, padding, contentContainerStyle]}>{children}</View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
});
