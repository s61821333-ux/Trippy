/* ════════════════════════════════════════════════════════════
 *  Trippy — Illustrated Icon Atlas (stamp/seal system)
 *
 *  Every icon is a COLORED CIRCULAR STAMP — a saturated brand
 *  hue forms the disc, an optional paper ring echoes the
 *  compass mark, and an illustrated symbol sits on top.
 *
 *  Data shape:  { key, bg, sym }
 *    bg  → fill color of the 38r disc (hex)
 *    sym → inner SVG markup (drawn over the disc, 80×80 space)
 *
 *  The renderer composes:
 *    <svg 80×80>
 *      <circle r=38 fill={bg}/>
 *      <circle r=34 stroke=paper width=1 opacity=.35/>
 *      {sym}
 *    </svg>
 *
 *  Stamp palette (cycles through chapters):
 *    forest #3B6E52  forest-dk #2B5340  forest-lt #6FB89A   sage #8BB39A
 *    terra  #C4714A  brick #9C3F2C      coral #E05A3A       rust #B45A32
 *    gold   #C8944A  amber #C8781E      butter #E8C46E      sun  #D4A017
 *    rose   #D4517A  berry #A03CB4      plum #6E4163        lavender #8A6ABE
 *    sky    #5BB4D2  cyan  #1E91AF      navy #2A4894        deep #1446B4
 *    olive  #7A8447  moss  #5A8047      ink #1A1410         paper #F4EFE8
 * ════════════════════════════════════════════════════════════ */

const PAPER='#F4EFE8', INK='#1A1410';

const ATLAS = [

/* ╔════ 01 · Wayfinding ════════════════════════════════════╗ */
{ chapter:'Wayfinding', accent:'#C4714A',
  lede:'Compasses, pins, and the geometry of being somewhere new.',
  icons: [
    { key:'compass', bg:'#C4714A', sym:`
      <circle cx="40" cy="40" r="26" fill="#F4EFE8"/>
      <path d="M40 16 L46 38 L40 40 L34 38 Z" fill="#C4714A"/>
      <path d="M40 64 L34 42 L40 40 L46 42 Z" fill="#3B6E52"/>
      <path d="M64 40 L42 46 L40 40 L42 34 Z" fill="#C8944A"/>
      <path d="M16 40 L38 34 L40 40 L38 46 Z" fill="#C8944A"/>
      <circle cx="40" cy="40" r="3" fill="#1A1410"/>`},

    { key:'pin', bg:'#3B6E52', sym:`
      <path d="M40 16 a16 16 0 0 1 16 16 c0 12 -16 32 -16 32 s -16 -20 -16 -32 a16 16 0 0 1 16 -16 Z" fill="#C4714A"/>
      <circle cx="40" cy="32" r="7" fill="#F4EFE8"/>
      <path d="M40 26 L43 32 L40 33 L37 32 Z" fill="#1A1410"/>`},

    { key:'pin_double', bg:'#C8944A', sym:`
      <path d="M28 14 a11 11 0 0 1 11 11 c0 9 -11 22 -11 22 s -11 -13 -11 -22 a11 11 0 0 1 11 -11 Z" fill="#C4714A"/>
      <circle cx="28" cy="25" r="4" fill="#F4EFE8"/>
      <path d="M54 30 a10 10 0 0 1 10 10 c0 8 -10 20 -10 20 s -10 -12 -10 -20 a10 10 0 0 1 10 -10 Z" fill="#3B6E52"/>
      <circle cx="54" cy="40" r="3.5" fill="#F4EFE8"/>`},

    { key:'map', bg:'#E8C46E', sym:`
      <path d="M14 22 L30 18 L50 24 L66 18 V58 L50 64 L30 58 L14 64 Z" fill="#F4EFE8"/>
      <path d="M30 18 V58" stroke="#C4714A" stroke-width="2" stroke-dasharray="3 3"/>
      <path d="M50 24 V64" stroke="#3B6E52" stroke-width="2" stroke-dasharray="3 3"/>
      <circle cx="40" cy="40" r="5" fill="#C4714A"/>
      <circle cx="40" cy="40" r="2" fill="#F4EFE8"/>`},

    { key:'route', bg:'#2B5340', sym:`
      <path d="M22 18 C26 14 32 18 32 26 C32 36 22 38 22 46 C22 54 30 56 38 54 C46 52 56 48 58 56 C60 64 52 64 50 62"
            fill="none" stroke="#E6B574" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 5"/>
      <circle cx="22" cy="18" r="6" fill="#C4714A"/>
      <circle cx="22" cy="18" r="2" fill="#F4EFE8"/>
      <path d="M50 62 a4 4 0 0 1 8 0 c0 4 -4 8 -4 8 s -4 -4 -4 -8 Z" fill="#F4EFE8"/>`},

    { key:'navigation', bg:'#1446B4', sym:`
      <path d="M40 12 L60 62 L40 50 L20 62 Z" fill="#F4EFE8"/>
      <path d="M40 12 L40 50 L20 62 Z" fill="#5BB4D2"/>
      <circle cx="40" cy="40" r="2" fill="#1A1410"/>`},

    { key:'globe', bg:'#1E91AF', sym:`
      <circle cx="40" cy="40" r="24" fill="#5BB4D2"/>
      <path d="M16 38 Q24 32 32 34 Q40 36 46 32 Q54 28 64 30" stroke="#3B6E52" stroke-width="3" fill="none"/>
      <path d="M18 48 Q28 50 38 48 Q48 46 58 50 Q62 51 64 50" stroke="#3B6E52" stroke-width="3" fill="none"/>
      <ellipse cx="40" cy="40" rx="10" ry="24" fill="none" stroke="#F4EFE8" stroke-width="1.5" opacity="0.6"/>
      <path d="M40 16 V64" stroke="#F4EFE8" stroke-width="1.5" opacity="0.6"/>`},

    { key:'satellite', bg:'#2A4894', sym:`
      <rect x="22" y="36" width="14" height="8" rx="1" fill="#E6B574" transform="rotate(-45 29 40)"/>
      <rect x="44" y="36" width="14" height="8" rx="1" fill="#E6B574" transform="rotate(-45 51 40)"/>
      <circle cx="40" cy="40" r="6" fill="#F4EFE8"/>
      <circle cx="40" cy="40" r="3" fill="#C4714A"/>
      <path d="M40 28 V18 M52 40 H62 M28 40 H18 M40 52 V62" stroke="#F4EFE8" stroke-width="1.5" stroke-dasharray="2 3"/>
      <circle cx="40" cy="18" r="2" fill="#D4517A"/>
      <circle cx="62" cy="40" r="2" fill="#D4517A"/>`},

    { key:'crosshair', bg:'#9C3F2C', sym:`
      <circle cx="40" cy="40" r="22" fill="none" stroke="#F4EFE8" stroke-width="2.5"/>
      <circle cx="40" cy="40" r="10" fill="#E6B574"/>
      <circle cx="40" cy="40" r="3" fill="#1A1410"/>
      <line x1="40" y1="14" x2="40" y2="22" stroke="#F4EFE8" stroke-width="3" stroke-linecap="round"/>
      <line x1="40" y1="58" x2="40" y2="66" stroke="#F4EFE8" stroke-width="3" stroke-linecap="round"/>
      <line x1="14" y1="40" x2="22" y2="40" stroke="#F4EFE8" stroke-width="3" stroke-linecap="round"/>
      <line x1="58" y1="40" x2="66" y2="40" stroke="#F4EFE8" stroke-width="3" stroke-linecap="round"/>`},

    { key:'distance', bg:'#7A8447', sym:`
      <circle cx="20" cy="56" r="8" fill="#C4714A"/>
      <circle cx="20" cy="56" r="3" fill="#F4EFE8"/>
      <circle cx="60" cy="24" r="8" fill="#E6B574"/>
      <circle cx="60" cy="24" r="3" fill="#1A1410"/>
      <path d="M22 50 L58 30" stroke="#F4EFE8" stroke-width="2.5" stroke-dasharray="3 3" stroke-linecap="round"/>`},

    { key:'border', bg:'#6E4163', sym:`
      <path d="M16 22 L40 14 L64 22 V58 L40 66 L16 58 Z" fill="#F4EFE8"/>
      <path d="M16 22 L40 14 L64 22 V58 L40 66 L16 58 Z" fill="none" stroke="#1A1410" stroke-width="2" stroke-dasharray="4 3"/>
      <rect x="26" y="32" width="28" height="16" rx="1" fill="#D4517A"/>
      <circle cx="40" cy="40" r="3" fill="#F4EFE8"/>`},

    { key:'layers', bg:'#1A7840', sym:`
      <path d="M40 16 L62 28 L40 40 L18 28 Z" fill="#C4714A"/>
      <path d="M18 38 L40 50 L62 38" stroke="#E6B574" stroke-width="4" fill="none" stroke-linejoin="round"/>
      <path d="M18 50 L40 62 L62 50" stroke="#F4EFE8" stroke-width="4" fill="none" stroke-linejoin="round"/>`},

    { key:'world', bg:'#C8781E', sym:`
      <circle cx="40" cy="40" r="26" fill="#3B6E52"/>
      <path d="M18 38 Q22 32 30 34 L34 30 L42 34 L50 26 L56 30 L60 36 L54 42 L50 40 L46 46 L40 44 L34 50 L26 48 L20 44 Z" fill="#E6B574"/>
      <path d="M44 52 Q50 50 56 54 L54 60 L46 58 Z" fill="#E6B574"/>
      <circle cx="58" cy="22" r="3" fill="#F4EFE8"/>`},

    { key:'wayfinder', bg:'#1A1410', sym:`
      <circle cx="40" cy="40" r="22" fill="#F4EFE8"/>
      <path d="M40 22 L43 40 L40 41 L37 40 Z" fill="#C4714A"/>
      <path d="M40 58 L37 40 L40 39 L43 40 Z" fill="#1A1410"/>
      <text x="37" y="20" font-family="monospace" font-size="6" font-weight="700" fill="#C4714A">N</text>
      <text x="60" y="43" font-family="monospace" font-size="6" font-weight="700" fill="#F4EFE8">E</text>
      <text x="37" y="68" font-family="monospace" font-size="6" font-weight="700" fill="#F4EFE8">S</text>
      <text x="10" y="43" font-family="monospace" font-size="6" font-weight="700" fill="#F4EFE8">W</text>`},

    { key:'sign_post', bg:'#3B6E52', sym:`
      <rect x="38" y="14" width="4" height="56" fill="#6B5C4E"/>
      <path d="M14 22 H50 L56 28 L50 34 H14 Z" fill="#C4714A"/>
      <path d="M66 38 H30 L24 44 L30 50 H66 Z" fill="#E6B574"/>
      <circle cx="40" cy="70" r="4" fill="#1A1410"/>
      <circle cx="22" cy="28" r="1.5" fill="#F4EFE8"/>
      <circle cx="58" cy="44" r="1.5" fill="#1A1410"/>`},

    { key:'address', bg:'#D4517A', sym:`
      <path d="M16 32 L40 14 L64 32 V60 a2 2 0 0 1 -2 2 H18 a2 2 0 0 1 -2 -2 Z" fill="#F4EFE8"/>
      <rect x="34" y="40" width="12" height="22" fill="#C4714A"/>
      <rect x="36" y="42" width="3" height="3" fill="#E6B574"/>
      <rect x="41" y="42" width="3" height="3" fill="#E6B574"/>
      <circle cx="44" cy="52" r="1" fill="#1A1410"/>
      <path d="M40 14 L40 6" stroke="#1A1410" stroke-width="2"/>
      <path d="M40 6 L50 8 L48 12 L40 12 Z" fill="#3B6E52"/>`},
  ]},

/* ╔════ 02 · Transport ════════════════════════════════════╗ */
{ chapter:'Transport', accent:'#2A4894',
  lede:'Twenty-eight ways to leave the front door behind.',
  icons: [
    { key:'plane', bg:'#2A4894', sym:`
      <path d="M40 12 C42 12 44 14 44 20 V34 L66 46 V52 L44 46 V58 L50 62 V66 L40 64 L30 66 V62 L36 58 V46 L14 52 V46 L36 34 V20 C36 14 38 12 40 12 Z" fill="#F4EFE8"/>
      <circle cx="40" cy="22" r="2.5" fill="#E6B574"/>`},

    { key:'plane_takeoff', bg:'#5BB4D2', sym:`
      <path d="M10 60 H68" stroke="#F4EFE8" stroke-width="2" stroke-dasharray="3 3"/>
      <path d="M14 54 L20 36 L28 40 L36 24 L42 28 L62 50 Z" fill="#F4EFE8"/>
      <circle cx="22" cy="40" r="2" fill="#C4714A"/>
      <path d="M28 60 L66 60" stroke="#E6B574" stroke-width="3" stroke-linecap="round"/>`},

    { key:'plane_landing', bg:'#1446B4', sym:`
      <path d="M10 60 H68" stroke="#F4EFE8" stroke-width="2" stroke-dasharray="3 3"/>
      <path d="M66 54 L60 36 L52 40 L44 24 L38 28 L18 50 Z" fill="#F4EFE8"/>
      <circle cx="58" cy="40" r="2" fill="#C4714A"/>
      <path d="M14 60 L50 60" stroke="#E6B574" stroke-width="3" stroke-linecap="round"/>`},

    { key:'helicopter', bg:'#C4714A', sym:`
      <rect x="10" y="20" width="56" height="3" rx="1" fill="#1A1410"/>
      <rect x="34" y="22" width="4" height="8" fill="#1A1410"/>
      <path d="M14 34 C14 30 18 28 24 28 H50 C58 28 62 32 62 38 V46 H46 L40 50 H22 C16 50 14 46 14 42 Z" fill="#F4EFE8"/>
      <circle cx="50" cy="38" r="6" fill="#5BB4D2"/>
      <path d="M52 46 L66 54" stroke="#1A1410" stroke-width="2.5"/>
      <rect x="60" y="50" width="10" height="3" fill="#1A1410"/>`},

    { key:'hot_air_balloon', bg:'#D4517A', sym:`
      <path d="M40 14 C52 14 60 24 60 34 C60 42 56 48 50 52 H30 C24 48 20 42 20 34 C20 24 28 14 40 14 Z" fill="#E8C46E"/>
      <path d="M28 16 C26 28 26 42 30 52" stroke="#9C3F2C" stroke-width="3" fill="none"/>
      <path d="M52 16 C54 28 54 42 50 52" stroke="#9C3F2C" stroke-width="3" fill="none"/>
      <path d="M40 14 C40 28 40 40 40 52" stroke="#9C3F2C" stroke-width="2" fill="none"/>
      <path d="M30 52 L34 58 L46 58 L50 52 Z" fill="#1A1410"/>
      <rect x="32" y="58" width="16" height="10" rx="2" fill="#6B5C4E"/>
      <line x1="34" y1="58" x2="34" y2="68" stroke="#3B6E52" stroke-width="1.5"/>
      <line x1="46" y1="58" x2="46" y2="68" stroke="#3B6E52" stroke-width="1.5"/>`},

    { key:'cable_car', bg:'#3B6E52', sym:`
      <path d="M10 16 L70 12" stroke="#F4EFE8" stroke-width="2"/>
      <line x1="40" y1="14" x2="40" y2="24" stroke="#F4EFE8" stroke-width="2"/>
      <path d="M40 24 L34 26 L34 32 L40 34 L46 32 L46 26 Z" fill="#1A1410"/>
      <rect x="22" y="34" width="36" height="26" rx="3" fill="#E8C46E"/>
      <rect x="26" y="38" width="11" height="10" rx="1" fill="#5BB4D2"/>
      <rect x="43" y="38" width="11" height="10" rx="1" fill="#5BB4D2"/>
      <rect x="22" y="54" width="36" height="6" fill="#C4714A"/>
      <circle cx="28" cy="64" r="2.5" fill="#F4EFE8"/>
      <circle cx="52" cy="64" r="2.5" fill="#F4EFE8"/>`},

    { key:'train', bg:'#C4714A', sym:`
      <path d="M20 16 H60 a4 4 0 0 1 4 4 V50 a6 6 0 0 1 -6 6 H22 a6 6 0 0 1 -6 -6 V20 a4 4 0 0 1 4 -4 Z" fill="#F4EFE8"/>
      <rect x="22" y="22" width="14" height="12" rx="1" fill="#5BB4D2"/>
      <rect x="44" y="22" width="14" height="12" rx="1" fill="#5BB4D2"/>
      <rect x="20" y="38" width="40" height="6" fill="#1A1410"/>
      <circle cx="28" cy="60" r="4.5" fill="#1A1410"/>
      <circle cx="52" cy="60" r="4.5" fill="#1A1410"/>
      <path d="M36 48 H44 V52 H36 Z" fill="#E6B574"/>`},

    { key:'high_speed', bg:'#1446B4', sym:`
      <path d="M14 32 L24 22 H56 a8 8 0 0 1 8 8 V46 H14 Z" fill="#F4EFE8"/>
      <path d="M14 32 L24 22 L24 32 Z" fill="#5BB4D2"/>
      <rect x="28" y="26" width="12" height="8" rx="1" fill="#1446B4"/>
      <rect x="44" y="26" width="14" height="8" rx="1" fill="#1446B4"/>
      <circle cx="26" cy="54" r="4" fill="#1A1410"/>
      <circle cx="54" cy="54" r="4" fill="#1A1410"/>
      <path d="M8 58 L18 58 M8 64 L26 64" stroke="#E6B574" stroke-width="2.5" stroke-linecap="round"/>`},

    { key:'subway', bg:'#1A7840', sym:`
      <path d="M22 16 H58 a6 6 0 0 1 6 6 V52 a6 6 0 0 1 -6 6 H22 a6 6 0 0 1 -6 -6 V22 a6 6 0 0 1 6 -6 Z" fill="#F4EFE8"/>
      <rect x="22" y="22" width="36" height="14" rx="1.5" fill="#5BB4D2"/>
      <line x1="40" y1="22" x2="40" y2="36" stroke="#F4EFE8" stroke-width="2"/>
      <rect x="22" y="40" width="36" height="6" fill="#1A1410"/>
      <circle cx="28" cy="54" r="3.5" fill="#E6B574"/>
      <circle cx="52" cy="54" r="3.5" fill="#E6B574"/>
      <text x="34" y="68" font-family="monospace" font-size="9" fill="#F4EFE8" font-weight="700">M</text>`},

    { key:'tram', bg:'#D4517A', sym:`
      <line x1="10" y1="68" x2="70" y2="68" stroke="#F4EFE8" stroke-width="2"/>
      <path d="M24 16 H56 a4 4 0 0 1 4 4 V50 a4 4 0 0 1 -4 4 H24 a4 4 0 0 1 -4 -4 V20 a4 4 0 0 1 4 -4 Z" fill="#F4EFE8"/>
      <rect x="24" y="20" width="32" height="14" rx="1" fill="#A03CB4"/>
      <line x1="40" y1="16" x2="40" y2="8" stroke="#1A1410" stroke-width="2"/>
      <circle cx="40" cy="6" r="2" fill="#E6B574"/>
      <rect x="24" y="38" width="32" height="6" fill="#1A1410"/>
      <circle cx="30" cy="58" r="3.5" fill="#1A1410"/>
      <circle cx="50" cy="58" r="3.5" fill="#1A1410"/>`},

    { key:'bus', bg:'#C8944A', sym:`
      <path d="M14 22 a4 4 0 0 1 4 -4 H62 a4 4 0 0 1 4 4 V54 a4 4 0 0 1 -4 4 H60 V62 H52 V58 H28 V62 H20 V58 H18 a4 4 0 0 1 -4 -4 Z" fill="#F4EFE8"/>
      <rect x="18" y="24" width="20" height="12" rx="1" fill="#5BB4D2"/>
      <rect x="42" y="24" width="20" height="12" rx="1" fill="#5BB4D2"/>
      <rect x="14" y="40" width="52" height="5" fill="#1A1410"/>
      <circle cx="26" cy="54" r="4" fill="#1A1410"/>
      <circle cx="54" cy="54" r="4" fill="#1A1410"/>
      <rect x="34" y="48" width="12" height="6" rx="1" fill="#C4714A"/>`},

    { key:'taxi', bg:'#1A1410', sym:`
      <rect x="22" y="20" width="36" height="5" fill="#F4EFE8"/>
      <text x="32" y="24" font-family="monospace" font-size="4.5" fill="#1A1410" font-weight="700">TAXI</text>
      <path d="M12 38 L18 28 H62 L68 38 V52 a3 3 0 0 1 -3 3 H58 V60 H50 V55 H30 V60 H22 V55 H15 a3 3 0 0 1 -3 -3 Z" fill="#E8C46E"/>
      <path d="M20 30 L26 38 H54 L60 30 Z" fill="#1A1410" opacity="0.2"/>
      <rect x="20" y="38" width="40" height="5" fill="#1A1410"/>
      <circle cx="26" cy="52" r="3.5" fill="#1A1410"/>
      <circle cx="54" cy="52" r="3.5" fill="#1A1410"/>`},

    { key:'car', bg:'#3B6E52', sym:`
      <path d="M10 44 L16 30 a4 4 0 0 1 4 -3 H60 a4 4 0 0 1 4 3 L70 44 V54 a2 2 0 0 1 -2 2 H62 V60 H54 V56 H26 V60 H18 V56 H12 a2 2 0 0 1 -2 -2 Z" fill="#F4EFE8"/>
      <path d="M20 30 L23 44 H38 V30 Z" fill="#5BB4D2"/>
      <path d="M40 30 L57 30 L60 44 H40 Z" fill="#5BB4D2"/>
      <circle cx="24" cy="54" r="4" fill="#1A1410"/>
      <circle cx="56" cy="54" r="4" fill="#1A1410"/>
      <rect x="60" y="44" width="6" height="3" fill="#C4714A"/>`},

    { key:'ev_car', bg:'#6FB89A', sym:`
      <path d="M10 44 L16 30 a4 4 0 0 1 4 -3 H60 a4 4 0 0 1 4 3 L70 44 V54 a2 2 0 0 1 -2 2 H62 V60 H54 V56 H26 V60 H18 V56 H12 a2 2 0 0 1 -2 -2 Z" fill="#F4EFE8"/>
      <path d="M20 30 L23 44 H38 V30 Z M40 30 L57 30 L60 44 H40 Z" fill="#1A7840" opacity="0.6"/>
      <circle cx="24" cy="54" r="4" fill="#1A1410"/>
      <circle cx="56" cy="54" r="4" fill="#1A1410"/>
      <path d="M44 33 L36 42 H40 L38 50 L48 39 H44 Z" fill="#E6B574"/>`},

    { key:'campervan', bg:'#9C3F2C', sym:`
      <rect x="10" y="22" width="60" height="34" rx="4" fill="#F4EFE8"/>
      <rect x="14" y="26" width="16" height="12" rx="1.5" fill="#5BB4D2"/>
      <rect x="34" y="26" width="32" height="12" rx="1.5" fill="#E6B574"/>
      <path d="M10 40 H70 V44 H10 Z" fill="#C4714A"/>
      <rect x="14" y="46" width="14" height="10" rx="1" fill="#5BB4D2"/>
      <circle cx="22" cy="60" r="4" fill="#1A1410"/>
      <circle cx="58" cy="60" r="4" fill="#1A1410"/>
      <path d="M40 22 L40 16 L52 16 L52 22" fill="#3B6E52"/>`},

    { key:'motorcycle', bg:'#2B5340', sym:`
      <circle cx="22" cy="52" r="9" fill="#1A1410"/>
      <circle cx="22" cy="52" r="3" fill="#E6B574"/>
      <circle cx="58" cy="52" r="9" fill="#1A1410"/>
      <circle cx="58" cy="52" r="3" fill="#E6B574"/>
      <path d="M24 50 L34 32 L48 32 L56 50" stroke="#C4714A" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M30 30 L42 22 L52 26" stroke="#F4EFE8" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <rect x="40" y="34" width="10" height="6" rx="1" fill="#F4EFE8"/>`},

    { key:'scooter', bg:'#A03CB4', sym:`
      <circle cx="22" cy="56" r="7" fill="#1A1410"/>
      <circle cx="22" cy="56" r="2" fill="#F4EFE8"/>
      <circle cx="58" cy="56" r="7" fill="#1A1410"/>
      <circle cx="58" cy="56" r="2" fill="#F4EFE8"/>
      <path d="M22 56 L36 42 L46 42 L58 56" stroke="#F4EFE8" stroke-width="3.5" fill="none"/>
      <path d="M44 42 L48 22" stroke="#F4EFE8" stroke-width="3"/>
      <path d="M44 22 L54 22" stroke="#E6B574" stroke-width="3" stroke-linecap="round"/>
      <rect x="32" y="40" width="14" height="4" fill="#E6B574"/>`},

    { key:'bike', bg:'#7A8447', sym:`
      <circle cx="22" cy="52" r="10" fill="none" stroke="#F4EFE8" stroke-width="3"/>
      <circle cx="58" cy="52" r="10" fill="none" stroke="#F4EFE8" stroke-width="3"/>
      <circle cx="22" cy="52" r="2" fill="#F4EFE8"/>
      <circle cx="58" cy="52" r="2" fill="#F4EFE8"/>
      <path d="M22 52 L36 28 L52 28 L58 52" stroke="#E6B574" stroke-width="3" fill="none"/>
      <path d="M36 28 L42 52" stroke="#E6B574" stroke-width="3"/>
      <path d="M50 24 L58 24" stroke="#F4EFE8" stroke-width="3" stroke-linecap="round"/>`},

    { key:'ebike', bg:'#1A1410', sym:`
      <circle cx="22" cy="52" r="10" fill="#3B6E52"/>
      <circle cx="58" cy="52" r="10" fill="#3B6E52"/>
      <circle cx="22" cy="52" r="3" fill="#E6B574"/>
      <circle cx="58" cy="52" r="3" fill="#E6B574"/>
      <path d="M22 52 L36 28 L52 28 L58 52" stroke="#C4714A" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <path d="M36 28 L42 52" stroke="#C4714A" stroke-width="3.5"/>
      <path d="M28 38 L34 32 L38 38 L34 44 Z" fill="#E6B574"/>`},

    { key:'walk', bg:'#E8C46E', sym:`
      <circle cx="46" cy="16" r="6" fill="#C4714A"/>
      <path d="M42 24 L34 38 L28 50 L24 64 L30 64 L36 52 L42 44 L42 64 L48 64 L50 44 L56 32 L46 26 Z" fill="#3B6E52"/>
      <path d="M50 28 L60 36 L58 42 L46 32 Z" fill="#3B6E52"/>`},

    { key:'run', bg:'#E05A3A', sym:`
      <circle cx="50" cy="16" r="6" fill="#1A1410"/>
      <path d="M44 24 L34 32 L46 38 L40 50 L30 54 L24 60 L32 58 L46 50 L52 60 L46 70 L54 70 L62 56 L54 42 L62 32 L52 26 Z" fill="#F4EFE8"/>
      <path d="M58 32 L66 28" stroke="#1A1410" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M64 30 L62 24" stroke="#1A1410" stroke-width="2.5" stroke-linecap="round"/>`},

    { key:'boat', bg:'#1E91AF', sym:`
      <path d="M40 14 L40 38 L20 38 Z" fill="#F4EFE8"/>
      <path d="M40 18 L58 38 L40 38 Z" fill="#C4714A"/>
      <line x1="40" y1="12" x2="40" y2="38" stroke="#1A1410" stroke-width="2"/>
      <path d="M12 42 H68 L60 56 a4 4 0 0 1 -4 3 H24 a4 4 0 0 1 -4 -3 Z" fill="#3B6E52"/>
      <path d="M14 46 H66" stroke="#1A1410" stroke-width="1.5" opacity="0.4"/>
      <path d="M10 64 Q18 60 26 64 Q34 68 42 64 Q50 60 58 64 Q66 68 70 64" stroke="#F4EFE8" stroke-width="2" fill="none"/>`},

    { key:'yacht', bg:'#2A4894', sym:`
      <path d="M40 14 L40 42 L22 42 Z" fill="#F4EFE8"/>
      <path d="M40 18 L52 42 L40 42 Z" fill="#E6B574"/>
      <line x1="40" y1="12" x2="40" y2="42" stroke="#F4EFE8" stroke-width="2"/>
      <path d="M12 46 H68 V52 H12 Z" fill="#F4EFE8"/>
      <path d="M16 52 H64 L58 62 H22 Z" fill="#1A1410"/>
      <circle cx="24" cy="58" r="1.5" fill="#E6B574"/>
      <circle cx="34" cy="58" r="1.5" fill="#E6B574"/>
      <circle cx="44" cy="58" r="1.5" fill="#E6B574"/>
      <circle cx="54" cy="58" r="1.5" fill="#E6B574"/>`},

    { key:'ferry', bg:'#5BB4D2', sym:`
      <rect x="16" y="20" width="48" height="14" fill="#F4EFE8"/>
      <rect x="16" y="20" width="48" height="4" fill="#C4714A"/>
      <rect x="20" y="26" width="5" height="6" fill="#1A1410"/>
      <rect x="28" y="26" width="5" height="6" fill="#1A1410"/>
      <rect x="36" y="26" width="5" height="6" fill="#1A1410"/>
      <rect x="44" y="26" width="5" height="6" fill="#1A1410"/>
      <rect x="52" y="26" width="5" height="6" fill="#1A1410"/>
      <path d="M10 36 H70 L62 56 a4 4 0 0 1 -4 3 H22 a4 4 0 0 1 -4 -3 Z" fill="#1446B4"/>
      <path d="M8 62 Q16 58 24 62 Q32 66 40 62 Q48 58 56 62 Q64 66 72 62" stroke="#F4EFE8" stroke-width="2" fill="none"/>`},

    { key:'cruise', bg:'#1446B4', sym:`
      <rect x="10" y="40" width="60" height="12" fill="#F4EFE8"/>
      <rect x="16" y="28" width="44" height="12" fill="#F4EFE8"/>
      <rect x="28" y="16" width="20" height="12" fill="#F4EFE8"/>
      <rect x="20" y="30" width="3" height="6" fill="#1A1410"/>
      <rect x="26" y="30" width="3" height="6" fill="#1A1410"/>
      <rect x="32" y="30" width="3" height="6" fill="#1A1410"/>
      <rect x="38" y="30" width="3" height="6" fill="#1A1410"/>
      <rect x="44" y="30" width="3" height="6" fill="#1A1410"/>
      <rect x="50" y="30" width="3" height="6" fill="#1A1410"/>
      <rect x="56" y="30" width="3" height="6" fill="#1A1410"/>
      <rect x="32" y="20" width="3" height="4" fill="#1A1410"/>
      <rect x="38" y="20" width="3" height="4" fill="#1A1410"/>
      <rect x="44" y="20" width="3" height="4" fill="#1A1410"/>
      <rect x="22" y="42" width="3" height="4" fill="#5BB4D2"/>
      <rect x="28" y="42" width="3" height="4" fill="#5BB4D2"/>
      <rect x="36" y="42" width="3" height="4" fill="#5BB4D2"/>
      <rect x="44" y="42" width="3" height="4" fill="#5BB4D2"/>
      <rect x="52" y="42" width="3" height="4" fill="#5BB4D2"/>
      <path d="M8 52 H72 L66 64 H14 Z" fill="#C4714A"/>
      <circle cx="58" cy="12" r="2" fill="#E6B574"/>`},

    { key:'kayak', bg:'#1E91AF', sym:`
      <path d="M12 40 Q40 20 68 40 Q40 60 12 40 Z" fill="#E6B574"/>
      <path d="M16 40 Q40 28 64 40 Q40 52 16 40 Z" fill="#1A1410" opacity="0.2"/>
      <ellipse cx="40" cy="40" rx="6" ry="3" fill="#1A1410"/>
      <path d="M16 20 L22 26 L60 56 L54 62 Z" fill="#C4714A"/>
      <ellipse cx="16" cy="20" rx="6" ry="3" fill="#C4714A" transform="rotate(45 16 20)"/>
      <ellipse cx="60" cy="60" rx="6" ry="3" fill="#C4714A" transform="rotate(45 60 60)"/>`},

    { key:'sailboat', bg:'#E6B574', sym:`
      <path d="M40 12 L40 42 L20 42 Z" fill="#F4EFE8"/>
      <path d="M40 18 L56 42 L40 42 Z" fill="#C4714A"/>
      <line x1="40" y1="10" x2="40" y2="42" stroke="#1A1410" stroke-width="2"/>
      <path d="M14 46 H66 L60 60 H20 Z" fill="#3B6E52"/>
      <path d="M8 64 Q16 60 24 64 Q32 68 40 64 Q48 60 56 64 Q64 68 72 64" stroke="#1E91AF" stroke-width="2" fill="none"/>`},

    { key:'rocket', bg:'#1A1410', sym:`
      <path d="M40 10 C50 10 56 22 56 34 V52 H24 V34 C24 22 30 10 40 10 Z" fill="#F4EFE8"/>
      <circle cx="40" cy="30" r="6" fill="#5BB4D2"/>
      <circle cx="40" cy="30" r="2" fill="#1A1410"/>
      <path d="M24 38 L14 50 L24 52 Z" fill="#C4714A"/>
      <path d="M56 38 L66 50 L56 52 Z" fill="#C4714A"/>
      <rect x="32" y="52" width="16" height="6" fill="#9C3F2C"/>
      <path d="M32 58 L28 70 L34 66 L36 72 L40 64 L44 72 L46 66 L52 70 L48 58 Z" fill="#E6B574"/>`},
  ]},

/* ╔════ 03 · Food & Drink ════════════════════════════════╗ */
{ chapter:'Food & Drink', accent:'#C8781E',
  lede:'Coffee at dawn, dumplings at noon, a small glass of something at dusk.',
  icons: [
    { key:'coffee', bg:'#9C3F2C', sym:`
      <path d="M18 30 H56 V46 a10 10 0 0 1 -10 10 H28 a10 10 0 0 1 -10 -10 Z" fill="#F4EFE8"/>
      <path d="M22 34 H52 V46 a6 6 0 0 1 -6 6 H28 a6 6 0 0 1 -6 -6 Z" fill="#1A1410"/>
      <path d="M56 34 a6 6 0 0 1 0 12" fill="none" stroke="#F4EFE8" stroke-width="3"/>
      <rect x="14" y="58" width="46" height="3" rx="1.5" fill="#1A1410"/>
      <path d="M30 16 Q32 20 30 24 Q28 28 30 32" stroke="#F4EFE8" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M40 14 Q42 18 40 22 Q38 26 40 30" stroke="#F4EFE8" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M50 16 Q52 20 50 24 Q48 28 50 32" stroke="#F4EFE8" stroke-width="2" fill="none" stroke-linecap="round"/>`},

    { key:'espresso', bg:'#1A1410', sym:`
      <path d="M26 32 H50 V46 a6 6 0 0 1 -6 6 H32 a6 6 0 0 1 -6 -6 Z" fill="#F4EFE8"/>
      <path d="M30 36 H46 V46 a3 3 0 0 1 -3 3 H33 a3 3 0 0 1 -3 -3 Z" fill="#9C3F2C"/>
      <path d="M50 36 a4 4 0 0 1 0 8" fill="none" stroke="#F4EFE8" stroke-width="2.5"/>
      <rect x="20" y="54" width="40" height="3" rx="1.5" fill="#F4EFE8"/>
      <path d="M38 22 Q40 26 38 28 Q36 30 38 32" stroke="#E6B574" stroke-width="2" fill="none"/>`},

    { key:'tea', bg:'#7A8447', sym:`
      <path d="M22 30 H54 V46 a10 10 0 0 1 -10 10 H32 a10 10 0 0 1 -10 -10 Z" fill="#F4EFE8"/>
      <path d="M26 34 H50 V46 a6 6 0 0 1 -6 6 H32 a6 6 0 0 1 -6 -6 Z" fill="#C8944A"/>
      <path d="M54 34 a6 6 0 0 1 0 12" fill="none" stroke="#F4EFE8" stroke-width="3"/>
      <path d="M34 20 Q42 28 38 36" stroke="#3B6E52" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="42" cy="22" r="3" fill="#3B6E52"/>
      <rect x="18" y="58" width="44" height="3" rx="1.5" fill="#1A1410"/>`},

    { key:'matcha', bg:'#1A7840', sym:`
      <path d="M22 32 H58 V48 a8 8 0 0 1 -8 8 H30 a8 8 0 0 1 -8 -8 Z" fill="#F4EFE8"/>
      <path d="M26 36 H54 V48 a4 4 0 0 1 -4 4 H30 a4 4 0 0 1 -4 -4 Z" fill="#6FB89A"/>
      <ellipse cx="40" cy="36" rx="14" ry="2" fill="#6FB89A"/>
      <rect x="38" y="14" width="4" height="18" fill="#8BB39A"/>
      <ellipse cx="40" cy="14" rx="6" ry="3" fill="#3B6E52"/>
      <rect x="18" y="58" width="44" height="3" rx="1.5" fill="#1A1410"/>`},

    { key:'boba', bg:'#6E4163', sym:`
      <path d="M28 22 H52 L48 60 a4 4 0 0 1 -4 4 H36 a4 4 0 0 1 -4 -4 Z" fill="#F4EFE8"/>
      <path d="M30 28 H50 L47 60 a3 3 0 0 1 -3 3 H36 a3 3 0 0 1 -3 -3 Z" fill="#E8C46E"/>
      <ellipse cx="40" cy="22" rx="12" ry="3" fill="#1A1410"/>
      <rect x="38" y="14" width="4" height="14" rx="1" fill="#1A1410"/>
      <circle cx="37" cy="52" r="2" fill="#1A1410"/>
      <circle cx="43" cy="55" r="2" fill="#1A1410"/>
      <circle cx="40" cy="48" r="2" fill="#1A1410"/>`},

    { key:'cocktail', bg:'#D4517A', sym:`
      <path d="M18 22 H62 L40 46 Z" fill="#F4EFE8"/>
      <path d="M22 24 H58 L40 42 Z" fill="#E6B574"/>
      <rect x="38" y="46" width="4" height="14" fill="#F4EFE8"/>
      <rect x="28" y="60" width="24" height="4" rx="1" fill="#F4EFE8"/>
      <circle cx="34" cy="30" r="3" fill="#9C3F2C"/>
      <rect x="44" y="16" width="2" height="14" fill="#E6B574"/>`},

    { key:'beer', bg:'#C8944A', sym:`
      <path d="M28 22 H52 V58 a4 4 0 0 1 -4 4 H32 a4 4 0 0 1 -4 -4 Z" fill="#F4EFE8"/>
      <path d="M30 28 H50 V58 a3 3 0 0 1 -3 3 H33 a3 3 0 0 1 -3 -3 Z" fill="#E6B574"/>
      <path d="M52 28 H58 a4 4 0 0 1 0 16 H52 Z" fill="#F4EFE8"/>
      <circle cx="34" cy="22" r="3" fill="#F4EFE8"/>
      <circle cx="40" cy="20" r="4" fill="#F4EFE8"/>
      <circle cx="46" cy="22" r="3" fill="#F4EFE8"/>
      <circle cx="40" cy="42" r="2" fill="#C8944A"/>
      <circle cx="36" cy="50" r="2" fill="#C8944A"/>
      <circle cx="44" cy="48" r="2" fill="#C8944A"/>`},

    { key:'wine', bg:'#6E4163', sym:`
      <path d="M28 14 H52 L50 32 a10 10 0 0 1 -20 0 Z" fill="#F4EFE8"/>
      <path d="M30 18 H50 L48 30 a8 8 0 0 1 -16 0 Z" fill="#9C3F2C"/>
      <line x1="40" y1="42" x2="40" y2="62" stroke="#F4EFE8" stroke-width="3"/>
      <rect x="30" y="62" width="20" height="3" rx="1" fill="#F4EFE8"/>`},

    { key:'champagne', bg:'#E8C46E', sym:`
      <path d="M30 14 H50 V20 L46 40 a6 6 0 0 1 -12 0 L30 20 Z" fill="#F4EFE8"/>
      <path d="M34 22 H46 L43 40 a3 3 0 0 1 -6 0 Z" fill="#E6B574"/>
      <line x1="40" y1="46" x2="40" y2="62" stroke="#F4EFE8" stroke-width="2.5"/>
      <rect x="32" y="62" width="16" height="3" rx="1" fill="#F4EFE8"/>
      <circle cx="36" cy="30" r="1.5" fill="#F4EFE8"/>
      <circle cx="44" cy="34" r="1.5" fill="#F4EFE8"/>
      <circle cx="40" cy="26" r="1.5" fill="#F4EFE8"/>
      <path d="M28 10 L34 16 M52 10 L46 16" stroke="#F4EFE8" stroke-width="2" stroke-linecap="round"/>`},

    { key:'water_drink', bg:'#5BB4D2', sym:`
      <path d="M30 18 H50 L48 58 a4 4 0 0 1 -4 4 H36 a4 4 0 0 1 -4 -4 Z" fill="#F4EFE8"/>
      <path d="M32 24 H48 L46.5 58 a2 2 0 0 1 -2 2 H35.5 a2 2 0 0 1 -2 -2 Z" fill="#5BB4D2"/>
      <ellipse cx="40" cy="18" rx="10" ry="2.5" fill="#1A1410"/>
      <rect x="38" y="12" width="4" height="8" rx="1" fill="#1A1410"/>`},

    { key:'juice', bg:'#E05A3A', sym:`
      <path d="M28 22 H52 V54 a6 6 0 0 1 -6 6 H34 a6 6 0 0 1 -6 -6 Z" fill="#F4EFE8"/>
      <path d="M30 26 H50 V54 a4 4 0 0 1 -4 4 H34 a4 4 0 0 1 -4 -4 Z" fill="#E05A3A"/>
      <ellipse cx="40" cy="22" rx="12" ry="2.5" fill="#1A1410"/>
      <path d="M40 14 Q38 18 40 22 Q42 18 40 14 Z" fill="#3B6E52"/>
      <rect x="36" y="20" width="8" height="4" fill="#F4EFE8"/>`},

    { key:'sushi', bg:'#1A1410', sym:`
      <ellipse cx="28" cy="46" rx="10" ry="10" fill="#F4EFE8"/>
      <ellipse cx="28" cy="46" rx="10" ry="10" fill="none" stroke="#3B6E52" stroke-width="3"/>
      <circle cx="28" cy="46" r="5" fill="#E05A3A"/>
      <ellipse cx="54" cy="46" rx="10" ry="10" fill="#F4EFE8"/>
      <ellipse cx="54" cy="46" rx="10" ry="10" fill="none" stroke="#3B6E52" stroke-width="3"/>
      <rect x="48" y="38" width="12" height="6" rx="1" fill="#D4517A"/>
      <path d="M48 42 L60 42" stroke="#F4EFE8" stroke-width="1"/>
      <path d="M22 28 L24 24 L60 24 L58 28" stroke="#C8944A" stroke-width="2" fill="none" stroke-linecap="round"/>`},

    { key:'ramen', bg:'#9C3F2C', sym:`
      <path d="M14 36 H66 V42 a18 18 0 0 1 -18 18 H32 a18 18 0 0 1 -18 -18 Z" fill="#F4EFE8"/>
      <path d="M18 40 H62 V42 a14 14 0 0 1 -14 14 H32 a14 14 0 0 1 -14 -14 Z" fill="#E6B574"/>
      <path d="M26 42 H54" stroke="#C8944A" stroke-width="2"/>
      <path d="M30 46 Q36 50 42 46 Q48 42 54 46" stroke="#1A1410" stroke-width="2" fill="none" stroke-linecap="round"/>
      <circle cx="34" cy="50" r="2.5" fill="#1A1410"/>
      <path d="M44 48 H50 V52 H44 Z" fill="#6FB89A"/>
      <path d="M52 22 L48 36 M28 22 L32 36" stroke="#F4EFE8" stroke-width="2.5" stroke-linecap="round"/>`},

    { key:'pizza', bg:'#E05A3A', sym:`
      <path d="M40 12 L66 56 H14 Z" fill="#E6B574"/>
      <path d="M40 20 L60 54 H20 Z" fill="#C8781E"/>
      <circle cx="34" cy="36" r="3" fill="#9C3F2C"/>
      <circle cx="46" cy="38" r="3" fill="#9C3F2C"/>
      <circle cx="40" cy="46" r="3" fill="#9C3F2C"/>
      <circle cx="30" cy="48" r="2.5" fill="#1A7840"/>
      <circle cx="50" cy="48" r="2.5" fill="#1A7840"/>
      <circle cx="40" cy="30" r="2" fill="#1A7840"/>`},

    { key:'burger', bg:'#C8944A', sym:`
      <path d="M16 32 a24 14 0 0 1 48 0 V36 H16 Z" fill="#C8781E"/>
      <circle cx="28" cy="26" r="1.5" fill="#E6B574"/>
      <circle cx="40" cy="24" r="1.5" fill="#E6B574"/>
      <circle cx="52" cy="26" r="1.5" fill="#E6B574"/>
      <rect x="14" y="36" width="52" height="4" fill="#1A7840"/>
      <rect x="14" y="40" width="52" height="6" fill="#9C3F2C"/>
      <rect x="14" y="46" width="52" height="3" fill="#E6B574"/>
      <path d="M16 49 a24 12 0 0 0 48 0 Z" fill="#C8781E"/>`},

    { key:'taco', bg:'#E6B574', sym:`
      <path d="M14 28 a26 14 0 0 1 52 0 L62 56 H18 Z" fill="#C8944A"/>
      <path d="M18 32 a22 10 0 0 1 44 0 L60 54 H20 Z" fill="#1A7840"/>
      <circle cx="32" cy="40" r="3" fill="#E05A3A"/>
      <circle cx="42" cy="38" r="3" fill="#E05A3A"/>
      <circle cx="50" cy="42" r="3" fill="#E05A3A"/>
      <rect x="26" y="46" width="3" height="6" fill="#F4EFE8"/>
      <rect x="36" y="46" width="3" height="6" fill="#F4EFE8"/>
      <rect x="46" y="46" width="3" height="6" fill="#F4EFE8"/>`},

    { key:'noodles', bg:'#C4714A', sym:`
      <path d="M16 38 H64 V44 a16 16 0 0 1 -16 16 H32 a16 16 0 0 1 -16 -16 Z" fill="#F4EFE8"/>
      <path d="M22 42 Q28 38 34 42 Q40 46 46 42 Q52 38 58 42" stroke="#E6B574" stroke-width="3" fill="none"/>
      <path d="M22 48 Q28 44 34 48 Q40 52 46 48 Q52 44 58 48" stroke="#E6B574" stroke-width="3" fill="none"/>
      <circle cx="40" cy="44" r="3" fill="#1A7840"/>
      <path d="M48 20 L46 38 M32 20 L34 38" stroke="#1A1410" stroke-width="2.5" stroke-linecap="round"/>`},

    { key:'salad', bg:'#1A7840', sym:`
      <path d="M16 38 H64 V44 a16 16 0 0 1 -16 16 H32 a16 16 0 0 1 -16 -16 Z" fill="#F4EFE8"/>
      <path d="M22 40 Q28 32 34 40" fill="#6FB89A"/>
      <path d="M30 40 Q36 30 44 40" fill="#3B6E52"/>
      <path d="M42 40 Q50 32 58 40" fill="#6FB89A"/>
      <circle cx="28" cy="48" r="3" fill="#E05A3A"/>
      <circle cx="48" cy="48" r="3" fill="#E05A3A"/>
      <circle cx="38" cy="52" r="3" fill="#E6B574"/>`},

    { key:'croissant', bg:'#E6B574', sym:`
      <path d="M16 50 C 18 38 28 26 40 26 C 52 26 62 38 64 50 C 60 48 56 52 50 50 C 44 48 38 52 32 50 C 26 48 22 52 16 50 Z" fill="#C8781E"/>
      <path d="M22 48 C 26 40 32 34 40 32 C 48 34 54 40 58 48" stroke="#9C3F2C" stroke-width="2" fill="none"/>
      <path d="M32 44 L36 38 M40 42 L40 36 M48 44 L44 38" stroke="#9C3F2C" stroke-width="1.5"/>`},

    { key:'donut', bg:'#D4517A', sym:`
      <circle cx="40" cy="40" r="20" fill="#E6B574"/>
      <circle cx="40" cy="40" r="20" fill="none" stroke="#D4517A" stroke-width="4" stroke-dasharray="6 4"/>
      <circle cx="40" cy="40" r="7" fill="#F4EFE8"/>
      <circle cx="40" cy="40" r="20" fill="none" stroke="#F4EFE8" stroke-width="1"/>
      <circle cx="30" cy="32" r="1.5" fill="#1A1410"/>
      <circle cx="50" cy="32" r="1.5" fill="#5BB4D2"/>
      <circle cx="32" cy="50" r="1.5" fill="#1A7840"/>
      <circle cx="50" cy="50" r="1.5" fill="#E6B574"/>`},

    { key:'cupcake', bg:'#A03CB4', sym:`
      <path d="M22 38 H58 L52 60 a3 3 0 0 1 -3 3 H31 a3 3 0 0 1 -3 -3 Z" fill="#E6B574"/>
      <path d="M22 38 H58 V42 H22 Z" fill="#9C3F2C"/>
      <path d="M22 38 a10 8 0 0 1 8 -8 a8 8 0 0 1 5 3 a8 8 0 0 1 10 0 a8 8 0 0 1 5 -3 a10 8 0 0 1 8 8 Z" fill="#D4517A"/>
      <circle cx="40" cy="20" r="3" fill="#9C3F2C"/>
      <circle cx="28" cy="36" r="1" fill="#F4EFE8"/>
      <circle cx="40" cy="34" r="1" fill="#F4EFE8"/>
      <circle cx="52" cy="36" r="1" fill="#F4EFE8"/>`},

    { key:'ice_cream', bg:'#5BB4D2', sym:`
      <path d="M28 20 a12 8 0 0 1 24 0 V32 H28 Z" fill="#F4EFE8"/>
      <path d="M28 32 H52 V36 H28 Z" fill="#D4517A"/>
      <path d="M28 36 L40 64 L52 36 Z" fill="#E6B574"/>
      <path d="M30 38 L34 46 M38 38 L42 50 M46 38 L42 46 M50 38 L46 50" stroke="#C8781E" stroke-width="1.5"/>
      <circle cx="36" cy="22" r="2" fill="#9C3F2C"/>
      <circle cx="44" cy="20" r="2" fill="#9C3F2C"/>`},

    { key:'cake', bg:'#D4517A', sym:`
      <path d="M16 38 H64 V58 a3 3 0 0 1 -3 3 H19 a3 3 0 0 1 -3 -3 Z" fill="#F4EFE8"/>
      <path d="M16 38 H64 V44 H16 Z" fill="#9C3F2C"/>
      <path d="M16 50 H64 V52 H16 Z" fill="#9C3F2C"/>
      <rect x="38" y="20" width="4" height="14" fill="#E6B574"/>
      <path d="M38 16 L40 14 L42 16 L42 20 H38 Z" fill="#E05A3A"/>
      <circle cx="26" cy="46" r="2" fill="#E05A3A"/>
      <circle cx="40" cy="48" r="2" fill="#E05A3A"/>
      <circle cx="54" cy="46" r="2" fill="#E05A3A"/>`},

    { key:'dumpling', bg:'#E6B574', sym:`
      <path d="M16 50 C 16 36 28 28 40 28 C 52 28 64 36 64 50 C 64 54 58 56 50 56 C 44 56 36 56 30 56 C 22 56 16 54 16 50 Z" fill="#F4EFE8"/>
      <path d="M20 48 C 24 42 30 40 36 42 M36 42 C 40 40 44 42 48 44 M48 44 C 52 42 58 44 60 48" stroke="#C8944A" stroke-width="2" fill="none"/>
      <circle cx="28" cy="46" r="1.5" fill="#9C3F2C"/>
      <circle cx="40" cy="44" r="1.5" fill="#9C3F2C"/>
      <circle cx="52" cy="46" r="1.5" fill="#9C3F2C"/>`},

    { key:'hot_dog', bg:'#C8781E', sym:`
      <path d="M12 36 a18 6 0 0 1 36 0 a18 6 0 0 1 20 6 a18 6 0 0 1 -36 0 a18 6 0 0 1 -20 -6 Z" fill="#C8944A"/>
      <path d="M16 36 a14 4 0 0 1 28 0 a14 4 0 0 1 16 6 a14 4 0 0 1 -28 0 a14 4 0 0 1 -16 -6 Z" fill="#9C3F2C"/>
      <path d="M14 38 Q22 36 30 40 Q40 44 50 40 Q58 36 64 40" stroke="#E6B574" stroke-width="2" fill="none"/>`},

    { key:'kebab', bg:'#9C3F2C', sym:`
      <line x1="14" y1="24" x2="66" y2="64" stroke="#6B5C4E" stroke-width="2.5" stroke-linecap="round"/>
      <rect x="22" y="32" width="10" height="10" rx="2" fill="#C8781E" transform="rotate(-35 27 37)"/>
      <rect x="34" y="40" width="10" height="10" rx="2" fill="#1A7840" transform="rotate(-35 39 45)"/>
      <rect x="46" y="48" width="10" height="10" rx="2" fill="#E05A3A" transform="rotate(-35 51 53)"/>`},

    { key:'breakfast', bg:'#E8C46E', sym:`
      <circle cx="40" cy="44" r="20" fill="#F4EFE8"/>
      <circle cx="40" cy="44" r="14" fill="#E6B574"/>
      <circle cx="40" cy="44" r="6" fill="#C8781E"/>
      <path d="M22 22 H30 V38 H22 Z" fill="#C8944A"/>
      <ellipse cx="26" cy="22" rx="4" ry="2" fill="#9C3F2C"/>
      <circle cx="56" cy="28" r="6" fill="#3B6E52"/>
      <rect x="55" y="20" width="2" height="12" fill="#1A7840"/>`},

    { key:'picnic', bg:'#9C3F2C', sym:`
      <rect x="14" y="34" width="52" height="20" fill="#F4EFE8"/>
      <path d="M14 34 H66 M14 38 H66 M14 42 H66 M14 46 H66 M14 50 H66" stroke="#9C3F2C" stroke-width="1"/>
      <path d="M22 34 V54 M30 34 V54 M38 34 V54 M46 34 V54 M54 34 V54 M62 34 V54" stroke="#9C3F2C" stroke-width="1"/>
      <ellipse cx="32" cy="28" rx="6" ry="3" fill="#E05A3A"/>
      <ellipse cx="32" cy="28" rx="6" ry="3" fill="none" stroke="#1A1410" stroke-width="1.5"/>
      <rect x="46" y="20" width="10" height="12" rx="1" fill="#3B6E52"/>
      <rect x="46" y="20" width="10" height="3" fill="#1A1410"/>`},

    { key:'street_food', bg:'#E05A3A', sym:`
      <rect x="14" y="32" width="52" height="22" rx="2" fill="#F4EFE8"/>
      <path d="M14 26 L40 14 L66 26 Z" fill="#D4517A"/>
      <path d="M16 26 H64" stroke="#9C3F2C" stroke-width="2"/>
      <rect x="18" y="20" width="4" height="6" fill="#F4EFE8"/>
      <rect x="26" y="20" width="4" height="6" fill="#F4EFE8"/>
      <rect x="34" y="20" width="4" height="6" fill="#F4EFE8"/>
      <rect x="42" y="20" width="4" height="6" fill="#F4EFE8"/>
      <rect x="50" y="20" width="4" height="6" fill="#F4EFE8"/>
      <rect x="58" y="20" width="4" height="6" fill="#F4EFE8"/>
      <text x="30" y="48" font-family="monospace" font-size="9" fill="#1A1410" font-weight="700">EAT</text>
      <circle cx="22" cy="60" r="3" fill="#1A1410"/>
      <circle cx="58" cy="60" r="3" fill="#1A1410"/>`},

    { key:'market', bg:'#C4714A', sym:`
      <rect x="14" y="28" width="52" height="34" rx="2" fill="#F4EFE8"/>
      <path d="M14 22 L40 12 L66 22 V28 H14 Z" fill="#9C3F2C"/>
      <rect x="20" y="34" width="8" height="6" fill="#1A7840"/>
      <rect x="30" y="34" width="8" height="6" fill="#E05A3A"/>
      <rect x="40" y="34" width="8" height="6" fill="#E6B574"/>
      <rect x="50" y="34" width="8" height="6" fill="#D4517A"/>
      <rect x="20" y="44" width="8" height="6" fill="#5BB4D2"/>
      <rect x="30" y="44" width="8" height="6" fill="#C8781E"/>
      <rect x="40" y="44" width="8" height="6" fill="#A03CB4"/>
      <rect x="50" y="44" width="8" height="6" fill="#3B6E52"/>
      <rect x="36" y="52" width="8" height="10" fill="#1A1410"/>`},

    { key:'bbq', bg:'#1A1410', sym:`
      <path d="M14 40 H66 L60 56 a4 4 0 0 1 -4 3 H24 a4 4 0 0 1 -4 -3 Z" fill="#5C6878"/>
      <path d="M18 36 H62 V40 H18 Z" fill="#E6B574"/>
      <path d="M20 36 H60" stroke="#C4714A" stroke-width="1"/>
      <path d="M22 36 V40 M28 36 V40 M34 36 V40 M40 36 V40 M46 36 V40 M52 36 V40 M58 36 V40" stroke="#9C3F2C" stroke-width="1.5"/>
      <path d="M28 22 Q30 28 28 32 M40 18 Q42 26 40 32 M52 22 Q54 28 52 32" stroke="#E05A3A" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <rect x="22" y="58" width="4" height="10" fill="#5C6878"/>
      <rect x="54" y="58" width="4" height="10" fill="#5C6878"/>`},

    { key:'bakery', bg:'#C8781E', sym:`
      <ellipse cx="40" cy="44" rx="22" ry="14" fill="#E6B574"/>
      <ellipse cx="40" cy="42" rx="20" ry="12" fill="#C8944A"/>
      <path d="M22 42 Q28 38 34 42 Q40 46 46 42 Q52 38 58 42" stroke="#9C3F2C" stroke-width="2" fill="none"/>
      <path d="M28 50 L32 46 M36 52 L40 48 M44 52 L48 48 M52 50 L56 46" stroke="#9C3F2C" stroke-width="1.5"/>
      <rect x="20" y="20" width="40" height="8" rx="1" fill="#9C3F2C"/>
      <text x="28" y="26" font-family="monospace" font-size="6" fill="#F4EFE8" font-weight="700">BAKERY</text>`},
  ]},

/* ╔════ 04 · Lodging ════════════════════════════════════╗ */
{ chapter:'Lodging', accent:'#A03CB4',
  lede:'A bed, a window, a kettle. Fourteen ways to land for the night.',
  icons: [
    { key:'hotel', bg:'#A03CB4', sym:`
      <rect x="14" y="20" width="52" height="44" rx="2" fill="#F4EFE8"/>
      <rect x="14" y="20" width="52" height="6" fill="#6E4163"/>
      <rect x="20" y="30" width="6" height="6" fill="#5BB4D2"/>
      <rect x="30" y="30" width="6" height="6" fill="#5BB4D2"/>
      <rect x="44" y="30" width="6" height="6" fill="#5BB4D2"/>
      <rect x="54" y="30" width="6" height="6" fill="#5BB4D2"/>
      <rect x="20" y="40" width="6" height="6" fill="#5BB4D2"/>
      <rect x="30" y="40" width="6" height="6" fill="#5BB4D2"/>
      <rect x="44" y="40" width="6" height="6" fill="#E6B574"/>
      <rect x="54" y="40" width="6" height="6" fill="#5BB4D2"/>
      <rect x="34" y="50" width="12" height="14" rx="1" fill="#9C3F2C"/>
      <circle cx="42" cy="58" r="0.8" fill="#E6B574"/>`},

    { key:'motel', bg:'#E05A3A', sym:`
      <rect x="10" y="36" width="60" height="24" fill="#F4EFE8"/>
      <path d="M10 36 H70 V32 a4 4 0 0 0 -4 -4 H14 a4 4 0 0 0 -4 4 Z" fill="#9C3F2C"/>
      <rect x="14" y="42" width="10" height="10" fill="#5BB4D2"/>
      <rect x="28" y="42" width="10" height="10" fill="#5BB4D2"/>
      <rect x="42" y="42" width="10" height="10" fill="#E6B574"/>
      <rect x="56" y="42" width="10" height="10" fill="#5BB4D2"/>
      <rect x="36" y="14" width="8" height="18" rx="1" fill="#E6B574"/>
      <text x="34" y="24" font-family="monospace" font-size="8" fill="#9C3F2C" font-weight="700">M</text>`},

    { key:'hostel', bg:'#5BB4D2', sym:`
      <rect x="14" y="20" width="52" height="44" rx="2" fill="#F4EFE8"/>
      <rect x="14" y="34" width="52" height="2" fill="#1E91AF"/>
      <rect x="14" y="48" width="52" height="2" fill="#1E91AF"/>
      <rect x="20" y="24" width="10" height="8" fill="#C4714A"/>
      <rect x="34" y="24" width="10" height="8" fill="#C4714A"/>
      <rect x="48" y="24" width="10" height="8" fill="#C4714A"/>
      <rect x="20" y="38" width="10" height="8" fill="#C4714A"/>
      <rect x="34" y="38" width="10" height="8" fill="#E6B574"/>
      <rect x="48" y="38" width="10" height="8" fill="#C4714A"/>
      <rect x="20" y="52" width="10" height="8" fill="#C4714A"/>
      <rect x="34" y="52" width="10" height="8" fill="#C4714A"/>
      <rect x="48" y="52" width="10" height="8" fill="#C4714A"/>`},

    { key:'airbnb', bg:'#D4517A', sym:`
      <path d="M40 14 L66 36 V60 a2 2 0 0 1 -2 2 H16 a2 2 0 0 1 -2 -2 V36 Z" fill="#F4EFE8"/>
      <path d="M40 14 L66 36 H14 Z" fill="#9C3F2C"/>
      <path d="M30 46 a4 4 0 0 1 4 -4 a4 4 0 0 1 4 4 a4 4 0 0 1 4 -4 a4 4 0 0 1 4 4 c0 5 -8 12 -8 12 s -8 -7 -8 -12 Z" fill="#D4517A"/>
      <rect x="34" y="22" width="6" height="6" fill="#5BB4D2"/>`},

    { key:'cabin', bg:'#2B5340', sym:`
      <path d="M14 32 L40 16 L66 32 V60 H14 Z" fill="#9C3F2C"/>
      <path d="M14 32 L40 16 L66 32 H14 Z" fill="#6B5C4E"/>
      <rect x="32" y="40" width="16" height="20" fill="#C4714A"/>
      <rect x="20" y="38" width="8" height="8" fill="#E6B574"/>
      <rect x="52" y="38" width="8" height="8" fill="#E6B574"/>
      <rect x="14" y="38" width="52" height="2" fill="#1A1410"/>
      <rect x="14" y="48" width="52" height="2" fill="#1A1410"/>
      <rect x="14" y="56" width="52" height="2" fill="#1A1410"/>
      <rect x="46" y="22" width="6" height="14" fill="#1A1410"/>
      <path d="M48 22 Q52 18 50 14 Q48 18 48 22" fill="#F4EFE8"/>`},

    { key:'villa', bg:'#E8C46E', sym:`
      <rect x="12" y="36" width="56" height="26" fill="#F4EFE8"/>
      <path d="M12 36 L40 18 L68 36" fill="#C4714A"/>
      <rect x="20" y="42" width="10" height="14" rx="1" fill="#1A1410"/>
      <rect x="34" y="42" width="12" height="20" rx="1" fill="#9C3F2C"/>
      <circle cx="42" cy="52" r="0.8" fill="#E6B574"/>
      <rect x="50" y="42" width="10" height="14" rx="1" fill="#1A1410"/>
      <path d="M22 32 a4 4 0 0 1 8 0" fill="none" stroke="#3B6E52" stroke-width="2"/>
      <path d="M50 32 a4 4 0 0 1 8 0" fill="none" stroke="#3B6E52" stroke-width="2"/>`},

    { key:'tent', bg:'#1A7840', sym:`
      <path d="M40 16 L62 60 H18 Z" fill="#6FB89A"/>
      <line x1="40" y1="16" x2="40" y2="60" stroke="#2B5340" stroke-width="2"/>
      <path d="M40 60 L32 48 L40 36 L48 48 Z" fill="#2B5340"/>
      <path d="M18 60 L14 56 M62 60 L66 56" stroke="#1A1410" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="40" cy="48" r="1.5" fill="#E6B574"/>`},

    { key:'glamping', bg:'#6FB89A', sym:`
      <path d="M14 56 a26 22 0 0 1 52 0 Z" fill="#F4EFE8"/>
      <path d="M14 56 a26 22 0 0 1 52 0" fill="none" stroke="#C4714A" stroke-width="3"/>
      <rect x="34" y="40" width="12" height="16" rx="1" fill="#9C3F2C"/>
      <path d="M40 24 V40 M40 24 L36 30 M40 24 L44 30" stroke="#3B6E52" stroke-width="2" fill="none"/>
      <circle cx="20" cy="56" r="1.5" fill="#E6B574"/>
      <circle cx="60" cy="56" r="1.5" fill="#E6B574"/>
      <circle cx="40" cy="58" r="1.5" fill="#E6B574"/>`},

    { key:'camper', bg:'#9C3F2C', sym:`
      <rect x="10" y="26" width="52" height="30" rx="3" fill="#F4EFE8"/>
      <rect x="62" y="34" width="8" height="14" rx="1" fill="#E6B574"/>
      <rect x="14" y="30" width="14" height="10" fill="#5BB4D2"/>
      <rect x="32" y="30" width="26" height="10" fill="#E6B574"/>
      <path d="M10 42 H62 V46 H10 Z" fill="#C4714A"/>
      <rect x="14" y="48" width="10" height="6" rx="1" fill="#5BB4D2"/>
      <circle cx="20" cy="60" r="4" fill="#1A1410"/>
      <circle cx="52" cy="60" r="4" fill="#1A1410"/>`},

    { key:'resort', bg:'#1E91AF', sym:`
      <rect x="14" y="44" width="52" height="20" fill="#F4EFE8"/>
      <path d="M22 32 V44 M22 32 C 18 30 14 32 14 36 M22 32 C 26 30 30 32 30 36 M22 32 C 20 28 22 24 26 24 M22 32 C 24 28 22 24 18 24" stroke="#3B6E52" stroke-width="2" fill="none" stroke-linecap="round"/>
      <circle cx="22" cy="22" r="3" fill="#C4714A"/>
      <rect x="34" y="48" width="20" height="16" fill="#C4714A"/>
      <rect x="38" y="52" width="4" height="4" fill="#5BB4D2"/>
      <rect x="46" y="52" width="4" height="4" fill="#5BB4D2"/>
      <rect x="40" y="58" width="8" height="6" fill="#1A1410"/>
      <path d="M58 32 V44 M58 32 C 54 30 50 32 50 36 M58 32 C 62 30 66 32 66 36 M58 32 C 56 28 58 24 62 24" stroke="#3B6E52" stroke-width="2" fill="none" stroke-linecap="round"/>
      <circle cx="58" cy="22" r="3" fill="#C4714A"/>`},

    { key:'treehouse', bg:'#7A8447', sym:`
      <path d="M40 14 C 50 14 56 24 54 32 C 60 30 64 36 60 42 C 64 44 64 50 58 50 H22 C 16 50 16 44 20 42 C 16 36 20 30 26 32 C 24 24 30 14 40 14 Z" fill="#1A7840"/>
      <rect x="34" y="46" width="12" height="18" fill="#9C3F2C"/>
      <rect x="36" y="50" width="8" height="8" fill="#E6B574"/>
      <line x1="38" y1="60" x2="38" y2="76" stroke="#6B5C4E" stroke-width="3"/>
      <line x1="42" y1="60" x2="42" y2="76" stroke="#6B5C4E" stroke-width="3"/>`},

    { key:'boutique', bg:'#6E4163', sym:`
      <rect x="16" y="22" width="48" height="40" rx="2" fill="#F4EFE8"/>
      <rect x="16" y="22" width="48" height="8" fill="#D4517A"/>
      <rect x="22" y="34" width="14" height="14" rx="1" fill="#5BB4D2"/>
      <rect x="44" y="34" width="14" height="14" rx="1" fill="#5BB4D2"/>
      <rect x="32" y="52" width="16" height="10" fill="#9C3F2C"/>
      <path d="M32 52 H48" stroke="#E6B574" stroke-width="2"/>
      <circle cx="44" cy="57" r="0.8" fill="#E6B574"/>
      <path d="M22 22 L26 14 L34 14 L30 22 M54 22 L50 14 L58 14 L62 22" fill="#D4517A"/>`},

    { key:'yurt', bg:'#C8944A', sym:`
      <path d="M14 56 a26 14 0 0 1 52 0 Z" fill="#F4EFE8"/>
      <path d="M14 56 H66 V60 a2 2 0 0 1 -2 2 H16 a2 2 0 0 1 -2 -2 Z" fill="#6B5C4E"/>
      <path d="M40 30 L20 56 H60 Z" fill="#C4714A"/>
      <path d="M40 30 L40 56 M30 44 L50 44 M26 50 L54 50" stroke="#9C3F2C" stroke-width="1.5"/>
      <rect x="36" y="48" width="8" height="14" fill="#9C3F2C"/>
      <circle cx="40" cy="28" r="3" fill="#E6B574"/>`},

    { key:'ryokan', bg:'#1A1410', sym:`
      <path d="M10 30 H70 V34 H10 Z" fill="#9C3F2C"/>
      <path d="M14 30 L20 18 H60 L66 30" fill="#C4714A"/>
      <rect x="14" y="34" width="52" height="30" fill="#F4EFE8"/>
      <rect x="18" y="38" width="12" height="12" fill="#E6B574" stroke="#9C3F2C" stroke-width="1.5"/>
      <rect x="34" y="38" width="12" height="12" fill="#E6B574" stroke="#9C3F2C" stroke-width="1.5"/>
      <rect x="50" y="38" width="12" height="12" fill="#E6B574" stroke="#9C3F2C" stroke-width="1.5"/>
      <line x1="24" y1="38" x2="24" y2="50" stroke="#9C3F2C" stroke-width="1"/>
      <line x1="40" y1="38" x2="40" y2="50" stroke="#9C3F2C" stroke-width="1"/>
      <line x1="56" y1="38" x2="56" y2="50" stroke="#9C3F2C" stroke-width="1"/>
      <rect x="36" y="54" width="8" height="10" fill="#9C3F2C"/>
      <circle cx="42" cy="59" r="0.8" fill="#E6B574"/>`},
  ]},

/* ╔════ 05 · Nature & Weather ═══════════════════════════╗ */
{ chapter:'Nature & Weather', accent:'#3B6E52',
  lede:'The sky and the ground and everything alive between them.',
  icons: [
    { key:'sun', bg:'#5BB4D2', sym:`
      <circle cx="40" cy="40" r="12" fill="#E6B574"/>
      <circle cx="40" cy="40" r="6" fill="#E05A3A"/>
      <path d="M40 16 L43 26 L40 27 L37 26 Z" fill="#E6B574"/>
      <path d="M40 64 L37 54 L40 53 L43 54 Z" fill="#E6B574"/>
      <path d="M64 40 L54 43 L53 40 L54 37 Z" fill="#E6B574"/>
      <path d="M16 40 L26 37 L27 40 L26 43 Z" fill="#E6B574"/>
      <path d="M58 22 L52 28 L50 26 L54 22 Z" fill="#E6B574"/>
      <path d="M22 58 L28 52 L30 54 L26 58 Z" fill="#E6B574"/>
      <path d="M58 58 L52 52 L54 50 L58 54 Z" fill="#E6B574"/>
      <path d="M22 22 L28 28 L26 30 L22 26 Z" fill="#E6B574"/>`},

    { key:'moon', bg:'#2A4894', sym:`
      <path d="M50 16 a24 24 0 1 0 14 38 a18 18 0 0 1 -22 -22 a24 24 0 0 1 8 -16 Z" fill="#E8C46E"/>
      <circle cx="46" cy="32" r="2" fill="#C8944A" opacity="0.6"/>
      <circle cx="54" cy="44" r="3" fill="#C8944A" opacity="0.6"/>
      <circle cx="42" cy="46" r="1.5" fill="#C8944A" opacity="0.6"/>
      <circle cx="20" cy="24" r="1.5" fill="#F4EFE8"/>
      <circle cx="60" cy="62" r="1" fill="#F4EFE8"/>`},

    { key:'star', bg:'#1A1410', sym:`
      <path d="M40 16 L46 34 L64 34 L50 44 L56 62 L40 50 L24 62 L30 44 L16 34 L34 34 Z" fill="#E6B574"/>
      <path d="M40 22 L44 36 L40 38 L36 36 Z" fill="#C8944A"/>
      <circle cx="58" cy="20" r="1.5" fill="#F4EFE8"/>
      <circle cx="22" cy="58" r="1.2" fill="#F4EFE8"/>`},

    { key:'cloud', bg:'#5BB4D2', sym:`
      <path d="M22 50 a10 10 0 0 1 10 -14 a14 10 0 0 1 26 0 a8 8 0 0 1 6 14 Z" fill="#F4EFE8"/>
      <path d="M22 50 a10 10 0 0 1 10 -14 a14 10 0 0 1 26 0 a8 8 0 0 1 6 14 Z" fill="none" stroke="#1A1410" stroke-width="1" opacity="0.15"/>
      <circle cx="30" cy="42" r="2" fill="#F4EFE8"/>`},

    { key:'rain', bg:'#1E91AF', sym:`
      <path d="M20 38 a8 8 0 0 1 8 -10 a12 8 0 0 1 22 0 a6 6 0 0 1 4 10 Z" fill="#F4EFE8"/>
      <path d="M26 46 L24 56 M34 46 L32 56 M42 46 L40 56 M50 46 L48 56 M58 46 L56 56" stroke="#5BB4D2" stroke-width="3" stroke-linecap="round"/>`},

    { key:'snow', bg:'#8BB39A', sym:`
      <path d="M20 36 a8 8 0 0 1 8 -10 a12 8 0 0 1 22 0 a6 6 0 0 1 4 10 Z" fill="#F4EFE8"/>
      <g stroke="#F4EFE8" stroke-width="1.8" stroke-linecap="round">
        <path d="M28 48 V58 M24 53 H32 M25 50 L31 56 M31 50 L25 56"/>
        <path d="M40 50 V60 M36 55 H44 M37 52 L43 58 M43 52 L37 58"/>
        <path d="M52 48 V58 M48 53 H56 M49 50 L55 56 M55 50 L49 56"/>
      </g>`},

    { key:'lightning', bg:'#1A1410', sym:`
      <path d="M44 14 L24 46 H38 L34 66 L56 32 H42 Z" fill="#E6B574"/>
      <path d="M44 14 L24 46 H38" fill="#C8944A"/>`},

    { key:'rainbow', bg:'#F4EFE8', sym:`
      <path d="M12 56 a28 28 0 0 1 56 0" fill="none" stroke="#E05A3A" stroke-width="4"/>
      <path d="M16 56 a24 24 0 0 1 48 0" fill="none" stroke="#E6B574" stroke-width="4"/>
      <path d="M20 56 a20 20 0 0 1 40 0" fill="none" stroke="#E8C46E" stroke-width="4"/>
      <path d="M24 56 a16 16 0 0 1 32 0" fill="none" stroke="#1A7840" stroke-width="4"/>
      <path d="M28 56 a12 12 0 0 1 24 0" fill="none" stroke="#5BB4D2" stroke-width="4"/>
      <path d="M32 56 a8 8 0 0 1 16 0" fill="none" stroke="#A03CB4" stroke-width="4"/>
      <ellipse cx="14" cy="60" rx="6" ry="3" fill="#1A1410"/>
      <ellipse cx="66" cy="60" rx="6" ry="3" fill="#1A1410"/>`},

    { key:'fog', bg:'#5C6878', sym:`
      <path d="M16 26 H56 a4 4 0 0 1 0 8 H16" fill="none" stroke="#F4EFE8" stroke-width="4" stroke-linecap="round"/>
      <path d="M20 38 H62 a4 4 0 0 1 0 8 H32" fill="none" stroke="#F4EFE8" stroke-width="4" stroke-linecap="round"/>
      <path d="M14 50 H48 a4 4 0 0 1 0 8 H22" fill="none" stroke="#F4EFE8" stroke-width="4" stroke-linecap="round"/>`},

    { key:'sunrise', bg:'#E05A3A', sym:`
      <path d="M14 56 H66" stroke="#1A1410" stroke-width="2.5"/>
      <path d="M22 56 a18 18 0 0 1 36 0 Z" fill="#E6B574"/>
      <circle cx="40" cy="56" r="10" fill="#E8C46E"/>
      <path d="M40 30 L42 38 L40 39 L38 38 Z" fill="#E6B574"/>
      <path d="M22 36 L28 40 L26 42 L20 38 Z" fill="#E6B574"/>
      <path d="M58 36 L52 40 L54 42 L60 38 Z" fill="#E6B574"/>
      <path d="M8 56 L18 56 M62 56 L72 56" stroke="#1A1410" stroke-width="2.5" stroke-linecap="round"/>`},

    { key:'sunset', bg:'#9C3F2C', sym:`
      <path d="M14 56 H66" stroke="#1A1410" stroke-width="2.5"/>
      <path d="M22 56 a18 18 0 0 1 36 0 Z" fill="#E05A3A"/>
      <circle cx="40" cy="56" r="10" fill="#E6B574"/>
      <path d="M14 50 H22 M58 50 H66 M20 44 L26 46 M54 46 L60 44 M30 38 L34 42 M46 42 L50 38" stroke="#E8C46E" stroke-width="2" stroke-linecap="round"/>`},

    { key:'mountain', bg:'#5C6878', sym:`
      <path d="M10 64 L28 30 L40 50 L52 22 L70 64 Z" fill="#3B6E52"/>
      <path d="M28 30 L34 40 L24 40 Z" fill="#F4EFE8"/>
      <path d="M52 22 L58 34 L46 34 Z" fill="#F4EFE8"/>
      <path d="M10 64 L70 64" stroke="#1A1410" stroke-width="2"/>
      <circle cx="60" cy="20" r="3" fill="#E6B574"/>`},

    { key:'volcano', bg:'#1A1410', sym:`
      <path d="M14 64 L28 38 L38 46 L46 28 L66 64 Z" fill="#5C6878"/>
      <path d="M30 38 L46 28" stroke="#9C3F2C" stroke-width="2"/>
      <path d="M40 12 Q42 18 40 22 Q38 26 40 30 M48 16 Q50 22 48 26 M32 18 Q34 22 32 26" stroke="#E05A3A" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M30 38 L38 46 L46 28 L52 36 Z" fill="#E05A3A"/>`},

    { key:'hill', bg:'#7A8447', sym:`
      <path d="M10 60 Q28 32 40 44 Q52 56 70 36 V64 H10 Z" fill="#6FB89A"/>
      <path d="M10 60 Q28 32 40 44" stroke="#3B6E52" stroke-width="2" fill="none"/>
      <circle cx="22" cy="48" r="2" fill="#E6B574"/>
      <circle cx="56" cy="42" r="2" fill="#E6B574"/>
      <path d="M62 26 L60 34 L66 34 Z" fill="#1A7840"/>`},

    { key:'river', bg:'#3B6E52', sym:`
      <path d="M10 22 Q22 30 30 26 Q42 22 50 30 Q60 38 70 32 V42 Q60 48 50 42 Q40 36 30 42 Q20 48 10 42 Z" fill="#5BB4D2"/>
      <path d="M14 32 Q26 36 38 32 Q50 28 62 34" stroke="#F4EFE8" stroke-width="1.5" fill="none"/>
      <path d="M16 56 L20 60 L24 58 L30 62 L36 58 L44 62 L50 58 L60 62 L66 56" stroke="#6B5C4E" stroke-width="2" fill="none"/>
      <circle cx="22" cy="50" r="2" fill="#6FB89A"/>
      <circle cx="56" cy="52" r="2" fill="#6FB89A"/>`},

    { key:'lake', bg:'#1E91AF', sym:`
      <ellipse cx="40" cy="50" rx="26" ry="12" fill="#5BB4D2"/>
      <path d="M20 50 Q30 46 40 50 Q50 54 60 50" stroke="#F4EFE8" stroke-width="1.5" fill="none"/>
      <path d="M22 28 L18 42 L26 42 Z" fill="#3B6E52"/>
      <path d="M30 22 L24 42 L36 42 Z" fill="#1A7840"/>
      <path d="M52 26 L46 42 L58 42 Z" fill="#3B6E52"/>
      <path d="M60 30 L56 42 L64 42 Z" fill="#1A7840"/>`},

    { key:'ocean', bg:'#1446B4', sym:`
      <path d="M10 30 Q22 22 34 30 Q46 38 58 30 Q66 24 70 28" stroke="#F4EFE8" stroke-width="2.5" fill="none"/>
      <path d="M10 42 Q22 34 34 42 Q46 50 58 42 Q66 36 70 40" stroke="#5BB4D2" stroke-width="3" fill="none"/>
      <path d="M10 54 Q22 46 34 54 Q46 62 58 54 Q66 48 70 52" stroke="#F4EFE8" stroke-width="2.5" fill="none"/>
      <circle cx="58" cy="22" r="3" fill="#E6B574"/>`},

    { key:'beach', bg:'#E8C46E', sym:`
      <path d="M14 54 H66 V64 H14 Z" fill="#E6B574"/>
      <path d="M14 54 Q26 56 38 54 Q50 52 66 54 Q60 52 50 50 Q40 48 30 50 Q20 52 14 54 Z" fill="#5BB4D2"/>
      <path d="M48 18 L52 50" stroke="#9C3F2C" stroke-width="3"/>
      <path d="M52 18 Q60 14 66 16 M52 18 Q60 22 66 24 M52 18 Q48 12 42 12 M52 20 Q44 24 40 28" stroke="#3B6E52" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="22" cy="60" rx="4" ry="1.5" fill="#9C3F2C"/>
      <ellipse cx="58" cy="60" rx="3" ry="1.2" fill="#D4517A"/>`},

    { key:'palm_tree', bg:'#1A7840', sym:`
      <path d="M40 28 Q42 50 38 64 L42 64 Q44 50 42 28 Z" fill="#9C3F2C"/>
      <path d="M40 28 Q24 22 16 26 Q24 26 30 30 Q24 28 18 32" fill="#6FB89A"/>
      <path d="M40 28 Q56 22 64 26 Q56 26 50 30 Q56 28 62 32" fill="#6FB89A"/>
      <path d="M40 28 Q44 16 52 14 Q48 18 46 24" fill="#3B6E52"/>
      <path d="M40 28 Q36 16 28 14 Q32 18 34 24" fill="#3B6E52"/>
      <circle cx="40" cy="28" r="3" fill="#E6B574"/>
      <circle cx="42" cy="32" r="1.5" fill="#C8944A"/>
      <circle cx="38" cy="32" r="1.5" fill="#C8944A"/>`},

    { key:'pine_tree', bg:'#2B5340', sym:`
      <path d="M40 14 L52 32 H44 L56 48 H44 L60 64 H20 L36 48 H24 L36 32 H28 Z" fill="#6FB89A"/>
      <path d="M40 18 L48 32 H44 V40 H36 V32 H32 Z" fill="#1A7840"/>
      <rect x="36" y="64" width="8" height="6" fill="#9C3F2C"/>`},

    { key:'cactus', bg:'#C8781E', sym:`
      <path d="M36 18 H44 V58 H36 Z" fill="#1A7840"/>
      <path d="M36 30 a6 6 0 0 0 -10 0 V44 H36 Z" fill="#1A7840"/>
      <path d="M44 26 a6 6 0 0 1 10 0 V40 H44 Z" fill="#1A7840"/>
      <path d="M36 18 a4 4 0 0 1 8 0" stroke="#1A7840" stroke-width="3" fill="none"/>
      <circle cx="40" cy="14" r="3" fill="#D4517A"/>
      <rect x="32" y="58" width="16" height="6" fill="#9C3F2C"/>
      <path d="M30 28 L34 30 M30 36 L34 38 M30 42 L34 44 M46 26 L50 24 M46 32 L50 30 M40 22 L40 26 M40 30 L40 36 M40 40 L40 48" stroke="#2B5340" stroke-width="1"/>`},

    { key:'flower', bg:'#6FB89A', sym:`
      <circle cx="40" cy="34" r="6" fill="#E6B574"/>
      <ellipse cx="40" cy="22" rx="6" ry="9" fill="#D4517A"/>
      <ellipse cx="40" cy="46" rx="6" ry="9" fill="#D4517A"/>
      <ellipse cx="28" cy="34" rx="9" ry="6" fill="#D4517A"/>
      <ellipse cx="52" cy="34" rx="9" ry="6" fill="#D4517A"/>
      <circle cx="40" cy="34" r="4" fill="#E05A3A"/>
      <path d="M40 50 V70" stroke="#1A7840" stroke-width="3"/>
      <path d="M40 60 Q34 56 30 60" stroke="#1A7840" stroke-width="2.5" fill="none"/>`},

    { key:'leaf', bg:'#1A7840', sym:`
      <path d="M14 50 C 14 26 38 14 62 18 C 60 42 42 60 18 60 Z" fill="#6FB89A"/>
      <path d="M18 56 L58 22" stroke="#3B6E52" stroke-width="2"/>
      <path d="M24 52 L36 40 M32 52 L42 42 M40 52 L48 44 M48 50 L54 44 M22 46 L34 34 M26 40 L40 26" stroke="#3B6E52" stroke-width="1.5"/>`},

    { key:'mushroom', bg:'#E05A3A', sym:`
      <path d="M16 40 a24 18 0 0 1 48 0 Z" fill="#9C3F2C"/>
      <circle cx="28" cy="32" r="3" fill="#F4EFE8"/>
      <circle cx="44" cy="28" r="4" fill="#F4EFE8"/>
      <circle cx="54" cy="36" r="2.5" fill="#F4EFE8"/>
      <circle cx="36" cy="36" r="2" fill="#F4EFE8"/>
      <path d="M28 40 H52 V58 a4 4 0 0 1 -4 4 H32 a4 4 0 0 1 -4 -4 Z" fill="#F4EFE8"/>
      <ellipse cx="40" cy="56" rx="3" ry="1.5" fill="#E6B574"/>`},
  ]},

/* ╔════ 06 · Sights & Landmarks ═════════════════════════╗ */
{ chapter:'Sights & Landmarks', accent:'#C8944A',
  lede:'The buildings worth the bus ride. Sixteen postcards in seal form.',
  icons: [
    { key:'eiffel', bg:'#1A1410', sym:`
      <path d="M40 12 L46 30 L52 50 L60 66 H44 L42 56 L40 62 L38 56 L36 66 H20 L28 50 L34 30 Z" fill="#E6B574"/>
      <path d="M34 36 H46 M30 50 H50" stroke="#1A1410" stroke-width="1.5"/>
      <path d="M40 12 L40 22" stroke="#E6B574" stroke-width="3"/>
      <circle cx="40" cy="12" r="2" fill="#D4517A"/>`},

    { key:'statue', bg:'#7A8447', sym:`
      <path d="M40 14 L44 18 L48 18 L52 14 L52 22 L46 26 L46 32 L52 32 L52 38 L44 36 V60 L40 64 L36 60 V36 L28 38 L28 32 L34 32 L34 26 L28 22 L28 14 L32 18 L36 18 Z" fill="#6FB89A"/>
      <circle cx="40" cy="20" r="4" fill="#6FB89A"/>
      <path d="M48 14 L54 8 L52 18" fill="#E6B574"/>
      <rect x="32" y="62" width="16" height="6" fill="#9C3F2C"/>`},

    { key:'pyramid', bg:'#E6B574', sym:`
      <path d="M40 16 L66 60 H14 Z" fill="#C8781E"/>
      <path d="M40 16 L40 60 L14 60 Z" fill="#9C3F2C"/>
      <path d="M30 40 H50" stroke="#1A1410" stroke-width="1" opacity="0.3"/>
      <path d="M22 50 H58" stroke="#1A1410" stroke-width="1" opacity="0.3"/>
      <circle cx="58" cy="22" r="3" fill="#E8C46E"/>
      <path d="M14 60 L66 60" stroke="#1A1410" stroke-width="1.5"/>`},

    { key:'lighthouse', bg:'#1E91AF', sym:`
      <path d="M32 22 H48 L46 60 H34 Z" fill="#F4EFE8"/>
      <rect x="32" y="22" width="16" height="4" fill="#E05A3A"/>
      <rect x="32" y="40" width="16" height="4" fill="#E05A3A"/>
      <rect x="34" y="14" width="12" height="8" fill="#1A1410"/>
      <rect x="36" y="16" width="8" height="4" fill="#E6B574"/>
      <path d="M44 18 L60 14 L60 22 Z" fill="#E6B574" opacity="0.6"/>
      <path d="M36 18 L20 14 L20 22 Z" fill="#E6B574" opacity="0.6"/>
      <path d="M28 60 H52 V64 H28 Z" fill="#9C3F2C"/>`},

    { key:'castle', bg:'#6E4163', sym:`
      <rect x="14" y="32" width="52" height="28" fill="#F4EFE8"/>
      <path d="M14 32 H18 V26 H22 V32 H26 V26 H30 V32 H34 V26 H38 V32 H42 V26 H46 V32 H50 V26 H54 V32 H58 V26 H62 V32 H66" fill="#F4EFE8"/>
      <rect x="34" y="38" width="12" height="22" fill="#9C3F2C"/>
      <path d="M34 38 a6 6 0 0 1 12 0" fill="#9C3F2C"/>
      <rect x="20" y="42" width="6" height="8" fill="#1A1410"/>
      <rect x="54" y="42" width="6" height="8" fill="#1A1410"/>
      <path d="M40 14 V26" stroke="#1A1410" stroke-width="1.5"/>
      <path d="M40 14 L52 18 L48 24 L40 22 Z" fill="#D4517A"/>`},

    { key:'church', bg:'#E05A3A', sym:`
      <path d="M40 12 V24" stroke="#1A1410" stroke-width="2"/>
      <path d="M36 18 H44 M40 12 L40 24" stroke="#1A1410" stroke-width="2"/>
      <path d="M30 30 L40 24 L50 30 V60 H30 Z" fill="#F4EFE8"/>
      <path d="M30 38 L20 42 V60 H30 Z" fill="#F4EFE8"/>
      <path d="M50 38 L60 42 V60 H50 Z" fill="#F4EFE8"/>
      <rect x="36" y="42" width="8" height="14" fill="#9C3F2C"/>
      <rect x="24" y="48" width="4" height="6" fill="#5BB4D2"/>
      <rect x="52" y="48" width="4" height="6" fill="#5BB4D2"/>
      <circle cx="40" cy="36" r="2.5" fill="#5BB4D2"/>`},

    { key:'mosque', bg:'#1A7840', sym:`
      <rect x="14" y="42" width="52" height="22" fill="#F4EFE8"/>
      <path d="M28 42 a12 12 0 0 1 24 0 Z" fill="#F4EFE8"/>
      <path d="M30 30 a10 10 0 0 1 20 0 V42 H30 Z" fill="#E6B574"/>
      <path d="M40 22 L42 26 L40 28 L38 26 Z" fill="#E6B574"/>
      <rect x="18" y="50" width="8" height="6" fill="#1A7840"/>
      <rect x="54" y="50" width="8" height="6" fill="#1A7840"/>
      <rect x="34" y="48" width="12" height="16" fill="#1A7840"/>
      <path d="M34 48 a6 8 0 0 1 12 0" fill="#1A7840"/>
      <line x1="20" y1="42" x2="20" y2="20" stroke="#F4EFE8" stroke-width="3"/>
      <line x1="60" y1="42" x2="60" y2="20" stroke="#F4EFE8" stroke-width="3"/>
      <circle cx="20" cy="18" r="2" fill="#E6B574"/>
      <circle cx="60" cy="18" r="2" fill="#E6B574"/>`},

    { key:'temple', bg:'#9C3F2C', sym:`
      <path d="M10 26 L40 14 L70 26 H10 Z" fill="#E6B574"/>
      <rect x="14" y="26" width="52" height="4" fill="#9C3F2C"/>
      <path d="M16 30 V46 L20 50 H60 L64 46 V30" fill="#F4EFE8"/>
      <path d="M20 50 V62 H60 V50" fill="#E6B574"/>
      <rect x="24" y="34" width="6" height="14" fill="#9C3F2C"/>
      <rect x="36" y="34" width="6" height="14" fill="#9C3F2C"/>
      <rect x="48" y="34" width="6" height="14" fill="#9C3F2C"/>
      <rect x="36" y="50" width="10" height="12" fill="#9C3F2C"/>`},

    { key:'pagoda', bg:'#D4517A', sym:`
      <path d="M40 14 L46 14 L42 20 H38 L34 14 Z" fill="#E6B574"/>
      <path d="M28 22 H52 V26 H28 Z" fill="#F4EFE8"/>
      <path d="M22 26 H58 L54 30 H26 Z" fill="#9C3F2C"/>
      <path d="M26 32 H54 V36 H26 Z" fill="#F4EFE8"/>
      <path d="M20 36 H60 L56 40 H24 Z" fill="#9C3F2C"/>
      <path d="M24 42 H56 V46 H24 Z" fill="#F4EFE8"/>
      <path d="M18 46 H62 L58 50 H22 Z" fill="#9C3F2C"/>
      <rect x="34" y="52" width="12" height="14" fill="#F4EFE8"/>
      <rect x="38" y="54" width="4" height="12" fill="#9C3F2C"/>
      <circle cx="40" cy="14" r="2" fill="#E6B574"/>`},

    { key:'ferris_wheel', bg:'#2A4894', sym:`
      <circle cx="40" cy="36" r="20" fill="none" stroke="#F4EFE8" stroke-width="3"/>
      <circle cx="40" cy="36" r="3" fill="#E6B574"/>
      <line x1="40" y1="36" x2="40" y2="16" stroke="#F4EFE8" stroke-width="2"/>
      <line x1="40" y1="36" x2="40" y2="56" stroke="#F4EFE8" stroke-width="2"/>
      <line x1="40" y1="36" x2="20" y2="36" stroke="#F4EFE8" stroke-width="2"/>
      <line x1="40" y1="36" x2="60" y2="36" stroke="#F4EFE8" stroke-width="2"/>
      <line x1="40" y1="36" x2="26" y2="22" stroke="#F4EFE8" stroke-width="2"/>
      <line x1="40" y1="36" x2="54" y2="22" stroke="#F4EFE8" stroke-width="2"/>
      <line x1="40" y1="36" x2="26" y2="50" stroke="#F4EFE8" stroke-width="2"/>
      <line x1="40" y1="36" x2="54" y2="50" stroke="#F4EFE8" stroke-width="2"/>
      <circle cx="40" cy="16" r="3" fill="#E05A3A"/>
      <circle cx="60" cy="36" r="3" fill="#E6B574"/>
      <circle cx="20" cy="36" r="3" fill="#E6B574"/>
      <circle cx="54" cy="22" r="2.5" fill="#D4517A"/>
      <circle cx="26" cy="22" r="2.5" fill="#D4517A"/>
      <circle cx="54" cy="50" r="2.5" fill="#1A7840"/>
      <circle cx="26" cy="50" r="2.5" fill="#1A7840"/>
      <path d="M28 60 L40 56 L52 60" stroke="#F4EFE8" stroke-width="3" fill="none"/>`},

    { key:'bridge', bg:'#5C6878', sym:`
      <path d="M10 44 H70" stroke="#F4EFE8" stroke-width="3"/>
      <path d="M14 44 Q40 18 66 44" stroke="#F4EFE8" stroke-width="2.5" fill="none"/>
      <line x1="22" y1="30" x2="22" y2="44" stroke="#F4EFE8" stroke-width="2"/>
      <line x1="32" y1="22" x2="32" y2="44" stroke="#F4EFE8" stroke-width="2"/>
      <line x1="40" y1="20" x2="40" y2="44" stroke="#F4EFE8" stroke-width="2"/>
      <line x1="48" y1="22" x2="48" y2="44" stroke="#F4EFE8" stroke-width="2"/>
      <line x1="58" y1="30" x2="58" y2="44" stroke="#F4EFE8" stroke-width="2"/>
      <path d="M10 48 H70 L66 60 H14 Z" fill="#E6B574"/>
      <path d="M14 60 Q24 56 34 60 Q44 64 54 60 Q64 56 70 60" stroke="#1E91AF" stroke-width="2" fill="none"/>`},

    { key:'fountain', bg:'#5BB4D2', sym:`
      <path d="M40 16 Q36 22 40 28 Q44 22 40 16 Z" fill="#F4EFE8"/>
      <path d="M28 26 Q32 32 36 30 M52 26 Q48 32 44 30" stroke="#F4EFE8" stroke-width="3" fill="none"/>
      <ellipse cx="40" cy="36" rx="14" ry="4" fill="#1A1410"/>
      <rect x="34" y="36" width="12" height="14" fill="#6B5C4E"/>
      <ellipse cx="40" cy="54" rx="22" ry="6" fill="#1E91AF"/>
      <path d="M22 54 Q40 50 58 54" stroke="#F4EFE8" stroke-width="1.5" fill="none"/>
      <path d="M22 58 Q40 62 58 58" stroke="#F4EFE8" stroke-width="1.5" fill="none"/>`},

    { key:'museum', bg:'#E8C46E', sym:`
      <path d="M14 30 L40 16 L66 30 H14 Z" fill="#9C3F2C"/>
      <rect x="14" y="30" width="52" height="4" fill="#F4EFE8"/>
      <rect x="14" y="56" width="52" height="6" fill="#F4EFE8"/>
      <rect x="18" y="34" width="4" height="22" fill="#F4EFE8"/>
      <rect x="26" y="34" width="4" height="22" fill="#F4EFE8"/>
      <rect x="34" y="34" width="4" height="22" fill="#F4EFE8"/>
      <rect x="42" y="34" width="4" height="22" fill="#F4EFE8"/>
      <rect x="50" y="34" width="4" height="22" fill="#F4EFE8"/>
      <rect x="58" y="34" width="4" height="22" fill="#F4EFE8"/>
      <path d="M14 62 H66" stroke="#1A1410" stroke-width="2"/>`},

    { key:'theater', bg:'#A03CB4', sym:`
      <path d="M16 18 H64 V36 a24 16 0 0 1 -48 0 Z" fill="#F4EFE8"/>
      <circle cx="30" cy="30" r="3" fill="#1A1410"/>
      <circle cx="50" cy="30" r="3" fill="#1A1410"/>
      <path d="M30 40 Q40 46 50 40" stroke="#1A1410" stroke-width="2" fill="none"/>
      <path d="M14 18 L20 12 L60 12 L66 18" fill="#9C3F2C"/>
      <path d="M16 50 H64 V62 H16 Z" fill="#9C3F2C"/>
      <path d="M20 50 V62 M30 50 V62 M40 50 V62 M50 50 V62 M60 50 V62" stroke="#E6B574" stroke-width="1.5"/>`},

    { key:'stadium', bg:'#1A7840', sym:`
      <ellipse cx="40" cy="44" rx="28" ry="14" fill="#6FB89A"/>
      <ellipse cx="40" cy="44" rx="24" ry="10" fill="#1A7840"/>
      <ellipse cx="40" cy="44" rx="14" ry="5" fill="#F4EFE8"/>
      <circle cx="40" cy="44" r="3" fill="#F4EFE8"/>
      <path d="M12 32 H68 L62 22 H18 Z" fill="#E6B574"/>
      <path d="M16 22 L18 14 M28 22 L28 14 M40 22 L40 12 M52 22 L52 14 M64 22 L62 14" stroke="#F4EFE8" stroke-width="2"/>`},

    { key:'observatory', bg:'#2A4894', sym:`
      <path d="M22 50 a18 18 0 0 1 36 0 Z" fill="#F4EFE8"/>
      <rect x="20" y="50" width="40" height="14" fill="#9C3F2C"/>
      <path d="M30 32 L46 18" stroke="#1A1410" stroke-width="4" stroke-linecap="round"/>
      <circle cx="30" cy="32" r="3" fill="#E6B574"/>
      <path d="M40 50 V42" stroke="#1A1410" stroke-width="2"/>
      <circle cx="22" cy="58" r="2" fill="#5BB4D2"/>
      <circle cx="40" cy="58" r="2" fill="#5BB4D2"/>
      <circle cx="58" cy="58" r="2" fill="#5BB4D2"/>
      <circle cx="58" cy="22" r="1.5" fill="#F4EFE8"/>
      <circle cx="20" cy="20" r="1" fill="#F4EFE8"/>
      <circle cx="46" cy="14" r="1.2" fill="#F4EFE8"/>`},
  ]},

/* ╔════ 07 · Activities ═════════════════════════════════╗ */
{ chapter:'Activities', accent:'#E05A3A',
  lede:'Things to do once you arrive. Some quiet, some not.',
  icons: [
    { key:'hiking', bg:'#1A7840', sym:`
      <circle cx="46" cy="16" r="5" fill="#C4714A"/>
      <path d="M44 24 L38 32 L34 44 L28 56 L34 56 L40 46 L44 56 L50 56 L46 42 L52 30 Z" fill="#C4714A"/>
      <path d="M20 64 L24 30" stroke="#9C3F2C" stroke-width="3" stroke-linecap="round"/>
      <path d="M24 30 L18 24 M24 30 L30 26" stroke="#3B6E52" stroke-width="2" stroke-linecap="round"/>
      <path d="M52 30 L62 28 L60 36 Z" fill="#C8944A"/>`},

    { key:'climbing', bg:'#5C6878', sym:`
      <path d="M14 16 L66 16 L60 64 L20 64 Z" fill="#9C3F2C" opacity="0.4"/>
      <circle cx="32" cy="22" r="3" fill="#1A1410"/>
      <circle cx="52" cy="32" r="3" fill="#1A1410"/>
      <circle cx="38" cy="44" r="3" fill="#1A1410"/>
      <circle cx="56" cy="52" r="3" fill="#1A1410"/>
      <circle cx="38" cy="32" r="4" fill="#C4714A"/>
      <path d="M40 36 L36 42 L40 48 L36 52 L40 58 L36 64 H44 L42 56 L46 50 L44 44 L46 38 L42 34 Z" fill="#C4714A"/>
      <path d="M46 50 L56 38" stroke="#E6B574" stroke-width="2.5" stroke-linecap="round"/>`},

    { key:'surfing', bg:'#1E91AF', sym:`
      <path d="M14 50 Q26 42 38 50 Q50 58 62 50 Q68 46 70 48" stroke="#F4EFE8" stroke-width="3" fill="none"/>
      <ellipse cx="40" cy="56" rx="22" ry="5" fill="#E6B574"/>
      <circle cx="44" cy="36" r="4" fill="#1A1410"/>
      <path d="M40 40 L34 50 L36 56 L40 50 L42 56 L46 48 Z" fill="#D4517A"/>
      <path d="M46 44 L52 38 L54 44" stroke="#1A1410" stroke-width="2" stroke-linecap="round"/>`},

    { key:'skiing', bg:'#F4EFE8', sym:`
      <circle cx="34" cy="18" r="4" fill="#C4714A"/>
      <path d="M30 24 L26 36 L20 48 L26 50 L30 38 L34 30 L34 50 L40 50 L38 32 L42 24 Z" fill="#1A7840"/>
      <path d="M14 60 L48 50" stroke="#1A1410" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M22 64 L56 54" stroke="#1A1410" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M34 30 L50 18" stroke="#9C3F2C" stroke-width="3" stroke-linecap="round"/>
      <path d="M52 16 L56 14 L54 20 Z" fill="#9C3F2C"/>`},

    { key:'snowboarding', bg:'#5BB4D2', sym:`
      <circle cx="32" cy="18" r="4" fill="#1A1410"/>
      <path d="M28 24 L22 36 L26 44 L34 36 L40 40 L42 30 L36 22 Z" fill="#E05A3A"/>
      <path d="M40 40 L48 56" stroke="#E05A3A" stroke-width="3" stroke-linecap="round"/>
      <path d="M14 60 L62 56 Q66 56 64 60 L20 64 Q14 64 14 60 Z" fill="#1A1410"/>
      <circle cx="24" cy="60" r="1.5" fill="#E6B574"/>
      <circle cx="40" cy="60" r="1.5" fill="#E6B574"/>
      <circle cx="56" cy="60" r="1.5" fill="#E6B574"/>`},

    { key:'diving', bg:'#1446B4', sym:`
      <circle cx="40" cy="32" r="12" fill="#F4EFE8"/>
      <circle cx="40" cy="32" r="9" fill="#5BB4D2"/>
      <rect x="28" y="42" width="8" height="3" fill="#1A1410" transform="rotate(-30 32 43)"/>
      <rect x="44" y="42" width="8" height="3" fill="#1A1410" transform="rotate(30 48 43)"/>
      <path d="M40 44 L36 56 L40 64 L44 56 Z" fill="#3B6E52"/>
      <circle cx="22" cy="22" r="2" fill="#F4EFE8"/>
      <circle cx="26" cy="18" r="1.5" fill="#F4EFE8"/>
      <circle cx="58" cy="20" r="2" fill="#F4EFE8"/>
      <circle cx="62" cy="26" r="1.5" fill="#F4EFE8"/>`},

    { key:'snorkel', bg:'#5BB4D2', sym:`
      <ellipse cx="40" cy="40" rx="18" ry="10" fill="#F4EFE8"/>
      <path d="M22 40 H58 V46 a8 6 0 0 1 -8 4 H30 a8 6 0 0 1 -8 -4 Z" fill="#E05A3A"/>
      <path d="M22 40 a4 4 0 0 1 -4 4 V20 a4 4 0 0 1 8 0 V36" stroke="#1A1410" stroke-width="3" fill="none"/>
      <circle cx="33" cy="40" r="3" fill="#1A1410"/>
      <circle cx="47" cy="40" r="3" fill="#1A1410"/>
      <path d="M14 60 Q22 56 30 60 Q38 64 46 60 Q54 56 62 60" stroke="#F4EFE8" stroke-width="2" fill="none"/>`},

    { key:'swim', bg:'#1E91AF', sym:`
      <circle cx="48" cy="20" r="4" fill="#C4714A"/>
      <path d="M40 32 L24 36 L18 30 L20 26 L26 30 L42 26 L54 28 L60 22 L62 26 Z" fill="#C4714A"/>
      <path d="M12 44 Q22 40 32 44 Q42 48 52 44 Q62 40 70 44" stroke="#F4EFE8" stroke-width="3" fill="none"/>
      <path d="M12 56 Q22 52 32 56 Q42 60 52 56 Q62 52 70 56" stroke="#F4EFE8" stroke-width="3" fill="none"/>`},

    { key:'yoga', bg:'#A03CB4', sym:`
      <circle cx="40" cy="22" r="4" fill="#E6B574"/>
      <path d="M40 28 V46 L24 56 L40 50 L56 56 L40 46 Z" fill="#E6B574"/>
      <ellipse cx="40" cy="58" rx="22" ry="4" fill="#1A1410"/>`},

    { key:'photography', bg:'#1A1410', sym:`
      <rect x="14" y="26" width="52" height="32" rx="3" fill="#F4EFE8"/>
      <rect x="24" y="20" width="20" height="8" rx="1" fill="#F4EFE8"/>
      <circle cx="40" cy="42" r="12" fill="#5C6878"/>
      <circle cx="40" cy="42" r="8" fill="#1A1410"/>
      <circle cx="40" cy="42" r="4" fill="#5BB4D2"/>
      <circle cx="38" cy="40" r="1.5" fill="#F4EFE8"/>
      <circle cx="58" cy="32" r="2" fill="#E05A3A"/>`},

    { key:'painting', bg:'#E6B574', sym:`
      <ellipse cx="40" cy="42" rx="26" ry="20" fill="#F4EFE8"/>
      <circle cx="26" cy="34" r="4" fill="#E05A3A"/>
      <circle cx="38" cy="28" r="4" fill="#E6B574"/>
      <circle cx="52" cy="32" r="4" fill="#1A7840"/>
      <circle cx="56" cy="44" r="4" fill="#5BB4D2"/>
      <circle cx="48" cy="54" r="4" fill="#A03CB4"/>
      <circle cx="32" cy="52" r="4" fill="#D4517A"/>
      <circle cx="40" cy="42" r="5" fill="none" stroke="#1A1410" stroke-width="1.5"/>
      <path d="M58 22 L70 14" stroke="#9C3F2C" stroke-width="3" stroke-linecap="round"/>
      <path d="M58 22 L62 18 L66 22 Z" fill="#E6B574"/>`},

    { key:'music', bg:'#D4517A', sym:`
      <path d="M30 20 H56 V46 a6 6 0 0 1 -12 0 a6 6 0 0 1 6 -6 a6 6 0 0 1 6 1 V20" fill="none" stroke="#F4EFE8" stroke-width="3.5"/>
      <ellipse cx="38" cy="46" rx="6" ry="5" fill="#F4EFE8"/>
      <path d="M30 20 H56" stroke="#F4EFE8" stroke-width="3.5"/>
      <path d="M30 20 L24 24" stroke="#F4EFE8" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="58" cy="28" r="2" fill="#E6B574"/>
      <circle cx="22" cy="56" r="2" fill="#E6B574"/>`},

    { key:'fishing', bg:'#3B6E52', sym:`
      <path d="M14 22 L28 60" stroke="#9C3F2C" stroke-width="3" stroke-linecap="round"/>
      <path d="M28 60 L60 38" stroke="#F4EFE8" stroke-width="1.5" stroke-dasharray="2 2"/>
      <circle cx="60" cy="38" r="2" fill="#E6B574"/>
      <path d="M52 50 Q60 46 64 52 Q60 58 52 54 L46 60 V44 Z" fill="#E6B574"/>
      <circle cx="58" cy="52" r="1.2" fill="#1A1410"/>
      <path d="M16 64 Q24 60 32 64 Q40 68 48 64 Q56 60 64 64" stroke="#5BB4D2" stroke-width="1.5" fill="none"/>`},

    { key:'sailing', bg:'#5BB4D2', sym:`
      <path d="M40 14 L40 44 L22 44 Z" fill="#F4EFE8"/>
      <path d="M40 18 L54 44 L40 44 Z" fill="#E05A3A"/>
      <line x1="40" y1="12" x2="40" y2="44" stroke="#1A1410" stroke-width="2"/>
      <path d="M14 50 H66 L60 60 H20 Z" fill="#9C3F2C"/>
      <circle cx="24" cy="55" r="1.5" fill="#E6B574"/>
      <circle cx="40" cy="55" r="1.5" fill="#E6B574"/>
      <circle cx="56" cy="55" r="1.5" fill="#E6B574"/>
      <path d="M10 64 Q18 60 26 64 Q34 68 42 64 Q50 60 58 64 Q66 68 70 64" stroke="#F4EFE8" stroke-width="2" fill="none"/>`},

    { key:'sunbathe', bg:'#E8C46E', sym:`
      <rect x="14" y="40" width="52" height="6" rx="1" fill="#9C3F2C"/>
      <rect x="14" y="46" width="52" height="3" fill="#6B5C4E"/>
      <rect x="18" y="49" width="4" height="14" fill="#6B5C4E"/>
      <rect x="58" y="49" width="4" height="14" fill="#6B5C4E"/>
      <circle cx="22" cy="32" r="5" fill="#C4714A"/>
      <rect x="18" y="30" width="8" height="2" fill="#1A1410"/>
      <path d="M28 38 L60 38 L60 42 L28 42 Z" fill="#C4714A"/>
      <circle cx="60" cy="20" r="6" fill="#E05A3A"/>
      <path d="M60 10 L62 16 M70 20 L64 22 M60 30 L62 24 M50 20 L56 22" stroke="#E05A3A" stroke-width="2" stroke-linecap="round"/>`},

    { key:'shopping', bg:'#D4517A', sym:`
      <path d="M22 26 H58 V64 a2 2 0 0 1 -2 2 H24 a2 2 0 0 1 -2 -2 Z" fill="#F4EFE8"/>
      <path d="M22 26 H58 V32 H22 Z" fill="#9C3F2C"/>
      <path d="M30 26 V20 a10 10 0 0 1 20 0 V26" stroke="#9C3F2C" stroke-width="3" fill="none"/>
      <rect x="32" y="40" width="4" height="14" fill="#D4517A"/>
      <rect x="40" y="40" width="4" height="14" fill="#D4517A"/>
      <rect x="48" y="40" width="4" height="14" fill="#D4517A"/>`},

    { key:'spa', bg:'#6FB89A', sym:`
      <circle cx="40" cy="40" r="6" fill="#E6B574"/>
      <ellipse cx="40" cy="22" rx="5" ry="9" fill="#F4EFE8"/>
      <ellipse cx="40" cy="58" rx="5" ry="9" fill="#F4EFE8"/>
      <ellipse cx="22" cy="40" rx="9" ry="5" fill="#F4EFE8"/>
      <ellipse cx="58" cy="40" rx="9" ry="5" fill="#F4EFE8"/>
      <ellipse cx="27" cy="27" rx="6" ry="4" fill="#F4EFE8" transform="rotate(-45 27 27)"/>
      <ellipse cx="53" cy="27" rx="6" ry="4" fill="#F4EFE8" transform="rotate(45 53 27)"/>
      <ellipse cx="27" cy="53" rx="6" ry="4" fill="#F4EFE8" transform="rotate(45 27 53)"/>
      <ellipse cx="53" cy="53" rx="6" ry="4" fill="#F4EFE8" transform="rotate(-45 53 53)"/>
      <circle cx="40" cy="40" r="3" fill="#C4714A"/>`},

    { key:'nightlife', bg:'#6E4163', sym:`
      <rect x="14" y="48" width="52" height="16" rx="2" fill="#1A1410"/>
      <rect x="14" y="48" width="52" height="6" fill="#9C3F2C"/>
      <circle cx="24" cy="58" r="3" fill="#E6B574"/>
      <circle cx="36" cy="58" r="3" fill="#5BB4D2"/>
      <circle cx="48" cy="58" r="3" fill="#D4517A"/>
      <circle cx="58" cy="58" r="3" fill="#1A7840"/>
      <path d="M20 20 L28 28 L24 30 L28 38 L20 30 L24 28 Z M50 14 L56 20 L52 22 L56 28 L50 22 L54 20 Z M40 24 L46 30 L42 32 L46 38 L40 32 L44 30 Z" fill="#E6B574"/>
      <circle cx="40" cy="44" r="2" fill="#F4EFE8"/>`},

    { key:'gallery', bg:'#1A1410', sym:`
      <rect x="14" y="20" width="52" height="40" rx="2" fill="#F4EFE8"/>
      <rect x="18" y="24" width="16" height="20" fill="#E05A3A"/>
      <circle cx="26" cy="32" r="3" fill="#E6B574"/>
      <path d="M18 44 L22 38 L26 42 L30 36 L34 44 Z" fill="#1A7840"/>
      <rect x="38" y="24" width="10" height="14" fill="#5BB4D2"/>
      <rect x="38" y="42" width="10" height="6" fill="#9C3F2C"/>
      <rect x="52" y="24" width="12" height="24" fill="#E8C46E"/>
      <circle cx="58" cy="36" r="4" fill="#9C3F2C"/>
      <rect x="14" y="60" width="52" height="4" fill="#6B5C4E"/>`},

    { key:'reading', bg:'#9C3F2C', sym:`
      <path d="M14 22 L40 18 V58 L14 62 Z" fill="#F4EFE8"/>
      <path d="M40 18 L66 22 V62 L40 58 Z" fill="#E6B574"/>
      <path d="M40 18 V58" stroke="#1A1410" stroke-width="1.5"/>
      <path d="M18 30 L36 27 M18 36 L36 33 M18 42 L36 39 M18 48 L32 46" stroke="#9C3F2C" stroke-width="1.5"/>
      <path d="M44 30 L62 33 M44 36 L62 39 M44 42 L62 45 M44 48 L58 50" stroke="#1A1410" stroke-width="1.5"/>`},

    { key:'journal', bg:'#3B6E52', sym:`
      <rect x="16" y="14" width="48" height="52" rx="2" fill="#C4714A"/>
      <rect x="20" y="18" width="40" height="44" fill="#F4EFE8"/>
      <line x1="40" y1="14" x2="40" y2="66" stroke="#9C3F2C" stroke-width="1.5"/>
      <path d="M24 26 L36 26 M24 32 L34 32 M24 38 L36 38" stroke="#1A1410" stroke-width="1.5"/>
      <path d="M44 28 L56 28 M44 34 L56 34 M44 40 L52 40" stroke="#1A1410" stroke-width="1.5"/>
      <circle cx="50" cy="50" r="4" fill="#E6B574"/>
      <path d="M50 54 L56 60" stroke="#9C3F2C" stroke-width="2"/>`},

    { key:'stargaze', bg:'#1A1410', sym:`
      <circle cx="22" cy="20" r="1.5" fill="#F4EFE8"/>
      <circle cx="38" cy="14" r="2" fill="#E6B574"/>
      <circle cx="54" cy="22" r="1.5" fill="#F4EFE8"/>
      <circle cx="62" cy="30" r="1" fill="#F4EFE8"/>
      <circle cx="18" cy="34" r="1" fill="#F4EFE8"/>
      <circle cx="48" cy="28" r="1.2" fill="#F4EFE8"/>
      <path d="M28 22 L38 14 L48 28" stroke="#E6B574" stroke-width="1" stroke-dasharray="2 2" fill="none"/>
      <path d="M16 60 L40 40 L64 60 Z" fill="#3B6E52" opacity="0.5"/>
      <path d="M14 60 L40 40 L66 60 Z" fill="none" stroke="#6FB89A" stroke-width="1.5"/>
      <circle cx="40" cy="56" r="2" fill="#C4714A"/>`},
  ]},

/* ╔════ 08 · Gear & Packing ═════════════════════════════╗ */
{ chapter:'Gear & Packing', accent:'#6B5C4E',
  lede:"The things you'll wish you remembered. The things you'll wish you forgot.",
  icons: [
    { key:'backpack', bg:'#3B6E52', sym:`
      <path d="M28 22 a12 8 0 0 1 24 0 V28 H28 Z" fill="#1A7840"/>
      <rect x="20" y="26" width="40" height="38" rx="4" fill="#6FB89A"/>
      <rect x="24" y="34" width="32" height="20" rx="2" fill="#F4EFE8"/>
      <rect x="28" y="38" width="24" height="2" fill="#9C3F2C"/>
      <rect x="30" y="44" width="20" height="8" rx="1" fill="#E6B574"/>
      <circle cx="40" cy="48" r="1.5" fill="#9C3F2C"/>
      <path d="M20 30 L14 36 V52 L20 56 M60 30 L66 36 V52 L60 56" stroke="#1A7840" stroke-width="4" fill="none" stroke-linecap="round"/>`},

    { key:'suitcase', bg:'#9C3F2C', sym:`
      <path d="M30 22 H50 V28 H30 Z" fill="none" stroke="#1A1410" stroke-width="2.5"/>
      <rect x="14" y="28" width="52" height="36" rx="3" fill="#C4714A"/>
      <rect x="14" y="38" width="52" height="3" fill="#9C3F2C"/>
      <rect x="14" y="52" width="52" height="3" fill="#9C3F2C"/>
      <rect x="36" y="32" width="8" height="4" rx="1" fill="#E6B574"/>
      <rect x="22" y="60" width="6" height="6" fill="#1A1410"/>
      <rect x="52" y="60" width="6" height="6" fill="#1A1410"/>`},

    { key:'duffel', bg:'#1A1410', sym:`
      <path d="M14 36 a6 6 0 0 1 6 -6 H60 a6 6 0 0 1 6 6 V52 a4 4 0 0 1 -4 4 H18 a4 4 0 0 1 -4 -4 Z" fill="#C4714A"/>
      <path d="M20 30 V22 a4 4 0 0 1 4 -4 H30 M50 30 V22 a4 4 0 0 1 4 -4 H56" stroke="#9C3F2C" stroke-width="3" fill="none"/>
      <rect x="32" y="38" width="16" height="6" rx="1" fill="#E6B574"/>
      <circle cx="40" cy="48" r="1.5" fill="#1A1410"/>
      <path d="M14 56 H66" stroke="#9C3F2C" stroke-width="2"/>`},

    { key:'daypack', bg:'#5BB4D2', sym:`
      <path d="M30 24 a10 6 0 0 1 20 0 V28 H30 Z" fill="#1E91AF"/>
      <rect x="22" y="26" width="36" height="36" rx="4" fill="#1446B4"/>
      <rect x="26" y="36" width="28" height="14" rx="2" fill="#F4EFE8"/>
      <rect x="30" y="42" width="20" height="4" fill="#E05A3A"/>
      <rect x="22" y="30" width="36" height="4" fill="#5BB4D2"/>`},

    { key:'sunglasses', bg:'#E8C46E', sym:`
      <path d="M10 30 H70" stroke="#1A1410" stroke-width="3"/>
      <rect x="14" y="30" width="22" height="20" rx="6" fill="#1A1410"/>
      <rect x="44" y="30" width="22" height="20" rx="6" fill="#1A1410"/>
      <path d="M36 36 H44" stroke="#1A1410" stroke-width="3"/>
      <rect x="18" y="34" width="14" height="12" rx="4" fill="#5BB4D2"/>
      <rect x="48" y="34" width="14" height="12" rx="4" fill="#5BB4D2"/>
      <circle cx="22" cy="38" r="2" fill="#F4EFE8"/>
      <circle cx="52" cy="38" r="2" fill="#F4EFE8"/>`},

    { key:'hat', bg:'#C8781E', sym:`
      <path d="M12 50 a28 8 0 0 1 56 0 V54 H12 Z" fill="#9C3F2C"/>
      <path d="M22 50 a18 22 0 0 1 36 0 Z" fill="#C4714A"/>
      <ellipse cx="40" cy="28" rx="18" ry="6" fill="#9C3F2C"/>
      <path d="M22 36 H58" stroke="#1A1410" stroke-width="2"/>
      <rect x="32" y="36" width="16" height="3" fill="#E6B574"/>`},

    { key:'umbrella', bg:'#D4517A', sym:`
      <path d="M14 38 a26 22 0 0 1 52 0 Z" fill="#F4EFE8"/>
      <path d="M14 38 a26 22 0 0 1 52 0" fill="none" stroke="#9C3F2C" stroke-width="2"/>
      <path d="M22 38 a18 18 0 0 1 36 0 M30 38 a10 18 0 0 1 20 0 M40 16 V38" stroke="#9C3F2C" stroke-width="2" fill="none"/>
      <path d="M40 38 V60 a6 6 0 0 1 -12 0" stroke="#1A1410" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="40" cy="16" r="2" fill="#E6B574"/>`},

    { key:'raincoat', bg:'#E6B574', sym:`
      <path d="M20 28 L40 22 L60 28 L62 60 a2 2 0 0 1 -2 2 H50 V44 H30 V62 H20 a2 2 0 0 1 -2 -2 Z" fill="#E6B574"/>
      <path d="M40 22 L40 44" stroke="#9C3F2C" stroke-width="2"/>
      <path d="M40 22 L34 28 L40 32 L46 28 Z" fill="#C8781E"/>
      <rect x="32" y="34" width="3" height="6" fill="#9C3F2C"/>
      <rect x="45" y="34" width="3" height="6" fill="#9C3F2C"/>
      <path d="M16 56 L14 64 M22 60 L20 68 M58 60 L60 68 M64 56 L66 64" stroke="#5BB4D2" stroke-width="2" stroke-linecap="round"/>`},

    { key:'swimsuit', bg:'#1E91AF', sym:`
      <path d="M26 22 H54 L52 36 L46 40 V58 a2 2 0 0 1 -2 2 H40 V46 H36 V60 a2 2 0 0 1 -2 2 H30 V42 L28 36 Z" fill="#D4517A"/>
      <path d="M26 22 H54" stroke="#9C3F2C" stroke-width="2"/>
      <circle cx="36" cy="32" r="2" fill="#E6B574"/>
      <circle cx="44" cy="32" r="2" fill="#E6B574"/>`},

    { key:'sunscreen', bg:'#E05A3A', sym:`
      <rect x="28" y="20" width="24" height="8" rx="2" fill="#F4EFE8"/>
      <path d="M30 28 H50 V60 a2 2 0 0 1 -2 2 H32 a2 2 0 0 1 -2 -2 Z" fill="#E6B574"/>
      <rect x="30" y="34" width="20" height="14" rx="1" fill="#F4EFE8"/>
      <text x="33" y="44" font-family="monospace" font-size="9" fill="#E05A3A" font-weight="700">SPF</text>
      <circle cx="58" cy="22" r="4" fill="#E6B574"/>
      <path d="M58 14 L60 18 M64 22 L60 24 M58 28 L60 26 M52 22 L56 24" stroke="#E6B574" stroke-width="1.5"/>`},

    { key:'flashlight', bg:'#1A1410', sym:`
      <rect x="22" y="40" width="20" height="22" rx="2" fill="#C8944A"/>
      <rect x="22" y="48" width="20" height="2" fill="#9C3F2C"/>
      <path d="M42 36 H56 L60 30 L60 44 L56 38 H42 Z" fill="#E6B574"/>
      <path d="M58 26 L72 18 M62 32 L74 30 M60 38 L72 42" stroke="#E6B574" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
      <circle cx="32" cy="44" r="1.5" fill="#9C3F2C"/>`},

    { key:'charger', bg:'#1A7840', sym:`
      <rect x="14" y="32" width="38" height="22" rx="3" fill="#F4EFE8"/>
      <rect x="20" y="38" width="6" height="10" rx="1" fill="#1A7840"/>
      <rect x="30" y="38" width="6" height="10" rx="1" fill="#1A7840"/>
      <rect x="40" y="38" width="6" height="10" rx="1" fill="#1A7840"/>
      <path d="M52 38 H58 a4 4 0 0 1 0 12 H52 Z" fill="#1A1410"/>
      <path d="M58 38 L66 32 M58 50 L66 56" stroke="#1A1410" stroke-width="3" fill="none" stroke-linecap="round"/>`},

    { key:'plug_adapter', bg:'#5C6878', sym:`
      <rect x="20" y="20" width="40" height="40" rx="6" fill="#F4EFE8"/>
      <circle cx="40" cy="34" r="3" fill="#1A1410"/>
      <circle cx="32" cy="46" r="3" fill="#1A1410"/>
      <circle cx="48" cy="46" r="3" fill="#1A1410"/>
      <path d="M40 14 V20" stroke="#1A1410" stroke-width="3" stroke-linecap="round"/>
      <path d="M40 60 V66" stroke="#1A1410" stroke-width="3" stroke-linecap="round"/>
      <circle cx="40" cy="40" r="22" fill="none" stroke="#E6B574" stroke-width="1.5" stroke-dasharray="3 3"/>`},

    { key:'headphones', bg:'#A03CB4', sym:`
      <path d="M16 42 a24 22 0 0 1 48 0" stroke="#1A1410" stroke-width="4" fill="none"/>
      <rect x="14" y="42" width="14" height="18" rx="3" fill="#D4517A"/>
      <rect x="52" y="42" width="14" height="18" rx="3" fill="#D4517A"/>
      <rect x="18" y="46" width="6" height="10" fill="#1A1410"/>
      <rect x="56" y="46" width="6" height="10" fill="#1A1410"/>
      <circle cx="21" cy="51" r="1" fill="#E6B574"/>`},

    { key:'camera', bg:'#9C3F2C', sym:`
      <rect x="14" y="26" width="52" height="34" rx="3" fill="#1A1410"/>
      <rect x="26" y="20" width="20" height="8" rx="1" fill="#1A1410"/>
      <circle cx="40" cy="42" r="13" fill="#5C6878"/>
      <circle cx="40" cy="42" r="9" fill="#1A1410"/>
      <circle cx="40" cy="42" r="5" fill="#5BB4D2"/>
      <circle cx="38" cy="40" r="1.5" fill="#F4EFE8"/>
      <circle cx="58" cy="32" r="2" fill="#E05A3A"/>`},

    { key:'binoculars', bg:'#2B5340', sym:`
      <rect x="14" y="28" width="22" height="28" rx="4" fill="#C4714A"/>
      <rect x="44" y="28" width="22" height="28" rx="4" fill="#C4714A"/>
      <path d="M36 32 H44" stroke="#1A1410" stroke-width="4"/>
      <circle cx="25" cy="42" r="6" fill="#1A1410"/>
      <circle cx="55" cy="42" r="6" fill="#1A1410"/>
      <circle cx="25" cy="42" r="3" fill="#5BB4D2"/>
      <circle cx="55" cy="42" r="3" fill="#5BB4D2"/>
      <rect x="14" y="24" width="22" height="4" rx="1" fill="#9C3F2C"/>
      <rect x="44" y="24" width="22" height="4" rx="1" fill="#9C3F2C"/>`},

    { key:'water_bottle', bg:'#5BB4D2', sym:`
      <rect x="30" y="14" width="20" height="6" fill="#1A1410"/>
      <path d="M28 24 H52 V58 a4 4 0 0 1 -4 4 H32 a4 4 0 0 1 -4 -4 Z" fill="#F4EFE8"/>
      <path d="M30 30 H50 V56 a2 2 0 0 1 -2 2 H32 a2 2 0 0 1 -2 -2 Z" fill="#5BB4D2"/>
      <rect x="30" y="20" width="20" height="4" fill="#E6B574"/>
      <text x="34" y="46" font-family="monospace" font-size="7" fill="#F4EFE8" font-weight="700">H2O</text>`},

    { key:'first_aid', bg:'#C0392B', sym:`
      <rect x="14" y="26" width="52" height="34" rx="3" fill="#F4EFE8"/>
      <rect x="14" y="26" width="52" height="6" fill="#9C3F2C"/>
      <rect x="36" y="36" width="8" height="20" fill="#C0392B"/>
      <rect x="26" y="42" width="28" height="8" fill="#C0392B"/>
      <rect x="32" y="22" width="16" height="6" fill="#F4EFE8"/>
      <path d="M32 22 V18 H48 V22" stroke="#9C3F2C" stroke-width="2"/>`},

    { key:'toiletries', bg:'#6E4163', sym:`
      <rect x="14" y="40" width="14" height="22" rx="1" fill="#5BB4D2"/>
      <rect x="14" y="40" width="14" height="4" fill="#1A1410"/>
      <text x="16" y="55" font-family="monospace" font-size="5" fill="#F4EFE8" font-weight="700">SOAP</text>
      <rect x="32" y="32" width="14" height="30" rx="1" fill="#D4517A"/>
      <rect x="32" y="32" width="14" height="4" fill="#1A1410"/>
      <rect x="36" y="26" width="6" height="6" fill="#1A1410"/>
      <rect x="50" y="42" width="14" height="20" rx="1" fill="#E6B574"/>
      <rect x="50" y="42" width="14" height="4" fill="#1A1410"/>
      <circle cx="57" cy="38" r="3" fill="#1A1410"/>`},

    { key:'sleep_mask', bg:'#1A1410', sym:`
      <path d="M14 36 a26 8 0 0 1 52 0 V44 a26 8 0 0 1 -52 0 Z" fill="#6E4163"/>
      <path d="M14 36 a26 8 0 0 1 52 0" fill="none" stroke="#F4EFE8" stroke-width="1"/>
      <path d="M14 40 H66" stroke="#F4EFE8" stroke-width="0.5" opacity="0.5"/>
      <path d="M14 36 L4 28 M66 36 L76 28" stroke="#9C3F2C" stroke-width="2.5" fill="none"/>
      <text x="32" y="44" font-family="monospace" font-size="8" fill="#E6B574" font-weight="700">ZZZ</text>`},
  ]},

/* ╔════ 09 · Documents & Money ══════════════════════════╗ */
{ chapter:'Documents & Money', accent:'#C8944A',
  lede:'The papers that prove you went, and the means to keep going.',
  icons: [
    { key:'passport', bg:'#1446B4', sym:`
      <rect x="18" y="14" width="44" height="52" rx="3" fill="#9C3F2C"/>
      <rect x="22" y="18" width="36" height="44" rx="2" fill="#F4EFE8"/>
      <circle cx="40" cy="34" r="10" fill="none" stroke="#9C3F2C" stroke-width="2"/>
      <circle cx="40" cy="34" r="5" fill="#E6B574"/>
      <path d="M40 24 V44 M30 34 H50" stroke="#9C3F2C" stroke-width="1.5"/>
      <rect x="28" y="50" width="24" height="2" fill="#9C3F2C"/>
      <rect x="28" y="54" width="20" height="2" fill="#9C3F2C"/>
      <path d="M48 24 L54 18 L54 22 L50 26 Z" fill="#9C3F2C"/>`},

    { key:'ticket', bg:'#C4714A', sym:`
      <path d="M14 26 H66 V36 a4 4 0 0 0 0 8 V54 H14 V44 a4 4 0 0 0 0 -8 Z" fill="#F4EFE8"/>
      <line x1="40" y1="26" x2="40" y2="54" stroke="#C4714A" stroke-width="2" stroke-dasharray="2 2"/>
      <text x="20" y="42" font-family="monospace" font-size="7" fill="#1A1410" font-weight="700">ADMIT</text>
      <rect x="20" y="44" width="14" height="4" fill="#E6B574"/>
      <rect x="46" y="32" width="14" height="3" fill="#1A1410"/>
      <rect x="46" y="38" width="14" height="3" fill="#1A1410"/>
      <rect x="46" y="44" width="10" height="3" fill="#1A1410"/>`},

    { key:'boarding_pass', bg:'#2A4894', sym:`
      <path d="M10 22 H66 a4 4 0 0 1 4 4 V54 a4 4 0 0 1 -4 4 H10 Z" fill="#F4EFE8"/>
      <path d="M50 22 V58" stroke="#2A4894" stroke-width="1.5" stroke-dasharray="2 2"/>
      <path d="M14 28 L24 30 L34 28 L24 34 L22 44 L20 34 Z" fill="#E05A3A"/>
      <rect x="14" y="48" width="14" height="3" fill="#1A1410"/>
      <rect x="14" y="52" width="20" height="3" fill="#1A1410"/>
      <text x="56" y="36" font-family="monospace" font-size="9" fill="#1A1410" font-weight="700">12A</text>
      <text x="54" y="48" font-family="monospace" font-size="6" fill="#9C3F2C">JFK</text>`},

    { key:'visa_stamp', bg:'#E05A3A', sym:`
      <circle cx="40" cy="40" r="22" fill="none" stroke="#F4EFE8" stroke-width="3" stroke-dasharray="3 1"/>
      <circle cx="40" cy="40" r="16" fill="none" stroke="#F4EFE8" stroke-width="2"/>
      <path d="M28 38 L32 32 H48 L52 38 V44 H28 Z" fill="#F4EFE8"/>
      <circle cx="40" cy="42" r="2" fill="#E05A3A"/>
      <text x="33" y="50" font-family="monospace" font-size="5" fill="#F4EFE8" font-weight="700">VISA</text>`},

    { key:'id_card', bg:'#1A7840', sym:`
      <rect x="14" y="22" width="52" height="36" rx="3" fill="#F4EFE8"/>
      <rect x="14" y="22" width="52" height="8" fill="#1A7840"/>
      <circle cx="26" cy="42" r="7" fill="#E6B574"/>
      <path d="M19 52 a7 7 0 0 1 14 0" fill="#C4714A"/>
      <rect x="40" y="36" width="20" height="3" fill="#1A1410"/>
      <rect x="40" y="42" width="20" height="3" fill="#1A1410"/>
      <rect x="40" y="48" width="14" height="3" fill="#1A1410"/>`},

    { key:'map_paper', bg:'#E8C46E', sym:`
      <path d="M14 24 L30 18 L50 24 L66 18 V58 L50 64 L30 58 L14 64 Z" fill="#F4EFE8"/>
      <path d="M30 18 V58" stroke="#9C3F2C" stroke-width="1" stroke-dasharray="2 2"/>
      <path d="M50 24 V64" stroke="#9C3F2C" stroke-width="1" stroke-dasharray="2 2"/>
      <path d="M18 34 Q24 30 28 34 M36 30 Q42 28 46 32 M54 30 Q60 28 64 32" stroke="#5BB4D2" stroke-width="1.5" fill="none"/>
      <path d="M18 46 Q26 50 30 46 M38 50 Q44 54 48 50 M56 46 Q62 50 64 48" stroke="#5BB4D2" stroke-width="1.5" fill="none"/>
      <circle cx="40" cy="40" r="3" fill="#E05A3A"/>`},

    { key:'guidebook', bg:'#9C3F2C', sym:`
      <rect x="18" y="14" width="44" height="52" rx="2" fill="#E6B574"/>
      <rect x="22" y="18" width="36" height="44" fill="#F4EFE8"/>
      <rect x="22" y="18" width="36" height="14" fill="#1A7840"/>
      <text x="27" y="28" font-family="serif" font-size="9" fill="#F4EFE8" font-weight="700" font-style="italic">GUIDE</text>
      <path d="M26 38 L54 38 M26 44 L48 44 M26 50 L52 50 M26 56 L44 56" stroke="#9C3F2C" stroke-width="1.5"/>`},

    { key:'cash', bg:'#1A7840', sym:`
      <rect x="14" y="24" width="52" height="32" rx="2" fill="#6FB89A"/>
      <rect x="14" y="24" width="52" height="32" rx="2" fill="none" stroke="#F4EFE8" stroke-width="1.5" stroke-dasharray="2 2"/>
      <circle cx="40" cy="40" r="9" fill="#E6B574"/>
      <text x="36" y="44" font-family="serif" font-size="11" fill="#1A1410" font-weight="700">$</text>
      <circle cx="22" cy="32" r="2" fill="#F4EFE8"/>
      <circle cx="58" cy="48" r="2" fill="#F4EFE8"/>`},

    { key:'card', bg:'#2A4894', sym:`
      <rect x="12" y="22" width="56" height="36" rx="4" fill="#5BB4D2"/>
      <rect x="12" y="30" width="56" height="6" fill="#1A1410"/>
      <rect x="18" y="42" width="12" height="10" rx="1" fill="#E6B574"/>
      <path d="M22 46 H26 M22 48 H26" stroke="#9C3F2C" stroke-width="0.8"/>
      <rect x="36" y="46" width="6" height="3" fill="#F4EFE8"/>
      <rect x="44" y="46" width="6" height="3" fill="#F4EFE8"/>
      <rect x="52" y="46" width="6" height="3" fill="#F4EFE8"/>
      <circle cx="58" cy="40" r="3" fill="#E05A3A" opacity="0.7"/>
      <circle cx="62" cy="40" r="3" fill="#E6B574" opacity="0.7"/>`},

    { key:'wallet', bg:'#6B5C4E', sym:`
      <path d="M14 26 a4 4 0 0 1 4 -4 H58 a4 4 0 0 1 4 4 V58 a4 4 0 0 1 -4 4 H18 a4 4 0 0 1 -4 -4 Z" fill="#C4714A"/>
      <path d="M14 32 H66" stroke="#9C3F2C" stroke-width="2"/>
      <circle cx="52" cy="44" r="4" fill="#E6B574"/>
      <rect x="20" y="48" width="20" height="3" fill="#F4EFE8"/>
      <rect x="20" y="54" width="14" height="3" fill="#F4EFE8"/>`},

    { key:'exchange', bg:'#C8944A', sym:`
      <circle cx="26" cy="32" r="10" fill="#1A7840"/>
      <text x="22" y="36" font-family="serif" font-size="11" fill="#F4EFE8" font-weight="700">$</text>
      <circle cx="54" cy="48" r="10" fill="#9C3F2C"/>
      <text x="49" y="52" font-family="serif" font-size="10" fill="#F4EFE8" font-weight="700">€</text>
      <path d="M38 24 H50 L46 20 M50 24 L46 28" stroke="#F4EFE8" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M42 56 H30 L34 60 M30 56 L34 52" stroke="#F4EFE8" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`},

    { key:'receipt', bg:'#E8C46E', sym:`
      <path d="M22 16 H58 V60 L52 56 L46 60 L40 56 L34 60 L28 56 L22 60 Z" fill="#F4EFE8"/>
      <path d="M28 26 H52 M28 32 H48 M28 38 H52 M28 44 H46" stroke="#1A1410" stroke-width="1.5"/>
      <rect x="26" y="20" width="28" height="2" fill="#9C3F2C"/>
      <text x="34" y="54" font-family="monospace" font-size="6" fill="#E05A3A" font-weight="700">TOTAL</text>`},
  ]},

/* ╔════ 10 · People & Social ════════════════════════════╗ */
{ chapter:'People & Social', accent:'#D4517A',
  lede:'The whole point of going.',
  icons: [
    { key:'avatar', bg:'#C4714A', sym:`
      <circle cx="40" cy="30" r="10" fill="#E6B574"/>
      <path d="M20 64 a20 16 0 0 1 40 0 Z" fill="#9C3F2C"/>
      <circle cx="37" cy="29" r="1.5" fill="#1A1410"/>
      <circle cx="43" cy="29" r="1.5" fill="#1A1410"/>
      <path d="M36 34 Q40 36 44 34" stroke="#1A1410" stroke-width="1.5" fill="none" stroke-linecap="round"/>`},

    { key:'group', bg:'#3B6E52', sym:`
      <circle cx="22" cy="28" r="7" fill="#E6B574"/>
      <path d="M12 50 a10 8 0 0 1 20 0 V58 H12 Z" fill="#9C3F2C"/>
      <circle cx="58" cy="28" r="7" fill="#C4714A"/>
      <path d="M48 50 a10 8 0 0 1 20 0 V58 H48 Z" fill="#1A7840"/>
      <circle cx="40" cy="34" r="8" fill="#D4517A"/>
      <path d="M28 58 a12 10 0 0 1 24 0 V64 H28 Z" fill="#E6B574"/>`},

    { key:'couple', bg:'#D4517A', sym:`
      <circle cx="30" cy="26" r="7" fill="#E6B574"/>
      <path d="M22 50 a8 8 0 0 1 16 0 V60 H22 Z" fill="#C4714A"/>
      <circle cx="50" cy="26" r="7" fill="#9C3F2C"/>
      <path d="M42 50 a8 8 0 0 1 16 0 V60 H42 Z" fill="#1A7840"/>
      <path d="M40 40 L36 44 L40 48 L44 44 Z" fill="#F4EFE8"/>`},

    { key:'family', bg:'#E05A3A', sym:`
      <circle cx="24" cy="24" r="6" fill="#E6B574"/>
      <path d="M16 44 a8 8 0 0 1 16 0 V52 H16 Z" fill="#9C3F2C"/>
      <circle cx="56" cy="24" r="6" fill="#C4714A"/>
      <path d="M48 44 a8 8 0 0 1 16 0 V52 H48 Z" fill="#1A7840"/>
      <circle cx="32" cy="52" r="4" fill="#E6B574"/>
      <path d="M28 64 a4 4 0 0 1 8 0 V66 H28 Z" fill="#D4517A"/>
      <circle cx="48" cy="52" r="4" fill="#E6B574"/>
      <path d="M44 64 a4 4 0 0 1 8 0 V66 H44 Z" fill="#5BB4D2"/>`},

    { key:'solo', bg:'#6E4163', sym:`
      <circle cx="40" cy="26" r="9" fill="#E6B574"/>
      <path d="M28 54 a12 10 0 0 1 24 0 V64 H28 Z" fill="#C4714A"/>
      <circle cx="58" cy="56" r="6" fill="none" stroke="#F4EFE8" stroke-width="2" stroke-dasharray="2 1"/>
      <circle cx="22" cy="56" r="4" fill="none" stroke="#F4EFE8" stroke-width="2" stroke-dasharray="2 1"/>
      <circle cx="40" cy="14" r="2" fill="#F4EFE8"/>`},

    { key:'chat', bg:'#5BB4D2', sym:`
      <path d="M14 24 H56 a4 4 0 0 1 4 4 V46 a4 4 0 0 1 -4 4 H30 L20 60 V50 H18 a4 4 0 0 1 -4 -4 Z" fill="#F4EFE8"/>
      <circle cx="26" cy="38" r="2" fill="#5BB4D2"/>
      <circle cx="36" cy="38" r="2" fill="#5BB4D2"/>
      <circle cx="46" cy="38" r="2" fill="#5BB4D2"/>`},

    { key:'invite', bg:'#1A7840', sym:`
      <path d="M14 26 H66 V58 H14 Z" fill="#F4EFE8"/>
      <path d="M14 26 L40 44 L66 26" fill="#E6B574"/>
      <path d="M14 26 L40 44 L66 26" stroke="#9C3F2C" stroke-width="1.5" fill="none"/>
      <circle cx="58" cy="22" r="6" fill="#E05A3A"/>
      <path d="M58 18 V26 M54 22 H62" stroke="#F4EFE8" stroke-width="2" stroke-linecap="round"/>`},

    { key:'share', bg:'#C8944A', sym:`
      <circle cx="22" cy="40" r="7" fill="#1A1410"/>
      <circle cx="56" cy="22" r="7" fill="#E05A3A"/>
      <circle cx="56" cy="58" r="7" fill="#3B6E52"/>
      <path d="M28 38 L50 24 M28 42 L50 56" stroke="#F4EFE8" stroke-width="3"/>`},

    { key:'wave_hello', bg:'#E6B574', sym:`
      <path d="M30 22 L34 14 L40 16 L42 24 L46 16 L52 18 L52 26 L56 22 L60 26 L58 36 L54 44 L48 50 L40 52 L32 50 L26 44 L24 36 L26 26 Z" fill="#C4714A"/>
      <path d="M48 50 L52 58 L42 64 L32 60 Z" fill="#9C3F2C"/>
      <path d="M48 26 L48 38 M40 22 L40 36 M34 22 L34 38" stroke="#9C3F2C" stroke-width="1.5"/>`},

    { key:'tag', bg:'#9C3F2C', sym:`
      <path d="M14 14 H40 L66 40 L40 66 L14 40 Z" fill="#E6B574"/>
      <path d="M14 14 H40 L66 40 L40 66 L14 40 Z" fill="none" stroke="#1A1410" stroke-width="2"/>
      <circle cx="24" cy="24" r="4" fill="#1A1410"/>
      <circle cx="24" cy="24" r="1.5" fill="#E6B574"/>
      <text x="36" y="46" font-family="monospace" font-size="9" fill="#1A1410" font-weight="700">#01</text>`},
  ]},

/* ╔════ 11 · Time & Planning ════════════════════════════╗ */
{ chapter:'Time & Planning', accent:'#3B6E52',
  lede:'Days on a grid, hours on a face, the small math of a trip.',
  icons: [
    { key:'calendar', bg:'#C4714A', sym:`
      <rect x="14" y="22" width="52" height="42" rx="2" fill="#F4EFE8"/>
      <rect x="14" y="22" width="52" height="10" fill="#9C3F2C"/>
      <rect x="22" y="14" width="4" height="14" rx="1" fill="#1A1410"/>
      <rect x="54" y="14" width="4" height="14" rx="1" fill="#1A1410"/>
      <circle cx="24" cy="42" r="2" fill="#1A1410"/>
      <circle cx="34" cy="42" r="2" fill="#1A1410"/>
      <circle cx="44" cy="42" r="3" fill="#E05A3A"/>
      <circle cx="54" cy="42" r="2" fill="#1A1410"/>
      <circle cx="24" cy="52" r="2" fill="#1A1410"/>
      <circle cx="34" cy="52" r="2" fill="#1A1410"/>
      <circle cx="44" cy="52" r="2" fill="#1A1410"/>
      <circle cx="54" cy="52" r="2" fill="#1A1410"/>`},

    { key:'clock', bg:'#1A1410', sym:`
      <circle cx="40" cy="40" r="22" fill="#F4EFE8"/>
      <circle cx="40" cy="40" r="22" fill="none" stroke="#9C3F2C" stroke-width="2"/>
      <circle cx="40" cy="20" r="2" fill="#1A1410"/>
      <circle cx="40" cy="60" r="2" fill="#1A1410"/>
      <circle cx="20" cy="40" r="2" fill="#1A1410"/>
      <circle cx="60" cy="40" r="2" fill="#1A1410"/>
      <line x1="40" y1="40" x2="40" y2="26" stroke="#1A1410" stroke-width="3" stroke-linecap="round"/>
      <line x1="40" y1="40" x2="52" y2="40" stroke="#C4714A" stroke-width="3" stroke-linecap="round"/>
      <circle cx="40" cy="40" r="2.5" fill="#9C3F2C"/>`},

    { key:'hourglass', bg:'#E6B574', sym:`
      <path d="M22 16 H58 V20 L46 38 L58 56 V60 H22 V56 L34 38 L22 20 Z" fill="#F4EFE8"/>
      <path d="M22 16 H58 V20 H22 Z" fill="#9C3F2C"/>
      <path d="M22 56 H58 V60 H22 Z" fill="#9C3F2C"/>
      <path d="M28 22 H52 L42 36 H38 Z" fill="#E6B574"/>
      <path d="M30 50 L40 38 L50 50 H30 Z" fill="#E6B574"/>
      <circle cx="40" cy="40" r="1.5" fill="#C8781E"/>`},

    { key:'timezone', bg:'#1E91AF', sym:`
      <circle cx="40" cy="40" r="22" fill="#F4EFE8"/>
      <path d="M16 38 Q24 32 32 34 Q40 36 46 32 Q52 30 60 32" stroke="#3B6E52" stroke-width="2" fill="none"/>
      <path d="M18 48 Q28 50 38 48 Q48 46 58 50" stroke="#3B6E52" stroke-width="2" fill="none"/>
      <ellipse cx="40" cy="40" rx="8" ry="22" fill="none" stroke="#5BB4D2" stroke-width="1"/>
      <line x1="40" y1="40" x2="48" y2="32" stroke="#1A1410" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="40" y1="40" x2="40" y2="28" stroke="#9C3F2C" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="40" cy="40" r="2" fill="#1A1410"/>`},

    { key:'checklist', bg:'#3B6E52', sym:`
      <rect x="16" y="16" width="48" height="48" rx="2" fill="#F4EFE8"/>
      <circle cx="24" cy="26" r="4" fill="#1A7840"/>
      <path d="M22 26 L23.5 27.5 L26 25" stroke="#F4EFE8" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <rect x="32" y="24" width="26" height="3" fill="#1A1410"/>
      <circle cx="24" cy="40" r="4" fill="#C4714A"/>
      <path d="M22 40 L23.5 41.5 L26 39" stroke="#F4EFE8" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <rect x="32" y="38" width="26" height="3" fill="#1A1410"/>
      <circle cx="24" cy="54" r="4" fill="none" stroke="#1A1410" stroke-width="2"/>
      <rect x="32" y="52" width="18" height="3" fill="#1A1410"/>`},

    { key:'plan', bg:'#9C3F2C', sym:`
      <rect x="14" y="20" width="52" height="44" rx="2" fill="#F4EFE8"/>
      <rect x="14" y="20" width="52" height="8" fill="#9C3F2C"/>
      <rect x="22" y="34" width="36" height="4" rx="1" fill="#E6B574"/>
      <rect x="22" y="42" width="28" height="4" rx="1" fill="#5BB4D2"/>
      <rect x="22" y="50" width="32" height="4" rx="1" fill="#1A7840"/>
      <circle cx="20" cy="36" r="1.5" fill="#9C3F2C"/>
      <circle cx="20" cy="44" r="1.5" fill="#9C3F2C"/>
      <circle cx="20" cy="52" r="1.5" fill="#9C3F2C"/>`},

    { key:'bookmark', bg:'#D4517A', sym:`
      <path d="M24 16 H56 V64 L40 52 L24 64 Z" fill="#F4EFE8"/>
      <path d="M24 16 H56 V64 L40 52 L24 64 Z" fill="none" stroke="#1A1410" stroke-width="2"/>
      <rect x="32" y="28" width="16" height="3" fill="#D4517A"/>
      <rect x="32" y="34" width="16" height="3" fill="#D4517A"/>
      <circle cx="40" cy="44" r="3" fill="#E6B574"/>`},

    { key:'deadline', bg:'#E05A3A', sym:`
      <circle cx="40" cy="40" r="22" fill="#F4EFE8"/>
      <circle cx="40" cy="40" r="22" fill="none" stroke="#9C3F2C" stroke-width="2"/>
      <path d="M40 40 L40 22 A18 18 0 0 1 56 50 Z" fill="#E05A3A"/>
      <line x1="40" y1="40" x2="40" y2="24" stroke="#1A1410" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="40" y1="40" x2="52" y2="46" stroke="#1A1410" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="40" cy="40" r="2" fill="#1A1410"/>
      <path d="M40 16 L36 12 H44 Z" fill="#9C3F2C"/>`},

    { key:'day_night', bg:'#E8C46E', sym:`
      <path d="M14 40 a26 26 0 0 1 52 0 Z" fill="#5BB4D2"/>
      <path d="M14 40 a26 26 0 0 0 52 0 Z" fill="#2A4894"/>
      <circle cx="26" cy="32" r="5" fill="#E6B574"/>
      <path d="M58 48 a8 8 0 1 1 -4 12 a6 6 0 0 0 4 -12 Z" fill="#F4EFE8"/>
      <circle cx="42" cy="20" r="1" fill="#F4EFE8"/>
      <circle cx="40" cy="56" r="1" fill="#F4EFE8"/>
      <circle cx="48" cy="58" r="1" fill="#F4EFE8"/>`},

    { key:'countdown', bg:'#2B5340', sym:`
      <rect x="14" y="26" width="14" height="22" rx="2" fill="#F4EFE8"/>
      <rect x="33" y="26" width="14" height="22" rx="2" fill="#F4EFE8"/>
      <rect x="52" y="26" width="14" height="22" rx="2" fill="#F4EFE8"/>
      <text x="17" y="42" font-family="monospace" font-size="14" fill="#1A1410" font-weight="700">0</text>
      <text x="36" y="42" font-family="monospace" font-size="14" fill="#1A1410" font-weight="700">3</text>
      <text x="55" y="42" font-family="monospace" font-size="14" fill="#E05A3A" font-weight="700">7</text>
      <rect x="14" y="36" width="14" height="2" fill="#9C3F2C" opacity="0.2"/>
      <rect x="33" y="36" width="14" height="2" fill="#9C3F2C" opacity="0.2"/>
      <rect x="52" y="36" width="14" height="2" fill="#9C3F2C" opacity="0.2"/>
      <text x="22" y="58" font-family="monospace" font-size="5" fill="#F4EFE8" font-weight="700">DAYS</text>
      <text x="52" y="58" font-family="monospace" font-size="5" fill="#F4EFE8" font-weight="700">HRS</text>`},
  ]},

/* ╔════ 12 · Souvenirs & Memories ═══════════════════════╗ */
{ chapter:'Souvenirs & Memories', accent:'#D4517A',
  lede:'The small proof you went. Twelve keepsakes for the shelf.',
  icons: [
    { key:'heart', bg:'#D4517A', sym:`
      <path d="M40 60 C 16 44 16 22 30 22 C 36 22 40 28 40 28 C 40 28 44 22 50 22 C 64 22 64 44 40 60 Z" fill="#E05A3A"/>
      <path d="M40 60 C 16 44 16 22 30 22 C 36 22 40 28 40 28 C 40 28 44 22 50 22 C 64 22 64 44 40 60 Z" fill="none" stroke="#9C3F2C" stroke-width="1.5"/>
      <path d="M32 30 Q34 34 36 32" stroke="#F4EFE8" stroke-width="2" fill="none" stroke-linecap="round"/>`},

    { key:'flag_pin', bg:'#1A7840', sym:`
      <line x1="22" y1="14" x2="22" y2="66" stroke="#9C3F2C" stroke-width="3" stroke-linecap="round"/>
      <path d="M22 16 L56 22 L46 30 L56 38 L22 32 Z" fill="#E05A3A"/>
      <circle cx="22" cy="66" r="3" fill="#1A1410"/>
      <rect x="28" y="22" width="4" height="2" fill="#F4EFE8"/>
      <rect x="34" y="24" width="4" height="2" fill="#F4EFE8"/>`},

    { key:'medal', bg:'#C8944A', sym:`
      <path d="M28 14 L20 22 L32 42 H48 L60 22 L52 14 Z" fill="#E05A3A"/>
      <circle cx="40" cy="50" r="16" fill="#E6B574"/>
      <circle cx="40" cy="50" r="12" fill="#C8944A"/>
      <path d="M40 42 L43 48 L50 48 L44 52 L46 58 L40 54 L34 58 L36 52 L30 48 L37 48 Z" fill="#F4EFE8"/>
      <text x="38" y="54" font-family="monospace" font-size="6" fill="#9C3F2C" font-weight="700">1</text>`},

    { key:'postcard', bg:'#5BB4D2', sym:`
      <rect x="12" y="22" width="56" height="36" rx="2" fill="#F4EFE8"/>
      <path d="M16 26 H38 V46 H16 Z" fill="#E6B574"/>
      <path d="M16 38 Q22 30 28 36 Q34 42 38 38 V46 H16 Z" fill="#1A7840"/>
      <circle cx="32" cy="32" r="3" fill="#E8C46E"/>
      <line x1="42" y1="28" x2="64" y2="28" stroke="#1A1410" stroke-width="1"/>
      <line x1="42" y1="34" x2="64" y2="34" stroke="#1A1410" stroke-width="1"/>
      <line x1="42" y1="40" x2="60" y2="40" stroke="#1A1410" stroke-width="1"/>
      <rect x="56" y="46" width="8" height="8" fill="#E05A3A"/>`},

    { key:'stamp_letter', bg:'#9C3F2C', sym:`
      <rect x="20" y="20" width="40" height="40" fill="#F4EFE8"/>
      <rect x="20" y="20" width="40" height="40" fill="none" stroke="#9C3F2C" stroke-width="2" stroke-dasharray="3 1"/>
      <circle cx="40" cy="36" r="9" fill="#E05A3A"/>
      <circle cx="40" cy="36" r="9" fill="none" stroke="#F4EFE8" stroke-width="1"/>
      <path d="M40 30 L42 35 L47 35 L43 38 L45 43 L40 40 L35 43 L37 38 L33 35 L38 35 Z" fill="#F4EFE8"/>
      <text x="30" y="54" font-family="monospace" font-size="6" fill="#1A1410" font-weight="700">PARIS</text>`},

    { key:'polaroid', bg:'#E6B574', sym:`
      <rect x="14" y="14" width="52" height="52" fill="#F4EFE8" transform="rotate(-4 40 40)"/>
      <rect x="18" y="18" width="44" height="34" fill="#5BB4D2" transform="rotate(-4 40 40)"/>
      <circle cx="34" cy="32" r="6" fill="#E6B574" transform="rotate(-4 40 40)"/>
      <path d="M22 44 L30 38 L36 42 L48 32 L56 44" stroke="#1A7840" stroke-width="3" fill="none" transform="rotate(-4 40 40)"/>
      <text x="28" y="62" font-family="monospace" font-size="7" fill="#1A1410" font-weight="500" transform="rotate(-4 40 40)">·Lisbon·</text>`},

    { key:'keychain', bg:'#1A1410', sym:`
      <circle cx="24" cy="28" r="10" fill="none" stroke="#E6B574" stroke-width="4"/>
      <circle cx="24" cy="28" r="3" fill="#E6B574"/>
      <path d="M30 32 L38 40" stroke="#9C3F2C" stroke-width="2.5"/>
      <path d="M36 38 L48 50 L52 46 L48 42 L54 36 L62 44 L54 52 L48 56" fill="#E6B574"/>
      <rect x="44" y="48" width="3" height="3" fill="#1A1410"/>
      <rect x="54" y="42" width="3" height="3" fill="#1A1410"/>`},

    { key:'sticker_burst', bg:'#E05A3A', sym:`
      <path d="M40 14 L46 22 L56 18 L54 28 L64 30 L58 38 L66 44 L56 48 L60 58 L50 56 L48 66 L40 60 L32 66 L30 56 L20 58 L24 48 L14 44 L22 38 L16 30 L26 28 L24 18 L34 22 Z" fill="#E6B574"/>
      <circle cx="40" cy="40" r="14" fill="#F4EFE8"/>
      <text x="34" y="38" font-family="monospace" font-size="6" fill="#E05A3A" font-weight="700">2026</text>
      <text x="30" y="46" font-family="monospace" font-size="6" fill="#1A1410" font-weight="700">TRIPPY</text>`},

    { key:'selfie', bg:'#A03CB4', sym:`
      <rect x="20" y="18" width="40" height="48" rx="6" fill="#1A1410"/>
      <rect x="24" y="26" width="32" height="32" rx="2" fill="#E6B574"/>
      <circle cx="32" cy="38" r="6" fill="#C4714A"/>
      <path d="M26 50 a6 6 0 0 1 12 0" fill="#9C3F2C"/>
      <circle cx="48" cy="42" r="5" fill="#C4714A"/>
      <path d="M43 52 a5 5 0 0 1 10 0" fill="#1A7840"/>
      <circle cx="40" cy="22" r="1.2" fill="#F4EFE8"/>
      <rect x="36" y="60" width="8" height="3" rx="1" fill="#F4EFE8"/>`},

    { key:'memory_book', bg:'#3B6E52', sym:`
      <rect x="14" y="14" width="52" height="52" rx="2" fill="#9C3F2C"/>
      <rect x="18" y="18" width="44" height="44" fill="#F4EFE8"/>
      <rect x="22" y="22" width="14" height="14" fill="#5BB4D2" transform="rotate(-4 29 29)"/>
      <rect x="40" y="24" width="14" height="14" fill="#E6B574" transform="rotate(5 47 31)"/>
      <rect x="22" y="42" width="14" height="14" fill="#D4517A" transform="rotate(3 29 49)"/>
      <rect x="40" y="42" width="14" height="14" fill="#1A7840" transform="rotate(-4 47 49)"/>
      <circle cx="58" cy="14" r="4" fill="#E05A3A"/>`},

    { key:'compass_rose', bg:'#1A1410', sym:`
      <circle cx="40" cy="40" r="24" fill="none" stroke="#E6B574" stroke-width="2"/>
      <circle cx="40" cy="40" r="18" fill="none" stroke="#E6B574" stroke-width="1" stroke-dasharray="2 2"/>
      <path d="M40 12 L44 38 L40 40 L36 38 Z" fill="#E05A3A"/>
      <path d="M40 68 L36 42 L40 40 L44 42 Z" fill="#F4EFE8"/>
      <path d="M68 40 L42 44 L40 40 L42 36 Z" fill="#E6B574"/>
      <path d="M12 40 L38 36 L40 40 L38 44 Z" fill="#E6B574"/>
      <path d="M58 22 L44 38 L40 40 L42 36 Z" fill="#C4714A"/>
      <path d="M58 58 L42 44 L40 40 L44 42 Z" fill="#C4714A"/>
      <path d="M22 58 L38 44 L40 40 L36 42 Z" fill="#C4714A"/>
      <path d="M22 22 L38 36 L40 40 L36 38 Z" fill="#C4714A"/>
      <circle cx="40" cy="40" r="3" fill="#E6B574"/>`},

    { key:'lantern', bg:'#6E4163', sym:`
      <path d="M40 14 V20" stroke="#E6B574" stroke-width="2" stroke-linecap="round"/>
      <path d="M30 20 H50 V24 H30 Z" fill="#9C3F2C"/>
      <path d="M28 24 H52 L48 56 a4 4 0 0 1 -4 4 H36 a4 4 0 0 1 -4 -4 Z" fill="#E6B574"/>
      <path d="M32 28 H48 L45 54 H35 Z" fill="#E05A3A"/>
      <circle cx="40" cy="42" r="6" fill="#E8C46E"/>
      <path d="M28 60 H52 V64 H28 Z" fill="#9C3F2C"/>
      <path d="M40 64 V72" stroke="#E6B574" stroke-width="2" stroke-dasharray="2 2"/>`},
  ]},

];

window.TRIPPY_ATLAS = { ATLAS };
