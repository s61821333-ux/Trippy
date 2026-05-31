/* ════════════════════════════════════════════════════════════════
 *  Trippy — Loaders & destination welcome · showcase composition
 * ════════════════════════════════════════════════════════════════ */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "destination": "US",
  "speed": 1,
  "loader": "compass",
  "dark": false
}/*EDITMODE-END*/;

function ThemeChip({ flag, dark }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '7px 12px 7px 8px',
      borderRadius: 999, background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <Swatch colors={flag.colors} w={26} h={18} r={5} />
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em' }}>{flag.name}</span>
    </div>
  );
}

// quick palette flippers
function DestChips({ flags, destIndex, onPick }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
      {flags.map((f, i) => {
        const active = i === destIndex;
        return (
          <button key={f.code} onClick={() => onPick(i)} title={f.name} style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '5px 10px 5px 6px', cursor: 'pointer',
            borderRadius: 999, fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
            color: active ? 'var(--text-inv)' : 'var(--text-2)',
            background: active ? 'var(--brand)' : 'var(--bg-warm)',
            border: active ? '1px solid var(--brand)' : '1px solid var(--border)',
            transition: 'all .18s' }}>
            <Swatch colors={f.colors} w={20} h={14} r={4} ring={!active} />
            {f.code}
          </button>
        );
      })}
    </div>
  );
}

function GalleryCard({ def, theme, speed, active, onSelect }) {
  const L = def.comp;
  return (
    <button onClick={onSelect} style={{
      textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
      border: active ? '1.5px solid var(--brand)' : '1px solid var(--border)',
      background: 'var(--bg-warm)', borderRadius: 'var(--radius-lg)', padding: 18,
      display: 'flex', flexDirection: 'column', gap: 12, position: 'relative',
      boxShadow: active ? 'var(--shadow-md)' : 'var(--shadow-xs)', transition: 'all .2s' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Eyebrow>{def.name}</Eyebrow>
        {active && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 600,
          letterSpacing: '0.12em', color: 'var(--brand)', background: 'var(--brand-light)',
          padding: '3px 8px', borderRadius: 999 }}>IN APP</span>}
      </div>
      <div style={{ height: 132, display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 'var(--radius-md)', background: 'var(--bg)',
        boxShadow: 'inset 0 1px 3px rgba(26,20,16,.05)' }}>
        <L theme={theme} speed={speed} size={120} />
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--text-3)', lineHeight: 1.4 }}>{def.blurb}</div>
    </button>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const flags = window.FLAGS;
  const destIndex = Math.max(0, flags.findIndex(f => f.code === t.destination));
  const flag = flags[destIndex];
  const theme = window.deriveTheme(flag.colors);
  const speed = t.speed;
  const dark = !!t.dark;
  const setDest = (i) => setTweak('destination', flags[i].code);
  const loaderDef = window.LOADERS.find(l => l.key === t.loader) || window.LOADERS[0];

  const pageBg = dark
    ? 'radial-gradient(60% 45% at 12% 8%, oklch(42% .09 155 / .35) 0%, transparent 55%), radial-gradient(55% 50% at 90% 92%, oklch(50% .10 40 / .28) 0%, transparent 55%), #0E0C0A'
    : 'radial-gradient(60% 45% at 10% 6%, oklch(82% .09 75 / .55) 0%, transparent 55%), radial-gradient(55% 50% at 92% 94%, oklch(62% .10 155 / .22) 0%, transparent 55%), var(--bg)';

  return (
    <div data-dark={dark ? 'true' : 'false'} className="grain" style={{ minHeight: '100vh',
      background: pageBg, color: 'var(--text)', fontFamily: 'var(--font-sans)',
      padding: 'clamp(20px, 4vw, 52px)', boxSizing: 'border-box' }}>
      <LoaderStyles />

      {/* header */}
      <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 18, maxWidth: 1280, margin: '0 auto 30px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Eyebrow>Trippy · Motion system</Eyebrow>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: 'clamp(30px, 4.4vw, 44px)',
            lineHeight: 1.1, letterSpacing: '-0.025em', fontWeight: 400 }}>
            Loaders &amp; the <span style={{ fontStyle: 'italic' }}>destination welcome</span></h1>
          <p style={{ margin: 0, maxWidth: 540, fontSize: 15, color: 'var(--text-2)', lineHeight: 1.5 }}>
            Open a trip and the compass assembles in that place’s flag colors — no words, the color says where
            you’re heading. The same palette flows through every wait state.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ThemeChip flag={flag} dark={dark} />
          <button onClick={() => setTweak('dark', !dark)} aria-label="Toggle theme" style={{
            width: 44, height: 44, borderRadius: 999, cursor: 'pointer', border: '1px solid var(--border)',
            background: 'var(--bg-warm)', color: 'var(--text)', display: 'flex', alignItems: 'center',
            justifyContent: 'center' }}
            dangerouslySetInnerHTML={{ __html: TrippyIcon(dark ? 'sun' : 'compass', { size: 21, color: 'var(--text)' }) }} />
        </div>
      </header>

      {/* main grid */}
      <div className="tl-grid" style={{ maxWidth: 1280, margin: '0 auto' }}>
        {/* phone */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ transform: 'scale(.96)', transformOrigin: 'top center' }}>
            <PhoneDemo flags={flags} destIndex={destIndex} setDestIndex={setDest}
              theme={theme} speed={speed} dark={dark} loaderComp={loaderDef.comp} duration={4} />
          </div>
        </div>

        {/* right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {/* welcome preview */}
          <section className="card-solid" style={{ padding: 20, borderRadius: 'var(--radius-xl)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <Eyebrow>Welcome animation</Eyebrow>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 21, marginTop: 2 }}>Heading to {flag.name}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'stretch' }}>
              <div style={{ width: 230, height: 230, borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                position: 'relative', flexShrink: 0, boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--border)' }}>
                <WelcomeAnimation key={flag.code + speed + dark} theme={theme} speed={speed}
                  dark={dark} duration={4} loop />
              </div>
              <div style={{ flex: 1, minWidth: 220, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ margin: 0, fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.5 }}>
                  Ribbons in the flag’s colors wave in, the orbits assemble over them, then everything
                  converges into the Trippy mark — recolored for the trip. Loops here for preview; in
                  the app it plays once, then the itinerary fades up.</p>
                <Eyebrow style={{ marginTop: 2 }}>Try another destination</Eyebrow>
                <DestChips flags={flags} destIndex={destIndex} onPick={setDest} />
              </div>
            </div>
          </section>

          {/* gallery */}
          <section>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
              <Eyebrow>Wait states · themed to {flag.name}</Eyebrow>
              <span style={{ fontSize: 12, color: 'var(--text-3)' }}>tap to use in app</span>
            </div>
            <div className="tl-gallery">
              {window.LOADERS.map(def => (
                <GalleryCard key={def.key} def={def} theme={theme} speed={speed}
                  active={def.key === t.loader} onSelect={() => setTweak('loader', def.key)} />
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Tweaks */}
      <TweaksPanel>
        <TweakSection label="Destination" />
        <TweakSelect label="Trip location" value={flag.name}
          options={flags.map(f => f.name)}
          onChange={(name) => setTweak('destination', flags.find(f => f.name === name).code)} />
        <TweakSection label="Motion" />
        <TweakSlider label="Speed" value={speed} min={0.5} max={2} step={0.1} unit="×"
          onChange={(v) => setTweak('speed', v)} />
        <TweakSection label="Loader style" />
        <TweakSelect label="In-app loader" value={loaderDef.name}
          options={window.LOADERS.map(l => l.name)}
          onChange={(name) => setTweak('loader', window.LOADERS.find(l => l.name === name).key)} />
        <TweakSection label="Theme" />
        <TweakToggle label="Dark mode" value={dark} onChange={(v) => setTweak('dark', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
