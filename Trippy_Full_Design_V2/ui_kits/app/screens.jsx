/* ════════════════════════════════════════════════════════════════
   Trippy UI Kit — Trip screens: Dashboard · Day · Crew · Supplies
   ════════════════════════════════════════════════════════════════ */

/* Shared sample data */
const CREW = ['Mia Rivera', 'Tom Okafor', 'Lena Park', 'You'];
const DAY_EVENTS = [
  { time: '09:00', stamp: 'coffee',  title: 'Coffee & pastéis', place: 'Manteigaria, Chiado', chip: { v: 'open', t: 'Booked' } },
  { time: '11:00', stamp: 'museum',  title: 'Gulbenkian Museum', place: 'Av. de Berna', chip: { v: 'accent', t: 'AI pick' } },
  { time: '13:30', stamp: 'wine',    title: 'Lunch at Time Out', place: 'Mercado da Ribeira', chip: null },
  { time: '16:00', stamp: 'camera',  title: 'Tram 28 + Alfama', place: 'Praça Martim Moniz', chip: { v: 'gap', t: 'No vote yet' } },
  { time: '20:00', stamp: 'beach',   title: 'Sunset, Cais do Sodré', place: 'Pink Street after', chip: null },
];

/* ── Dashboard ─────────────────────────────────────────────────── */
function DashboardScreen({ trip }) {
  const th = (window.TRIP_THEMES.find(x => x.id === trip.theme)) || window.TRIP_THEMES[0];
  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '14px 20px 110px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <p className="eyebrow" style={{ color: 'var(--terra)', marginBottom: 4 }}>Good morning, crew</p>
          <h1 style={{ fontSize: 27, margin: 0, lineHeight: 1 }}>{trip.name}</h1>
        </div>
        <Stamp name={th.stamp} size={46} />
      </div>

      {/* Countdown hero */}
      <div className="glass-float an-blur-up" style={{ padding: 20, marginBottom: 14 }}>
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 46, lineHeight: 1, color: 'var(--brand)' }}>12<span style={{ fontSize: 18, color: 'var(--text-3)' }}> days</span></div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>until you fly · {trip.dates}</div>
          </div>
          <div style={{ display: 'flex' }}>
            {CREW.map((c, i) => <span key={i} style={{ marginLeft: i ? -10 : 0 }}><Avatar name={c} i={i} size={36} /></span>)}
          </div>
        </div>
      </div>

      {/* AI insight */}
      <div className="an-blur-up stagger-1" style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '13px 15px',
        borderRadius: 18, background: 'var(--brand-light)', border: '1px solid oklch(42% 0.092 155 / 18%)', marginBottom: 18 }}>
        <Icon name="sparkle" size={18} color="var(--brand)" style={{ marginTop: 1 }} />
        <div style={{ fontSize: 13.5, lineHeight: 1.5, color: 'var(--brand-800)' }}>
          Day 3 has a long gap after lunch. Want me to slot in the Belém tram ride? <span style={{ fontWeight: 600, color: 'var(--brand)' }}>Ask Trippy →</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
        <p className="eyebrow">Today · Day 1</p>
        <span style={{ fontSize: 12, color: 'var(--terra)', fontWeight: 600 }}>See all 6 days</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {DAY_EVENTS.slice(0, 3).map((e, i) => <EventRow key={i} e={e} i={i} compact />)}
      </div>

      {/* Budget */}
      <div className="card-solid an-blur-up" style={{ padding: 16, marginTop: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Budget</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)' }}>€840 / €1,200</span>
        </div>
        <div style={{ height: 8, borderRadius: 4, background: 'var(--border)', overflow: 'hidden' }}>
          <div style={{ width: '70%', height: '100%', background: 'var(--brand)', borderRadius: 4 }} />
        </div>
      </div>
    </div>
  );
}

/* ── Event row (shared) ────────────────────────────────────────── */
function EventRow({ e, i, compact }) {
  return (
    <div className="card-solid an-blur-up" style={{ display: 'flex', alignItems: 'center', gap: 13, padding: compact ? 12 : 14, animationDelay: `${0.05 * i}s` }}>
      <div style={{ textAlign: 'center', flex: 'none', width: 44 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{e.time}</div>
      </div>
      <Stamp name={e.stamp} size={40} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em' }}>{e.title}</div>
        <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon name="pin" size={12} color="var(--text-3)" />{e.place}
        </div>
      </div>
      {e.chip && <Chip v={e.chip.v}>{e.chip.t}</Chip>}
    </div>
  );
}

/* ── Day planner ───────────────────────────────────────────────── */
function DayScreen() {
  const [day, setDay] = useState(1);
  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '14px 20px 110px' }}>
      <p className="eyebrow" style={{ color: 'var(--terra)', marginBottom: 6 }}>Hour by hour</p>
      <h1 style={{ fontSize: 27, margin: '0 0 16px', lineHeight: 1 }}>Day {day} · Lisbon</h1>

      {/* Day pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 2 }}>
        {[1, 2, 3, 4, 5, 6].map(d => (
          <button key={d} onClick={() => setDay(d)} style={{ flex: 'none', width: 48, height: 56, borderRadius: 16, cursor: 'pointer',
            border: 0, background: d === day ? 'var(--terra)' : 'var(--glass-base)', backdropFilter: 'var(--blur-sm)',
            color: d === day ? '#fff' : 'var(--text-2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
            boxShadow: d === day ? '0 6px 18px oklch(62% 0.115 40 / 28%)' : 'inset 0 0 0 1px oklch(13% 0.012 55 / 8%)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, opacity: 0.8 }}>OCT</span>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 20, lineHeight: 1 }}>{11 + d}</span>
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: 21, top: 8, bottom: 8, width: 2, background: 'var(--border)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {DAY_EVENTS.map((e, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ flex: 'none', width: 44, display: 'flex', justifyContent: 'center', paddingTop: 16, position: 'relative', zIndex: 1 }}>
                <span style={{ width: 11, height: 11, borderRadius: '50%', background: 'var(--terra)', border: '3px solid var(--bg)', boxShadow: '0 0 0 1px var(--border)' }} />
              </div>
              <div style={{ flex: 1 }}><EventRow e={e} i={i} /></div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 16, paddingLeft: 58 }}>
        <GlassBtn variant="flat" size="sm"><Icon name="plus" size={15} /> Add an event</GlassBtn>
      </div>
    </div>
  );
}

/* ── Crew ──────────────────────────────────────────────────────── */
function CrewScreen() {
  const roles = ['Organizer', 'Member', 'Member', 'Member'];
  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '14px 20px 110px' }}>
      <p className="eyebrow" style={{ color: 'var(--terra)', marginBottom: 6 }}>The whole point of going</p>
      <h1 style={{ fontSize: 27, margin: '0 0 18px', lineHeight: 1 }}>Your crew</h1>

      <div className="glass-float an-blur-up" style={{ padding: 16, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 13 }}>
        <Icon name="share" size={20} color="var(--brand)" style={{ position: 'relative', zIndex: 2 }} />
        <div style={{ flex: 1, position: 'relative', zIndex: 2 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Invite by link</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>trippy.app/j/lisbon-x9k2</div>
        </div>
        <GlassBtn variant="accent" size="sm" style={{ position: 'relative', zIndex: 2 }}>Copy</GlassBtn>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {CREW.map((c, i) => (
          <div key={i} className="card-solid an-blur-up" style={{ display: 'flex', alignItems: 'center', gap: 13, padding: 13, animationDelay: `${0.05 * i}s` }}>
            <Avatar name={c} i={i} size={42} ring={false} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{c}{c === 'You' && <span style={{ color: 'var(--text-3)', fontWeight: 400 }}> · you</span>}</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-3)' }}>{roles[i]}</div>
            </div>
            {i === 0 ? <Chip v="accent">Organizer</Chip> : <Icon name="check" size={18} color="var(--success)" />}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Supplies / packing ────────────────────────────────────────── */
function SuppliesScreen() {
  const [items, setItems] = useState([
    { stamp: 'passport', t: 'Passports + EU adapter', done: true },
    { stamp: 'camera',   t: 'Camera & spare battery', done: true },
    { stamp: 'sun',      t: 'Sunscreen SPF 50', done: false },
    { stamp: 'wallet',   t: 'Split the cash float', done: false },
    { stamp: 'backpack', t: 'Day pack for Sintra', done: false },
  ]);
  const done = items.filter(i => i.done).length;
  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '14px 20px 110px' }}>
      <p className="eyebrow" style={{ color: 'var(--terra)', marginBottom: 6 }}>Don't forget</p>
      <h1 style={{ fontSize: 27, margin: '0 0 4px', lineHeight: 1 }}>Packing list</h1>
      <p style={{ fontSize: 13, color: 'var(--text-2)', margin: '0 0 16px' }}>{done} of {items.length} sorted · shared with the crew</p>

      <div style={{ height: 8, borderRadius: 4, background: 'var(--border)', overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ width: `${(done / items.length) * 100}%`, height: '100%', background: 'var(--brand)', borderRadius: 4, transition: 'width 0.4s var(--ease-spring)' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((it, i) => (
          <button key={i} onClick={() => setItems(items.map((x, j) => j === i ? { ...x, done: !x.done } : x))}
            className="card-solid" style={{ display: 'flex', alignItems: 'center', gap: 13, padding: 13, cursor: 'pointer', textAlign: 'left',
              opacity: it.done ? 0.62 : 1, transition: 'opacity 0.2s' }}>
            <Stamp name={it.stamp} size={38} />
            <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: 'var(--text)', textDecoration: it.done ? 'line-through' : 'none', textDecorationColor: 'var(--text-3)' }}>{it.t}</span>
            <span style={{ width: 26, height: 26, borderRadius: '50%', flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: it.done ? 'var(--brand)' : 'transparent', border: it.done ? 'none' : '2px solid var(--border-strong)' }}>
              {it.done && <Icon name="check" size={15} color="#fff" />}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { DashboardScreen, DayScreen, CrewScreen, SuppliesScreen, EventRow });
