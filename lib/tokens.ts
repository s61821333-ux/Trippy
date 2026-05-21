// Raw design token values — map every color used inline in components.
// Each key maps to a CSS custom property defined in globals.css.
// Never import these directly in components; use the CSS variable instead.
export const tokens = {
  // Insight chip colors (light mode)
  insightGapBg:       'var(--insight-gap-bg)',
  insightGapBorder:   'var(--insight-gap-border)',
  insightGapText:     'var(--insight-gap-text)',
  insightBalanceBg:   'var(--insight-balance-bg)',
  insightBalanceBorder: 'var(--insight-balance-border)',
  insightBalanceText: 'var(--insight-balance-text)',
  insightReadyBg:     'var(--insight-ready-bg)',
  insightReadyBorder: 'var(--insight-ready-border)',
  insightReadyText:   'var(--insight-ready-text)',
  insightTipBg:       'var(--insight-tip-bg)',
  insightTipBorder:   'var(--insight-tip-border)',
  insightTipText:     'var(--insight-tip-text)',
  insightEcoBg:       'var(--insight-eco-bg)',
  insightEcoBorder:   'var(--insight-eco-border)',
  insightEcoText:     'var(--insight-eco-text)',
  insightPacingBg:    'var(--insight-pacing-bg)',
  insightPacingBorder:'var(--insight-pacing-border)',
  insightPacingText:  'var(--insight-pacing-text)',
  insightRelaxBg:     'var(--insight-relax-bg)',
  insightRelaxBorder: 'var(--insight-relax-border)',
  insightRelaxText:   'var(--insight-relax-text)',
} as const;
