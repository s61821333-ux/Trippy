/* ════════════════════════════════════════════════════════════════════════
   Trippy Liquid Glass — Splash · Welcome · Home
   ════════════════════════════════════════════════════════════════════════ */

const TRIPS = [
  { id: 'usa',  name: 'USA 2026',     stamp: 'museum',  dest: 'United States', days: 16, countdown: 86, crew: ['Guy Ahron', 'Mia Rivera', 'Tom Okafor'], dateRange: 'Aug 23 → Sep 7', events: 9 },
  { id: 'wadi', name: 'Wadi Rum',     stamp: 'cactus',  dest: 'Jordan',        days: 6,  countdown: 210, crew: ['Sam Vega', 'Guy Ahron'], dateRange: 'Mar 3 → 9', events: 4 },
  { id: 'alg',  name: 'Algarve reset',stamp: 'beach',   dest: 'Portugal',      days: 7,  countdown: 340, crew: ['Dani Cohen', 'Guy Ahron'], dateRange: 'Jun 21 → 27', events: 6 },
];

/* ── Splash ──────────────────────────────────────────────────────────── */
function Splash() {
  return <div style={{ height: '100%', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'radial-gradient(110% 80% at 25% 15%, oklch(62% 0.13 78) 0%, transparent 55%), radial-gradient(120% 90% at 90% 80%, oklch(55% 0.16 36) 0%, transparent 55%), radial-gradient(120% 100% at 40% 100%, oklch(40% 0.10 158) 0%, transparent 60%), linear-gradient(160deg, oklch(48% 0.10 160), oklch(32% 0.08 60))' }}>
    <div style={{ position: 'absolute', width: 520, height: 520, borderRadius: '50%', border: '1px solid oklch(100% 0 0 / 14%)' }} className="a-float" />
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
      <div className="a-pop" style={{ width: 124, height: 124, borderRadius: '50%', background: 'oklch(100% 0 0 / 16%)', backdropFilter: 'blur(20px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 1px 0 oklch(100% 0 0 / 40%), 0 20px 50px oklch(20% 0.03 60 / 30%)' }}>
        <div style={{ background: '#F4EFE8', width: 90, height: 90, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CompassMark size={64} /></div>
      </div>
      <span className="wm a-rise d2" style={{ fontSize: 30, color: '#fff' }}>Trippy<span style={{ color: 'var(--lg-sand)' }}>.</span></span>
    </div>
  </div>;
}

/* ── Welcome ─────────────────────────────────────────────────────────── */
function Welcome({ onContinue }) {
  return <div style={{ height: '100%', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    background: 'radial-gradient(100% 70% at 50% 0%, oklch(60% 0.13 60) 0%, transparent 60%), linear-gradient(170deg, oklch(54% 0.13 45), oklch(34% 0.09 40))' }}>
    {/* floating compass */}
    <div className="a-float" style={{ position: 'absolute', top: 110, left: '50%', transform: 'translateX(-50%)', width: 96, height: 96, borderRadius: '50%',
      background: '#F4EFE8', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 24px 60px oklch(20% 0.03 60 / 36%)' }}><CompassMark size={66} /></div>

    <div className="lg lg-strong a-rise" style={{ margin: 20, borderRadius: 'var(--lg-r-lg)', padding: '30px 26px 26px', textAlign: 'center' }}>
      <span className="display-xl" style={{ fontSize: 52, color: 'var(--lg-forest)', display: 'block' }}>Trippy<span style={{ color: 'var(--lg-terra)', fontStyle: 'normal' }}>.</span></span>
      <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 19, color: 'var(--lg-terra)', margin: '6px 0 0' }}>Plan together. Discover more.</p>
      <p style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--text-2)', margin: '16px 0 24px', maxWidth: 280, marginInline: 'auto' }}>
        The new standard in collaborative travel. From desert dunes to city lights, your journey begins here.</p>
      <Btn kind="forest" full onClick={onContinue} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
        Start an adventure <Icon name="arrow" size={18} color="#fff" /></Btn>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, marginTop: 20, fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-3)' }}>
        <span>Document</span><span style={{ width: 3, height: 3, borderRadius: 9, background: 'var(--lg-terra)' }} /><span>Discover</span>
        <span style={{ width: 3, height: 3, borderRadius: 9, background: 'var(--lg-terra)' }} /><span>Collaborate</span>
      </div>
    </div>
  </div>;
}

/* ── Home — "Where to next?" ─────────────────────────────────────────── */
function Home({ onOpen, onCreate }) {
  return <div className="lg-scroll" style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)' }}>
    {/* dark hero header */}
    <div className="hero-mesh" style={{ padding: '52px 22px 30px', borderRadius: '0 0 32px 32px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26 }}>
        <span className="wm" style={{ fontSize: 19, color: '#fff' }}>Trippy<span style={{ color: 'var(--lg-sand)' }}>.</span></span>
        <Avatar name="Guy Ahron" i={0} size={34} ring="oklch(100% 0 0 / 30%)" />
      </div>
      <p className="eyebrow-lg a-rise" style={{ color: 'var(--lg-sand)', marginBottom: 6 }}>Hey, Guy Ahron</p>
      <h1 className="display-xl a-rise d1" style={{ fontSize: 40, color: '#fff', margin: 0 }}>Where to<br/>next?</h1>
      <p className="a-rise d2" style={{ color: 'oklch(98% 0.005 80 / 75%)', fontSize: 14, marginTop: 10 }}>Your adventures are waiting.</p>
    </div>

    <div style={{ padding: '20px 20px 30px', marginTop: -16, position: 'relative' }}>
      <button onClick={onCreate} className="lg-btn lg-btn-forest a-rise" style={{ width: '100%', height: 60, justifyContent: 'space-between', padding: '0 24px', marginBottom: 12 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 11, fontSize: 16 }}><Icon name="plus" size={20} color="#fff" />Create a new trip</span>
        <Icon name="arrow" size={18} color="#fff" /></button>
      <button onClick={onCreate} className="lg-btn lg-btn-glass a-rise d1" style={{ width: '100%', height: 52, gap: 8, marginBottom: 26 }}>
        <Icon name="sparkle" size={18} color="var(--lg-terra)" /> Plan one with AI</button>

      <p className="eyebrow-lg" style={{ color: 'var(--text-3)', marginBottom: 12 }}>Your trips</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
        {TRIPS.map((t, i) => (
          <button key={t.id} onClick={() => onOpen(t)} className="lg a-rise" style={{ display: 'flex', alignItems: 'center', gap: 15, padding: 15, textAlign: 'left', border: 0, cursor: 'pointer', animationDelay: `${0.1 + i * 0.07}s` }}>
            <Stamp name={t.stamp} size={52} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="eyebrow-lg" style={{ color: 'var(--lg-terra)', fontSize: 9 }}>{t.dateRange} · {t.days} days</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 23, color: 'var(--lg-ink)', lineHeight: 1.05, marginTop: 2 }}>{t.name}</div>
              <div style={{ display: 'flex', marginTop: 8 }}>{t.crew.map((c, j) => <span key={j} style={{ marginLeft: j ? -8 : 0 }}><Avatar name={c} i={j} size={22} /></span>)}</div>
            </div>
            <span className="lg-btn lg-btn-forest" style={{ width: 40, height: 40, padding: 0, flex: 'none' }}><Icon name="arrow" size={17} color="#fff" /></span>
          </button>
        ))}
      </div>
    </div>
  </div>;
}

Object.assign(window, { Splash, Welcome, Home, TRIPS });
