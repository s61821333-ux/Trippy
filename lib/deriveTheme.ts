export interface LoaderTheme {
  c1: string;
  c2: string;
  c3: string;
  ink: string;
  wash: string[];
}

export const BRAND_THEME: LoaderTheme = {
  c1: '#3B6E52',
  c2: '#C4714A',
  c3: '#C8944A',
  ink: '#1A1410',
  wash: ['#3B6E52', '#C4714A', '#C8944A'],
};

function hexToRgb(h: string): { r: number; g: number; b: number } {
  h = h.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
}

function rgbToHsl({ r, g, b }: { r: number; g: number; b: number }): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return { h: h * 360, s, l };
}

function hslToHex(h: number, s: number, l: number): string {
  h /= 360;
  const f = (n: number) => {
    const k = (n + h * 12) % 12;
    const a = s * Math.min(l, 1 - l);
    const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(c * 255).toString(16).padStart(2, '0');
  };
  return '#' + f(0) + f(8) + f(4);
}

interface ColorMeta {
  hex: string;
  h: number;
  s: number;
  l: number;
  vivid: number;
  isPaper: boolean;
  isInk: boolean;
}

function colorMeta(hex: string): ColorMeta {
  const hsl = rgbToHsl(hexToRgb(hex));
  const vivid = hsl.s * (1 - Math.abs(hsl.l - 0.52) * 1.1);
  const isPaper = hsl.l > 0.86 && hsl.s < 0.25;
  const isInk = hsl.l < 0.16;
  return { hex, ...hsl, vivid, isPaper, isInk };
}

function workable(m: ColorMeta): string {
  if (m.isPaper) return hslToHex(m.h || 42, Math.max(m.s, 0.12), 0.78);
  if (m.isInk)   return hslToHex(m.h || 42, Math.max(m.s, 0.10), 0.30);
  return m.hex;
}

export function deriveTheme(colors: string[]): LoaderTheme {
  if (!colors.length) return BRAND_THEME;
  const ms = colors.map(colorMeta);
  const chroma = ms.filter(m => !m.isPaper && !m.isInk).sort((a, b) => b.vivid - a.vivid);
  const pool = chroma.length ? chroma : ms.slice().sort((a, b) => b.vivid - a.vivid);
  const pick = (i: number) => workable(pool[i % pool.length]);
  const c1 = pick(0);
  const c2 = pool.length > 1 ? pick(1) : hslToHex(pool[0].h, pool[0].s * 0.8, Math.min(0.72, pool[0].l + 0.18));
  const c3 = pool.length > 2 ? pick(2)
    : pool.length > 1 ? hslToHex(pool[1].h, pool[1].s * 0.7, Math.min(0.78, pool[1].l + 0.2))
    : hslToHex(pool[0].h, pool[0].s * 0.55, Math.min(0.82, pool[0].l + 0.32));
  const inkM = ms.slice().sort((a, b) => a.l - b.l)[0];
  const ink = inkM.l < 0.4 ? inkM.hex : '#1A1410';
  const wash = ms.map(m => m.isPaper ? '#FBF7F0' : m.hex);
  return { c1, c2, c3, ink, wash };
}
