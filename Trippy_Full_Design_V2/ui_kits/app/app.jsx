/* ════════════════════════════════════════════════════════════════
   Trippy UI Kit — App shell + Tweaks + rich interactions
   ════════════════════════════════════════════════════════════════ */
const { useEffect, useRef } = React;

const SAMPLE_TRIPS = [
  { id: 't1', name: 'Lisbon, slowly.', theme: 'city',   stamp: 'museum', status: 'Confirmed', dates: 'Oct 12 → 18', crew: ['Mia Rivera', 'Tom Okafor', 'Lena Park', 'You'] },
  { id: 't2', name: 'Wadi Rum nights', theme: 'desert', stamp: 'cactus', status: 'Planning',  dates: 'Mar 3 → 9',   crew: ['Sam Vega', 'You'] },
  { id: 't3', name: 'Algarve reset',   theme: 'beach',  stamp: 'beach',  status: 'Planning',  dates: 'Jun 21 → 27', crew: ['Mia Rivera', 'Dani Cohen', 'You'] },
];
const TABS = [
  { id: 'dashboard', icon: 'grid',      label: 'Camp' },
  { id: 'day',       icon: 'compass',   label: 'Explore' },
  { id: 'map',       icon: 'map',       label: 'Map' },
  { id: 'supplies',  icon: 'checklist', label: 'Pack' },
  { id: 'crew',      icon: 'users',     label: 'Crew' },
];

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "transition": "slide",
  "speed": 1,
  "accent": "#C4714A",
  "glass": 40,
  "tripEntry": true,
  "loader": true,
  "hoverLift": true,
  "reduceMotion": false
}/*EDITMODE-END*/;

/* ── Compass loader (wait state) ───────────────────────────────── */
function CompassLoader({ size = 96 }) {
  return (
    <div style={{ width: size, height: size, position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle,rgba(196,113,74,.22) 0%,rgba(196,113,74,.08) 30%,transparent 60%)', animation: 'haloPulse 2.4s ease-in-out infinite' }} />
      <svg viewBox="0 0 200 200" style={{ position: 'absolute', inset: 0, animation: 'spin360 2.4s linear infinite' }}><circle cx="100" cy="100" r="84" fill="none" stroke="#C8944A" strokeWidth="2" strokeDasharray="58 38 22 410" strokeLinecap="round" opacity=".9" /></svg>
      <svg viewBox="0 0 200 200" style={{ position: 'absolute', inset: 0, animation: 'spin360 1.5s linear infinite reverse' }}><circle cx="100" cy="100" r="70" fill="none" stroke="#3B6E52" strokeWidth="2.5" strokeDasharray="40 70 16 314" strokeLinecap="round" opacity=".92" /></svg>
      <svg viewBox="0 0 240 240" style={{ position: 'absolute', inset: '18%', animation: 'spin360 6s linear infinite' }}>
        <circle cx="120" cy="120" r="56" stroke="#1A1410" strokeWidth="5" fill="none" />
        <path d="M120 70 L131 120 L120 124 L109 120 Z" fill="#C4714A" /><path d="M120 170 L109 120 L120 116 L131 120 Z" fill="#3B6E52" />
        <path d="M170 120 L120 109 L116 120 L120 131 Z" fill="#C8944A" /><path d="M70 120 L120 131 L124 120 L120 109 Z" fill="#C8944A" />
        <circle cx="120" cy="120" r="5" fill="#1A1410" />
      </svg>
    </div>
  );
}

/* ── Trip-entry / loading intro overlay ────────────────────────── */
function IntroOverlay({ trip, tripEntry, loader, onDone }) {
  const [phase, setPhase] = useState(tripEntry ? 'entry' : (loader ? 'load' : 'done'));
  useEffect(() => {
    let id;
    if (phase === 'entry') id = setTimeout(() => setPhase(loader ? 'load' : 'done'), 950);
    else if (phase === 'load') id = setTimeout(() => setPhase('done'), 850);
    else onDone();
    return () => clearTimeout(id);
  }, [phase]);
  if (phase === 'done') return null;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22,
      background: 'radial-gradient(120% 90% at 30% 10%, #3B6E52 0%, transparent 55%), radial-gradient(120% 100% at 80% 90%, #C4714A 0%, transparent 55%), linear-gradient(160deg,#22312a,#15110d)' }}>
      {phase === 'entry' ? (
        <>
          <div style={{ animation: 'entryPop .85s cubic-bezier(.34,1.56,.64,1) both' }}><Stamp name={trip.stamp} size={104} /></div>
          <div style={{ textAlign: 'center', animation: 'entryPop .85s cubic-bezier(.34,1.56,.64,1) .12s both' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--sand-300)', marginBottom: 6 }}>{trip.status} · {trip.dates}</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 34, color: '#fff', lineHeight: 1 }}>{trip.name}</div>
          </div>
        </>
      ) : (
        <>
          <CompassLoader size={96} />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,.8)' }}>Charting your trip…</div>
        </>
      )}
    </div>
  );
}

/* ── Map screen ────────────────────────────────────────────────── */
function MapScreen() {
  return (
    <div style={{ height: '100%', position: 'relative', overflow: 'hidden', background: 'linear-gradient(160deg, #E8EFE9 0%, #DCE8E0 40%, #E6E0D4 100%)' }}>
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.5 }}>
        <path d="M-20 120 Q120 90 240 160 T520 140" stroke="#B7C4B8" strokeWidth="8" fill="none" />
        <path d="M40 -20 Q90 200 60 420 T140 860" stroke="#C9BfA8" strokeWidth="10" fill="none" />
      </svg>
      {[{ s: 'coffee', x: 70, y: 150 }, { s: 'museum', x: 220, y: 250 }, { s: 'wine', x: 120, y: 380 }, { s: 'camera', x: 250, y: 480 }].map((p, i) => (
        <div key={i} className="an-pop press" style={{ position: 'absolute', left: p.x, top: p.y, animationDelay: `${0.08 * i}s`, cursor: 'pointer' }}><Stamp name={p.s} size={42} /></div>
      ))}
      <div style={{ position: 'absolute', left: 20, right: 20, bottom: 96 }}>
        <div className="glass-float hoverlift" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 13 }}>
          <Stamp name="museum" size={42} style={{ position: 'relative', zIndex: 2 }} />
          <div style={{ flex: 1, position: 'relative', zIndex: 2 }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Gulbenkian Museum</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-3)' }}>11:00 · 8 min walk from lunch</div>
          </div>
          <GlassBtn variant="accent" size="sm" style={{ position: 'relative', zIndex: 2 }}>Route</GlassBtn>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 16, left: 20 }}>
        <span className="bb-pill" style={{ color: 'var(--brand)', background: 'var(--glass-strong)', backdropFilter: 'var(--blur-sm)', border: '1px solid var(--border)' }}>Lisbon · Day 1</span>
      </div>
    </div>
  );
}

function StatusBar({ dark }) {
  const c = dark ? '#fff' : 'var(--text)';
  return (
    <div style={{ height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 26px', flex: 'none', position: 'relative', zIndex: 5 }}>
      <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14, color: c }}>9:41</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: c }}>
        <svg width="17" height="11" viewBox="0 0 17 11" fill={c}><rect x="0" y="6" width="3" height="5" rx="1"/><rect x="4.5" y="4" width="3" height="7" rx="1"/><rect x="9" y="2" width="3" height="9" rx="1"/><rect x="13.5" y="0" width="3" height="11" rx="1"/></svg>
        <svg width="22" height="11" viewBox="0 0 22 11" fill="none"><rect x="0.5" y="0.5" width="18" height="10" rx="2.5" stroke={c} opacity="0.5"/><rect x="2" y="2" width="14" height="7" rx="1.3" fill={c}/><rect x="19.5" y="3.5" width="1.5" height="4" rx="0.7" fill={c} opacity="0.5"/></svg>
      </div>
    </div>
  );
}

/* ── Bottom nav with sliding liquid pill ───────────────────────── */
function BottomNav({ active, onChange }) {
  const idx = Math.max(0, TABS.findIndex(t => t.id === active));
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '0 14px 12px', zIndex: 40, display: 'flex', justifyContent: 'center' }}>
      <div className="glass-float" style={{ position: 'relative', display: 'flex', gap: 2, padding: 7, borderRadius: 9999 }}>
        <div style={{ position: 'absolute', top: 7, left: 7, width: 58, height: 46, borderRadius: 9999, background: 'var(--terra)', boxShadow: 'var(--shadow-sm)',
          transform: `translateX(${idx * 60}px)`, transition: 'transform .42s cubic-bezier(.34,1.56,.64,1)', zIndex: 1 }} />
        {TABS.map(tab => {
          const on = active === tab.id;
          return (
            <button key={tab.id} onClick={() => onChange(tab.id)} style={{ position: 'relative', zIndex: 2, width: 58, border: 0, cursor: 'pointer', background: 'transparent',
              color: on ? '#fff' : 'var(--text-3)', borderRadius: 9999, padding: '7px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, transition: 'color .3s' }}>
              <span style={{ transform: on ? 'translateY(-1px) scale(1.1)' : 'none', transition: 'transform .4s cubic-bezier(.34,1.56,.64,1)' }}><Icon name={tab.icon} size={18} color={on ? '#fff' : 'var(--text-3)'} /></span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── App ───────────────────────────────────────────────────────── */
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [stage, setStage] = useState('welcome');
  const [tab, setTab] = useState('dashboard');
  const [trip, setTrip] = useState(SAMPLE_TRIPS[0]);
  const [showCreate, setShowCreate] = useState(false);
  const [intro, setIntro] = useState(null);          // pending trip during intro
  const prevTab = useRef(0);

  const rm = t.reduceMotion;
  const dur = rm ? 0.001 : (0.42 / (t.speed || 1));

  const openTrip = (tp) => {
    if (rm || (!t.tripEntry && !t.loader)) { setTrip(tp); setTab('dashboard'); setStage('trip'); return; }
    setIntro(tp);
  };
  const finishIntro = () => { const tp = intro; setIntro(null); setTrip(tp); setTab('dashboard'); setStage('trip'); };

  const screens = { dashboard: <DashboardScreen trip={trip} />, day: <DayScreen />, map: <MapScreen />, supplies: <SuppliesScreen />, crew: <CrewScreen /> };

  let body, showNav = false;
  if (stage === 'welcome') body = <WelcomeScreen onContinue={() => setStage('home')} />;
  else if (stage === 'home') body = <HomeScreen trips={SAMPLE_TRIPS} onOpenTrip={openTrip} onCreate={() => setShowCreate(true)} />;
  else { body = screens[tab]; showNav = true; }

  // transition class
  const newIdx = stage === 'trip' ? TABS.findIndex(x => x.id === tab) : -1;
  let txClass = 'tx-fade';
  if (!rm) {
    if (t.transition === 'fade') txClass = 'tx-fade';
    else if (t.transition === 'zoom') txClass = 'tx-zoom';
    else txClass = (newIdx >= 0 && newIdx < prevTab.current) ? 'tx-slideL' : 'tx-slideR';
  } else txClass = '';
  if (newIdx >= 0) prevTab.current = newIdx;

  const changeTab = (id) => setTab(id);

  // CSS vars from tweaks
  const skinVars = {
    '--terra': t.accent,
    '--blur-lg': `blur(${t.glass}px) saturate(1.85)`,
    '--blur-sm': `blur(${Math.round(t.glass * 0.5)}px) saturate(1.6)`,
    '--tw-dur': dur + 's',
  };

  return (
    <div>
      <div className={t.hoverLift && !rm ? 'lift-on' : ''} style={{ width: 393, height: 852, position: 'relative', borderRadius: 54, padding: 12,
        background: 'linear-gradient(160deg, #2a2620, #14110d)', boxShadow: '0 50px 110px oklch(13% 0.012 55 / 38%), inset 0 0 0 2px #3a352c', ...skinVars }}>
        <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', width: 120, height: 30, background: '#14110d', borderRadius: '0 0 18px 18px', zIndex: 10 }} />
        <div className="grain" style={{ width: '100%', height: '100%', borderRadius: 42, overflow: 'hidden', position: 'relative', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
          <StatusBar />
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            {stage === 'trip' && (
              <button onClick={() => setStage('home')} className="press" style={{ position: 'absolute', top: 10, left: 16, zIndex: 45, border: 0, cursor: 'pointer',
                width: 38, height: 38, borderRadius: '50%', background: 'var(--glass-strong)', backdropFilter: 'var(--blur-sm)', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="chevL" size={18} color="var(--text)" />
              </button>
            )}
            <div key={stage + tab} className={txClass} style={{ height: '100%', paddingTop: (stage === 'trip' && tab !== 'map') ? 46 : 0 }}>{body}</div>
            {showNav && <BottomNav active={tab} onChange={changeTab} />}
            {intro && <IntroOverlay trip={intro} tripEntry={t.tripEntry} loader={t.loader} onDone={finishIntro} />}
          </div>
          {showCreate && <CreateSheet onClose={() => setShowCreate(false)} onDone={() => { setShowCreate(false); openTrip(SAMPLE_TRIPS[0]); }} />}
        </div>
      </div>

      <TweaksPanel>
        <TweakSection label="Motion" />
        <TweakRadio label="Transition" value={t.transition} options={['slide', 'fade', 'zoom']} onChange={v => setTweak('transition', v)} />
        <TweakSlider label="Speed" value={t.speed} min={0.5} max={2} step={0.1} unit="×" onChange={v => setTweak('speed', v)} />
        <TweakToggle label="Trip-entry animation" value={t.tripEntry} onChange={v => setTweak('tripEntry', v)} />
        <TweakToggle label="Loading state" value={t.loader} onChange={v => setTweak('loader', v)} />
        <TweakToggle label="Hover & press lift" value={t.hoverLift} onChange={v => setTweak('hoverLift', v)} />
        <TweakToggle label="Reduce motion" value={t.reduceMotion} onChange={v => setTweak('reduceMotion', v)} />
        <TweakSection label="Look" />
        <TweakColor label="Accent" value={t.accent} options={['#C4714A', '#3B6E52', '#C8944A', '#2B7A8E']} onChange={v => setTweak('accent', v)} />
        <TweakSlider label="Glass blur" value={t.glass} min={10} max={60} unit="px" onChange={v => setTweak('glass', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
