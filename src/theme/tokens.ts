/**
 * Tokens visuais do Massa Mia — porte do `theme.js` da versão Next.js.
 *
 * O Mantine não existe no React Native, então as escalas de cor do
 * `createTheme` viram constantes aqui. O Mantine usa o tom 6 como cor
 * principal no tema claro, por isso `colors.primary` é `massaAzul[6]`.
 */

/** Escalas completas (tom 0 = mais claro, tom 9 = mais escuro). */
export const massaAzul = [
  '#eef2fa',
  '#dbe4f4',
  '#b6c7e8',
  '#8ea9dc',
  '#6b90d1',
  '#547dc8',
  '#4a69b3',
  '#3b5590',
  '#2d4170',
  '#1f2e50',
] as const;

export const massaVermelho = [
  '#fdece3',
  '#fbd0bd',
  '#f6a375',
  '#f27538',
  '#ee4d08',
  '#d94206',
  '#ba3801',
  '#8f2b01',
  '#651f01',
  '#3d1300',
] as const;

export const massaAmarelo = [
  '#fffdf0',
  '#fffad6',
  '#fff5ad',
  '#fff084',
  '#ffec89',
  '#ffe35c',
  '#f5d43f',
  '#d9b82c',
  '#b3961d',
  '#8c7412',
] as const;

export const colors = {
  massaAzul,
  massaVermelho,
  massaAmarelo,

  /** Ação principal (botões, links, foco). */
  primary: massaAzul[6],
  primaryDark: massaAzul[7],
  primaryLight: massaAzul[0],

  /** Ação destrutiva (remover, cancelar). */
  danger: massaVermelho[6],
  dangerDark: massaVermelho[7],
  dangerLight: massaVermelho[0],

  /** Destaques e avisos. */
  accent: massaAmarelo[6],
  accentDark: massaAmarelo[9],
  accentLight: massaAmarelo[0],

  success: '#2f7d4f',
  successLight: '#e6f4ea',

  background: massaAmarelo[0],
  surface: '#ffffff',
  border: massaAzul[1],
  borderStrong: massaAzul[2],

  text: massaAzul[9],
  textMuted: '#5c6b85',
  textOnPrimary: '#ffffff',
  placeholder: '#8b98ad',

  overlay: 'rgba(31, 46, 80, 0.45)',
  disabled: '#e8ecf4',
} as const;

/** Cores das etiquetas de status usadas em vendas e eventos. */
export const statusColors = {
  Servido: { background: colors.successLight, text: colors.success },
  Cancelado: { background: colors.dangerLight, text: colors.danger },
  Agendado: { background: massaAmarelo[2], text: massaAmarelo[9] },
  Realizado: { background: colors.primaryLight, text: colors.primaryDark },
} as const;

export type StatusType = keyof typeof statusColors;

/** Espaçamentos (base 4). */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

/** Raios de borda. */
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

/** Tamanhos de fonte. */
export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 30,
} as const;

/**
 * Famílias carregadas pelo `useMassaFonts`.
 * Fredoka = títulos (display), Nunito = textos (corpo).
 */
export const fontFamily = {
  display: 'Fredoka_600SemiBold',
  displayRegular: 'Fredoka_400Regular',
  displayBold: 'Fredoka_700Bold',
  body: 'Nunito_400Regular',
  bodyMedium: 'Nunito_600SemiBold',
  bodyBold: 'Nunito_700Bold',
} as const;

/** Sombra padrão dos cartões, com `elevation` para o Android. */
export const cardShadow = {
  shadowColor: massaAzul[9],
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 12,
  elevation: 3,
} as const;
