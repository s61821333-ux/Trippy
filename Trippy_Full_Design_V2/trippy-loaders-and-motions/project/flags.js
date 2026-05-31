/* ════════════════════════════════════════════════════════════════
 *  Trippy — Destination color database  (window.FLAGS)
 *  A trip's location resolves to a palette; deriveTheme() turns ANY
 *  palette into a loader theme (3 working colors + ink + wash ribbons).
 *  Colors are the real flag colors; we never draw a literal flag —
 *  the destination's identity is carried by color alone (wordless).
 * ════════════════════════════════════════════════════════════════ */
(function () {
  // name, the city we headline in the demo, and ordered flag colors
  const FLAGS = [
    { code: 'US', name: 'United States', city: 'New York',     colors: ['#B22234', '#3C3B6E', '#FFFFFF'] },
    { code: 'JP', name: 'Japan',         city: 'Tokyo',        colors: ['#BC002D', '#FFFFFF'] },
    { code: 'FR', name: 'France',        city: 'Paris',        colors: ['#0055A4', '#EF4135', '#FFFFFF'] },
    { code: 'IT', name: 'Italy',         city: 'Rome',         colors: ['#008C45', '#CD212A', '#F4F5F0'] },
    { code: 'GR', name: 'Greece',        city: 'Santorini',    colors: ['#0D5EAF', '#FFFFFF'] },
    { code: 'BR', name: 'Brazil',        city: 'Rio',          colors: ['#009C3B', '#FFDF00', '#002776'] },
    { code: 'MX', name: 'Mexico',        city: 'Mexico City',  colors: ['#006847', '#CE1126', '#FFFFFF'] },
    { code: 'ES', name: 'Spain',         city: 'Barcelona',    colors: ['#AA151B', '#F1BF00'] },
    { code: 'PT', name: 'Portugal',      city: 'Lisbon',       colors: ['#006600', '#FF0000', '#FFCC00'] },
    { code: 'GB', name: 'United Kingdom',city: 'London',       colors: ['#012169', '#C8102E', '#FFFFFF'] },
    { code: 'DE', name: 'Germany',       city: 'Berlin',       colors: ['#DD0000', '#FFCE00', '#1A1410'] },
    { code: 'NL', name: 'Netherlands',   city: 'Amsterdam',    colors: ['#AE1C28', '#21468B', '#FFFFFF'] },
    { code: 'SE', name: 'Sweden',        city: 'Stockholm',    colors: ['#006AA7', '#FECC00'] },
    { code: 'IE', name: 'Ireland',       city: 'Dublin',       colors: ['#169B62', '#FF883E', '#FFFFFF'] },
    { code: 'CH', name: 'Switzerland',   city: 'Zurich',       colors: ['#DA291C', '#FFFFFF'] },
    { code: 'IL', name: 'Israel',        city: 'Tel Aviv',     colors: ['#0038B8', '#FFFFFF'] },
    { code: 'IN', name: 'India',         city: 'Jaipur',       colors: ['#FF9933', '#138808', '#000080'] },
    { code: 'TH', name: 'Thailand',      city: 'Bangkok',      colors: ['#A51931', '#2D2A4A', '#FFFFFF'] },
    { code: 'AR', name: 'Argentina',     city: 'Buenos Aires', colors: ['#74ACDF', '#F6B40E', '#FFFFFF'] },
    { code: 'AU', name: 'Australia',     city: 'Sydney',       colors: ['#00247D', '#E4002B', '#FFFFFF'] },
    { code: 'ZA', name: 'South Africa',  city: 'Cape Town',    colors: ['#007A4D', '#FFB915', '#DE3831', '#002395'] },
    { code: 'EG', name: 'Egypt',         city: 'Cairo',        colors: ['#CE1126', '#C09300', '#1A1410'] },
    { code: 'MA', name: 'Morocco',       city: 'Marrakech',    colors: ['#C1272D', '#006233'] },
    { code: 'CA', name: 'Canada',        city: 'Vancouver',    colors: ['#FF0000', '#FFFFFF'] },
  ];

  // ── color helpers ──────────────────────────────────────────────
  function hexToRgb(h) {
    h = h.replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
  }
  function rgbToHsl({ r, g, b }) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0; const l = (max + min) / 2;
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
  function hslToHex(h, s, l) {
    h /= 360;
    const f = (n) => {
      const k = (n + h * 12) % 12;
      const a = s * Math.min(l, 1 - l);
      const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
      return Math.round(c * 255).toString(16).padStart(2, '0');
    };
    return '#' + f(0) + f(8) + f(4);
  }
  function meta(hex) {
    const hsl = rgbToHsl(hexToRgb(hex));
    // how "usable as a working color" — vivid mid-tones score highest
    const vivid = hsl.s * (1 - Math.abs(hsl.l - 0.52) * 1.1);
    const isPaper = hsl.l > 0.86 && hsl.s < 0.25;   // white-ish
    const isInk = hsl.l < 0.16;                      // black-ish
    return { hex, ...hsl, vivid, isPaper, isInk };
  }
  // nudge a near-white color into a visible tint so it can theme on paper
  function workable(m) {
    if (m.isPaper) return hslToHex(m.h || 42, Math.max(m.s, 0.12), 0.78);
    if (m.isInk)   return hslToHex(m.h || 42, Math.max(m.s, 0.10), 0.30);
    return m.hex;
  }

  // ── derive a loader theme from any ordered palette ─────────────
  function deriveTheme(colors) {
    const ms = colors.map(meta);
    const chroma = ms.filter(m => !m.isPaper && !m.isInk).sort((a, b) => b.vivid - a.vivid);
    const pool = chroma.length ? chroma : ms.slice().sort((a, b) => b.vivid - a.vivid);
    const pick = (i) => workable(pool[i % pool.length]);
    const c1 = pick(0);
    const c2 = pool.length > 1 ? pick(1) : hslToHex(pool[0].h, pool[0].s * 0.8, Math.min(0.72, pool[0].l + 0.18));
    const c3 = pool.length > 2 ? pick(2)
             : pool.length > 1 ? hslToHex(pool[1].h, pool[1].s * 0.7, Math.min(0.78, pool[1].l + 0.2))
             : hslToHex(pool[0].h, pool[0].s * 0.55, Math.min(0.82, pool[0].l + 0.32));
    const inkM = ms.slice().sort((a, b) => a.l - b.l)[0];
    const ink = inkM.l < 0.4 ? inkM.hex : '#1A1410';
    // wash = the full flag palette, paper softened, for the welcome ribbons
    const wash = ms.map(m => m.isPaper ? '#FBF7F0' : m.hex);
    return { c1, c2, c3, ink, wash, raw: colors };
  }

  window.FLAGS = FLAGS;
  window.deriveTheme = deriveTheme;
  // brand-default theme (forest / terracotta / gold) for the "no destination" state
  window.BRAND_THEME = { c1: '#3B6E52', c2: '#C4714A', c3: '#C8944A', ink: '#1A1410',
    wash: ['#3B6E52', '#C4714A', '#C8944A'], raw: ['#3B6E52', '#C4714A', '#C8944A'] };
})();
