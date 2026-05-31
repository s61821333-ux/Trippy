/* ════════════════════════════════════════════════════════════════════════
   Trippy Liquid Glass — Day detail (list/timeline) + Add-event sheet
   Per-day weather + budget bar · hotel anchors · tappable event accordions
   ════════════════════════════════════════════════════════════════════════ */

const HOTEL = { name: 'Four Points by Sheraton', area: 'Times Square', checkout: '11:00' };
const DAY_PLAN = [
  { time: '00:00', end: '06:30', stamp: 'plane', title: 'Flight to JFK', place: 'John F. Kennedy Intl', tag: 'Flight', color: '#2A4894', h: 6.5, cost: '$420', notes: 'Aisle seats 14C/D. Terminal 4, gate B22.' },
  { time: '14:30', end: '15:30', stamp: 'hotel', title: 'Hotel check-in', place: 'Four Points, Times Sq', tag: 'Hotel', color: '#A03CB4', h: 1, cost: '$0', notes: 'Early check-in requested.' },
  { time: '17:00', end: '19:00', stamp: 'museum', title: 'MoMA', place: '11 W 53rd St', tag: 'Sight', color: '#C8944A', h: 2, cost: '$30', notes: 'Free entry Friday 4–8pm.' },
  { time: '20:00', end: '22:00', stamp: 'wine', title: 'Dinner, Hell\u2019s Kitchen', place: '9th Ave', tag: 'Food', color: '#9C3F2C', h: 2, cost: '$70', notes: 'Booked for 4 · 20:00.' },
];

function HotelAnchor({ end }) {
  const t = window.t;
  return <div className="lg" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', background: 'var(--lg-panel-strong)' }}>
    <Stamp name="hotel" size={34} />
    <div style={{ flex: 1 }}>
      <div className="eyebrow-lg" style={{ color: 'var(--text-3)', fontSize: 8.5 }}>{end ? t('Checkout') : t('Stay')}{end ? ` · ${HOTEL.checkout}` : ''}</div>
      <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--lg-ink)' }}>{HOTEL.name}</div>
    </div>
    <Icon name="pin" size={15} color="var(--text-3)" />
  </div>;
}

function QuickAction({ icon, label, onClick, color }) {
  return <button onClick={onClick} className="lg-btn" style={{ height: 38, padding: '0 12px', gap: 6, background: 'var(--lg-panel-strong)', color: 'var(--lg-ink)', boxShadow: 'inset 0 0 0 1px oklch(50% 0.02 60 / 14%)' }}>
    <Icon name={icon} size={15} color={color} /><span style={{ fontSize: 12, fontWeight: 600 }}>{label}</span></button>;
}

function EventAccordion({ e, i, onEdit, onAsk, onAdd }) {
  const [open, setOpen] = useState(false);
  const t = window.t;
  return <div className="lg a-rise" style={{ animationDelay: `${i * 0.05}s`, borderInlineStart: `3px solid ${e.color}` }}>
    <button onClick={() => setOpen(o => !o)} style={{ width: '100%', display: 'flex', gap: 13, padding: 14, border: 0, background: 'transparent', cursor: 'pointer', textAlign: 'start' }}>
      <div style={{ flex: 'none', textAlign: 'center', width: 42 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--lg-ink)' }}>{e.time}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)', marginTop: 2 }}>{e.end}</div>
      </div>
      <Stamp name={e.stamp} size={42} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15.5, fontWeight: 600, color: 'var(--lg-ink)', letterSpacing: '-0.01em' }}>{t(e.title)}</div>
        <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="pin" size={12} color="var(--text-3)" />{e.place}</div>
        <span style={{ display: 'inline-block', marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: e.color, background: `${e.color}1f`, padding: '3px 9px', borderRadius: 9999 }}>{t(e.tag)}</span>
      </div>
      <span style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform .35s var(--spring)', alignSelf: 'center' }}><Icon name="chevR" size={18} color="var(--text-3)" /></span>
    </button>
    {/* accordion body */}
    <div style={{ maxHeight: open ? 280 : 0, overflow: 'hidden', transition: 'max-height .4s var(--snap)' }}>
      <div style={{ padding: '0 14px 14px 14px' }}>
        <div style={{ height: 1, background: 'oklch(50% 0.02 60 / 12%)', margin: '0 0 12px' }} />
        <div style={{ display: 'flex', gap: 18, marginBottom: 10 }}>
          <div><div className="eyebrow-lg" style={{ color: 'var(--text-3)', fontSize: 8.5 }}>{t('Duration')}</div><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--lg-ink)' }}>{e.time}–{e.end}</div></div>
          <div><div className="eyebrow-lg" style={{ color: 'var(--text-3)', fontSize: 8.5 }}>{t('Cost')}</div><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--lg-ink)' }}>{e.cost}</div></div>
        </div>
        <div className="eyebrow-lg" style={{ color: 'var(--text-3)', fontSize: 8.5, marginBottom: 3 }}>{t('Notes')}</div>
        <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--text-2)', margin: '0 0 14px' }}>{e.notes}</p>
        <div className="lg-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
          <QuickAction icon="edit" label={t('Quick edit')} color="var(--lg-forest)" onClick={onEdit} />
          <QuickAction icon="clock" label={t('Reschedule')} color="var(--lg-terra)" onClick={onEdit} />
          <QuickAction icon="sparkle" label={t('Suggest nearby')} color="var(--lg-sand)" onClick={onAsk} />
        </div>
      </div>
    </div>
  </div>;
}

function DayDetail({ day, onDayChange, onAdd, onAsk, onEdit, totalDays = 16 }) {
  const [mode, setMode] = useState('list');
  const t = window.t;
  return <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
    {/* sticky header */}
    <div style={{ padding: '6px 20px 12px', flex: 'none' }}>
      <p className="eyebrow-lg" style={{ color: 'var(--lg-terra)', marginBottom: 2 }}>{t('Adventure')} · USA 2026</p>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <h1 className="display-xl" style={{ fontSize: 38, color: 'var(--lg-ink)', margin: 0, whiteSpace: 'nowrap' }}>{t('Day')} {day}</h1>
        <div className="lg" style={{ display: 'flex', padding: 4, borderRadius: 9999, gap: 2 }}>
          {[['list','List'], ['timeline','Timeline']].map(([m, lb]) => <button key={m} onClick={() => setMode(m)} style={{ border: 0, cursor: 'pointer', borderRadius: 9999, padding: '7px 13px',
            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600,
            background: mode === m ? 'var(--lg-terra)' : 'transparent', color: mode === m ? '#fff' : 'var(--text-3)', transition: 'all .3s' }}>{t(lb)}</button>)}
        </div>
      </div>
      <p style={{ fontSize: 12.5, color: 'var(--text-3)', margin: '4px 0 12px' }}>Sun, Aug 23 · {DAY_PLAN.length} {t('events')} · 16h 30m {t('free')}</p>
      {/* day pills */}
      <div className="lg-scroll" style={{ display: 'flex', gap: 7, overflowX: 'auto' }}>
        {Array.from({ length: totalDays }).map((_, i) => { const d = i + 1, on = d === day;
          return <button key={d} onClick={() => onDayChange(d)} style={{ flex: 'none', border: 0, cursor: 'pointer', borderRadius: 9999, padding: '8px 15px',
            fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 13, background: on ? 'var(--lg-forest)' : 'var(--lg-panel)', backdropFilter: 'var(--lg-blur)',
            color: on ? '#fff' : 'var(--text-2)', boxShadow: on ? 'var(--lg-glow-forest)' : 'inset 0 0 0 1px oklch(50% 0.02 60 / 12%)', transition: 'all .3s', whiteSpace: 'nowrap' }}>{t('Day')} {d}</button>; })}
      </div>
    </div>

    {/* body */}
    <div className="lg-scroll" style={{ flex: 1, overflowY: 'auto', padding: '6px 20px 130px' }}>
      {/* weather + day budget bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <div className="lg" style={{ flex: 1, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="sun" size={22} color="var(--lg-sand)" />
          <div><div className="eyebrow-lg" style={{ color: 'var(--text-3)', fontSize: 8.5 }}>{t('Weather')}</div><div style={{ fontSize: 15, fontWeight: 700, color: 'var(--lg-ink)' }}>24° · Clear</div></div>
        </div>
        <div className="lg" style={{ flex: 1, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="download" size={20} color="var(--lg-terra)" />
          <div><div className="eyebrow-lg" style={{ color: 'var(--text-3)', fontSize: 8.5 }}>{t('Day budget')}</div><div style={{ fontSize: 15, fontWeight: 700, color: 'var(--lg-ink)' }}>$520</div></div>
        </div>
      </div>

      {mode === 'list' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          <HotelAnchor />
          {DAY_PLAN.map((e, i) => <EventAccordion key={i} e={e} i={i} onEdit={onEdit} onAsk={onAsk} onAdd={onAdd} />)}
          <HotelAnchor end />
          <button onClick={onAdd} className="lg-btn lg-btn-glass" style={{ height: 48, marginTop: 4, gap: 7 }}><Icon name="plus" size={17} color="var(--lg-forest)" />{t('Add an event')}</button>
        </div>
      ) : (
        <div style={{ position: 'relative', paddingInlineStart: 46 }}>
          {Array.from({ length: 13 }).map((_, h) => { const hr = h * 2;
            return <div key={h} style={{ position: 'relative', height: 52, borderTop: '1px solid oklch(50% 0.02 60 / 10%)' }}>
              <span style={{ position: 'absolute', insetInlineStart: -46, top: -7, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', width: 40, textAlign: 'end' }}>{String(hr).padStart(2,'0')}:00</span>
            </div>; })}
          {DAY_PLAN.map((e, i) => { const top = parseInt(e.time) / 2 * 52;
            return <div key={i} className="a-pop" style={{ position: 'absolute', insetInlineStart: 46, insetInlineEnd: 0, top: top, height: Math.max(e.h / 2 * 52, 40), borderRadius: 14, padding: '8px 12px',
              background: `linear-gradient(135deg, ${e.color}, ${e.color}cc)`, color: '#fff', boxShadow: `0 6px 18px ${e.color}55`, overflow: 'hidden', animationDelay: `${i*0.07}s` }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{t(e.title)}</div>
              <div style={{ fontSize: 10, opacity: 0.85, fontFamily: 'var(--font-mono)' }}>{e.time}–{e.end}</div>
            </div>; })}
        </div>
      )}
    </div>
  </div>;
}

/* ── Add / edit event sheet ──────────────────────────────────────────── */
const CATS = [['Flight','plane'],['Drive','swap'],['Rest','tent'],['Hotel','home'],['Sight','pin'],['Cafe','water'],['Food','wind'],['Beach','sun'],['Sport','users'],['Other','sparkle']];
function AddEventSheet({ onClose, editing }) {
  const [cat, setCat] = useState(editing ? 'Flight' : 'Sight');
  const [dur, setDur] = useState('1h');
  const [name, setName] = useState(editing ? 'Flight to JFK' : '');
  const t = window.t;
  return <Sheet title={editing ? t('Edit event') : t('Add event')} sub="Day 1 · USA 2026" onClose={onClose}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <LGField label={t('Event name')} placeholder="—" value={name} onChange={setName} icon="edit" />
      <div style={{ display: 'flex', gap: 12 }}>
        <LGField label={t('Start')} value="00:00" onChange={()=>{}} icon="clock" flex />
        <div style={{ flex: 1 }}>
          <label style={lgLabel}>{t('Duration')}</label>
          <div className="lg-scroll" style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
            {['30m','1h','1h 30m','2h','3h'].map(d => <button key={d} onClick={() => setDur(d)} style={{ flex: 'none', border: 0, cursor: 'pointer', borderRadius: 12, padding: '11px 13px', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13,
              background: dur === d ? 'var(--lg-terra)' : 'var(--lg-panel)', color: dur === d ? '#fff' : 'var(--text-2)', boxShadow: dur === d ? 'var(--lg-glow-terra)' : 'inset 0 0 0 1px oklch(50% 0.02 60 / 12%)', transition: 'all .25s', whiteSpace: 'nowrap' }}>{d}</button>)}
          </div>
        </div>
      </div>
      <div>
        <label style={lgLabel}>{t('Category')}</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {CATS.map(([c, ic]) => <button key={c} onClick={() => setCat(c)} style={{ border: 0, cursor: 'pointer', borderRadius: 9999, padding: '8px 13px', display: 'inline-flex', alignItems: 'center', gap: 5,
            fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 12.5, background: cat === c ? 'var(--lg-forest)' : 'var(--lg-panel)', color: cat === c ? '#fff' : 'var(--text-2)',
            boxShadow: cat === c ? 'var(--lg-glow-forest)' : 'inset 0 0 0 1px oklch(50% 0.02 60 / 12%)', transition: 'all .25s' }}><Icon name={ic} size={13} color={cat === c ? '#fff' : 'var(--text-3)'} />{t(c)}</button>)}
        </div>
      </div>
      <LGField label={t('Location (optional)')} placeholder="—" value="" onChange={()=>{}} icon="pin" />
      <LGField label={t('Cost (optional)')} placeholder="$0" value="" onChange={()=>{}} icon="download" />
      <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
        <Btn kind="forest" full onClick={onClose} style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{editing ? t('Save changes') : t('Add event')}</Btn>
        <button onClick={onClose} className="lg-btn lg-btn-glass" style={{ height: 52, padding: '0 22px', flex: 'none' }}>{t('Cancel')}</button>
      </div>
    </div>
  </Sheet>;
}

const lgLabel = { display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 8, fontWeight: 600 };
function LGField({ label, placeholder, value, onChange, icon, flex }) {
  const [foc, setFoc] = useState(false);
  return <div style={{ flex: flex ? 1 : undefined }}>
    {label && <label style={lgLabel}>{label}</label>}
    <div style={{ position: 'relative' }}>
      {icon && <span style={{ position: 'absolute', insetInlineStart: 15, top: '50%', transform: 'translateY(-50%)', color: foc ? 'var(--lg-forest)' : 'var(--text-3)', display: 'flex' }}><Icon name={icon} size={17} /></span>}
      <input value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} onFocus={() => setFoc(true)} onBlur={() => setFoc(false)}
        style={{ width: '100%', boxSizing: 'border-box', height: 48, border: 0, borderRadius: 14, paddingInlineStart: icon ? 42 : 16, paddingInlineEnd: 16,
          fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--lg-ink)', outline: 'none', background: 'var(--lg-panel-strong)', textAlign: 'start',
          boxShadow: foc ? 'inset 0 0 0 1.5px var(--lg-forest), 0 0 0 3px oklch(46% 0.115 158 / 12%)' : 'inset 0 0 0 1px oklch(50% 0.02 60 / 14%)', transition: 'box-shadow .2s' }} />
    </div>
  </div>;
}

Object.assign(window, { DayDetail, AddEventSheet, LGField });
