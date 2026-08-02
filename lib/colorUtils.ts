// Utility functions for WCAG-compliant dynamic color contrast and theme styling

export function parseHexColor(hex: string): { r: number; g: number; b: number } | null {
  if (!hex || typeof hex !== 'string') return null;
  let clean = hex.trim().replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  if (clean.length !== 6) return null;

  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);

  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  return { r, g, b };
}

export function getLuminance(hex: string): number {
  const rgb = parseHexColor(hex);
  if (!rgb) return 0.5;

  const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map(v => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return r * 0.2126 + g * 0.7152 + b * 0.0722;
}

/**
  * Calculates the contrast ratio between two hex colors (1 to 21)
  */
export function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const max = Math.max(lum1, lum2);
  const min = Math.min(lum1, lum2);
  return (max + 0.05) / (min + 0.05);
}

/**
  * Returns pure black (#000000) or pure white (#ffffff) to guarantee maximum contrast
  */
export function getContrastTextColor(bgColorHex: string): '#000000' | '#ffffff' {
  const lum = getLuminance(bgColorHex);
  // WCAG standard mid-point threshold ~0.35-0.45
  return lum > 0.4 ? '#000000' : '#ffffff';
}

/**
  * Ensures a text color is dark enough to be readable on a white/light background
  */
export function getReadableOnLightText(hexColor: string): string {
  const lum = getLuminance(hexColor);
  if (lum > 0.3) {
    // Too light to be read on a white background, return deep navy/black or darkened version
    return '#0a192f';
  }
  return hexColor;
}

/**
  * Applies dynamic theme CSS variables on documentElement with high contrast guarantees
  */
export function applyDeputyTheme(partyColors?: {
  cor_primaria?: string;
  cor_secundaria?: string;
  cor_terciaria?: string;
}) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  const primary = partyColors?.cor_primaria?.trim() || '#005baa';
  const secondary = partyColors?.cor_secundaria?.trim() || '#002776';
  const tertiary = partyColors?.cor_terciaria?.trim() || '#009C3B';

  const onPrimary = getContrastTextColor(primary);
  const onSecondary = getContrastTextColor(secondary);
  const onTertiary = getContrastTextColor(tertiary);

  const readablePrimaryText = getReadableOnLightText(primary);
  const readableSecondaryText = getReadableOnLightText(secondary);

  root.style.setProperty('--color-primary', primary);
  root.style.setProperty('--color-on-primary', onPrimary);

  root.style.setProperty('--color-secondary', secondary);
  root.style.setProperty('--color-on-secondary', onSecondary);

  root.style.setProperty('--color-tertiary', tertiary);
  root.style.setProperty('--color-on-tertiary', onTertiary);

  root.style.setProperty('--color-primary-text', readablePrimaryText);
  root.style.setProperty('--color-secondary-text', readableSecondaryText);

  // Derived UI variables for topbar, sidebar, active tabs, popups
  root.style.setProperty('--topbar-accent', primary);
  root.style.setProperty('--topbar-accent-text', onPrimary);

  root.style.setProperty('--sidebar-accent', primary);
  root.style.setProperty('--sidebar-accent-text', onPrimary);

  root.style.setProperty('--badge-primary-bg', primary);
  root.style.setProperty('--badge-primary-text', onPrimary);
}
