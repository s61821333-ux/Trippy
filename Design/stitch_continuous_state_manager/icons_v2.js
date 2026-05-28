/* ════════════════════════════════════════════════════════════
 *  Trippy Brand Assets — v2 icon data
 *  Compass-emblem language: circular ring + flat-filled brand
 *  shapes (no internal strokes, no monochrome line icons).
 *
 *  Coords: 80×80 viewBox. Ring: cx=40 cy=40 r=33 stroke=2.5.
 *  Brand palette:
 *    forest #3B6E52  · terra #C4714A  · gold #C8944A
 *    paper  #F4EFE8  · ink   #1A1410  · forest-lt #8BB39A
 *    success #2E7D55 · danger #C0392B · cyan #1E91AF
 * ════════════════════════════════════════════════════════════ */

// Ring helper — every UI emblem starts with this.
const RING = `<circle cx="40" cy="40" r="33" fill="none" stroke="#1A1410" stroke-width="2.5"/>`;

// ─── 28 UI emblems ────────────────────────────────────────
const UI_EMBLEMS = [
  { key:'home', role:'Nav · home', svg: RING + `
    <path d="M22 42 L40 24 L58 42 V58 a1 1 0 0 1 -1 1 H23 a1 1 0 0 1 -1 -1 Z" fill="#3B6E52"/>
    <rect x="35" y="44" width="10" height="15" fill="#C4714A"/>
    <rect x="26" y="44" width="6" height="6" fill="#C8944A"/>
    <circle cx="40" cy="51" r="0.8" fill="#1A1410"/>` },

  { key:'calendar', role:'Nav · planner', svg: RING + `
    <rect x="22" y="26" width="36" height="30" rx="2" fill="#F4EFE8" stroke="#1A1410" stroke-width="1.5"/>
    <rect x="22" y="26" width="36" height="8" fill="#C4714A"/>
    <circle cx="29" cy="42" r="2" fill="#3B6E52"/>
    <circle cx="40" cy="42" r="2" fill="#1A1410"/>
    <circle cx="51" cy="42" r="2" fill="#3B6E52"/>
    <circle cx="29" cy="50" r="2" fill="#1A1410"/>
    <circle cx="40" cy="50" r="2.8" fill="#C8944A"/>
    <circle cx="51" cy="50" r="2" fill="#1A1410"/>` },

  { key:'checklist', role:'Nav · supplies', svg: RING + `
    <circle cx="28" cy="30" r="4" fill="#3B6E52"/>
    <path d="M25.5 30 L27.5 32 L31 28" stroke="#F4EFE8" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="36" y="29" width="20" height="2.5" rx="1" fill="#1A1410"/>
    <circle cx="28" cy="42" r="4" fill="#C4714A"/>
    <path d="M25.5 42 L27.5 44 L31 40" stroke="#F4EFE8" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="36" y="41" width="20" height="2.5" rx="1" fill="#1A1410"/>
    <circle cx="28" cy="54" r="4" fill="#C8944A"/>
    <path d="M25.5 54 L27.5 56 L31 52" stroke="#F4EFE8" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="36" y="53" width="14" height="2.5" rx="1" fill="#1A1410"/>` },

  { key:'settings', role:'Nav · settings', svg: RING + `
    <path d="M40 16 L43 28 L40 29 L37 28 Z" fill="#C8944A"/>
    <path d="M40 64 L37 52 L40 51 L43 52 Z" fill="#C8944A"/>
    <path d="M64 40 L52 37 L51 40 L52 43 Z" fill="#C8944A"/>
    <path d="M16 40 L28 43 L29 40 L28 37 Z" fill="#C8944A"/>
    <circle cx="40" cy="40" r="11" fill="#3B6E52"/>
    <circle cx="40" cy="40" r="4" fill="#F4EFE8"/>` },

  { key:'plus', role:'Action · add', svg: `
    <circle cx="40" cy="40" r="33" fill="#C4714A"/>
    <rect x="36" y="22" width="8" height="36" rx="2" fill="#F4EFE8"/>
    <rect x="22" y="36" width="36" height="8" rx="2" fill="#F4EFE8"/>` },

  { key:'chevR', role:'Navigate forward', svg: `
    <circle cx="40" cy="40" r="33" fill="#3B6E52"/>
    <path d="M32 22 L50 40 L32 58 L38 40 Z" fill="#F4EFE8"/>` },

  { key:'chevL', role:'Navigate back', svg: `
    <circle cx="40" cy="40" r="33" fill="#3B6E52"/>
    <path d="M48 22 L30 40 L48 58 L42 40 Z" fill="#F4EFE8"/>` },

  { key:'share', role:'Action · share', svg: RING + `
    <rect x="36" y="34" width="8" height="20" fill="#3B6E52"/>
    <path d="M26 36 L40 20 L54 36 Z" fill="#3B6E52"/>
    <rect x="22" y="56" width="36" height="3" rx="1" fill="#1A1410"/>` },

  { key:'map', role:'Map · location', svg: RING + `
    <path d="M20 30 L32 26 L32 56 L20 60 Z" fill="#3B6E52"/>
    <path d="M32 26 L48 30 L48 60 L32 56 Z" fill="#C8944A"/>
    <path d="M48 30 L60 26 L60 56 L48 60 Z" fill="#C4714A"/>
    <circle cx="42" cy="42" r="3" fill="#F4EFE8"/>
    <circle cx="42" cy="42" r="1.5" fill="#1A1410"/>` },

  { key:'sparkle', role:'AI · suggest', svg: RING + `
    <path d="M40 16 L43 35 L62 40 L43 45 L40 64 L37 45 L18 40 L37 35 Z" fill="#C8944A"/>
    <path d="M56 22 L57 26 L61 27 L57 28 L56 32 L55 28 L51 27 L55 26 Z" fill="#C4714A"/>
    <circle cx="40" cy="40" r="2.5" fill="#1A1410"/>` },

  { key:'trash', role:'Destructive', svg: RING + `
    <rect x="26" y="30" width="28" height="4" rx="1" fill="#C0392B"/>
    <rect x="34" y="24" width="12" height="6" rx="1" fill="#C0392B"/>
    <path d="M28 34 H52 V56 a3 3 0 0 1 -3 3 H31 a3 3 0 0 1 -3 -3 Z" fill="#C4714A"/>
    <line x1="35" y1="40" x2="35" y2="53" stroke="#F4EFE8" stroke-width="1.8" stroke-linecap="round"/>
    <line x1="40" y1="40" x2="40" y2="53" stroke="#F4EFE8" stroke-width="1.8" stroke-linecap="round"/>
    <line x1="45" y1="40" x2="45" y2="53" stroke="#F4EFE8" stroke-width="1.8" stroke-linecap="round"/>` },

  { key:'edit', role:'Action · edit', svg: RING + `
    <path d="M22 58 L26 46 L46 26 L54 34 L34 54 L22 58 Z" fill="#C8944A"/>
    <path d="M46 26 L50 22 L58 30 L54 34 Z" fill="#C4714A"/>
    <path d="M22 58 L26 56 L24 54 Z" fill="#1A1410"/>` },

  { key:'x', role:'Dismiss · close', svg: `
    <circle cx="40" cy="40" r="33" fill="#1A1410"/>
    <path d="M28 28 L52 52 M52 28 L28 52" stroke="#F4EFE8" stroke-width="5" stroke-linecap="round"/>` },

  { key:'check', role:'Confirm · save', svg: `
    <circle cx="40" cy="40" r="33" fill="#2E7D55"/>
    <path d="M25 40 L36 51 L55 30" stroke="#F4EFE8" stroke-width="5.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` },

  { key:'sun', role:'Weather · sun', svg: RING + `
    <circle cx="40" cy="40" r="10" fill="#C8944A"/>
    <path d="M40 16 L42 24 L40 25 L38 24 Z" fill="#C8944A"/>
    <path d="M40 64 L38 56 L40 55 L42 56 Z" fill="#C8944A"/>
    <path d="M64 40 L56 38 L55 40 L56 42 Z" fill="#C8944A"/>
    <path d="M16 40 L24 42 L25 40 L24 38 Z" fill="#C8944A"/>
    <circle cx="40" cy="40" r="3" fill="#C4714A"/>` },

  { key:'wind', role:'Weather · wind', svg: RING + `
    <path d="M22 28 H44 a4 4 0 0 0 0 -8" fill="none" stroke="#3B6E52" stroke-width="4" stroke-linecap="round"/>
    <path d="M22 40 H52 a5 5 0 0 1 0 10" fill="none" stroke="#3B6E52" stroke-width="4" stroke-linecap="round"/>
    <path d="M22 52 H40 a4 4 0 0 0 0 8" fill="none" stroke="#C4714A" stroke-width="4" stroke-linecap="round"/>` },

  { key:'lock', role:'Private · trip', svg: RING + `
    <path d="M30 36 a10 10 0 0 1 20 0 V44 H46 V36 a6 6 0 0 0 -12 0 V44 H30 Z" fill="#1A1410"/>
    <rect x="26" y="40" width="28" height="22" rx="2" fill="#C8944A"/>
    <circle cx="40" cy="48" r="2.5" fill="#1A1410"/>
    <rect x="38.7" y="48" width="2.6" height="7" fill="#1A1410"/>` },

  { key:'pin', role:'Location · place', svg: RING + `
    <path d="M40 18 a14 14 0 0 1 14 14 c0 12 -14 28 -14 28 s -14 -16 -14 -28 a14 14 0 0 1 14 -14 Z" fill="#C4714A"/>
    <circle cx="40" cy="32" r="5.5" fill="#F4EFE8"/>
    <circle cx="40" cy="32" r="2" fill="#C4714A"/>` },

  { key:'download', role:'Export · save', svg: `
    <circle cx="40" cy="40" r="33" fill="#3B6E52"/>
    <rect x="36" y="20" width="8" height="20" fill="#F4EFE8"/>
    <path d="M28 38 L40 54 L52 38 Z" fill="#F4EFE8"/>
    <rect x="22" y="56" width="36" height="4" rx="1" fill="#F4EFE8"/>` },

  { key:'compass', role:'Explore · navigate', svg: RING + `
    <path d="M40 18 L43 38 L40 39 L37 38 Z" fill="#C4714A"/>
    <path d="M40 62 L37 42 L40 41 L43 42 Z" fill="#3B6E52"/>
    <path d="M62 40 L42 37 L41 40 L42 43 Z" fill="#C8944A"/>
    <path d="M18 40 L38 43 L39 40 L38 37 Z" fill="#C8944A"/>
    <circle cx="40" cy="40" r="2.5" fill="#1A1410"/>` },

  { key:'tent', role:'Trip · type', svg: RING + `
    <path d="M40 22 L58 56 H22 Z" fill="#3B6E52"/>
    <line x1="40" y1="22" x2="40" y2="56" stroke="#1A1410" stroke-width="2"/>
    <path d="M40 56 L34 48 L40 40 L46 48 Z" fill="#C4714A"/>
    <path d="M22 22 L24 19 M58 22 L56 19" stroke="#1A1410" stroke-width="2" stroke-linecap="round"/>` },

  { key:'water', role:'Supply · water', svg: RING + `
    <path d="M40 18 C30 30 24 42 24 50 a16 16 0 0 0 32 0 c0 -8 -6 -20 -16 -32 Z" fill="#1E91AF"/>
    <ellipse cx="33" cy="46" rx="3" ry="6" fill="#F4EFE8" opacity="0.55"/>` },

  { key:'calExport', role:'Export · iCal', svg: RING + `
    <rect x="16" y="26" width="28" height="28" rx="2" fill="#F4EFE8" stroke="#1A1410" stroke-width="1.5"/>
    <rect x="16" y="26" width="28" height="6" fill="#C4714A"/>
    <circle cx="24" cy="42" r="2" fill="#3B6E52"/>
    <circle cx="32" cy="42" r="2" fill="#1A1410"/>
    <circle cx="40" cy="42" r="2.5" fill="#C8944A"/>
    <path d="M48 40 H62 M56 34 L62 40 L56 46" stroke="#3B6E52" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` },

  { key:'user', role:'Profile · auth', svg: RING + `
    <circle cx="40" cy="32" r="9" fill="#C4714A"/>
    <path d="M20 62 a20 20 0 0 1 40 0 Z" fill="#3B6E52"/>
    <circle cx="40" cy="62" r="3" fill="#C8944A"/>` },

  { key:'search', role:'Find · search', svg: RING + `
    <circle cx="34" cy="34" r="13" fill="none" stroke="#3B6E52" stroke-width="4"/>
    <circle cx="34" cy="34" r="6" fill="#C8944A"/>
    <rect x="45" y="44" width="4" height="14" rx="2" fill="#C4714A" transform="rotate(-45 47 51)"/>` },

  { key:'filter', role:'Sort · filter', svg: RING + `
    <path d="M22 24 H58 L46 42 V60 L34 56 V42 Z" fill="#C8944A"/>
    <line x1="22" y1="24" x2="58" y2="24" stroke="#1A1410" stroke-width="2"/>` },

  { key:'ai', role:'AI · feature', svg: `
    <circle cx="40" cy="40" r="33" fill="#C8944A"/>
    <path d="M44 16 L24 42 H36 L32 64 L52 36 H40 Z" fill="#1A1410"/>
    <circle cx="58" cy="22" r="2.5" fill="#F4EFE8"/>
    <circle cx="22" cy="56" r="1.8" fill="#F4EFE8"/>
    <circle cx="62" cy="56" r="1.4" fill="#F4EFE8"/>` },

  { key:'clock', role:'Time · duration', svg: RING + `
    <circle cx="40" cy="40" r="20" fill="#F4EFE8" stroke="#1A1410" stroke-width="1.5"/>
    <circle cx="40" cy="24" r="1.5" fill="#1A1410"/>
    <circle cx="56" cy="40" r="1.5" fill="#1A1410"/>
    <circle cx="40" cy="56" r="1.5" fill="#1A1410"/>
    <circle cx="24" cy="40" r="1.5" fill="#1A1410"/>
    <line x1="40" y1="40" x2="40" y2="28" stroke="#1A1410" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="40" y1="40" x2="52" y2="40" stroke="#C4714A" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="40" cy="40" r="2.2" fill="#1A1410"/>` },
];

// ─── 8 Event seals ────────────────────────────────────────
const EVENT_SEALS = [
  { key:'food', label:'Food', color:'#C8781E', chipBg:'rgba(200,120,30,0.12)', svg: `
    <circle cx="40" cy="40" r="38" fill="#C8781E"/>
    <circle cx="40" cy="40" r="34" fill="none" stroke="#9c5c10" stroke-width="1" opacity="0.5"/>
    <path d="M26 18 V30 c0 2 1 3 3 3 V63 H33 V33 c2 0 3 -1 3 -3 V18 H34 V28 H32 V18 H30 V28 H28 V18 Z" fill="#F4EFE8"/>
    <path d="M50 18 c-3 3 -4 9 -4 14 v4 h4 V63 H53 V36 h2 V20 c0 -1 -1 -2 -5 -2 Z" fill="#F4EFE8"/>` },

  { key:'cafe', label:'Café', color:'#A0641E', chipBg:'rgba(160,100,30,0.12)', svg: `
    <circle cx="40" cy="40" r="38" fill="#A0641E"/>
    <circle cx="40" cy="40" r="34" fill="none" stroke="#774816" stroke-width="1" opacity="0.5"/>
    <path d="M22 36 H54 V48 a8 8 0 0 1 -8 8 H30 a8 8 0 0 1 -8 -8 Z" fill="#F4EFE8"/>
    <path d="M54 40 a4 4 0 0 1 0 8" fill="none" stroke="#F4EFE8" stroke-width="3"/>
    <ellipse cx="38" cy="60" rx="22" ry="3" fill="#F4EFE8"/>
    <path d="M30 26 q2 -3 0 -7" stroke="#F4EFE8" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M38 28 q2 -3 0 -7" stroke="#F4EFE8" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M46 26 q2 -3 0 -7" stroke="#F4EFE8" stroke-width="2" fill="none" stroke-linecap="round"/>` },

  { key:'attraction', label:'Sight', color:'#1E91AF', chipBg:'rgba(30,145,175,0.12)', svg: `
    <circle cx="40" cy="40" r="38" fill="#1E91AF"/>
    <circle cx="40" cy="40" r="34" fill="none" stroke="#176d83" stroke-width="1" opacity="0.5"/>
    <path d="M40 12 a16 16 0 0 1 16 16 c0 14 -16 32 -16 32 s -16 -18 -16 -32 a16 16 0 0 1 16 -16 Z" fill="#F4EFE8"/>
    <circle cx="40" cy="28" r="6" fill="#1E91AF"/>
    <circle cx="40" cy="28" r="2.5" fill="#F4EFE8"/>` },

  { key:'hotel', label:'Hotel', color:'#A03CB4', chipBg:'rgba(160,60,180,0.11)', svg: `
    <circle cx="40" cy="40" r="38" fill="#A03CB4"/>
    <circle cx="40" cy="40" r="34" fill="none" stroke="#762d87" stroke-width="1" opacity="0.5"/>
    <rect x="38" y="13" width="4" height="6" fill="#C8944A"/>
    <rect x="22" y="20" width="36" height="44" rx="2" fill="#F4EFE8"/>
    <rect x="27" y="26" width="5" height="5" fill="#A03CB4"/><rect x="34.5" y="26" width="5" height="5" fill="#A03CB4"/><rect x="42" y="26" width="5" height="5" fill="#A03CB4"/><rect x="49.5" y="26" width="5" height="5" fill="#A03CB4"/>
    <rect x="27" y="34" width="5" height="5" fill="#A03CB4"/><rect x="34.5" y="34" width="5" height="5" fill="#A03CB4"/><rect x="42" y="34" width="5" height="5" fill="#A03CB4"/><rect x="49.5" y="34" width="5" height="5" fill="#A03CB4"/>
    <rect x="27" y="42" width="5" height="5" fill="#A03CB4"/><rect x="34.5" y="42" width="5" height="5" fill="#C8944A"/><rect x="42" y="42" width="5" height="5" fill="#A03CB4"/><rect x="49.5" y="42" width="5" height="5" fill="#A03CB4"/>
    <rect x="34" y="52" width="12" height="12" rx="1" fill="#A03CB4"/>
    <circle cx="43" cy="58" r="0.8" fill="#C8944A"/>` },

  { key:'rest', label:'Rest', color:'#28A05A', chipBg:'rgba(40,160,90,0.11)', svg: `
    <circle cx="40" cy="40" r="38" fill="#28A05A"/>
    <circle cx="40" cy="40" r="34" fill="none" stroke="#1c7741" stroke-width="1" opacity="0.5"/>
    <path d="M40 14 L60 58 H20 Z" fill="#F4EFE8"/>
    <line x1="40" y1="14" x2="40" y2="58" stroke="#28A05A" stroke-width="2"/>
    <path d="M40 58 L33 47 L40 38 L47 47 Z" fill="#28A05A"/>
    <circle cx="56" cy="20" r="3" fill="#C8944A"/>` },

  { key:'transport', label:'Drive', color:'#3C64C8', chipBg:'rgba(60,100,200,0.11)', svg: `
    <circle cx="40" cy="40" r="38" fill="#3C64C8"/>
    <circle cx="40" cy="40" r="34" fill="none" stroke="#2a4694" stroke-width="1" opacity="0.5"/>
    <path d="M14 46 L18 32 a4 4 0 0 1 4 -3 H58 a4 4 0 0 1 4 3 L66 46 V54 a2 2 0 0 1 -2 2 H58 V58 H52 V56 H28 V58 H22 V56 H16 a2 2 0 0 1 -2 -2 Z" fill="#F4EFE8"/>
    <path d="M22 44 L25 32 H40 V44 Z" fill="#3C64C8"/>
    <path d="M40 32 H55 L58 44 H40 Z" fill="#3C64C8"/>
    <circle cx="26" cy="56" r="5" fill="#1A1410"/>
    <circle cx="54" cy="56" r="5" fill="#1A1410"/>
    <circle cx="26" cy="56" r="2" fill="#F4EFE8"/>
    <circle cx="54" cy="56" r="2" fill="#F4EFE8"/>
    <circle cx="60" cy="44" r="1.5" fill="#C8944A"/>` },

  { key:'flight', label:'Flight', color:'#1446B4', chipBg:'rgba(20,70,180,0.12)', svg: `
    <circle cx="40" cy="40" r="38" fill="#1446B4"/>
    <circle cx="40" cy="40" r="34" fill="none" stroke="#0d3287" stroke-width="1" opacity="0.5"/>
    <path d="M58 14 L62 18 L46 36 L48 52 L44 54 L36 42 L24 52 L20 50 L26 36 L16 32 L20 28 L30 30 L42 22 Z" fill="#F4EFE8"/>` },

  { key:'other', label:'Other', color:'#B45A32', chipBg:'rgba(180,90,50,0.10)', svg: `
    <circle cx="40" cy="40" r="38" fill="#B45A32"/>
    <circle cx="40" cy="40" r="34" fill="none" stroke="#834124" stroke-width="1" opacity="0.5"/>
    <circle cx="40" cy="40" r="22" fill="none" stroke="#F4EFE8" stroke-width="2"/>
    <path d="M40 18 L44 40 L40 41 L36 40 Z" fill="#F4EFE8"/>
    <path d="M40 62 L36 40 L40 39 L44 40 Z" fill="#F4EFE8"/>
    <path d="M62 40 L40 36 L39 40 L40 44 Z" fill="#F4EFE8"/>
    <path d="M18 40 L40 44 L41 40 L40 36 Z" fill="#F4EFE8"/>
    <circle cx="40" cy="40" r="2.5" fill="#B45A32"/>` },
];

// ─── 6 Supply seals ──────────────────────────────────────
const SUPPLY_SEALS = [
  { key:'water', label:'Water', svg: `
    <circle cx="40" cy="40" r="38" fill="#1E91AF"/>
    <circle cx="40" cy="40" r="34" fill="none" stroke="#176d83" stroke-width="1" opacity="0.5"/>
    <path d="M40 14 C28 28 22 42 22 50 a18 18 0 0 0 36 0 c0 -8 -6 -22 -18 -36 Z" fill="#F4EFE8"/>
    <ellipse cx="32" cy="46" rx="4" ry="8" fill="#1E91AF" opacity="0.3"/>` },

  { key:'food', label:'Food', svg: `
    <circle cx="40" cy="40" r="38" fill="#C8781E"/>
    <circle cx="40" cy="40" r="34" fill="none" stroke="#9c5c10" stroke-width="1" opacity="0.5"/>
    <path d="M18 38 a22 14 0 0 0 44 0 Z" fill="#F4EFE8"/>
    <circle cx="28" cy="32" r="3" fill="#C8781E"/>
    <circle cx="36" cy="29" r="3" fill="#C8781E"/>
    <circle cx="44" cy="31" r="3" fill="#C8781E"/>
    <circle cx="52" cy="32" r="3" fill="#C8781E"/>
    <circle cx="32" cy="35" r="2.5" fill="#A0641E"/>
    <circle cx="40" cy="33" r="2.5" fill="#A0641E"/>
    <circle cx="48" cy="35" r="2.5" fill="#A0641E"/>
    <ellipse cx="40" cy="56" rx="22" ry="2" fill="#1A1410" opacity="0.2"/>` },

  { key:'gear', label:'Gear', svg: `
    <circle cx="40" cy="40" r="38" fill="#3B6E52"/>
    <circle cx="40" cy="40" r="34" fill="none" stroke="#2a4f3b" stroke-width="1" opacity="0.5"/>
    <rect x="24" y="14" width="4" height="14" rx="2" fill="#F4EFE8"/>
    <rect x="52" y="14" width="4" height="14" rx="2" fill="#F4EFE8"/>
    <path d="M20 30 a4 4 0 0 1 4 -4 H56 a4 4 0 0 1 4 4 V58 a4 4 0 0 1 -4 4 H24 a4 4 0 0 1 -4 -4 Z" fill="#F4EFE8"/>
    <line x1="20" y1="34" x2="60" y2="34" stroke="#3B6E52" stroke-width="1.5"/>
    <rect x="26" y="40" width="28" height="16" rx="2" fill="#3B6E52"/>
    <rect x="38" y="46" width="4" height="2" rx="0.5" fill="#F4EFE8"/>
    <rect x="32" y="20" width="16" height="3" rx="1" fill="#C8944A"/>` },

  { key:'medical', label:'Medical', svg: `
    <circle cx="40" cy="40" r="38" fill="#C0392B"/>
    <circle cx="40" cy="40" r="34" fill="none" stroke="#902a20" stroke-width="1" opacity="0.5"/>
    <rect x="35" y="16" width="10" height="6" rx="1" fill="#F4EFE8"/>
    <rect x="18" y="22" width="44" height="38" rx="3" fill="#F4EFE8"/>
    <rect x="36" y="28" width="8" height="26" fill="#C0392B"/>
    <rect x="27" y="37" width="26" height="8" fill="#C0392B"/>
    <rect x="18" y="22" width="44" height="6" fill="#C0392B" opacity="0.18"/>` },

  { key:'documents', label:'Documents', svg: `
    <circle cx="40" cy="40" r="38" fill="#6B5C4E"/>
    <circle cx="40" cy="40" r="34" fill="none" stroke="#4d4338" stroke-width="1" opacity="0.5"/>
    <path d="M20 22 H38 L42 26 H60 V60 H20 Z" fill="#F4EFE8"/>
    <path d="M20 22 H38 L42 26 H60 V32 H20 Z" fill="#C8944A"/>
    <line x1="28" y1="42" x2="52" y2="42" stroke="#6B5C4E" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="28" y1="48" x2="52" y2="48" stroke="#6B5C4E" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="28" y1="54" x2="44" y2="54" stroke="#6B5C4E" stroke-width="2.5" stroke-linecap="round"/>` },

  { key:'other', label:'Other', svg: `
    <circle cx="40" cy="40" r="38" fill="#B45A32"/>
    <circle cx="40" cy="40" r="34" fill="none" stroke="#834124" stroke-width="1" opacity="0.5"/>
    <path d="M30 22 a2 2 0 0 1 2 -2 H48 a2 2 0 0 1 2 2 V30 H46 V24 H34 V30 H30 Z" fill="#F4EFE8"/>
    <rect x="18" y="28" width="44" height="34" rx="3" fill="#F4EFE8"/>
    <line x1="40" y1="32" x2="40" y2="58" stroke="#B45A32" stroke-width="2" stroke-dasharray="3 2"/>
    <rect x="24" y="36" width="10" height="14" rx="1" fill="#B45A32"/>
    <rect x="48" y="36" width="10" height="3" fill="#B45A32"/>
    <rect x="48" y="42" width="10" height="3" fill="#B45A32"/>
    <rect x="48" y="48" width="6" height="3" fill="#B45A32"/>
    <rect x="36" y="22" width="8" height="2" rx="1" fill="#C8944A"/>` },
];

// ─── Emoji palettes ──────────────────────────────────────
const THEMES = [
  { em:'🏜️', label:'Desert',  bg:'#E6B574' },
  { em:'🌲', label:'Nature',  bg:'#8BB39A' },
  { em:'🌆', label:'City',    bg:'#A03CB4' },
  { em:'🏖️', label:'Beach',   bg:'#1E91AF' },
  { em:'🌍', label:'Default', bg:'#C4714A' },
];
const DAYS = [
  { em:'🏙️', label:'City' },     { em:'🗼', label:'Landmark' },  { em:'🌊', label:'Ocean' },
  { em:'🏖️', label:'Beach' },    { em:'🏔️', label:'Mountain' },  { em:'🌲', label:'Forest' },
  { em:'✈️', label:'Flight' },   { em:'🚂', label:'Train' },     { em:'🛳️', label:'Ferry' },
  { em:'🏛️', label:'Museum' },   { em:'🗺️', label:'Explore' },   { em:'🎡', label:'Fun' },
  { em:'🌅', label:'Sunset' },   { em:'❄️', label:'Snow' },      { em:'🍷', label:'Dining' },
  { em:'🎭', label:'Theater' },  { em:'🎨', label:'Art' },       { em:'⛷️', label:'Ski' },
];
const TOUR = [
  { em:'👋', label:'Welcome',       step:1 },
  { em:'🗓️', label:'Planner',       step:2 },
  { em:'🤝', label:'Collaborate',   step:3 },
  { em:'🗺️', label:'Map view',      step:4 },
  { em:'➕', label:'Add events',     step:5 },
  { em:'✨', label:'AI suggest',    step:6 },
  { em:'🎒', label:'Packing',       step:7 },
  { em:'🚀', label:'Ready',         step:8 },
];

window.TRIPPY_V2 = { UI_EMBLEMS, EVENT_SEALS, SUPPLY_SEALS, THEMES, DAYS, TOUR };
