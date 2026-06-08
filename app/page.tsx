import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LandingSignIn from './components/LandingSignIn';
import LandingLangToggle from './components/LandingLangToggle';

export const metadata = {
  title: 'Trippy — Plan trips together',
  description: 'The collaborative trip planner for groups. Build itineraries, track budgets, discover places, and travel smarter.',
};

type Locale = 'en' | 'he';

const T = {
  en: {
    eyebrow: 'Collaborative Trip Planning',
    h1a: 'Plan trips.',
    h1b: 'Together.',
    hero: 'Build a shared plan for every day, track your budget, find great places, and keep the whole group in the loop — all in real time.',
    signIn: 'Sign in with Google',
    featuresEyebrow: 'Everything your trip needs',
    about: {
      eyebrow: 'About',
      h2: 'Built for the way groups actually travel',
      p1: 'Planning a group trip means juggling spreadsheets, endless chat threads, and competing Google Docs. Something always falls through the cracks.',
      p2: 'Trippy brings everything into one place — a shared itinerary your whole group can see and edit, a budget tracker that splits costs fairly, an interactive map, and a packing list that stays in sync.',
      p3: 'Whether you are organising a weekend city break or a month-long adventure, Trippy keeps everyone on the same page. Sign in to get started — no payment needed.',
    },
    legalEyebrow: 'Legal',
    legalH2: 'Terms of Use & Privacy',
    ctaH2: 'A destination in mind?',
    ctaBody: 'Sign in and your group can start planning in under a minute. No payment needed.',
    footerLinks: ['Terms', 'Privacy', 'Contact'],
  },
  he: {
    eyebrow: 'תכנון טיולים שיתופי',
    h1a: 'תכנן טיולים.',
    h1b: 'ביחד.',
    hero: 'בנו תוכנית משותפת לכל יום, עקבו אחר התקציב, מצאו מקומות מעולים, ושמרו על כל הקבוצה בתמונה — הכל בזמן אמת.',
    signIn: 'כניסה עם Google',
    featuresEyebrow: 'כל מה שהטיול שלכם צריך',
    about: {
      eyebrow: 'אודות',
      h2: 'בנוי לאופן שבו קבוצות באמת נוסעות',
      p1: 'תכנון טיול קבוצתי אומר להתמודד עם גיליונות אלקטרוניים, שרשורי צ׳אט אינסופיים ומסמכי גוגל מתחרים. תמיד משהו נופל בין הכסאות.',
      p2: 'טריפי מביא הכל למקום אחד — לוח זמנים משותף שכל הקבוצה יכולה לראות ולערוך, מעקב תקציב שמחלק עלויות בצורה הוגנת, מפה אינטראקטיבית, ורשימת אריזה שנשארת מסונכרנת.',
      p3: 'בין אם אתם מארגנים טיול סוף שבוע בעיר או הרפתקה חודשית, טריפי שומר על כולם באותו עמוד. התחברו כדי להתחיל — ללא תשלום.',
    },
    legalEyebrow: 'משפטי',
    legalH2: 'תנאי שימוש ופרטיות',
    ctaH2: 'יש יעד ביד?',
    ctaBody: 'התחברו וכל הקבוצה יכולה להתחיל לתכנן תוך פחות מדקה. לא נדרש תשלום.',
    footerLinks: ['תנאים', 'פרטיות', 'יצירת קשר'],
  },
};

const FEATURES = {
  en: [
    {
      path: `<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/>`,
      iconColor: 'var(--brand)', iconBg: 'var(--brand-muted)',
      title: 'Hour-by-hour itineraries',
      desc: 'Build a shared plan for every day — activities, hotels, transport, restaurants. Each change syncs to the whole group straight away.',
    },
    {
      path: `<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>`,
      iconColor: 'var(--terra)', iconBg: 'var(--terra-muted)',
      title: 'Shared budget',
      desc: 'Track expenses, split costs fairly, and see at a glance whether the group is on track.',
    },
    {
      path: `<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14"/>`,
      iconColor: 'var(--brand)', iconBg: 'var(--brand-muted)',
      title: 'Interactive map',
      desc: 'Every stop on a live map. See the whole route, find what is nearby, and share it with anyone.',
    },
    {
      path: `<circle cx="9" cy="8" r="3.5"/><path d="M2 21a7 7 0 0 1 14 0"/><circle cx="17" cy="9" r="3"/><path d="M22 21a5 5 0 0 0-8-4"/>`,
      iconColor: 'var(--sand)', iconBg: 'oklch(68% 0.108 75 / 12%)',
      title: 'Your whole crew',
      desc: 'Invite people by link. Everyone can add ideas, vote on plans, and edit anything until the day you leave.',
    },
    {
      path: `<path d="M4 6.5l1.6 1.6L8.8 5M13 6.5h7M4 12.5l1.6 1.6L8.8 11M13 12.5h7M4 18.5l1.6 1.6L8.8 17M13 18.5h6"/>`,
      iconColor: 'var(--brand)', iconBg: 'var(--brand-muted)',
      title: 'Packing lists',
      desc: 'One shared checklist, organised by category. No one forgets the important things.',
    },
    {
      path: `<path d="M11 3l1.4 5.6L18 10l-5.6 1.4L11 17l-1.4-5.6L4 10l5.6-1.4zM18.5 14l.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7z"/>`,
      iconColor: 'var(--terra)', iconBg: 'var(--terra-muted)',
      title: 'AI assistance',
      desc: 'Ask for place ideas, budget tips, or packing help. Gets smarter the more it knows about your trip.',
    },
  ],
  he: [
    {
      path: `<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/>`,
      iconColor: 'var(--brand)', iconBg: 'var(--brand-muted)',
      title: 'לוח זמנים שעה-שעה',
      desc: 'בנו תוכנית משותפת לכל יום — פעילויות, מלונות, תחבורה, מסעדות. כל שינוי מסתנכרן לכל הקבוצה מיד.',
    },
    {
      path: `<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>`,
      iconColor: 'var(--terra)', iconBg: 'var(--terra-muted)',
      title: 'תקציב משותף',
      desc: 'עקבו אחרי ההוצאות, חלקו עלויות בצורה הוגנת, ודעו בכל רגע האם אתם בתקציב.',
    },
    {
      path: `<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14"/>`,
      iconColor: 'var(--brand)', iconBg: 'var(--brand-muted)',
      title: 'מפה אינטראקטיבית',
      desc: 'כל עצירה על מפה חיה. ראו את המסלול המלא, מצאו מה יש בסביבה, ושתפו עם כולם.',
    },
    {
      path: `<circle cx="9" cy="8" r="3.5"/><path d="M2 21a7 7 0 0 1 14 0"/><circle cx="17" cy="9" r="3"/><path d="M22 21a5 5 0 0 0-8-4"/>`,
      iconColor: 'var(--sand)', iconBg: 'oklch(68% 0.108 75 / 12%)',
      title: 'כל הקבוצה שלכם',
      desc: 'הזמינו אנשים בלינק. כולם יכולים להוסיף רעיונות, להצביע על תוכניות, ולערוך הכל עד יום הנסיעה.',
    },
    {
      path: `<path d="M4 6.5l1.6 1.6L8.8 5M13 6.5h7M4 12.5l1.6 1.6L8.8 11M13 12.5h7M4 18.5l1.6 1.6L8.8 17M13 18.5h6"/>`,
      iconColor: 'var(--brand)', iconBg: 'var(--brand-muted)',
      title: 'רשימות אריזה',
      desc: 'צ׳ק-ליסט משותף אחד, מסודר לפי קטגוריות. אף אחד לא שוכח את הדברים החשובים.',
    },
    {
      path: `<path d="M11 3l1.4 5.6L18 10l-5.6 1.4L11 17l-1.4-5.6L4 10l5.6-1.4zM18.5 14l.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7z"/>`,
      iconColor: 'var(--terra)', iconBg: 'var(--terra-muted)',
      title: 'עזרת AI',
      desc: 'בקשו המלצות על מקומות, טיפים לתקציב, או עזרה באריזה. ככל שיודע יותר על הטיול שלכם, כך הוא שימושי יותר.',
    },
  ],
};

const LEGAL = {
  en: [
    { title: 'Terms of Use', body: 'Trippy is provided for personal, non-commercial trip planning. By signing in you agree to use the service in good faith and not to misuse it or harm other users. We reserve the right to suspend accounts that violate these terms.' },
    { title: 'Privacy', body: 'We store only the information you provide — your name and email via Google OAuth — and the trip data you create. We do not sell your data to third parties. All data is stored securely with row-level security policies.' },
    { title: 'Your Data', body: 'You can delete your account and all associated trip data at any time from the Settings screen inside the app. Deletion is immediate and permanent.' },
    { title: 'Contact', body: 'For questions, support, or concerns, email us at support@trippy.app. We aim to respond within 48 hours.' },
  ],
  he: [
    { title: 'תנאי שימוש', body: 'טריפי מסופק לתכנון טיולים אישי, לא מסחרי. בכניסה אתם מסכימים להשתמש בשירות בתום לב ולא לפגוע במשתמשים אחרים. אנו שומרים את הזכות להשעות חשבונות שמפרים תנאים אלה.' },
    { title: 'פרטיות', body: 'אנו שומרים רק את המידע שאתם מספקים — שם ואימייל דרך Google OAuth — ואת נתוני הטיול שאתם יוצרים. אנחנו לא מוכרים את הנתונים שלכם לצדדים שלישיים. כל המידע מאובטח עם מדיניות אבטחה ברמת שורה.' },
    { title: 'הנתונים שלכם', body: 'תוכלו למחוק את החשבון ואת כל נתוני הטיול שלכם בכל עת מתוך מסך ההגדרות באפליקציה. המחיקה מיידית וקבועה.' },
    { title: 'יצירת קשר', body: 'לשאלות, תמיכה או חששות, שלחו אימייל ל-support@trippy.app. אנו מתכוונים להשיב תוך 48 שעות.' },
  ],
};

export default async function LandingPage() {
  const [supabase, cookieStore] = await Promise.all([createClient(), cookies()]);
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect('/app');

  const locale: Locale = (cookieStore.get('trippy-locale')?.value === 'he') ? 'he' : 'en';
  const t = T[locale];
  const features = FEATURES[locale];
  const legal = LEGAL[locale];

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', fontFamily: 'var(--font-sans)', color: 'var(--text)', overflowX: 'hidden' }}>

      {/* ── HEADER ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        backdropFilter: 'blur(40px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
        background: 'oklch(98% 0.010 75 / 82%)',
        borderBottom: '1px solid var(--border)',
        padding: '0 clamp(20px, 5vw, 80px)',
        height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12,
      }}>
        <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <CompassMark size={26} />
          <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: '-0.04em', color: 'var(--text)' }}>
            Trippy<span style={{ color: 'var(--terra)' }}>.</span>
          </span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LandingLangToggle locale={locale} />
          <LandingSignIn compact locale={locale} />
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{
        position: 'relative',
        padding: 'clamp(80px, 14vh, 160px) clamp(20px, 5vw, 80px) clamp(72px, 11vh, 130px)',
        textAlign: 'center',
        overflow: 'hidden',
      }}>
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <div style={{ position: 'absolute', top: '-10%', left: '10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, oklch(62% 0.115 40 / 8%) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', top: '5%', right: '5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, oklch(42% 0.092 155 / 7%) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 700, height: 300, borderRadius: '50%', background: 'radial-gradient(ellipse, oklch(68% 0.108 75 / 6%) 0%, transparent 70%)' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 820, margin: '0 auto' }}>
          <p style={{
            display: 'inline-block',
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'var(--terra)', background: 'var(--terra-light)',
            padding: '5px 14px', borderRadius: 'var(--radius-full)', marginBottom: 36,
          }}>
            {t.eyebrow}
          </p>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(52px, 9vw, 116px)',
            fontWeight: 400, lineHeight: 1.03, letterSpacing: '-0.025em',
            color: 'var(--text)', marginBottom: 28,
          }}>
            {t.h1a}<br />
            <em style={{ color: 'var(--brand)', fontStyle: 'italic' }}>{t.h1b}</em>
          </h1>

          <p style={{
            fontSize: 'clamp(16px, 2vw, 20px)', lineHeight: 1.7,
            color: 'var(--text-2)', maxWidth: 540, margin: '0 auto 52px',
          }}>
            {t.hero}
          </p>

          <LandingSignIn locale={locale} />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{
        padding: 'clamp(60px, 8vh, 100px) clamp(20px, 5vw, 80px)',
        background: 'var(--bg-alt)',
        borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{
            textAlign: 'center',
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
            letterSpacing: '0.13em', textTransform: 'uppercase',
            color: 'var(--text-3)', marginBottom: 52,
          }}>
            {t.featuresEyebrow}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {features.map(f => (
              <div key={f.title} style={{
                background: 'rgba(255,255,255,0.55)',
                backdropFilter: 'blur(24px) saturate(1.6)',
                WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
                border: '1px solid var(--border)',
                borderTop: '1px solid rgba(255,255,255,0.7)',
                borderLeft: '1px solid rgba(255,255,255,0.4)',
                borderRadius: 'var(--radius-xl)',
                padding: '28px 24px',
                boxShadow: 'var(--shadow-sm), inset 0 1px 0 rgba(255,255,255,0.6)',
              }}>
                <div style={{
                  width: 46, height: 46, borderRadius: 'var(--radius-md)',
                  background: f.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 18,
                }}>
                  <TripIcon path={f.path} color={f.iconColor} />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: 8 }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--text-2)' }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section style={{ padding: 'clamp(60px, 8vh, 100px) clamp(20px, 5vw, 80px)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
            letterSpacing: '0.13em', textTransform: 'uppercase',
            color: 'var(--terra)', marginBottom: 20,
          }}>
            {t.about.eyebrow}
          </p>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 400,
            lineHeight: 1.15, letterSpacing: '-0.02em',
            color: 'var(--text)', marginBottom: 28,
          }}>
            {t.about.h2}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {[t.about.p1, t.about.p2, t.about.p3].map((text, i) => (
              <p key={i} style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--text-2)' }}>{text}</p>
            ))}
          </div>
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 clamp(20px, 5vw, 80px)', borderTop: '1px solid var(--border)' }} />

      {/* ── TERMS & PRIVACY ── */}
      <section id="legal" style={{ padding: 'clamp(60px, 8vh, 100px) clamp(20px, 5vw, 80px)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
            letterSpacing: '0.13em', textTransform: 'uppercase',
            color: 'var(--terra)', marginBottom: 20,
          }}>
            {t.legalEyebrow}
          </p>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 400,
            letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: 32,
          }}>
            {t.legalH2}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {legal.map(item => (
              <div key={item.title} style={{
                background: 'var(--bg-alt)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', padding: '20px 22px',
              }}>
                <p style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: 'var(--text-3)', marginBottom: 8,
                }}>
                  {item.title}
                </p>
                <p style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--text-2)' }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section style={{
        padding: 'clamp(60px, 8vh, 100px) clamp(20px, 5vw, 80px)',
        background: 'var(--bg-alt)', borderTop: '1px solid var(--border)',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(32px, 5vw, 60px)', fontWeight: 400,
          letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: 16,
        }}>
          {t.ctaH2}
        </h2>
        <p style={{ fontSize: 16, color: 'var(--text-2)', marginBottom: 40 }}>{t.ctaBody}</p>
        <LandingSignIn locale={locale} />
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        padding: 'clamp(20px, 3vh, 32px) clamp(20px, 5vw, 80px)',
        borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CompassMark size={18} />
          <span style={{ fontSize: 13, color: 'var(--text-3)', letterSpacing: '-0.01em' }}>© 2026 Trippy</span>
        </div>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {t.footerLinks.map(label => (
            <a key={label} href="#legal" className="footer-link">{label}</a>
          ))}
        </div>
      </footer>

    </div>
  );
}

function CompassMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 240 240" fill="none" aria-hidden="true">
      <path d="M120 36 L138 120 L120 124 L102 120 Z" fill="var(--terra)" />
      <path d="M120 204 L102 120 L120 116 L138 120 Z" fill="var(--brand)" />
      <path d="M204 120 L120 102 L116 120 L120 138 Z" fill="var(--sand)" opacity="0.75" />
      <path d="M36 120 L120 138 L124 120 L120 102 Z" fill="var(--sand)" opacity="0.75" />
      <circle cx="120" cy="120" r="6" fill="var(--text)" />
    </svg>
  );
}

function TripIcon({ path, size = 22, color = 'currentColor' }: { path: string; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" dangerouslySetInnerHTML={{ __html: path }}
    />
  );
}
