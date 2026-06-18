/**
 * Tema do app — "Aço & Sinal"
 * ---------------------------------------------------------------------
 * Paleta pensada para o universo de ordens de serviço em campo: fundo
 * neutro e frio (boa leitura ao ar livre / sob luz forte, já que o
 * técnico costuma preencher isso no local da visita), com UM único
 * acento de cor (âmbar) carregando a identidade visual e os estados de
 * "pendente de sincronização" — exatamente o conceito central do app.
 * Verde/vermelho/cinza ficam reservados a indicadores de status
 * pequenos (não competem com o acento principal).
 */

export const colors = {
  ink: '#14181D',
  inkMuted: '#5B6470',
  background: '#ECEEF0',
  surface: '#FFFFFF',
  border: '#D6DBE0',
  borderStrong: '#AEB6BF',

  accent: '#C97A2B',
  accentMuted: '#F3E2CC',

  success: '#2F9E63',
  successMuted: '#DFF1E7',
  danger: '#C94343',
  dangerMuted: '#F6DEDE',
  offline: '#7A8794',
  offlineMuted: '#E4E7EA',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

export const type = {
  title: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.3, color: colors.ink },
  subtitle: { fontSize: 17, fontWeight: '600' as const, color: colors.ink },
  body: { fontSize: 16, fontWeight: '400' as const, color: colors.ink },
  bodyStrong: { fontSize: 16, fontWeight: '600' as const, color: colors.ink },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 0.6,
    textTransform: 'uppercase' as const,
    color: colors.inkMuted,
  },
  caption: { fontSize: 13, fontWeight: '500' as const, color: colors.inkMuted },
};
