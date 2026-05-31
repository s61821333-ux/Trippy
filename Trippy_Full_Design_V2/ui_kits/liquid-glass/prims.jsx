/* ════════════════════════════════════════════════════════════════════════
   Trippy Liquid Glass — primitives
   ════════════════════════════════════════════════════════════════════════ */
const { useState, useEffect, useRef } = React;

const AVC = ['#C4714A', '#C8944A', '#3B6E52', '#2B7A8E', '#A03CB4', '#1E91AF'];
function Avatar({ name, i = 0, size = 32, ring = '#fff' }) {
  const t = (name || '?').split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase();
  return <span style={{ width: size, height: size, borderRadius: '50%', flex: 'none', background: AVC[i % AVC.length],
    color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)',
    fontWeight: 700, fontSize: size * 0.36, boxShadow: ring ? `0 0 0 2px ${ring}, var(--lg-shadow)` : 'var(--lg-shadow)', boxSizing: 'border-box' }}>{t}</span>;
}

function Icon({ name, size = 20, color = 'currentColor', style }) {
  const svg = (window.TRIPPY_ICON_PATHS && window.TRIPPY_ICON_PATHS[name]) || '';
  return <span style={{ display: 'inline-flex', alignItems: 'center', color, ...style }}
    dangerouslySetInnerHTML={{ __html: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${svg}</svg>` }} />;
}

const _SI = (() => { const m = {}; try { window.TRIPPY_ATLAS.ATLAS.forEach(c => c.icons.forEach(i => m[i.key] = i)); } catch (e) {} return m; })();
function Stamp({ name, size = 40, style }) {
  const ic = _SI[name]; if (!ic) return <span style={{ width: size, height: size, display: 'inline-block', ...style }} />;
  return <span style={{ width: size, height: size, display: 'inline-block', filter: 'drop-shadow(0 3px 7px oklch(20% 0.03 60 / 22%))', ...style }}
    dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 80 80" style="width:100%;height:100%;display:block"><circle cx="40" cy="40" r="38" fill="${ic.bg}"/><circle cx="40" cy="40" r="34" fill="none" stroke="#F4EFE8" stroke-width="1" opacity="0.4"/>${ic.sym.trim()}</svg>` }} />;
}

function CompassMark({ size = 44, style }) {
  return <svg width={size} height={size} viewBox="0 0 240 240" fill="none" style={style}>
    <circle cx="120" cy="120" r="90" stroke="var(--compass-ring)" strokeWidth="4" fill="none" />
    <path d="M120 36 L138 120 L120 124 L102 120 Z" fill="var(--compass-n)" />
    <path d="M120 204 L102 120 L120 116 L138 120 Z" fill="var(--compass-s)" />
    <path d="M204 120 L120 102 L116 120 L120 138 Z" fill="var(--compass-ew)" opacity="0.85" />
    <path d="M36 120 L120 138 L124 120 L120 102 Z" fill="var(--compass-ew)" opacity="0.85" />
    <circle cx="120" cy="120" r="6" fill="var(--compass-hub)" /></svg>;
}

function Btn({ children, kind = 'terra', onClick, style, full }) {
  return <button onClick={onClick} className={`lg-btn lg-btn-${kind}`}
    style={{ height: 52, padding: '0 24px', fontSize: 15, width: full ? '100%' : undefined, ...style }}>{children}</button>;
}

/* Circular progress ring */
function Ring({ pct = 0, size = 56, stroke = 5, color = 'var(--lg-terra)', children }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return <span style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="oklch(20% 0.03 60 / 12%)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} style={{ transition: 'stroke-dashoffset .8s var(--snap)' }} />
    </svg>
    <span style={{ position: 'absolute', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: size * 0.26, color: 'var(--lg-ink)' }}>{children}</span>
  </span>;
}

/* ── Dynamic-island status bar ───────────────────────────────────────── */
function StatusBar({ dark }) {
  const c = dark ? '#fff' : 'var(--lg-ink)';
  return <div style={{ height: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px 0 34px', flex: 'none', position: 'relative', zIndex: 30 }}>
    <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 15, color: c, letterSpacing: '0.02em' }}>9:41</span>
    <div style={{ position: 'absolute', left: '50%', top: 11, transform: 'translateX(-50%)', width: 116, height: 32, background: '#000', borderRadius: 20 }} />
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: c }}>
      <svg width="18" height="12" viewBox="0 0 18 12" fill={c}><rect x="0" y="7" width="3" height="5" rx="1"/><rect x="5" y="4.5" width="3" height="7.5" rx="1"/><rect x="10" y="2" width="3" height="10" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>
      <svg width="24" height="12" viewBox="0 0 24 12" fill="none"><rect x="1" y="1" width="20" height="10" rx="3" stroke={c} opacity="0.5"/><rect x="2.5" y="2.5" width="15" height="7" rx="1.6" fill={c}/><rect x="22" y="4" width="1.6" height="4" rx="0.8" fill={c} opacity="0.5"/></svg>
    </div>
  </div>;
}

/* ── Morphing liquid hover nav (expands to reveal Settings + Switch trip) ── */
const NAV_TABS = [
  { id: 'dashboard', icon: 'grid',      label: 'Trip' },
  { id: 'day',       icon: 'compass',   label: 'Days' },
  { id: 'map',       icon: 'map',       label: 'Map' },
  { id: 'supplies',  icon: 'checklist', label: 'Pack' },
  { id: 'crew',      icon: 'users',     label: 'Crew' },
];
function HoverNav({ active, onChange, onAdd, onSettings, onSwitch }) {
  const [open, setOpen] = useState(false);
  const idx = Math.max(0, NAV_TABS.findIndex(t => t.id === active));
  return <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingBottom: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 40 }}>
    {/* expanded focus panel — only visible when the nav is focused */}
    {open && <div className="lg lg-strong a-pop" style={{ display: 'flex', gap: 8, padding: 8, borderRadius: 9999, marginBottom: 10 }}>
      <button onClick={() => { setOpen(false); onSwitch && onSwitch(); }} className="lg-btn" style={{ height: 42, padding: '0 16px', gap: 7, background: 'transparent', color: 'var(--lg-ink)' }}>
        <Icon name="swap" size={17} color="var(--lg-terra)" /><span style={{ fontSize: 13, fontWeight: 600 }}>{window.t('Switch trip')}</span></button>
      <div style={{ width: 1, background: 'oklch(50% 0.02 60 / 22%)', margin: '6px 0' }} />
      <button onClick={() => { setOpen(false); onSettings && onSettings(); }} className="lg-btn" style={{ height: 42, padding: '0 16px', gap: 7, background: 'transparent', color: 'var(--lg-ink)' }}>
        <Icon name="settings" size={17} color="var(--lg-forest)" /><span style={{ fontSize: 13, fontWeight: 600 }}>{window.t('Settings')}</span></button>
    </div>}

    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
      <div className="lg lg-strong" style={{ position: 'relative', display: 'flex', alignItems: 'center', padding: 7, borderRadius: 9999, height: 64 }}>
        <div style={{ position: 'absolute', top: 7, [window.LANG === 'he' ? 'right' : 'left']: 7 + 44, width: 58, height: 50, borderRadius: 9999,
          background: 'linear-gradient(180deg, var(--lg-terra-bright), var(--lg-terra))', boxShadow: 'var(--lg-glow-terra)',
          transform: `translateX(${(window.LANG === 'he' ? -1 : 1) * idx * 58}px)`, transition: 'transform .45s var(--spring)', zIndex: 0 }} />
        {/* focus handle */}
        <button onClick={() => setOpen(o => !o)} style={{ width: 44, height: 50, border: 0, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }} aria-label="Menu">
          <span style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .35s var(--spring)', display: 'flex' }}><Icon name="menu" size={18} color="var(--text-3)" /></span>
        </button>
        {NAV_TABS.map((tb, i) => {
          const on = i === idx;
          return <button key={tb.id} onClick={() => { onChange(tb.id); setOpen(false); }} style={{ position: 'relative', zIndex: 1, width: 58, height: 50, border: 0,
            background: 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
            color: on ? '#fff' : 'var(--text-3)', transition: 'color .3s' }}>
            <span style={{ transform: on ? 'translateY(-1px) scale(1.08)' : 'none', transition: 'transform .4s var(--spring)' }}><Icon name={tb.icon} size={20} color={on ? '#fff' : 'var(--text-3)'} /></span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8.5, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{window.t(tb.label)}</span>
          </button>;
        })}
      </div>
      <button onClick={onAdd} className="lg-btn lg-btn-forest a-float" style={{ width: 64, height: 64, borderRadius: 9999, flex: 'none' }} aria-label="Add">
        <Icon name="plus" size={26} color="#fff" />
      </button>
    </div>
  </div>;
}

/* ── Bottom sheet ────────────────────────────────────────────────────── */
function Sheet({ title, sub, onClose, children, accent }) {
  return <div style={{ position: 'absolute', inset: 0, zIndex: 70, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
    <div onClick={onClose} className="a-fade" style={{ position: 'absolute', inset: 0, background: 'oklch(16% 0.018 60 / 42%)', backdropFilter: 'blur(3px)' }} />
    <div className="lg lg-strong" style={{ position: 'relative', borderRadius: '36px 36px 0 0', maxHeight: '90%', display: 'flex', flexDirection: 'column',
      animation: 'sheetUp .5s var(--spring) both' }}>
      <div style={{ padding: '12px 24px 6px', flex: 'none' }}>
        <div style={{ width: 40, height: 5, borderRadius: 3, background: 'oklch(20% 0.03 60 / 18%)', margin: '0 auto 14px' }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div><h2 style={{ fontSize: 24, margin: 0, color: 'var(--lg-ink)' }}>{title}</h2>
            {sub && <p style={{ fontSize: 13, color: 'var(--text-2)', margin: '3px 0 0' }}>{sub}</p>}</div>
          <button onClick={onClose} className="lg-btn lg-btn-glass" style={{ width: 36, height: 36, padding: 0, flex: 'none' }}><Icon name="x" size={18} color="var(--lg-ink)" /></button>
        </div>
      </div>
      <div className="lg-scroll" style={{ overflowY: 'auto', padding: '8px 24px 28px' }}>{children}</div>
    </div>
  </div>;
}

Object.assign(window, { Avatar, Icon, Stamp, CompassMark, Btn, Ring, StatusBar, HoverNav, Sheet, NAV_TABS });
