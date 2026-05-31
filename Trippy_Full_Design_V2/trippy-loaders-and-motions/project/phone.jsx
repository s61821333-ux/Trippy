/* ════════════════════════════════════════════════════════════════
 *  Trippy — in-context phone demo
 *  Pick a destination → the welcome animation plays in that destination's
 *  flag colors → the trip opens. The chosen loader style appears as the
 *  in-app "building your day" wait state.
 * ════════════════════════════════════════════════════════════════ */

// honest color swatch — flag palette as vertical bands (not a literal flag)
function Swatch({ colors, w = 30, h = 22, r = 7, ring = true }) {
  return (
    <div style={{ width: w, height: h, borderRadius: r, overflow: 'hidden', display: 'flex',
      flexShrink: 0, boxShadow: ring ? 'inset 0 0 0 1px rgba(26,20,16,.12), 0 1px 2px rgba(26,20,16,.12)' : 'none' }}>
      {colors.map((c, i) => (
        <div key={i} style={{ flex: 1, background: c === '#FFFFFF' ? '#FCFAF6' : c }} />
      ))}
    </div>
  );
}

function Eyebrow({ children, style }) {
  return <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 500,
    letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-3)', ...style }}>{children}</div>;
}

// ── picker screen ─────────────────────────────────────────────────
function PickerScreen({ flags, destIndex, onPick, onOpen, dark }) {
  const sel = flags[destIndex];
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
      paddingTop: 58 }}>
      <div style={{ padding: '6px 22px 12px' }}>
        <Eyebrow>New trip</Eyebrow>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 33, lineHeight: 1.04, marginTop: 4,
          letterSpacing: '-0.02em', color: 'var(--text)' }}>Where to?</div>
        <div style={{ fontSize: 13.5, color: 'var(--text-2)', marginTop: 7, lineHeight: 1.45 }}>
          Pick a destination — we’ll set the mood the moment you open it.</div>
        {/* search field (glass, decorative) */}
        <div className="glass" style={{ marginTop: 14, borderRadius: 16, padding: '11px 14px',
          display: 'flex', alignItems: 'center', gap: 10, boxShadow: 'var(--shadow-sm)' }}>
          <span dangerouslySetInnerHTML={{ __html: TrippyIcon('search', { size: 17, color: 'var(--text-3)' }) }} />
          <span style={{ fontSize: 14, color: 'var(--text-3)', position: 'relative', zIndex: 2 }}>Search destinations</span>
        </div>
      </div>
      {/* list */}
      <div style={{ flex: 1, overflow: 'auto', padding: '2px 14px 12px' }}>
        {flags.map((f, i) => {
          const active = i === destIndex;
          return (
            <button key={f.code} onClick={() => onPick(i)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 13, textAlign: 'left',
              padding: '11px 12px', marginBottom: 4, borderRadius: 16, cursor: 'pointer',
              border: active ? '1.5px solid var(--brand)' : '1.5px solid transparent',
              background: active ? 'var(--brand-light)' : 'transparent',
              transition: 'background .2s, border-color .2s', fontFamily: 'inherit' }}>
              <Swatch colors={f.colors} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 15, fontWeight: 600, color: 'var(--text)',
                  letterSpacing: '-0.01em' }}>{f.name}</span>
                <span style={{ display: 'block', fontSize: 12, color: 'var(--text-3)' }}>{f.city}</span>
              </span>
              {active && <span dangerouslySetInnerHTML={{ __html: TrippyIcon('check', { size: 18, color: 'var(--brand)' }) }} />}
            </button>
          );
        })}
      </div>
      {/* open button */}
      <div style={{ padding: '10px 18px 30px', position: 'relative', zIndex: 5 }}>
        <button onClick={onOpen} style={{ width: '100%', height: 54, borderRadius: 999, border: 'none',
          cursor: 'pointer', background: 'var(--terra)', color: 'var(--text-inv)',
          fontFamily: 'var(--font-sans)', fontSize: 15.5, fontWeight: 600, letterSpacing: '0.01em',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
          boxShadow: 'var(--shadow-accent-glow)' }}>
          Open the {sel.name} trip
          <span dangerouslySetInnerHTML={{ __html: TrippyIcon('arrow', { size: 19, color: 'var(--text-inv)' }) }} />
        </button>
      </div>
    </div>
  );
}

// ── trip screen (revealed after the welcome) ──────────────────────
function TripScreen({ flag, theme, loaderComp: Loader, speed, dark, onBack, onReplay }) {
  const days = [1, 2, 3, 4, 5];
  // app chrome stays in Trippy brand colors — only the loader adopts the destination palette
  const events = [
    { stamp: 'var(--terra)', t: '09:30', title: `Slow morning in ${flag.city}`, sub: 'Coffee, then wander on foot' },
    { stamp: 'var(--brand)', t: '13:00', title: 'Lunch the locals love', sub: 'A short walk from the old quarter' },
    { stamp: 'var(--sand)', t: '18:30', title: 'Golden-hour viewpoint', sub: 'Best light of the day' },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', paddingTop: 56 }}>
      {/* header */}
      <div style={{ padding: '8px 20px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onBack} className="glass" style={{ width: 38, height: 38, borderRadius: 999, border: 'none',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ position: 'relative', zIndex: 2 }} dangerouslySetInnerHTML={{ __html: TrippyIcon('chevL', { size: 18, color: 'var(--text)' }) }} />
        </button>
        <Swatch colors={flag.colors} w={34} h={22} />
      </div>
      <div style={{ padding: '0 20px 6px' }}>
        <Eyebrow>{flag.name}</Eyebrow>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 30, lineHeight: 1.05, marginTop: 3,
          fontStyle: 'italic', letterSpacing: '-0.02em', color: 'var(--text)' }}>{flag.city}</div>
      </div>
      {/* day chips */}
      <div style={{ display: 'flex', gap: 8, overflow: 'auto', padding: '8px 20px 12px' }}>
        {days.map((d, i) => (
          <div key={d} style={{ flexShrink: 0, padding: '8px 15px', borderRadius: 999, fontSize: 13, fontWeight: 600,
            background: i === 0 ? 'var(--brand)' : 'var(--surface)',
            color: i === 0 ? 'var(--text-inv)' : 'var(--text-2)' }}>Day {d}</div>
        ))}
      </div>
      {/* itinerary */}
      <div style={{ flex: 1, overflow: 'auto', padding: '2px 16px 96px' }}>
        {events.map((e, i) => (
          <div key={i} className="glass" style={{ display: 'flex', gap: 13, alignItems: 'center',
            padding: 13, marginBottom: 10, borderRadius: 20, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', flexShrink: 0, background: e.stamp,
              position: 'relative', zIndex: 2, boxShadow: 'inset 0 0 0 3px rgba(251,247,240,.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span dangerouslySetInnerHTML={{ __html: TrippyIcon(i === 0 ? 'water' : i === 1 ? 'tent' : 'compass', { size: 20, color: '#FBF7F0' }) }} />
            </div>
            <div style={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 2 }}>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', color: 'var(--text-3)' }}>{e.t}</div>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em' }}>{e.title}</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-3)' }}>{e.sub}</div>
            </div>
          </div>
        ))}
        {/* in-context loader: building the rest of the day */}
        <div className="glass" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 8, padding: '20px 13px 22px', borderRadius: 20, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <Loader theme={theme} speed={speed} size={92} />
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-3)', position: 'relative', zIndex: 2 }}>Building the rest of your day…</div>
        </div>
      </div>
      {/* bottom nav */}
      <div style={{ position: 'absolute', left: 16, right: 16, bottom: 26, height: 60, zIndex: 6 }}>
        <div className="glass-float" style={{ height: '100%', borderRadius: 999, display: 'flex',
          alignItems: 'center', justifyContent: 'space-around', padding: '0 8px' }}>
          {['home', 'map', 'sparkle', 'users'].map((ic, i) => (
            <div key={ic} style={{ position: 'relative', zIndex: 2, padding: 10 }}
              dangerouslySetInnerHTML={{ __html: TrippyIcon(ic, { size: 22, color: i === 0 ? 'var(--brand)' : 'var(--text-3)' }) }} />
          ))}
        </div>
      </div>
      {/* replay */}
      <button onClick={onReplay} className="glass" style={{ position: 'absolute', top: 56, right: 18, zIndex: 7,
        height: 32, padding: '0 12px', borderRadius: 999, border: 'none', cursor: 'pointer', display: 'flex',
        alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 600, color: 'var(--text-2)',
        fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
        <span style={{ position: 'relative', zIndex: 2 }}>↺ REPLAY</span>
      </button>
    </div>
  );
}

function PhoneDemo({ flags, destIndex, setDestIndex, theme, speed, dark, loaderComp, duration }) {
  const [screen, setScreen] = React.useState('picker');  // picker | welcome | trip
  const open = () => setScreen('welcome');
  return (
    <IOSDevice dark={dark} width={392} height={812}>
      <div style={{ position: 'absolute', inset: 0, background: dark ? 'var(--bg)' : 'var(--bg)',
        overflow: 'hidden' }}>
        {/* soft brand wash */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
          background: dark
            ? 'radial-gradient(70% 40% at 80% 8%, var(--brand-muted) 0%, transparent 60%)'
            : 'radial-gradient(70% 40% at 80% 6%, var(--sand-light) 0%, transparent 60%)' }} />
        {screen === 'picker' && (
          <PickerScreen flags={flags} destIndex={destIndex} dark={dark}
            onPick={setDestIndex} onOpen={open} />
        )}
        {screen === 'trip' && (
          <TripScreen flag={flags[destIndex]} theme={theme} loaderComp={loaderComp} speed={speed} dark={dark}
            onBack={() => setScreen('picker')} onReplay={() => setScreen('welcome')} />
        )}
        {screen === 'welcome' && (
          <WelcomeAnimation theme={theme} speed={speed} dark={dark} duration={duration}
            onDone={() => setScreen('trip')} />
        )}
      </div>
    </IOSDevice>
  );
}

Object.assign(window, { PhoneDemo, Swatch, Eyebrow });
