import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

// Edge runtime = always warm, zero cold start vs ~5-8s Node.js lambda cold boot.
export const runtime = 'edge';
import LandingSignIn from './components/LandingSignIn';
import LandingNextGuard from './components/LandingNextGuard';
import { LandingSchema } from './components/SchemaMarkup';
import StatementHeading from './components/ui/StatementHeading';

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale = cookieStore.get('Trippy-locale')?.value === 'he' ? 'he' : 'en';

  const alternates = {
    canonical: 'https://letsexploring.com',
    languages: {
      'en-US': 'https://letsexploring.com',
      'he-IL': 'https://letsexploring.com/?lang=he',
    },
  };

  if (locale === 'he') {
    return {
      title: 'Trippy - מתכנן טיולים קבוצתי חינמי | תכנן יחד',
      description:
        'תכנן את הטיול הקבוצתי שלך בחינם - מסלול משותף, מפה אינטראקטיבית, תקציב קבוצתי ורשימת ציוד. הזמן חברים בשניות.',
      alternates,
      openGraph: {
        title: 'Trippy - מתכנן טיולים קבוצתי חינמי',
        description:
          'תכנן את הטיול הקבוצתי שלך בחינם - מסלול משותף, מפה אינטראקטיבית, תקציב קבוצתי ורשימת ציוד.',
        url: 'https://letsexploring.com',
        locale: 'he_IL',
        alternateLocale: ['en_US'],
        images: [{ url: '/og-image-he.png', width: 1200, height: 630, alt: 'Trippy - מתכנן טיולים קבוצתי' }],
      },
    };
  }

  return {
    title: 'Trippy - Free Group Trip Planner | Plan Together',
    description:
      'Plan your group trip for free - shared itinerary, interactive map, group budget, and packing list. Invite friends in seconds.',
    alternates,
    openGraph: {
      title: 'Trippy - Free Group Trip Planner',
      description:
        'Plan your group trip for free - shared itinerary, interactive map, group budget, and packing list.',
      url: 'https://letsexploring.com',
      locale: 'en_US',
      alternateLocale: ['he_IL'],
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Trippy - Group Trip Planner' }],
    },
  };
}

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Strip external ?next= open-redirect params at the server before the client
  // ever sees them, so tests checking page.url() at domcontentloaded pass.
  const sp = await searchParams;
  const nextRaw = sp['next'];
  const nextParam = Array.isArray(nextRaw) ? nextRaw[0] : nextRaw;
  if (nextParam && (/^https?:\/\//i.test(nextParam) || nextParam.startsWith('//'))) {
    const safe = new URLSearchParams(
      Object.fromEntries(
        Object.entries(sp)
          .filter(([k]) => k !== 'next')
          .flatMap(([k, v]) => v === undefined ? [] : [[k, Array.isArray(v) ? v[0] : v]])
      )
    ).toString();
    redirect(safe ? `/?${safe}` : '/');
  }

  const cookieStore = await cookies();
  const locale = cookieStore.get('Trippy-locale')?.value === 'he' ? 'he' as const : 'en' as const;
  const isHe = locale === 'he';

  // Trust the Supabase auth cookie directly — skipping getUser() removes a
  // 200-500ms network round-trip. AppShell validates the session client-side
  // and redirects to '/' if the token is invalid.
  const hasAuthCookie = cookieStore
    .getAll()
    .some((c) => c.name.startsWith('sb-') && c.name.includes('-auth-token'));
  if (hasAuthCookie) redirect('/app');

  const features = isHe ? [
    {
      icon: '📅',
      title: 'מסלול יומי שיתופי',
      desc: 'תכנן את הטיול יום אחרי יום עם כל הקבוצה. הוסף פעילויות, שייך שעות וראה את המסלול המלא בזמן אמת. הצעות AI לפעילויות מקומיות כלולות.',
    },
    {
      icon: '💰',
      title: 'מעקב תקציב קבוצתי',
      desc: 'הגדר תקציב, רשום הוצאות וחשב אוטומטית מי חייב למי - עם תמיכה במטבעות מרובים. אין יותר ויכוחים על כסף אחרי הטיול.',
    },
    {
      icon: '🗺️',
      title: 'מפת טיול אינטראקטיבית',
      desc: 'ראה כל פעילות על מפה אינטראקטיבית. סנן לפי יום, הערך זמני נסיעה וצפה במסלול כולו במבט אחד - גם ללא אינטרנט.',
    },
    {
      icon: '🎒',
      title: 'רשימת ציוד קבוצתית',
      desc: 'צור רשימת ציוד משותפת שכל הקבוצה יכולה לראות ולסמן. סמן פריטים קריטיים, שייך אותם לאנשים ועקוב אחרי ההתקדמות.',
    },
  ] : [
    {
      icon: '📅',
      title: 'Collaborative Itinerary Planner',
      desc: 'Plan your trip day by day with your whole group. Add activities, set times, and share a live itinerary everyone can edit. AI suggestions for local activities are built in.',
    },
    {
      icon: '💰',
      title: 'Group Budget & Expense Splitter',
      desc: 'Set a budget, log every expense, and automatically calculate who owes what - with multi-currency support. No more awkward money talks after the trip.',
    },
    {
      icon: '🗺️',
      title: 'Interactive Trip Map',
      desc: 'See every activity pinned on an interactive map. Filter by day, estimate travel times between stops, and visualize your whole route at a glance - even offline.',
    },
    {
      icon: '🎒',
      title: 'Shared Group Packing List',
      desc: 'Create a packing list your whole group can see and check off together. Mark items as critical, assign them to people, and track progress before departure.',
    },
  ];

  const whyItems = isHe ? [
    { emoji: '✅', label: '100% חינמי - ללא כרטיס אשראי, ללא תוכנית פרמיום' },
    { emoji: '📶', label: 'עובד גם ללא אינטרנט - מסלול, אנשי קשר והערות תמיד זמינים' },
    { emoji: '📱', label: 'אין צורך בהורדה - אפליקציית PWA, עובדת ישירות מהדפדפן' },
    { emoji: '🌐', label: 'עברית ואנגלית - תמיכה מלאה ב-RTL, ממשק דו-לשוני' },
  ] : [
    { emoji: '✅', label: '100% free - no credit card, no premium tier, no catch' },
    { emoji: '📶', label: 'Works offline - itinerary, contacts, and notes always available' },
    { emoji: '📱', label: 'No download needed - PWA that installs directly from the browser' },
    { emoji: '🌐', label: 'English & Hebrew - full RTL support, bilingual interface' },
  ];

  const faqs = isHe ? [
    {
      q: 'האם Trippy באמת חינמי?',
      a: 'כן. Trippy חינמי לחלוטין - אין תוכנית פרמיום, אין כרטיס אשראי נדרש, אין מגבלה על מספר הטיולים או חברי הקבוצה.',
    },
    {
      q: 'איך מזמינים חברים לטיול?',
      a: 'אחרי יצירת טיול, תוכל לשלוח קישור הזמנה בלחיצה אחת. הם מצטרפים דרך הדפדפן - ללא צורך בחשבון.',
    },
    {
      q: 'האם האפליקציה עובדת ללא אינטרנט?',
      a: 'כן. Trippy שומר את תוכנית הטיול מקומית. תוכל לצפות במסלול, באנשי קשר לחירום ובהערות גם ללא חיבור לאינטרנט.',
    },
    {
      q: 'אילו שפות נתמכות?',
      a: 'Trippy תומך באנגלית ועברית עם תמיכה מלאה ב-RTL. שפת הממשק עוקבת אחר העדפות הדפדפן שלך.',
    },
    {
      q: 'איך עובד מחשבון חלוקת ההוצאות?',
      a: 'כל חבר קבוצה רושם הוצאות. Trippy מחשב אוטומטית מי חייב למי ובכמה - עם תמיכה במטבעות מרובים.',
    },
  ] : [
    {
      q: 'Is Trippy really free?',
      a: 'Yes. Trippy is completely free - no premium plan, no credit card required, no limit on trips or group members.',
    },
    {
      q: 'How do I invite friends to a trip?',
      a: 'After creating a trip, send a one-click invite link. Friends join via browser - no account or download needed.',
    },
    {
      q: 'Does it work offline?',
      a: 'Yes. Trippy saves your trip plan locally. You can view the itinerary, emergency contacts, and notes without an internet connection.',
    },
    {
      q: 'What languages does Trippy support?',
      a: 'Trippy supports English and Hebrew with full RTL support. The interface language follows your browser preferences.',
    },
    {
      q: 'How does the expense splitter work?',
      a: 'Each group member logs expenses as they happen. Trippy automatically calculates who owes what and how much - with multi-currency support.',
    },
  ];

  return (
    <>
      <LandingSchema />
      <LandingNextGuard />

      {/* ── Auth wall (full height) ── */}
      <div style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 20px',
        background: 'var(--bg)',
        gap: 0,
      }}>

        {/* Compass mark in a warm-white circle (HANDOFF sign-in) */}
        <div style={{
          width: 76, height: 76, borderRadius: '50%',
          background: 'var(--paper-pill-bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-md), inset 0 1px 0 oklch(100% 0 0 / 60%)',
          marginBottom: 22,
        }}>
          <svg width="42" height="42" viewBox="0 0 240 240" fill="none" aria-hidden="true">
            <path d="M120 36 L138 120 L120 124 L102 120 Z" fill="var(--terra)" />
            <path d="M120 204 L102 120 L120 116 L138 120 Z" fill="var(--brand)" />
            <path d="M204 120 L120 102 L116 120 L120 138 Z" fill="var(--sand)" opacity="0.75" />
            <path d="M36 120 L120 138 L124 120 L120 102 Z" fill="var(--sand)" opacity="0.75" />
            <circle cx="120" cy="120" r="6" fill="var(--text)" />
          </svg>
        </div>

        {/* Wordmark - serif (the one place serif remains) */}
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 32,
          fontWeight: 400,
          letterSpacing: '-0.03em',
          color: 'var(--text)',
          lineHeight: 1,
          margin: '0 0 16px',
        }} aria-hidden="true">
          Trippy<span style={{ color: 'var(--terra)' }}>.</span>
        </div>

        {/* Two-tone statement - bold DM Sans hero (visual, not the SEO h1) */}
        <StatementHeading
          as="p"
          size="base"
          animate={false}
          lines={[
            isHe ? 'מתכננים יחד.' : 'Plan together.',
            isHe ? 'בקלות, ישר מהדפדפן.' : 'The easy way, from your browser.',
          ]}
          style={{ textAlign: 'center', marginBottom: 14 }}
        />

        {/* SEO H1 - keyword-optimised, styled as a mono eyebrow */}
        <h1 className="mono-eyebrow" style={{ margin: '0 0 40px', textAlign: 'center' }}>
          {isHe ? 'מתכנן טיולים קבוצתי חינמי' : 'Free Group Trip Planner'}
        </h1>

        {/* Sign-in buttons */}
        <LandingSignIn locale={locale} />

      </div>

      {/* ── Feature sections (below fold, fully indexable) ── */}
      <div style={{ background: 'var(--bg)' }}>

        {/* Feature grid */}
        <section style={{ padding: '72px 20px 48px', maxWidth: 860, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28,
            fontWeight: 400,
            color: 'var(--text)',
            textAlign: 'center',
            marginBottom: 12,
          }}>
            {isHe ? 'כל מה שצריך לטיול מושלם' : 'Everything your group trip needs'}
          </h2>
          <p style={{
            fontSize: 15,
            color: 'var(--text-2)',
            textAlign: 'center',
            maxWidth: 520,
            margin: '0 auto 48px',
            lineHeight: 1.6,
          }}>
            {isHe
              ? 'מסלול, תקציב, מפה ורשימת ציוד - כולם במקום אחד, לכל חברי הקבוצה'
              : 'Itinerary, budget, map, and packing list - all in one place, for everyone in the group'}
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 24,
          }}>
            {features.map(({ icon, title, desc }) => (
              <div key={title} style={{
                background: 'var(--surface)',
                borderRadius: 16,
                padding: '24px 20px',
                border: '1px solid var(--border)',
              }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{icon}</div>
                <h3 style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: 'var(--text)',
                  marginBottom: 8,
                }}>
                  {title}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Why Trippy */}
        <section style={{ padding: '0 20px 72px', maxWidth: 860, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 24,
            fontWeight: 400,
            color: 'var(--text)',
            marginBottom: 24,
          }}>
            {isHe ? 'למה Trippy?' : 'Why Trippy?'}
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {whyItems.map(({ emoji, label }) => (
              <li key={label} style={{ fontSize: 14, color: 'var(--text-2)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span>{emoji}</span>
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ */}
        <section style={{ padding: '0 20px 80px', maxWidth: 680, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 24,
            fontWeight: 400,
            color: 'var(--text)',
            marginBottom: 24,
          }}>
            {isHe ? 'שאלות נפוצות' : 'Frequently Asked Questions'}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {faqs.map(({ q, a }) => (
              <div key={q}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>{q}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.65, margin: 0 }}>{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section style={{ padding: '0 20px 80px', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 4 }}>
            {isHe ? 'ללא צורך בחשבון לניסיון ההדגמה' : 'No account needed for the demo'}
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-3)', margin: 0 }}>
            {isHe ? '© 2026 Trippy - letsexploring.com' : '© 2026 Trippy - letsexploring.com'}
          </p>
        </section>

      </div>
    </>
  );
}
