/* ════════════════════════════════════════════════════════════════
   Trippy UI Kit — Primitives
   CompassMark · Icon · Stamp · GlassBtn · Chip · Field · Avatar · Card
   Cosmetic recreations of the Trippy codebase ui/ components.
   ════════════════════════════════════════════════════════════════ */
const { useState } = React;

/* ── Compass mark (brand logo) ─────────────────────────────────── */
function CompassMark({ size = 44, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 240 240" fill="none" aria-hidden style={style}>
      <circle cx="120" cy="120" r="90" stroke="var(--compass-ring)" strokeWidth="4" fill="none" />
      <path d="M120 36 L138 120 L120 124 L102 120 Z" fill="var(--compass-n)" />
      <path d="M120 204 L102 120 L120 116 L138 120 Z" fill="var(--compass-s)" />
      <path d="M204 120 L120 102 L116 120 L120 138 Z" fill="var(--compass-ew)" opacity="0.85" />
      <path d="M36 120 L120 138 L124 120 L120 102 Z" fill="var(--compass-ew)" opacity="0.85" />
      <circle cx="120" cy="120" r="6" fill="var(--compass-hub)" />
    </svg>
  );
}

/* ── Wordmark ──────────────────────────────────────────────────── */
function Wordmark({ size = 22, color = 'var(--text)', dot = 'var(--terra)' }) {
  return (
    <span className="wm" style={{ fontSize: size, color }}>Trippy<span style={{ color: dot }}>.</span></span>
  );
}

/* ── Line icon (uses assets/trippy-icons.js global) ────────────── */
function Icon({ name, size = 20, color = 'currentColor', style }) {
  const svg = (window.TRIPPY_ICON_PATHS && window.TRIPPY_ICON_PATHS[name]) || '';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', color, ...style }}
      dangerouslySetInnerHTML={{ __html:
        `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${svg}</svg>` }} />
  );
}

/* ── Stamp seal (uses assets/trippy-stamps.js global) ──────────── */
const _STAMP_INDEX = (() => {
  const m = {};
  try { window.TRIPPY_ATLAS.ATLAS.forEach(c => c.icons.forEach(i => { m[i.key] = i; })); } catch (e) {}
  return m;
})();
function Stamp({ name, size = 40, style }) {
  const ic = _STAMP_INDEX[name];
  if (!ic) return <span style={{ width: size, height: size, display: 'inline-block', ...style }} />;
  const html = `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;height:100%">
    <circle cx="40" cy="40" r="38" fill="${ic.bg}"/>
    <circle cx="40" cy="40" r="34" fill="none" stroke="#F4EFE8" stroke-width="1" opacity="0.4"/>${ic.sym.trim()}</svg>`;
  return <span style={{ width: size, height: size, display: 'inline-block', filter: 'drop-shadow(0 2px 5px oklch(13% 0.012 55 / 14%))', ...style }}
    dangerouslySetInnerHTML={{ __html: html }} />;
}

/* ── Button (pill) ─────────────────────────────────────────────── */
function GlassBtn({ children, variant = 'default', size = 'md', onClick, style = {}, full }) {
  const [press, setPress] = useState(false);
  const sizes = { sm: { h: 38, px: 16, fs: 13 }, md: { h: 44, px: 20, fs: 14 }, lg: { h: 52, px: 26, fs: 15 } };
  const sz = sizes[size];
  const variants = {
    accent:  { background: 'var(--brand)', color: '#fff', boxShadow: '0 6px 20px oklch(42% 0.092 155 / 28%), inset 0 1px 0 rgba(255,255,255,0.15)' },
    coral:   { background: 'var(--terra)', color: '#fff', boxShadow: '0 6px 20px oklch(62% 0.115 40 / 28%), inset 0 1px 0 rgba(255,255,255,0.15)' },
    danger:  { background: 'var(--danger-bg)', color: 'var(--danger)', boxShadow: 'inset 0 0 0 1px oklch(48% 0.130 25 / 18%)' },
    ghost:   { background: 'transparent', color: 'var(--text-2)' },
    flat:    { background: 'var(--glass-base)', color: 'var(--text)', backdropFilter: 'var(--blur-sm)', boxShadow: 'inset 0 0 0 1px oklch(13% 0.012 55 / 8%), inset 0 1px 0 rgba(255,255,255,0.4)' },
    default: { background: 'rgba(255,255,255,0.72)', color: 'var(--text)', backdropFilter: 'var(--blur-sm)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 2px 8px oklch(13% 0.012 55 / 7%)' },
  };
  return (
    <button onClick={onClick}
      onPointerDown={() => setPress(true)} onPointerUp={() => setPress(false)} onPointerLeave={() => setPress(false)}
      style={{ height: sz.h, padding: `0 ${sz.px}px`, fontSize: sz.fs, border: 0, borderRadius: 9999,
        fontFamily: 'var(--font-sans)', fontWeight: 600, letterSpacing: '-0.01em', cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        width: full ? '100%' : undefined,
        transform: press ? 'scale(0.96)' : 'scale(1)', transition: 'transform 0.15s var(--ease-spring), box-shadow 0.18s',
        WebkitTapHighlightColor: 'transparent', ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

/* ── Chip ──────────────────────────────────────────────────────── */
function Chip({ children, v = 'neutral', style }) {
  const V = {
    neutral: { bg: 'var(--bg)', c: 'var(--text-2)', b: 'var(--border)' },
    open:    { bg: 'var(--success-bg)', c: 'var(--success)', b: 'oklch(50% 0.090 155 / 25%)' },
    gap:     { bg: 'var(--warning-bg)', c: 'var(--warning)', b: 'oklch(55% 0.110 68 / 25%)' },
    accent:  { bg: 'var(--brand-light)', c: 'var(--brand)', b: 'oklch(42% 0.092 155 / 22%)' },
    warn:    { bg: 'var(--terra-light)', c: 'var(--terra)', b: 'oklch(62% 0.115 40 / 22%)' },
  }[v];
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px',
    borderRadius: 'var(--radius-sm)', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-sans)',
    background: V.bg, color: V.c, border: `1px solid ${V.b}`, ...style }}>{children}</span>;
}

/* ── Field ─────────────────────────────────────────────────────── */
function Field({ label, placeholder, value, onChange, icon, type = 'text' }) {
  const [foc, setFoc] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.03em',
        color: foc ? 'var(--brand)' : 'var(--text-2)', transition: 'color 0.2s' }}>{label}</label>}
      <div style={{ position: 'relative' }}>
        {icon && <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
          color: foc ? 'var(--brand)' : 'var(--text-3)', display: 'flex', pointerEvents: 'none' }}>{icon}</span>}
        <input type={type} placeholder={placeholder} value={value} onChange={e => onChange && onChange(e.target.value)}
          onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
          style={{ width: '100%', boxSizing: 'border-box', height: 46, border: 0, borderRadius: 14,
            background: foc ? 'var(--glass-float)' : 'oklch(97% 0.008 80 / 58%)', backdropFilter: 'var(--blur-sm)',
            padding: icon ? '0 18px 0 46px' : '0 18px', fontFamily: 'var(--font-sans)', fontSize: 16,
            color: 'var(--text)', outline: 'none',
            boxShadow: foc ? 'inset 0 0 0 1.5px var(--brand), 0 0 0 3px var(--brand-muted)'
                           : 'inset 0 0 0 1px oklch(13% 0.012 55 / 8%), inset 0 1px 0 oklch(100% 0 0 / 50%)' }} />
      </div>
    </div>
  );
}

/* ── Avatar ────────────────────────────────────────────────────── */
const AV_COLORS = ['var(--terra)', 'var(--sand)', 'var(--brand)', 'var(--terra-300)', '#2B7A8E', '#6E4163'];
function Avatar({ name, i = 0, size = 30, ring = true }) {
  const initials = (name || '?').split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase();
  return <span style={{ width: size, height: size, borderRadius: '50%', flex: 'none',
    background: AV_COLORS[i % AV_COLORS.length], color: '#fff', display: 'inline-flex',
    alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)', fontWeight: 700,
    fontSize: size * 0.36, border: ring ? '2px solid var(--paper-hi)' : 'none', boxSizing: 'border-box' }}>{initials}</span>;
}

Object.assign(window, { CompassMark, Wordmark, Icon, Stamp, GlassBtn, Chip, Field, Avatar });
