/* ════════════════════════════════════════════════════════════════════════
   Trippy Liquid Glass — Map · Packing · Crew · Settings · AI sheet
   ════════════════════════════════════════════════════════════════════════ */

/* ── Map ─────────────────────────────────────────────────────────────── */
function MapScreen() {
  const [tab, setTab] = useState('trip'); const t = window.t;
  const pins = [{ s: 'plane', x: 60, y: 130 }, { s: 'hotel', x: 250, y: 200 }, { s: 'museum', x: 140, y: 300 }, { s: 'wine', x: 270, y: 380 }, { s: 'coffee', x: 90, y: 440 }];
  return <div style={{ height: '100%', position: 'relative', overflow: 'hidden',
    background: 'linear-gradient(165deg, #E3EBE4 0%, #DCE6DD 35%, #EBE2D2 70%, #E8DCC8 100%)' }}>
    <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.55 }}>
      <path d="M-20 160 Q120 120 250 200 T520 180" stroke="#fff" strokeWidth="14" fill="none" opacity="0.6" />
      <path d="M70 -20 Q120 220 90 460 T160 880" stroke="#fff" strokeWidth="16" fill="none" opacity="0.6" />
      <path d="M-20 420 Q200 380 420 460" stroke="#fff" strokeWidth="10" fill="none" opacity="0.6" />
    </svg>
    <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <path d="M80 150 L268 218 L160 318 L286 398 L110 458" stroke="var(--lg-terra)" strokeWidth="2.5" fill="none" strokeDasharray="2 9" strokeLinecap="round" opacity="0.7" />
    </svg>
    {pins.map((p, i) => <div key={i} className="a-pop" style={{ position: 'absolute', left: p.x, top: p.y, animationDelay: `${i * 0.08}s` }}><Stamp name={p.s} size={46} /></div>)}

    <div style={{ position: 'absolute', top: 56, left: 16, right: 16, display: 'flex', gap: 10 }}>
      <div className="lg lg-strong" style={{ display: 'flex', padding: 4, borderRadius: 9999, flex: 'none' }}>
        {[['trip','Trip'], ['explore','Explore']].map(([id, lb]) => <button key={id} onClick={() => setTab(id)} style={{ border: 0, cursor: 'pointer', borderRadius: 9999, padding: '8px 15px', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600,
          background: tab === id ? 'var(--lg-forest)' : 'transparent', color: tab === id ? '#fff' : 'var(--text-3)', transition: 'all .3s' }}>{t(lb)}</button>)}
      </div>
      <div className="lg lg-strong" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', borderRadius: 9999, height: 42 }}>
        <Icon name="search" size={16} color="var(--text-3)" /><span style={{ fontSize: 13, color: 'var(--text-3)' }}>{t('Search your trip')}</span>
      </div>
    </div>

    <div style={{ position: 'absolute', left: 16, right: 16, bottom: 92 }}>
      <div className="lg lg-strong a-rise" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 13 }}>
        <Stamp name="museum" size={48} />
        <div style={{ flex: 1 }}>
          <div className="eyebrow-lg" style={{ color: 'var(--lg-sand)', fontSize: 9 }}>{t('Sight')} · 4.8 ★ · 0.5km</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--lg-ink)', marginTop: 1 }}>MoMA</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{t('Open')} · {t('8 min walk from hotel')}</div>
        </div>
        <Btn kind="terra" style={{ height: 42, padding: '0 18px', fontSize: 13 }}>{t('Route')}</Btn>
      </div>
    </div>
  </div>;
}

/* ── Packing ─────────────────────────────────────────────────────────── */
function PackScreen() {
  const t = window.t;
  const [items, setItems] = useState([
    { stamp: 'passport', t: 'Passports + ESTA', cat: 'Documents', done: true },
    { stamp: 'camera', t: 'Camera & batteries', cat: 'Gear', done: true },
    { stamp: 'wallet', t: 'USD cash float', cat: 'Documents', done: true },
    { stamp: 'sun', t: 'Sunscreen SPF 50', cat: 'Health', done: false },
    { stamp: 'backpack', t: 'Day pack', cat: 'Gear', done: false },
    { stamp: 'wine', t: 'Snacks for the flight', cat: 'Food', done: false },
  ]);
  const done = items.filter(i => i.done).length, pct = Math.round(done / items.length * 100);
  const cats = ['All', 'Documents', 'Gear', 'Health', 'Food'];
  const [cat, setCat] = useState('All');
  return <div className="lg-scroll" style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)', padding: '6px 20px 120px' }}>
    <p className="eyebrow-lg" style={{ color: 'var(--lg-terra)', marginBottom: 2 }}>{t('Adventure prep')}</p>
    <h1 className="display-xl" style={{ fontSize: 38, color: 'var(--lg-ink)', margin: '0 0 16px' }}>{t('Packing')}</h1>

    <div className="lg a-rise" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 18, marginBottom: 16 }}>
      <Ring pct={pct} size={76} stroke={6} color="var(--lg-terra)">{pct}%</Ring>
      <div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--lg-ink)', lineHeight: 1.1 }}>{t('Almost there')}</div>
        <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 3 }}>{done}/{items.length} {t('packed · shared with crew')}</div>
      </div>
    </div>

    <div className="lg-scroll" style={{ display: 'flex', gap: 7, overflowX: 'auto', marginBottom: 16 }}>
      {cats.map(c => <button key={c} onClick={() => setCat(c)} style={{ flex: 'none', border: 0, cursor: 'pointer', borderRadius: 9999, padding: '8px 15px', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13,
        background: cat === c ? 'var(--lg-forest)' : 'var(--lg-panel)', backdropFilter: 'var(--lg-blur)', color: cat === c ? '#fff' : 'var(--text-2)', boxShadow: cat === c ? 'var(--lg-glow-forest)' : 'inset 0 0 0 1px oklch(50% 0.02 60 / 12%)', transition: 'all .3s', whiteSpace: 'nowrap' }}>{t(c)}</button>)}
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.filter(i => cat === 'All' || i.cat === cat).map((it) => { const idx = items.indexOf(it);
        return <button key={idx} onClick={() => setItems(items.map((x, j) => j === idx ? { ...x, done: !x.done } : x))} className="lg" style={{ display: 'flex', alignItems: 'center', gap: 13, padding: 13, border: 0, cursor: 'pointer', textAlign: 'start', opacity: it.done ? 0.6 : 1, transition: 'opacity .2s' }}>
          <Stamp name={it.stamp} size={38} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--lg-ink)', textDecoration: it.done ? 'line-through' : 'none', textDecorationColor: 'var(--text-3)' }}>{t(it.t)}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)' }}>{t(it.cat)}</div>
          </div>
          <span style={{ width: 28, height: 28, borderRadius: '50%', flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: it.done ? 'var(--lg-forest)' : 'transparent', boxShadow: it.done ? 'var(--lg-glow-forest)' : 'inset 0 0 0 2px oklch(50% 0.02 60 / 22%)' }}>{it.done && <Icon name="check" size={16} color="#fff" />}</span>
        </button>; })}
    </div>
  </div>;
}

/* ── Crew ────────────────────────────────────────────────────────────── */
function CrewScreen() {
  const t = window.t;
  const crew = [['Guy Ahron', 'Organizer'], ['Mia Rivera', 'Member'], ['Tom Okafor', 'Member']];
  return <div className="lg-scroll" style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)', paddingBottom: 110 }}>
    <div className="hero-mesh" style={{ padding: '54px 22px 40px', borderRadius: '0 0 32px 32px', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
      <div className="a-float" style={{ width: 84, height: 84, borderRadius: '50%', background: '#F4EFE8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 18px 44px oklch(20% 0.03 60 / 36%)', marginBottom: 14 }}><CompassMark size={58} /></div>
      <h1 className="display-xl" style={{ fontSize: 34, color: '#fff', margin: 0 }}>{t('Gather the tribe')}</h1>
      <p style={{ fontSize: 13.5, color: 'oklch(98% 0.005 80 / 78%)', margin: '8px 0 0' }}>{t('Add friends to sync itineraries and share memories in real time.')}</p>
    </div>

    <div style={{ padding: '0 20px', marginTop: -22 }}>
      <div className="lg lg-strong a-rise" style={{ padding: 18 }}>
        <LGField label={t('Invite by email')} placeholder="friend@example.com" value="" onChange={()=>{}} icon="user" />
        <Btn kind="forest" full style={{ marginTop: 12, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{t('Send invites')}</Btn>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0 8px' }}><div style={{ flex: 1, height: 1, background: 'oklch(50% 0.02 60 / 14%)' }} /><span className="eyebrow-lg" style={{ color: 'var(--text-3)' }}>{t('or magic link')}</span><div style={{ flex: 1, height: 1, background: 'oklch(50% 0.02 60 / 14%)' }} /></div>
        <button className="lg-btn lg-btn-glass" style={{ width: '100%', height: 48, justifyContent: 'space-between', padding: '0 18px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)' }}>trippy.app/j/usa-2026</span><Icon name="share" size={16} color="var(--lg-terra)" /></button>
      </div>

      <p className="eyebrow-lg" style={{ color: 'var(--text-3)', margin: '22px 0 12px' }}>{t('Current crew')} · {crew.length}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {crew.map(([n, r], i) => <div key={i} className="lg a-rise" style={{ display: 'flex', alignItems: 'center', gap: 13, padding: 13, animationDelay: `${i*0.06}s` }}>
          <Avatar name={n} i={i} size={44} ring="" />
          <div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 600, color: 'var(--lg-ink)' }}>{n}{i===0 && <span style={{ color: 'var(--text-3)', fontWeight: 400 }}> · {t('you')}</span>}</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-3)' }}>{t(r)}</div></div>
          {i === 0 ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--lg-terra)', background: 'oklch(60% 0.155 38 / 12%)', padding: '4px 10px', borderRadius: 9999 }}>{t('Organizer')}</span> : <Icon name="check" size={18} color="var(--lg-forest)" />}
        </div>)}
      </div>
    </div>
  </div>;
}

/* ── Settings ────────────────────────────────────────────────────────── */
function Toggle({ on, onClick }) {
  return <button onClick={onClick} style={{ width: 50, height: 30, borderRadius: 9999, border: 0, cursor: 'pointer', padding: 3, flex: 'none',
    background: on ? 'var(--lg-forest)' : 'oklch(50% 0.02 60 / 24%)', boxShadow: on ? 'var(--lg-glow-forest)' : 'none', transition: 'background .3s' }}>
    <span style={{ display: 'block', width: 24, height: 24, borderRadius: '50%', background: '#fff', boxShadow: 'var(--lg-shadow)', transform: on ? 'translateX(20px)' : 'none', transition: 'transform .3s var(--spring)' }} /></button>;
}
function Row({ icon, title, sub, right, onClick }) {
  return <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 0', cursor: onClick ? 'pointer' : 'default' }}>
    {icon && <span className="lg-btn lg-btn-glass" style={{ width: 38, height: 38, padding: 0, flex: 'none' }}><Icon name={icon} size={17} color="var(--lg-forest)" /></span>}
    <div style={{ flex: 1 }}><div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--lg-ink)' }}>{title}</div>{sub && <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{sub}</div>}</div>
    {right}
  </div>;
}
function SettingsScreen({ theme, onTheme, lang, onLang }) {
  const t = window.t;
  const [t1, setT1] = useState(true); const [t2, setT2] = useState(false);
  const chev = <Icon name="chevR" size={16} color="var(--text-3)" style={{ transform: lang === 'he' ? 'scaleX(-1)' : 'none' }} />;
  return <div className="lg-scroll" style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)', padding: '6px 20px 120px' }}>
    <p className="eyebrow-lg" style={{ color: 'var(--lg-terra)', marginBottom: 2 }}>{t('Trip & preferences')}</p>
    <h1 className="display-xl" style={{ fontSize: 38, color: 'var(--lg-ink)', margin: '0 0 18px' }}>{t('Settings')}</h1>

    <p className="eyebrow-lg" style={{ color: 'var(--text-3)', marginBottom: 10 }}>{t('Appearance')}</p>
    <div className="lg a-rise" style={{ padding: 16, marginBottom: 16 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        {[['light','sun','Light'],['dark','lock','Dark'],['system','grid','System']].map(([id, ic, lb]) => <button key={id} onClick={() => onTheme(id)} style={{ flex: 1, border: 0, cursor: 'pointer', borderRadius: 14, padding: '14px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        background: theme === id ? 'var(--lg-forest)' : 'var(--lg-panel-strong)', color: theme === id ? '#fff' : 'var(--text-2)', boxShadow: theme === id ? 'var(--lg-glow-forest)' : 'inset 0 0 0 1px oklch(50% 0.02 60 / 12%)', transition: 'all .25s' }}>
        <Icon name={ic} size={20} color={theme === id ? '#fff' : 'var(--text-3)'} /><span style={{ fontSize: 12, fontWeight: 600 }}>{t(lb)}</span></button>)}
      </div>
    </div>

    <div className="lg a-rise d1" style={{ padding: '4px 16px', marginBottom: 16 }}>
      <Row icon="sparkle" title={t('High contrast')} sub={t('WCAG AA boosted')} right={<Toggle on={t1} onClick={() => setT1(!t1)} />} />
      <div style={{ height: 1, background: 'oklch(50% 0.02 60 / 10%)' }} />
      <Row icon="wind" title={t('Reduce motion')} sub={t('Calm transitions')} right={<Toggle on={t2} onClick={() => setT2(!t2)} />} />
    </div>

    <p className="eyebrow-lg" style={{ color: 'var(--text-3)', marginBottom: 10 }}>{t('Trip')}</p>
    <div className="lg a-rise d2" style={{ padding: '4px 16px', marginBottom: 16 }}>
      <Row icon="download" title={t('Currency')} sub={t('USD — US Dollar')} right={chev} />
      <div style={{ height: 1, background: 'oklch(50% 0.02 60 / 10%)' }} />
      <Row icon="share" title={t('Language')} onClick={() => onLang(lang === 'he' ? 'en' : 'he')}
        right={<div className="lg" style={{ display: 'flex', padding: 3, borderRadius: 9999, gap: 2, boxShadow: 'inset 0 0 0 1px oklch(50% 0.02 60 / 12%)' }}>
          {[['en','EN'],['he','עב']].map(([id, lb]) => <span key={id} style={{ borderRadius: 9999, padding: '5px 11px', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 12,
            background: lang === id ? 'var(--lg-forest)' : 'transparent', color: lang === id ? '#fff' : 'var(--text-3)' }}>{lb}</span>)}</div>} />
      <div style={{ height: 1, background: 'oklch(50% 0.02 60 / 10%)' }} />
      <Row icon="calExport" title={t('Export as PDF')} sub={t('Printable itinerary')} right={chev} />
    </div>

    <button className="lg-btn" style={{ width: '100%', height: 50, background: 'var(--danger-bg)', color: 'var(--danger)', boxShadow: 'inset 0 0 0 1px oklch(48% 0.130 25 / 18%)' }}>{t('Delete trip')}</button>
    <p style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', marginTop: 16, letterSpacing: '0.06em' }}>Trippy · v1.0.0 · Liquid Glass</p>
  </div>;
}

/* ── AI suggestions sheet ────────────────────────────────────────────── */
const SUGGS = [
  { stamp: 'museum', title: 'The High Line walk', meta: 'Sight · 4.8 ★ · 0.5km', desc: 'Elevated park on a former rail line — great for a slow afternoon stroll.', time: '120 min · free' },
  { stamp: 'wine', title: 'Brunch in West Village', meta: 'Food · 4.5 ★ · 1.2km', desc: 'Cosy spot with a long weekend brunch — book ahead.', time: '75 min · $45' },
  { stamp: 'camera', title: 'Top of the Rock', meta: 'Sight · 4.6 ★ · 2.1km', desc: 'Best skyline view at golden hour; quieter than the Empire State.', time: '90 min · $40' },
];
function AISheet({ onClose }) {
  const t = window.t;
  return <Sheet title={t('AI suggestions')} sub={t('Tailored to your day & pace')} onClose={onClose} accent>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {SUGGS.map((s, i) => <div key={i} className="lg a-rise" style={{ padding: 15, animationDelay: `${i*0.07}s` }}>
        <div style={{ display: 'flex', gap: 13, marginBottom: 10 }}>
          <Stamp name={s.stamp} size={46} />
          <div style={{ flex: 1 }}>
            <div className="eyebrow-lg" style={{ color: 'var(--lg-sand)', fontSize: 9 }}>{s.meta}</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--lg-ink)', marginTop: 1 }}>{s.title}</div>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>{s.time}</span>
        </div>
        <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--text-2)', margin: '0 0 12px' }}>{s.desc}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn kind="forest" full onClick={onClose} style={{ height: 44, fontSize: 13 }}><Icon name="plus" size={15} color="#fff" /> {t('Add to day')}</Btn>
          <button onClick={onClose} className="lg-btn lg-btn-glass" style={{ height: 44, padding: '0 20px' }}>{t('Dismiss')}</button>
        </div>
      </div>)}
    </div>
  </Sheet>;
}

Object.assign(window, { MapScreen, PackScreen, CrewScreen, SettingsScreen, AISheet });
