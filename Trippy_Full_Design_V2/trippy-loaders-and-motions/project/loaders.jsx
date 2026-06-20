/* ════════════════════════════════════════════════════════════════
 *  Trippy — Loader wait-states (themeable)
 *  Each takes { theme:{c1,c2,c3,ink}, speed, size }.
 *  Durations are computed inline so the global speed tweak scales them.
 *  Keyframes live in <LoaderStyles/> (mounted once).
 * ════════════════════════════════════════════════════════════════ */

// keyframes shared by every loader — injected once
function LoaderStyles() {
  return (
    <style>{`
      @keyframes tlSpinCW  { from { transform: rotate(0); }   to { transform: rotate(360deg); } }
      @keyframes tlSpinCCW { from { transform: rotate(360deg); } to { transform: rotate(0); } }
      @keyframes tlHalo    { 0%,100% { transform: scale(.84); opacity:.55; } 50% { transform: scale(1.06); opacity:1; } }
      @keyframes tlDraw    { 0% { stroke-dashoffset: var(--len); } 55% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: 0; } }
      @keyframes tlTravel  { 0% { offset-distance: 0%; opacity:0; } 8% { opacity:1; } 92% { opacity:1; } 100% { offset-distance: 100%; opacity:0; } }
      @keyframes tlPinPop  { 0%,18% { transform: translateY(6px) scale(.4); opacity:0; } 34% { transform: translateY(-3px) scale(1.12); opacity:1; } 46%,100% { transform: translateY(0) scale(1); opacity:1; } }
      @keyframes tlDrop    { 0% { transform: translateY(-58px) scale(.7); opacity:0; }
                             14% { opacity:1; }
                             46% { transform: translateY(0) scale(1); }
                             56% { transform: translateY(-4px) scaleY(1.08) scaleX(.94); }
                             66% { transform: translateY(0) scaleY(.94) scaleX(1.06); }
                             76% { transform: translateY(0) scale(1); }
                             100% { transform: translateY(0) scale(1); opacity:1; } }
      @keyframes tlSync    { 0%,70%,100% { transform: scale(.66); opacity:.35; }
                             18% { transform: scale(1.18); opacity:1; }
                             40% { transform: scale(1); opacity:.9; } }
      @keyframes tlSyncRing{ 0% { transform: scale(.6); opacity:.7; } 60%,100% { transform: scale(1.7); opacity:0; } }
      @keyframes tlArc     { 0% { stroke-dashoffset: var(--len); } 70%,100% { stroke-dashoffset: 0; } }
      @keyframes tlTwinkle { 0%,100% { transform: scale(.5) rotate(-8deg); opacity:.25; } 50% { transform: scale(1) rotate(0); opacity:1; } }
      @keyframes tlShimmer { 0% { transform: translateX(-130%); } 100% { transform: translateX(230%); } }
      @keyframes tlFloat   { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
      @keyframes tlDots    { 0%,80%,100% { opacity:.25; transform: translateY(0); } 40% { opacity:1; transform: translateY(-4px); } }
    `}</style>
  );
}

// ── 1 · Compass — the signature multi-orbit mark ──────────────────
function CompassLoader({ theme, speed = 1, size = 124 }) {
  const t = theme, d = (s) => (s / speed) + 's';
  const orbit = (r, dash, color, dur, dir, w, op) => (
    <svg viewBox="0 0 200 200" style={{ position: 'absolute', inset: 0, overflow: 'visible',
      animation: `${dir} ${d(dur)} linear infinite`, transformOrigin: '50% 50%' }}>
      <circle cx="100" cy="100" r={r} fill="none" stroke={color} strokeWidth={w}
        strokeDasharray={dash} strokeLinecap="round" opacity={op} />
    </svg>
  );
  return (
    <div style={{ width: size, height: size, position: 'relative' }} role="status" aria-label="Loading">
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%',
        background: `radial-gradient(circle at 50% 50%, ${t.c2}38 0%, ${t.c2}18 30%, transparent 60%)`,
        animation: `tlHalo ${d(2.8)} ease-in-out infinite` }} />
      {orbit(96, '170 433', t.c1, 9, 'tlSpinCCW', 1, 0.35)}
      {orbit(92, '120 84 18 357', t.c2, 5.4, 'tlSpinCW', 1.5, 0.8)}
      {orbit(84, '58 38 22 410', t.c3, 3.6, 'tlSpinCCW', 1.5, 0.9)}
      {orbit(76, '44 60 18 356', t.c1, 2.4, 'tlSpinCW', 2, 0.92)}
      {/* leading dot on the fast orbit */}
      <svg viewBox="0 0 200 200" style={{ position: 'absolute', inset: 0, overflow: 'visible',
        animation: `tlSpinCW ${d(2.4)} linear infinite`, transformOrigin: '50% 50%' }}>
        <circle cx="176" cy="100" r="3.6" fill={t.c1} />
      </svg>
      {/* the compass mark, slow full-color spin */}
      <svg viewBox="0 0 240 240" style={{ position: 'absolute', inset: 0, overflow: 'visible',
        animation: `tlSpinCW ${d(6)} linear infinite`, transformOrigin: '50% 50%' }}>
        <circle cx="120" cy="120" r="62" fill="none" stroke={t.ink} strokeWidth="3.5" opacity="0.92" />
        <path d="M120 64 L134 120 L120 123 L106 120 Z" fill={t.c2} />
        <path d="M120 176 L106 120 L120 117 L134 120 Z" fill={t.c1} />
        <path d="M176 120 L120 106 L117 120 L120 134 Z" fill={t.c3} />
        <path d="M64 120 L120 134 L123 120 L120 106 Z" fill={t.c3} />
        <circle cx="120" cy="120" r="5.5" fill={t.ink} />
      </svg>
    </div>
  );
}

// ── 2 · Route — drawing a path between two pins ───────────────────
const ROUTE_PATH = 'M26 86 C 60 30, 96 124, 130 70 S 178 26, 190 34';
function Pin({ x, y, color, duration, delayStr }) {
  return (
    <g style={{ transformOrigin: `${x}px ${y}px`, animation: `tlPinPop ${duration} ${delayStr} ease-in-out infinite` }}>
      <path d={`M${x} ${y} c -8 -10 -8 -19 0 -25 c 8 -6 16 0 16 9 c 0 7 -7 12 -16 16 Z`}
        transform={`rotate(45 ${x} ${y})`} fill={color} opacity="0" style={{ display: 'none' }} />
      <path d={`M${x} ${y - 2} a 8.5 8.5 0 1 1 0.01 0 Z`} fill="none" />
      <path d={`M${x} ${y} C ${x - 8} ${y - 12} ${x - 8} ${y - 23} ${x} ${y - 29} C ${x + 8} ${y - 23} ${x + 8} ${y - 12} ${x} ${y} Z`} fill={color} />
      <circle cx={x} cy={y - 19} r="4.5" fill="#FBF7F0" />
    </g>
  );
}
function RouteLoader({ theme, speed = 1, size = 124 }) {
  const t = theme, d = (s) => (s / speed) + 's';
  return (
    <div style={{ width: size, height: size * 0.72, position: 'relative' }} role="status" aria-label="Loading">
      <svg viewBox="0 0 216 116" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        {/* faint full track */}
        <path d={ROUTE_PATH} fill="none" stroke={t.ink} strokeWidth="2" strokeDasharray="2 7"
          strokeLinecap="round" opacity="0.18" />
        {/* drawing route */}
        <path d={ROUTE_PATH} fill="none" stroke={t.c1} strokeWidth="3" strokeLinecap="round"
          style={{ '--len': 320, strokeDasharray: 320, animation: `tlDraw ${d(3.4)} cubic-bezier(.45,0,.2,1) infinite` }} />
        <Pin x={26} y={86} color={t.c1} duration={d(3.4)} delayStr={d(0)} />
        <Pin x={190} y={34} color={t.c2} duration={d(3.4)} delayStr={d(1.7)} />
      </svg>
      {/* traveler riding the path */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: 11, height: 11, marginLeft: -5.5, marginTop: -5.5,
          borderRadius: '50%', background: t.c2, boxShadow: `0 0 0 4px ${t.c2}33`,
          offsetPath: `path('${ROUTE_PATH}')`, animation: `tlTravel ${d(3.4)} cubic-bezier(.5,0,.3,1) infinite` }} />
      </div>
    </div>
  );
}

// ── 3 · Pack — stamps dropping into the bag ───────────────────────
function PackLoader({ theme, speed = 1, size = 124 }) {
  const t = theme, d = (s) => (s / speed) + 's';
  const cs = [t.c1, t.c2, t.c3];
  return (
    <div style={{ width: size, height: size, position: 'relative', display: 'flex',
      alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 6 }} role="status" aria-label="Loading">
      {/* dropping discs */}
      <div style={{ position: 'absolute', top: 4, left: 0, right: 0, display: 'flex',
        justifyContent: 'center', gap: 12 }}>
        {cs.map((c, i) => (
          <span key={i} style={{ width: 20, height: 20, borderRadius: '50%', background: c,
            border: `1.5px solid ${t.ink}22`, boxShadow: `inset 0 1px 0 #ffffff66`,
            animation: `tlDrop ${d(2.4)} ${d(i * 0.42)} cubic-bezier(.4,0,.2,1) infinite` }} />
        ))}
      </div>
      {/* the open bag / tray */}
      <svg viewBox="0 0 120 64" style={{ width: size * 0.82, height: size * 0.45, position: 'relative' }}>
        <path d="M14 14 H106 a6 6 0 0 1 6 6 l-6 34 a8 8 0 0 1 -8 7 H22 a8 8 0 0 1 -8 -7 L8 20 a6 6 0 0 1 6 -6 Z"
          fill="#FBF7F0" stroke={t.ink} strokeWidth="2.4" strokeLinejoin="round" opacity="0.96" />
        <path d="M40 14 c0 -10 8 -16 20 -16 c12 0 20 6 20 16" fill="none" stroke={t.ink}
          strokeWidth="2.4" strokeLinecap="round" />
        <path d="M9 24 H111" stroke={t.ink} strokeWidth="2" opacity="0.25" />
      </svg>
    </div>
  );
}

// ── 4 · Sync — the crew saving together ───────────────────────────
function SyncLoader({ theme, speed = 1, size = 124 }) {
  const t = theme, d = (s) => (s / speed) + 's';
  const cs = [t.c1, t.c2, t.c3, t.c1];
  const n = 4, gap = 30, startX = 24, y = 40;
  return (
    <div style={{ width: size, height: size * 0.66, position: 'relative' }} role="status" aria-label="Loading">
      <svg viewBox="0 0 132 76" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        {/* connecting arc that fills */}
        <path d={`M${startX} ${y} H${startX + gap * (n - 1)}`} stroke={t.ink} strokeWidth="2"
          strokeLinecap="round" opacity="0.16" />
        <path d={`M${startX} ${y} H${startX + gap * (n - 1)}`} stroke={t.c1} strokeWidth="2.4" strokeLinecap="round"
          style={{ '--len': gap * (n - 1), strokeDasharray: gap * (n - 1), animation: `tlArc ${d(2.6)} ease-in-out infinite` }} />
        {cs.map((c, i) => {
          const x = startX + gap * i;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="9" fill={c} opacity="0.25"
                style={{ transformOrigin: `${x}px ${y}px`, animation: `tlSyncRing ${d(2.6)} ${d(i * 0.42)} ease-out infinite` }} />
              <g style={{ transformOrigin: `${x}px ${y}px`, animation: `tlSync ${d(2.6)} ${d(i * 0.42)} ease-in-out infinite` }}>
                <circle cx={x} cy={y} r="9.5" fill={c} stroke="#FBF7F0" strokeWidth="2" />
                <circle cx={x} cy={y - 3} r="3" fill="#FBF7F0" />
                <path d={`M${x - 4.5} ${y + 6} a4.5 4 0 0 1 9 0`} fill="#FBF7F0" />
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── 5 · Sparkle — Trippy is thinking (AI) ─────────────────────────
const SPARK = 'M11 3l1.4 5.6L18 10l-5.6 1.4L11 17l-1.4-5.6L4 10l5.6-1.4z';
function SparkleLoader({ theme, speed = 1, size = 124 }) {
  const t = theme, d = (s) => (s / speed) + 's';
  return (
    <div style={{ width: size, height: size, position: 'relative', display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }} role="status" aria-label="Loading">
      <div style={{ position: 'relative', width: 70, height: 56, animation: `tlFloat ${d(3)} ease-in-out infinite` }}>
        <svg viewBox="0 0 22 20" width="46" height="42" style={{ position: 'absolute', left: 12, top: 6,
          animation: `tlTwinkle ${d(1.8)} ease-in-out infinite`, transformOrigin: '11px 10px' }}>
          <path d={SPARK} fill={t.c1} />
        </svg>
        <svg viewBox="0 0 22 20" width="22" height="20" style={{ position: 'absolute', left: 0, top: 0,
          animation: `tlTwinkle ${d(1.8)} ${d(0.5)} ease-in-out infinite`, transformOrigin: '11px 10px' }}>
          <path d={SPARK} fill={t.c2} />
        </svg>
        <svg viewBox="0 0 22 20" width="16" height="15" style={{ position: 'absolute', right: 0, top: 18,
          animation: `tlTwinkle ${d(1.8)} ${d(0.9)} ease-in-out infinite`, transformOrigin: '11px 10px' }}>
          <path d={SPARK} fill={t.c3} />
        </svg>
      </div>
      {/* shimmer pill */}
      <div style={{ width: size * 0.6, height: 8, borderRadius: 99, background: `${t.ink}14`,
        position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, bottom: 0, width: '45%', borderRadius: 99,
          background: `linear-gradient(90deg, transparent, ${t.c1}, transparent)`,
          animation: `tlShimmer ${d(1.6)} ease-in-out infinite` }} />
      </div>
    </div>
  );
}

const LOADERS = [
  { key: 'compass', name: 'Compass',  comp: CompassLoader, blurb: 'Signature multi-orbit wait state.' },
  { key: 'route',   name: 'Route',    comp: RouteLoader,   blurb: 'Charting the path between stops.' },
  { key: 'pack',    name: 'Packing',  comp: PackLoader,    blurb: 'Stamps dropping into the bag.' },
  { key: 'sync',    name: 'Syncing',  comp: SyncLoader,    blurb: 'The crew saving together.' },
  { key: 'sparkle', name: 'Thinking', comp: SparkleLoader, blurb: 'Trippy generating a plan.' },
];

Object.assign(window, { LoaderStyles, CompassLoader, RouteLoader, PackLoader, SyncLoader, SparkleLoader, LOADERS });
