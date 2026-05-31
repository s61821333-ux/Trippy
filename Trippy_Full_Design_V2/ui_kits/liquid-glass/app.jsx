/* ════════════════════════════════════════════════════════════════════════
   Trippy Liquid Glass — app shell + state machine
   ════════════════════════════════════════════════════════════════════════ */

function CreateSheet({ onClose }) {
  const THEMES = [['Desert','cactus','#C4714A'],['Nature','pine_tree','#3B6E52'],['City','museum','#3A2E26'],['Beach','beach','#2B7A8E']];
  const [theme, setTheme] = useState('City');
  return <Sheet title={t('Create a new trip')} sub={t('Pick a vibe, name it, share the link')} onClose={onClose}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 8, fontWeight: 600 }}>{t('Background')}</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {THEMES.map(([n, st, ac]) => <button key={n} onClick={() => setTheme(n)} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 14px', borderRadius: 18, cursor: 'pointer', border: 0,
            background: 'var(--lg-panel-strong)', boxShadow: theme === n ? `0 6px 20px ${ac}40, inset 0 0 0 1.5px ${ac}` : 'inset 0 0 0 1px oklch(50% 0.02 60 / 14%)', transition: 'all .2s var(--spring)' }}>
            <Stamp name={st} size={34} /><span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14.5, color: 'var(--lg-ink)' }}>{t(n)}</span></button>)}
        </div>
      </div>
      <LGField label={t('Trip name')} placeholder="e.g. USA 2026" value="" onChange={()=>{}} icon="tent" />
      <LGField label={t('Your nickname')} placeholder="—" value="" onChange={()=>{}} icon="user" />
      <Btn kind="forest" full onClick={onClose} style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{t('Create trip')}</Btn>
    </div>
  </Sheet>;
}

function App() {
  const [stage, setStage] = useState('splash');
  const [tab, setTab] = useState('dashboard');
  const [trip, setTrip] = useState(window.TRIPS[0]);
  const [day, setDay] = useState(1);
  const [sheet, setSheet] = useState(null);
  const [lang, setLang] = useState('en');
  const [theme, setTheme] = useState('light');   // light | dark | system

  window.LANG = lang;                              // i18n reads this during render
  const dark = theme === 'dark';

  useEffect(() => { const x = setTimeout(() => setStage(s => s === 'splash' ? 'welcome' : s), 1900); return () => clearTimeout(x); }, []);

  const goDay = (d) => { setDay(d); setTab('day'); setStage('trip'); };
  const heroScreen = (stage === 'splash' || stage === 'welcome' || stage === 'home' || (stage === 'trip' && (tab === 'dashboard' || tab === 'crew')));
  const fullBleed = heroScreen || (stage === 'trip' && tab === 'map');
  const statusDark = heroScreen || (dark && !fullBleed) || dark;

  let body;
  if (stage === 'splash') body = <Splash />;
  else if (stage === 'welcome') body = <Welcome onContinue={() => setStage('home')} />;
  else if (stage === 'home') body = <Home onOpen={tp => { setTrip(tp); setTab('dashboard'); setStage('trip'); }} onCreate={() => setSheet('create')} />;
  else {
    const screens = {
      dashboard: <Dashboard trip={trip} onOpenDay={goDay} onAsk={() => setSheet('ai')} onSettings={() => setTab('settings')} />,
      day: <DayDetail day={day} onDayChange={setDay} totalDays={trip.days} onAdd={() => setSheet('add')} onAsk={() => setSheet('ai')} onEdit={() => setSheet('edit')} />,
      map: <MapScreen />,
      supplies: <PackScreen />,
      crew: <CrewScreen />,
      settings: <SettingsScreen theme={theme} onTheme={setTheme} lang={lang} onLang={setLang} />,
    };
    body = screens[tab] || screens.dashboard;
  }

  const showNav = stage === 'trip';
  return <div style={{ width: 402, height: 872, position: 'relative', borderRadius: 56, padding: 13,
    background: 'linear-gradient(155deg, #2c2822, #15120d)', boxShadow: '0 60px 130px oklch(16% 0.018 60 / 42%), inset 0 0 0 2px #3a352c' }}>
    <div className="lg-scroll" dir={lang === 'he' ? 'rtl' : 'ltr'} data-theme={dark ? 'dark' : undefined}
      style={{ width: '100%', height: '100%', borderRadius: 44, overflow: 'hidden', position: 'relative', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 25 }}><StatusBar dark={statusDark} /></div>
      <div key={stage + tab + day + lang + theme} style={{ flex: 1, position: 'relative', overflow: 'hidden', paddingTop: fullBleed ? 0 : 50 }}>
        {body}
      </div>
      {showNav && <HoverNav active={tab} onChange={tb => setTab(tb)} onAdd={() => setSheet(tab === 'crew' ? 'create' : 'add')}
        onSettings={() => setTab('settings')} onSwitch={() => setStage('home')} />}

      {sheet === 'create' && <CreateSheet onClose={() => setSheet(null)} />}
      {sheet === 'add' && <AddEventSheet onClose={() => setSheet(null)} />}
      {sheet === 'edit' && <AddEventSheet editing onClose={() => setSheet(null)} />}
      {sheet === 'ai' && <AISheet onClose={() => setSheet(null)} />}
    </div>
  </div>;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
