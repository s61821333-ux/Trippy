/* ════════════════════════════════════════════════════════════════
   Trippy UI Kit — Welcome + Home (auth flow)
   ════════════════════════════════════════════════════════════════ */

const TRIP_THEMES = [
  { id: 'desert', stamp: 'cactus',    label: 'Desert', accent: '#C4714A' },
  { id: 'nature', stamp: 'pine_tree', label: 'Nature', accent: '#3B6E52' },
  { id: 'city',   stamp: 'museum',    label: 'City',   accent: '#3A2E26' },
  { id: 'beach',  stamp: 'beach',     label: 'Beach',  accent: '#2B7A8E' },
];

/* ── Welcome / sign-in ─────────────────────────────────────────── */
function WelcomeScreen({ onContinue }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '0 28px', textAlign: 'center', position: 'relative',
      background: 'radial-gradient(circle at 50% 18%, var(--brand-light) 0%, transparent 55%), var(--bg)' }}>
      <div className="an-pop" style={{ marginBottom: 26 }}><CompassMark size={92} /></div>
      <div className="an-blur-up stagger-1">
        <Wordmark size={40} />
      </div>
      <p className="an-blur-up stagger-2 hero-title" style={{ fontSize: 27, color: 'var(--brand-700)', margin: '14px 0 0', lineHeight: 1 }}>
        Together, the easy way.
      </p>
      <p className="an-blur-up stagger-3" style={{ fontSize: 14.5, lineHeight: 1.55, color: 'var(--text-2)', maxWidth: 290, margin: '20px 0 0' }}>
        Experience the new standard in collaborative travel. From desert dunes to city lights, your journey begins here.
      </p>
      <div className="an-blur-up stagger-4" style={{ marginTop: 32, width: '100%', maxWidth: 320 }}>
        <GlassBtn variant="accent" size="lg" full onClick={onContinue}
          style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
          Start an Adventure <Icon name="arrow" size={17} color="#fff" />
        </GlassBtn>
      </div>
      <div style={{ position: 'absolute', bottom: 30, display: 'flex', alignItems: 'center', gap: 10,
        fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-3)' }}>
        <span>Collaborate</span><span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--text-3)' }} />
        <span>Discover</span><span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--text-3)' }} />
        <span>Go together</span>
      </div>
    </div>
  );
}

/* ── Home: trips list + create ─────────────────────────────────── */
function HomeScreen({ trips, onOpenTrip, onCreate }) {
  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '14px 20px 30px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <CompassMark size={28} /><Wordmark size={20} />
        </div>
        <Avatar name="You" i={2} size={34} ring={false} />
      </div>

      <p className="eyebrow" style={{ color: 'var(--terra)', marginBottom: 8 }}>Your trips</p>
      <h1 style={{ fontSize: 30, margin: '0 0 20px', lineHeight: 1.05 }}>Three trips,<br /><span style={{ color: 'var(--terra)' }}>one good year.</span></h1>

      <GlassBtn variant="accent" full onClick={onCreate} style={{ justifyContent: 'space-between', height: 56, padding: '0 22px', marginBottom: 22 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Icon name="plus" size={17} color="#fff" />Create a new trip</span>
        <Icon name="arrow" size={16} color="#fff" />
      </GlassBtn>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {trips.map((t, i) => {
          const th = TRIP_THEMES.find(x => x.id === t.theme) || TRIP_THEMES[0];
          return (
            <button key={t.id} onClick={() => onOpenTrip(t)} className="card-solid an-blur-up" style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: 14, textAlign: 'left',
              cursor: 'pointer', animationDelay: `${0.05 * i}s`, border: '1px solid var(--border)' }}>
              <Stamp name={th.stamp} size={46} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: t.status === 'Confirmed' ? 'var(--success)' : 'var(--text-3)' }}>{t.status} · {t.dates}</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 21, color: 'var(--text)', lineHeight: 1.1, marginTop: 2 }}>{t.name}</div>
                <div style={{ display: 'flex', marginTop: 8 }}>
                  {t.crew.map((c, j) => <span key={j} style={{ marginLeft: j ? -8 : 0 }}><Avatar name={c} i={j} size={24} /></span>)}
                </div>
              </div>
              <Icon name="chevR" size={18} color="var(--text-3)" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Create-trip sheet ─────────────────────────────────────────── */
function CreateSheet({ onClose, onDone }) {
  const [name, setName] = useState('');
  const [nick, setNick] = useState('');
  const [theme, setTheme] = useState('desert');
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 60, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'oklch(13% 0.012 55 / 32%)', backdropFilter: 'blur(2px)' }} className="an-fade" />
      <div className="glass-float" style={{ position: 'relative', borderRadius: '32px 32px 0 0', padding: '10px 22px 26px',
        maxHeight: '88%', overflowY: 'auto', animation: 'sheetUp 0.4s var(--ease-spring) both' }}>
        <div style={{ width: 38, height: 4, borderRadius: 2, background: 'var(--border-strong)', margin: '0 auto 16px' }} />
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4, position: 'relative', zIndex: 2 }}>
          <h3 style={{ fontSize: 24, margin: 0 }}>Create a new trip</h3>
          <button onClick={onClose} style={{ border: 0, background: 'none', cursor: 'pointer' }}><Icon name="x" size={20} color="var(--text-3)" /></button>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-2)', margin: '0 0 20px', position: 'relative', zIndex: 2 }}>Pick a vibe, name it, and share the link.</p>

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="mono-label" style={{ color: 'var(--text-2)', display: 'block', marginBottom: 10, fontSize: 11 }}>Background</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {TRIP_THEMES.map(th => (
                <button key={th.id} onClick={() => setTheme(th.id)} style={{ display: 'flex', alignItems: 'center', gap: 10,
                  padding: '11px 14px', borderRadius: 18, cursor: 'pointer', background: 'var(--paper-hi)',
                  border: theme === th.id ? `1.5px solid ${th.accent}` : '1.5px solid var(--border)',
                  boxShadow: theme === th.id ? `0 4px 18px ${th.accent}30` : 'none', transition: 'all 0.18s var(--ease-spring)' }}>
                  <Stamp name={th.stamp} size={30} />
                  <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{th.label}</span>
                </button>
              ))}
            </div>
          </div>
          <Field label="Trip name" placeholder="Lisbon, slowly" value={name} onChange={setName} icon={<Icon name="tent" size={15} />} />
          <Field label="Your nickname" placeholder="What should the crew call you?" value={nick} onChange={setNick} icon={<Icon name="user" size={15} />} />
          <GlassBtn variant="accent" full size="lg" onClick={() => onDone({ name, theme })}
            style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)', fontSize: 12, marginTop: 4 }}>
            Create trip
          </GlassBtn>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { WelcomeScreen, HomeScreen, CreateSheet, TRIP_THEMES });
