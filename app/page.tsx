import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LandingSignIn from './components/LandingSignIn';
import LandingLangToggle from './components/LandingLangToggle';
import LandingNextGuard from './components/LandingNextGuard';

export const metadata = {
  title: 'Trippy — Free Group Trip Planner | Plan Together',
  description: 'Plan your group trip in one shared space. Live itinerary, group budget, interactive map, and packing list — all free.',
  alternates: {
    canonical: 'https://trippy.app',
    languages: {
      'en': 'https://trippy.app',
      'he': 'https://trippy.app',
      'x-default': 'https://trippy.app',
    },
  },
  openGraph: {
    title: 'Trippy — Free Group Trip Planner',
    description: 'Plan your group trip in one shared space. Live itinerary, group budget, interactive map, and packing list — all free.',
    url: 'https://trippy.app',
    siteName: 'Trippy',
    type: 'website',
    images: [{ url: 'https://trippy.app/og-image.png', width: 1200, height: 630, alt: 'Trippy — Group Trip Planner' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trippy — Free Group Trip Planner',
    description: 'Plan your group trip in one shared space. Live itinerary, group budget, interactive map, and packing list — all free.',
    images: ['https://trippy.app/og-image.png'],
  },
};

type Locale = 'en' | 'he';

const T = {
  en: {
    eyebrow: 'Free group trip planning',
    h1a: 'Plan trips.',
    h1b: 'Together.',
    hero: 'One shared plan your whole crew can build, edit, and actually follow — itinerary, budget, map, and packing list, all in one place.',
    signIn: 'Continue with Google',
    trust: ['Completely free', 'No app to download', 'Works on any device'],
    featuresEyebrow: 'Everything your crew needs',
    about: {
      eyebrow: 'Our story',
      h2: 'Made for the chaos of group travel',
      p1: 'Group trips should be fun — not a mess of competing spreadsheets, WhatsApp threads nobody keeps up with, and Google Docs that are never finished.',
      p2: 'Trippy puts everything in one shared space: a live itinerary everyone can edit, a budget you can all see and trust, an interactive map, and a packing list that syncs in real time.',
      p3: 'Weekend trip or month on the road — Trippy keeps your whole crew on the same page. Free to start, no card needed.',
    },
    legalEyebrow: 'Legal',
    legalH2: 'Terms & Privacy',
    ctaEyebrow: 'Ready when you are',
    ctaH2: 'Where are you headed?',
    ctaBody: 'Your group can start planning in under a minute. Free — no card, no catch.',
    footerLinks: ['Terms', 'Privacy', 'Contact'],
  },
  he: {
    eyebrow: 'תכנון טיולים קבוצתי — בחינם',
    h1a: 'תכננו טיולים.',
    h1b: 'ביחד.',
    hero: 'תוכנית משותפת אחת שכל הקבוצה בונה, עורכת ועוקבת אחריה — לוח זמנים, תקציב, מפה ורשימת אריזה, הכל במקום אחד.',
    signIn: 'כניסה עם Google',
    trust: ['חינמי לחלוטין', 'ללא הורדת אפליקציה', 'עובד בכל מכשיר'],
    featuresEyebrow: 'כל מה שהצוות שלכם צריך',
    about: {
      eyebrow: 'הסיפור שלנו',
      h2: 'נולד מהכאוס של טיול קבוצתי',
      p1: 'טיולים קבוצתיים אמורים להיות כיף — לא מלחמה בין גיליונות אלקטרוניים, שרשורי וואטסאפ שאף אחד לא עוקב אחריהם, ומסמכי גוגל שאף פעם לא מוגמרים.',
      p2: 'טריפי מביא הכל למקום אחד: לוח זמנים חי שכולם יכולים לערוך, תקציב שנשאר מעודכן, מפה אינטראקטיבית ורשימת אריזה שמסתנכרנת בזמן אמת.',
      p3: 'בין אם זה חופשת סוף שבוע או חודש בדרכים — טריפי שומר על כל הקבוצה באותו עמוד. בחינם, ללא צורך בכרטיס אשראי.',
    },
    legalEyebrow: 'משפטי',
    legalH2: 'תנאים ופרטיות',
    ctaEyebrow: 'מוכנים?',
    ctaH2: 'לאן הפעם?',
    ctaBody: 'הקבוצה שלכם יכולה להתחיל לתכנן תוך פחות מדקה. בחינם, ללא כרטיס אשראי.',
    footerLinks: ['תנאים', 'פרטיות', 'יצירת קשר'],
  },
};

const FEATURES = {
  en: [
    {
      path: `<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/>`,
      iconColor: 'var(--brand)', iconBg: 'var(--brand-muted)',
      title: 'Day-by-day itinerary',
      desc: 'Build a shared plan for every day — activities, hotels, transport, restaurants. Every change syncs to the whole group instantly.',
    },
    {
      path: `<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>`,
      iconColor: 'var(--terra)', iconBg: 'var(--terra-muted)',
      title: 'Group budget',
      desc: 'Log expenses, split costs fairly, and see at a glance whether you\'re on track. No more post-trip surprises.',
    },
    {
      path: `<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14"/>`,
      iconColor: 'var(--brand)', iconBg: 'var(--brand-muted)',
      title: 'Live trip map',
      desc: 'Every stop on a live map. See the full route, discover what\'s nearby, and share it with your crew.',
    },
    {
      path: `<circle cx="9" cy="8" r="3.5"/><path d="M2 21a7 7 0 0 1 14 0"/><circle cx="17" cy="9" r="3"/><path d="M22 21a5 5 0 0 0-8-4"/>`,
      iconColor: 'var(--sand)', iconBg: 'var(--sand-light)',
      title: 'Bring your crew',
      desc: 'Invite people by link. Everyone can add ideas, vote on plans, and edit anything — right up until you leave.',
    },
    {
      path: `<path d="M4 6.5l1.6 1.6L8.8 5M13 6.5h7M4 12.5l1.6 1.6L8.8 11M13 12.5h7M4 18.5l1.6 1.6L8.8 17M13 18.5h6"/>`,
      iconColor: 'var(--brand)', iconBg: 'var(--brand-muted)',
      title: 'Shared packing list',
      desc: 'One checklist for the whole group, sorted by category. Nobody forgets the essentials.',
    },
    {
      path: `<path d="M11 3l1.4 5.6L18 10l-5.6 1.4L11 17l-1.4-5.6L4 10l5.6-1.4zM18.5 14l.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7z"/>`,
      iconColor: 'var(--terra)', iconBg: 'var(--terra-muted)',
      title: 'AI trip helper',
      desc: 'Ask for place ideas, budget tips, or packing advice. The more it knows about your trip, the more useful it gets.',
    },
  ],
  he: [
    {
      path: `<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/>`,
      iconColor: 'var(--brand)', iconBg: 'var(--brand-muted)',
      title: 'לוח זמנים יום-יום',
      desc: 'בנו תוכנית משותפת לכל יום — פעילויות, מלונות, תחבורה, מסעדות. כל שינוי מסתנכרן לכל הקבוצה מיד.',
    },
    {
      path: `<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>`,
      iconColor: 'var(--terra)', iconBg: 'var(--terra-muted)',
      title: 'תקציב הקבוצה',
      desc: 'עקבו אחרי ההוצאות, חלקו עלויות בצורה הוגנת, ודעו בכל רגע אם אתם בגבולות. לא עוד הפתעות אחרי הטיול.',
    },
    {
      path: `<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14"/>`,
      iconColor: 'var(--brand)', iconBg: 'var(--brand-muted)',
      title: 'מפה חיה של המסלול',
      desc: 'כל עצירה על מפה חיה. ראו את המסלול המלא, מצאו מה יש בסביבה, ושתפו עם כולם.',
    },
    {
      path: `<circle cx="9" cy="8" r="3.5"/><path d="M2 21a7 7 0 0 1 14 0"/><circle cx="17" cy="9" r="3"/><path d="M22 21a5 5 0 0 0-8-4"/>`,
      iconColor: 'var(--sand)', iconBg: 'var(--sand-light)',
      title: 'הביאו את כולם',
      desc: 'הזמינו בקישור. כולם יכולים להוסיף רעיונות, להצביע על תוכניות ולערוך הכל — עד שיוצאים לדרך.',
    },
    {
      path: `<path d="M4 6.5l1.6 1.6L8.8 5M13 6.5h7M4 12.5l1.6 1.6L8.8 11M13 12.5h7M4 18.5l1.6 1.6L8.8 17M13 18.5h6"/>`,
      iconColor: 'var(--brand)', iconBg: 'var(--brand-muted)',
      title: 'רשימת אריזה משותפת',
      desc: 'צ׳ק-ליסט אחד לכל הקבוצה, מסודר לפי קטגוריות. אף אחד לא שוכח את הדברים החשובים.',
    },
    {
      path: `<path d="M11 3l1.4 5.6L18 10l-5.6 1.4L11 17l-1.4-5.6L4 10l5.6-1.4zM18.5 14l.7 2.3 2.3.7-2.3.7-.7 2.3-.7 2.3-.7-2.3-2.3-.7 2.3-.7z"/>`,
      iconColor: 'var(--terra)', iconBg: 'var(--terra-muted)',
      title: 'עוזר AI לטיול',
      desc: 'בקשו המלצות על מקומות, טיפים לתקציב, או עזרה באריזה. ככל שיודע יותר על הטיול שלכם, כך הוא שימושי יותר.',
    },
  ],
};

const FAQ = {
  en: [
    {
      q: 'What is Trippy?',
      a: 'Trippy is a free collaborative group trip planner. It gives your whole group a shared space to build a day-by-day itinerary, track the group budget, see stops on a live map, and manage a shared packing list — all in real time.',
    },
    {
      q: 'Is Trippy free?',
      a: 'Yes, completely. Trippy is free to use with no credit card required. Everyone in your group can sign in, edit the trip, and see updates for free.',
    },
    {
      q: 'How do I invite my group?',
      a: 'Share a trip link and anyone you invite can join instantly, add ideas, and edit the plan. No app download required — Trippy works in any browser on any device.',
    },
    {
      q: 'What can we plan together?',
      a: 'Day-by-day activities, hotels, transport, restaurants, group expenses, a shared packing checklist, and an interactive map of all your stops.',
    },
    {
      q: 'Does Trippy work on mobile?',
      a: 'Yes. Trippy is a progressive web app that works on any smartphone or desktop browser. You can add it to your home screen for a native-app feel.',
    },
  ],
  he: [
    {
      q: 'מה זה טריפי?',
      a: 'טריפי הוא מתכנן טיולים קבוצתי חינמי. הוא נותן לכל הקבוצה מרחב משותף לבנות לוח זמנים יום-יום, לעקוב אחרי תקציב הקבוצה, לראות עצירות על מפה חיה, ולנהל רשימת אריזה משותפת — הכל בזמן אמת.',
    },
    {
      q: 'האם טריפי חינמי?',
      a: 'כן, לחלוטין. טריפי חינמי לשימוש ללא צורך בכרטיס אשראי. כל אחד בקבוצה יכול להיכנס, לערוך את הטיול ולראות עדכונים — בחינם.',
    },
    {
      q: 'איך מזמינים את הקבוצה?',
      a: 'שתפו קישור לטיול וכל מי שהזמנתם יכול להצטרף מיד, להוסיף רעיונות ולערוך את התוכנית. אין צורך בהורדת אפליקציה — טריפי עובד בכל דפדפן.',
    },
    {
      q: 'מה אפשר לתכנן ביחד?',
      a: 'פעילויות יום-יום, מלונות, תחבורה, מסעדות, הוצאות הקבוצה, צ׳ק-ליסט אריזה משותף ומפה אינטראקטיבית של כל העצירות.',
    },
    {
      q: 'האם טריפי עובד בנייד?',
      a: 'כן. טריפי הוא אפליקציית ווב שעובדת בכל סמארטפון או דפדפן מחשב. אפשר להוסיף אותה למסך הבית לחוויה כמו אפליקציה.',
    },
  ],
};

const LEGAL = {
  en: [
    { title: 'Terms of Use', body: 'Trippy is for personal, non-commercial trip planning. By signing in you agree to use the service honestly and not to harm other users. We reserve the right to suspend accounts that violate these terms.' },
    { title: 'Privacy', body: 'We store only the information you share with us — your name and email via Google OAuth — plus the trip data you create. We never sell your data. Everything is stored securely with row-level security policies.' },
    { title: 'Your Data', body: 'You can delete your account and all your trip data at any time from Settings inside the app. Deletion is immediate and permanent.' },
    { title: 'Contact', body: 'Questions, feedback, or just want to say hi? Email us at support@trippy.app — we aim to get back to you within 48 hours.' },
  ],
  he: [
    { title: 'תנאי שימוש', body: 'טריפי מיועד לתכנון טיולים אישי, לא מסחרי. בכניסה אתם מסכימים להשתמש בשירות בתום לב ולא לפגוע במשתמשים אחרים. אנו שומרים את הזכות להשעות חשבונות שמפרים תנאים אלה.' },
    { title: 'פרטיות', body: 'אנו שומרים רק את המידע שאתם מספקים לנו — שם ואימייל דרך Google OAuth — ואת נתוני הטיול שיצרתם. לא נמכור את הנתונים שלכם לאף אחד. כל המידע מאוחסן בצורה מאובטחת.' },
    { title: 'הנתונים שלכם', body: 'תוכלו למחוק את החשבון ואת כל נתוני הטיול שלכם בכל עת מתוך מסך ההגדרות באפליקציה. המחיקה מיידית וקבועה.' },
    { title: 'יצירת קשר', body: 'שאלות, משוב, או סתם רוצים להגיד שלום? שלחו אלינו אימייל ל-support@trippy.app — אנחנו מתכוונים לחזור תוך 48 שעות.' },
  ],
};

export default async function LandingPage() {
  const [supabase, cookieStore] = await Promise.all([createClient(), cookies()]);
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect('/app');

  const locale: Locale = (cookieStore.get('trippy-locale')?.value === 'he') ? 'he' : 'en';
  const t = T[locale];
  const features = FEATURES[locale];
  const faq = FAQ[locale];
  const legal = LEGAL[locale];
  const isRTL = locale === 'he';

  const appJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Trippy',
    applicationCategory: 'TravelApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description: 'Collaborative group trip planner. Shared itinerary, group budget, live map, and packing list — free.',
    url: 'https://trippy.app',
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.en.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Trippy',
    url: 'https://trippy.app',
    email: 'support@trippy.app',
    description: 'Free collaborative group trip planning app for friends and families.',
  };

  return (
    <>
      <LandingNextGuard />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />

      {/* Scroll wrapper — body has overflow:hidden for the app shell; this is the landing scroll container */}
      <div
        className="landing-scroll"
        dir={isRTL ? 'rtl' : 'ltr'}
        lang={locale}
      >

        {/* ── HEADER ── */}
        <header className="landing-header">
          <a
            href="/"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexShrink: 0,
            }}
          >
            <CompassMark size={26} />
            <span className="wordmark" style={{ fontSize: 20, color: 'var(--text)' }}>
              Trippy<span className="dot">.</span>
            </span>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LandingLangToggle locale={locale} />
            <LandingSignIn compact locale={locale} />
          </div>
        </header>

        {/* ── HERO ── */}
        <section
          style={{
            position: 'relative',
            padding: 'clamp(72px, 13vh, 148px) clamp(20px, 5vw, 80px) clamp(64px, 10vh, 120px)',
            textAlign: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Ambient orbs — use CSS classes so dark mode vars apply */}
          <div aria-hidden="true">
            <div className="landing-orb-1" />
            <div className="landing-orb-2" />
            <div className="landing-orb-3" />
          </div>

          <div style={{ position: 'relative', zIndex: 1, maxWidth: 820, margin: '0 auto' }}>

            {/* Eyebrow */}
            <p style={{
              display: 'inline-block',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--terra)',
              background: 'var(--terra-light)',
              padding: '5px 16px',
              borderRadius: 'var(--radius-full)',
              marginBottom: 32,
            }}>
              {t.eyebrow}
            </p>

            {/* H1 */}
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(48px, 9vw, 112px)',
              fontWeight: 400,
              lineHeight: 1.03,
              letterSpacing: '-0.025em',
              color: 'var(--text)',
              marginBottom: 24,
            }}>
              {t.h1a}
              <br />
              <em style={{ color: 'var(--brand)', fontStyle: 'italic' }}>{t.h1b}</em>
            </h1>

            {/* Subhead */}
            <p style={{
              fontSize: 'clamp(15px, 2vw, 19px)',
              lineHeight: 1.75,
              color: 'var(--text-2)',
              maxWidth: 520,
              margin: '0 auto 40px',
            }}>
              {t.hero}
            </p>

            {/* CTA */}
            <LandingSignIn locale={locale} />

            {/* Trust pills */}
            <div className="landing-trust" role="list">
              {t.trust.map(item => (
                <span key={item} className="landing-trust-pill" role="listitem">
                  <span className="landing-trust-dot" aria-hidden="true" />
                  {item}
                </span>
              ))}
            </div>

          </div>
        </section>

        {/* ── FEATURES ── */}
        <section
          style={{
            padding: 'clamp(56px, 8vh, 96px) clamp(20px, 5vw, 80px)',
            background: 'var(--bg-alt)',
            borderTop: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <p style={{
              textAlign: 'center',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.13em',
              textTransform: 'uppercase',
              color: 'var(--text-3)',
              marginBottom: 48,
            }}>
              {t.featuresEyebrow}
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 200px), 1fr))',
              gap: 14,
            }}>
              {features.map(f => (
                <div key={f.title} className="landing-card">
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 'var(--radius-md)',
                    background: f.iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                    flexShrink: 0,
                  }}>
                    <TripIcon path={f.path} color={f.iconColor} />
                  </div>
                  <h3 style={{
                    fontSize: 15,
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    color: 'var(--text)',
                    marginBottom: 8,
                    lineHeight: 1.3,
                  }}>
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
        <section style={{ padding: 'clamp(56px, 8vh, 96px) clamp(20px, 5vw, 80px)' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.13em',
              textTransform: 'uppercase',
              color: 'var(--terra)',
              marginBottom: 18,
            }}>
              {t.about.eyebrow}
            </p>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(26px, 4vw, 46px)',
              fontWeight: 400,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              color: 'var(--text)',
              marginBottom: 28,
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

        {/* ── FAQ ── */}
        <section
          style={{
            padding: 'clamp(56px, 8vh, 96px) clamp(20px, 5vw, 80px)',
            background: 'var(--bg-alt)',
            borderTop: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(24px, 3.5vw, 38px)',
              fontWeight: 400,
              letterSpacing: '-0.02em',
              color: 'var(--text)',
              marginBottom: 28,
            }}>
              {locale === 'he' ? 'שאלות נפוצות' : 'Frequently Asked Questions'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {faq.map(item => (
                <div key={item.q} className="landing-card landing-card-sm">
                  <h3 style={{
                    fontSize: 15,
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    color: 'var(--text)',
                    marginBottom: 8,
                  }}>
                    {item.q}
                  </h3>
                  <p style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--text-2)' }}>{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TERMS & PRIVACY ── */}
        <section id="legal" style={{ padding: 'clamp(56px, 8vh, 96px) clamp(20px, 5vw, 80px)' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.13em',
              textTransform: 'uppercase',
              color: 'var(--terra)',
              marginBottom: 18,
            }}>
              {t.legalEyebrow}
            </p>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(24px, 3.5vw, 38px)',
              fontWeight: 400,
              letterSpacing: '-0.02em',
              color: 'var(--text)',
              marginBottom: 28,
            }}>
              {t.legalH2}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {legal.map(item => (
                <div
                  key={item.title}
                  style={{
                    background: 'var(--bg-alt)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '18px 20px',
                  }}
                >
                  <h3 style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.10em',
                    textTransform: 'uppercase',
                    color: 'var(--text-3)',
                    marginBottom: 8,
                  }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--text-2)' }}>{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BOTTOM CTA ── */}
        <section
          style={{
            padding: 'clamp(64px, 10vh, 120px) clamp(20px, 5vw, 80px)',
            background: 'var(--bg-alt)',
            borderTop: '1px solid var(--border)',
            textAlign: 'center',
          }}
        >
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--terra)',
            marginBottom: 20,
          }}>
            {t.ctaEyebrow}
          </p>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(30px, 5vw, 58px)',
            fontWeight: 400,
            letterSpacing: '-0.02em',
            color: 'var(--text)',
            marginBottom: 14,
          }}>
            {t.ctaH2}
          </h2>
          <p style={{
            fontSize: 'clamp(14px, 1.8vw, 17px)',
            color: 'var(--text-2)',
            marginBottom: 36,
            lineHeight: 1.6,
          }}>
            {t.ctaBody}
          </p>
          <LandingSignIn locale={locale} />
          <div className="landing-trust" style={{ marginTop: 28 }} role="list">
            {t.trust.map(item => (
              <span key={item} className="landing-trust-pill" role="listitem">
                <span className="landing-trust-dot" aria-hidden="true" />
                {item}
              </span>
            ))}
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer
          style={{
            padding: 'clamp(18px, 2.5vh, 28px) clamp(20px, 5vw, 80px)',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CompassMark size={18} />
            <span style={{ fontSize: 13, color: 'var(--text-3)', letterSpacing: '-0.01em' }}>
              © 2026 Trippy
            </span>
          </div>
          <nav aria-label={locale === 'he' ? 'קישורי תחתית' : 'Footer links'} style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {t.footerLinks.map(label => (
              <a key={label} href="#legal" className="footer-link">{label}</a>
            ))}
          </nav>
        </footer>

      </div>{/* /landing-scroll */}
    </>
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
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: path }}
    />
  );
}
