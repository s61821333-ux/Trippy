/* ════════════════════════════════════════════════════════════════════════
   Trippy Liquid Glass — Dashboard (cinematic trip hero)
   ════════════════════════════════════════════════════════════════════════ */

const TODAY_EVENTS = [
  { time: '00:00', stamp: 'plane',  title: 'Flight to New York', place: 'John F. Kennedy Intl', dur: '6h 30m' },
  { time: '14:30', stamp: 'hotel',  title: 'Hotel check-in', place: 'Four Points, Times Square', dur: '' },
  { time: '19:00', stamp: 'wine',   title: 'Dinner downtown', place: 'Hell\u2019s Kitchen', dur: '2h' },
];

function Dashboard({ trip, onOpenDay, onAsk, onSettings }) {
  const t = window.t;
  return <div className="lg-scroll" style={{ height: '100%', overflowY: 'auto', background: 'var(--bg)', paddingBottom: 110 }}>
    {/* ── Cinematic hero ── */}
    <div className="hero-mesh" style={{ position: 'relative', padding: '52px 22px 22px', borderRadius: '0 0 34px 34px', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -40, insetInlineEnd: -30, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, oklch(62% 0.17 40 / 45%), transparent 70%)' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        <span className="eyebrow-lg" style={{ color: 'oklch(98% 0.005 80 / 72%)' }}>{t('Active trip')}</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={onSettings} className="lg-dark" style={{ width: 34, height: 34, border: 0, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Icon name="settings" size={16} color="#fff" /></button>
          <button className="lg-dark" style={{ width: 34, height: 34, border: 0, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Icon name="share" size={16} color="#fff" /></button>
          {trip.crew.map((c, i) => <span key={i} style={{ marginInlineStart: i ? -10 : 0 }}><Avatar name={c} i={i} size={34} ring="oklch(20% 0.03 60)" /></span>)}
        </div>
      </div>

      <div style={{ marginTop: 24, position: 'relative' }}>
        <p className="a-rise" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--lg-sand)', margin: '0 0 4px' }}>{t('United States')}</p>
        <h1 className="display-xl a-rise d1" style={{ fontSize: 52, color: '#fff', margin: 0 }}>{trip.name}</h1>
        <div className="a-rise d2" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          <span className="lg-dark" style={{ padding: '6px 13px', display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13 }}>
            <span style={{ width: 7, height: 7, borderRadius: 9, background: 'var(--lg-terra-bright)', boxShadow: '0 0 8px var(--lg-terra-bright)' }} />{trip.countdown} {t('days to go')}</span>
          <span className="lg-dark" style={{ padding: '6px 13px', display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13 }}><Icon name="sun" size={14} color="var(--lg-sand)" />24° · NYC</span>
          <span className="lg-dark" style={{ padding: '6px 13px', display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: 12 }}><Icon name="clock" size={13} color="#fff" />09:41</span>
        </div>
      </div>

      {/* day-journey scroller */}
      <div className="lg-scroll a-rise d3" style={{ display: 'flex', gap: 8, marginTop: 20, overflowX: 'auto', paddingBottom: 2 }}>
        {Array.from({ length: trip.days }).map((_, i) => { const on = i === 0;
          return <button key={i} onClick={() => onOpenDay(i + 1)} style={{ flex: 'none', width: 50, height: 62, borderRadius: 16, border: 0, cursor: 'pointer',
            background: on ? 'linear-gradient(180deg, var(--lg-terra-bright), var(--lg-terra))' : 'oklch(100% 0 0 / 12%)',
            boxShadow: on ? 'var(--lg-glow-terra)' : 'inset 0 0 0 1px oklch(100% 0 0 / 14%)', color: '#fff',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, backdropFilter: 'blur(10px)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, opacity: 0.8, letterSpacing: '0.1em' }}>{t('Day').toUpperCase()}</span>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 22, lineHeight: 1 }}>{i + 1}</span>
          </button>; })}
      </div>
    </div>

    <div style={{ padding: '18px 20px 0' }}>
      {/* AI summary */}
      <button onClick={onAsk} className="a-rise" style={{ width: '100%', textAlign: 'start', border: 0, cursor: 'pointer', borderRadius: 'var(--lg-r-card)', padding: 16, marginBottom: 18,
        background: 'linear-gradient(135deg, var(--lg-forest), var(--lg-forest-deep))', boxShadow: 'var(--lg-glow-forest)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -20, insetInlineEnd: -10, opacity: 0.16 }}><Icon name="sparkle" size={90} color="#fff" /></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}><Icon name="sparkle" size={16} color="var(--lg-sand)" /><span className="eyebrow-lg" style={{ color: 'var(--lg-sand)' }}>{t('Trip summary')}</span></div>
        <div style={{ fontSize: 14, lineHeight: 1.55, color: '#fff', fontWeight: 500 }}>{t('16 days · 9 events planned · NYC, then a road trip west. You\u2019re 62% packed and on budget.')}</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, color: '#fff', fontWeight: 600, fontSize: 13 }}>{t('See suggestions')} <Icon name="arrow" size={15} color="#fff" style={{ transform: window.LANG === 'he' ? 'scaleX(-1)' : 'none' }} /></div>
      </button>

      {/* Next up */}
      <p className="eyebrow-lg a-rise" style={{ color: 'var(--text-3)', marginBottom: 10 }}>{t('Next up')}</p>
      <button onClick={() => onOpenDay(1)} className="lg a-rise d1" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 15, padding: 16, border: 0, cursor: 'pointer', textAlign: 'start', marginBottom: 18 }}>
        <Stamp name="plane" size={56} />
        <div style={{ flex: 1 }}>
          <div className="eyebrow-lg" style={{ color: 'var(--lg-sky)', fontSize: 9 }}>{t('Day')} 1 · 00:00 → 06:30</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--lg-ink)', lineHeight: 1.05, marginTop: 2 }}>{t('Flight to New York')}</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="pin" size={12} color="var(--text-3)" />John F. Kennedy Intl</div>
        </div>
        <Icon name="chevR" size={20} color="var(--text-3)" style={{ transform: window.LANG === 'he' ? 'scaleX(-1)' : 'none' }} />
      </button>

      {/* Quick stats: packing + budget */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
        <div className="lg a-rise d2" style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <Ring pct={62} size={58} color="var(--lg-terra)">62%</Ring>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--lg-ink)' }}>{t('Packed')}</span>
        </div>
        <div className="lg a-rise d3" style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4 }}>
          <span className="eyebrow-lg" style={{ color: 'var(--text-3)', fontSize: 9 }}>{t('Budget')}</span>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 26, color: 'var(--lg-ink)', lineHeight: 1 }}>$1,372</span>
          <div style={{ height: 6, borderRadius: 3, background: 'oklch(50% 0.02 60 / 14%)', overflow: 'hidden', marginTop: 4 }}><div style={{ width: '46%', height: '100%', background: 'var(--lg-terra)', borderRadius: 3 }} /></div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)' }}>{t('of')} $3,000</span>
        </div>
      </div>

      {/* Today preview */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <p className="eyebrow-lg" style={{ color: 'var(--text-3)' }}>{t('Today')} · {t('Day')} 1</p>
        <button onClick={() => onOpenDay(1)} style={{ border: 0, background: 'none', cursor: 'pointer', color: 'var(--lg-terra)', fontWeight: 600, fontSize: 12.5 }}>{trip.days} {t('Days')}</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {TODAY_EVENTS.map((e, i) => (
          <div key={i} className="lg a-rise" style={{ display: 'flex', alignItems: 'center', gap: 13, padding: 13, animationDelay: `${0.3 + i * 0.06}s` }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--lg-ink)', width: 40, flex: 'none' }}>{e.time}</span>
            <Stamp name={e.stamp} size={38} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--lg-ink)' }}>{t(e.title)}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{e.place}</div>
            </div>
            {e.dur && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)' }}>{e.dur}</span>}
          </div>
        ))}
      </div>
    </div>
  </div>;
}

Object.assign(window, { Dashboard, TODAY_EVENTS });
