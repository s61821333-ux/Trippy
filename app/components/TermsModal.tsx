'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import GlassBtn from './ui/GlassBtn';

const TERMS_EN = `TERMS OF USE & PRIVACY POLICY
Last updated: May 2026

PLEASE READ THESE TERMS CAREFULLY BEFORE USING TRIPPY. BY CREATING AN ACCOUNT OR USING THE SERVICE, YOU AGREE TO BE BOUND BY THESE TERMS.

1. ACCEPTANCE OF TERMS
By accessing or using Trippy ("the App", "the Service"), you agree to these Terms of Use and Privacy Policy. If you do not agree, you must not use the Service.

2. DESCRIPTION OF SERVICE
Trippy is a collaborative trip-planning tool that allows users to organize itineraries, track expenses, manage packing lists, and share trip details with invited participants. The Service is provided for personal, non-commercial use only.

3. ELIGIBILITY
You must be at least 16 years of age to use this Service. By using the App, you confirm that you meet this requirement. If you are under 18, you confirm that a parent or legal guardian has reviewed and agreed to these Terms on your behalf.

4. USER ACCOUNTS & AUTHENTICATION
The App uses Google OAuth for authentication. By signing in, you authorise Trippy to access your Google profile name and email address for the sole purpose of identifying your account. We do not access your Google contacts, calendar, or any other Google data.

5. DATA WE COLLECT
We collect and store the following data you provide:
• Google account email and display name
• Trip names, dates, destinations, and participant lists
• Event itineraries (names, times, locations, notes, costs)
• Expense records and packing lists
• Trip notes and emergency contacts entered by you
• App preferences (language, theme, accessibility settings)

We do not collect payment information, precise real-time GPS location, or any sensitive personal data beyond the above.

6. HOW WE USE YOUR DATA
Your data is used exclusively to:
• Provide and operate the Service
• Synchronise trip data across devices and between invited participants
• Generate AI-powered trip suggestions (your trip context is sent to an AI provider for this feature only)
• Improve the App through aggregated, anonymised analytics

We do not sell, rent, or share your personal data with third parties for marketing purposes.

7. DATA SHARING WITH TRIP PARTICIPANTS
When you invite another person to your trip, they will be able to view all trip data including events, expenses, notes, and your display name. You are responsible for only inviting people you trust. Once a user joins a trip, they may retain access until you or they explicitly leave the trip.

8. DATA STORAGE & SECURITY
Trip data is stored on Supabase (a third-party cloud database provider) and protected by Row-Level Security (RLS) policies. While we implement reasonable security measures, no internet transmission is completely secure. You use the Service at your own risk.

9. AI SUGGESTIONS
The "AI Suggestions" feature sends anonymised trip context (day number, event names, location names) to an AI model (Anthropic Claude). No personally identifiable information beyond trip content is included. By using this feature, you consent to this data transfer.

10. NO WARRANTY — TRIP PLANNING TOOL ONLY
THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND. THE APP IS A PLANNING AID ONLY. WE ARE NOT RESPONSIBLE FOR:
• Inaccurate travel times, opening hours, or event availability
• Weather conditions, safety risks, or hazards at any destination
• Financial losses arising from trip plans made using the App
• Data loss due to technical failures
• Decisions made during your actual trip based on information in the App

11. LIMITATION OF LIABILITY
TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE DEVELOPER SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF THE SERVICE, INCLUDING BUT NOT LIMITED TO LOSS OF DATA, PERSONAL INJURY, OR FINANCIAL LOSS DURING TRAVEL.

12. USER RESPONSIBILITIES
You agree to:
• Provide accurate information and not impersonate others
• Not use the Service for unlawful purposes
• Not attempt to reverse-engineer, hack, or disrupt the Service
• Be responsible for all content you add to trips
• Keep your account credentials secure

13. DATA RETENTION & DELETION
You may delete your trip data at any time from within the App. To request full account deletion and erasure of all personal data, contact us at the email below. We will process deletion requests within 30 days.

14. CHANGES TO THESE TERMS
We may update these Terms from time to time. Material changes will be communicated via in-app notice. Continued use after notice constitutes acceptance.

15. GOVERNING LAW
These Terms are governed by the laws of the State of Israel. Any disputes shall be subject to the exclusive jurisdiction of the courts of Tel Aviv, Israel.

16. CONTACT
For questions, data requests, or concerns: guy9d2g5@gmail.com`;

const TERMS_HE = `תנאי שימוש ומדיניות פרטיות
עדכון אחרון: מאי 2026

אנא קרא תנאים אלה בעיון לפני השימוש ב-Trippy. על ידי יצירת חשבון או שימוש בשירות, אתה מסכים לתנאים אלה.

1. קבלת התנאים
על ידי גישה לאפליקציה Trippy ("האפליקציה", "השירות") או שימוש בה, אתה מסכים לתנאי שימוש ומדיניות הפרטיות הללו. אם אינך מסכים, עליך להימנע מהשימוש בשירות.

2. תיאור השירות
Trippy הוא כלי לתכנון טיולים שיתופי המאפשר למשתמשים לארגן לוחות זמנים, לעקוב אחר הוצאות, לנהל רשימות ציוד ולשתף פרטי טיול עם משתתפים מוזמנים. השירות מיועד לשימוש אישי ולא מסחרי בלבד.

3. כשירות לשימוש
עליך להיות בן 16 לפחות כדי להשתמש בשירות זה. בשימוש באפליקציה, אתה מאשר כי אתה עומד בדרישה זו. אם אתה מתחת לגיל 18, אתה מאשר כי הורה או אפוטרופוס קרא ואישר תנאים אלה בשמך.

4. חשבונות משתמש ואימות
האפליקציה משתמשת ב-Google OAuth לצורך אימות. בכניסה לחשבון, אתה מאשר ל-Trippy גישה לשם הפרופיל וכתובת האימייל שלך ב-Google, למטרת זיהוי חשבונך בלבד. אנו לא ניגשים לאנשי הקשר, ליומן או לנתוני Google אחרים שלך.

5. נתונים שאנו אוספים
אנו אוספים ושומרים את הנתונים הבאים שאתה מספק:
• כתובת אימייל ושם תצוגה מחשבון Google
• שמות טיולים, תאריכים, יעדים ורשימות משתתפים
• לוחות זמנים של אירועים (שמות, זמנים, מיקומים, הערות, עלויות)
• רשומות הוצאות ורשימות ציוד
• הערות טיול ואנשי קשר לחירום שהוזנו על ידך
• העדפות אפליקציה (שפה, ערכת נושא, הגדרות נגישות)

אנו לא אוספים מידע על תשלום, מיקום GPS בזמן אמת מדויק, או נתונים אישיים רגישים מעבר לאמור לעיל.

6. כיצד אנו משתמשים בנתוניך
הנתונים שלך משמשים אך ורק ל:
• מתן השירות והפעלתו
• סנכרון נתוני הטיול בין מכשירים ובין משתתפים מוזמנים
• יצירת הצעות טיול מבוססות בינה מלאכותית (הקשר הטיול שלך נשלח לספק AI למטרה זו בלבד)
• שיפור האפליקציה באמצעות ניתוחים אנונימיים ומצטברים

אנו לא מוכרים, משכירים או משתפים את הנתונים האישיים שלך עם צדדים שלישיים למטרות שיווק.

7. שיתוף נתונים עם משתתפי הטיול
כאשר אתה מזמין אדם אחר לטיול שלך, הוא יוכל לראות את כל נתוני הטיול כולל אירועים, הוצאות, הערות ושם התצוגה שלך. אתה אחראי להזמין רק אנשים שאתה סומך עליהם. לאחר שמשתמש מצטרף לטיול, הוא עשוי לשמור גישה עד שאתה או הוא עוזבים את הטיול.

8. אחסון ואבטחת נתונים
נתוני הטיול מאוחסנים ב-Supabase (ספק מסד נתונים בענן של צד שלישי) ומוגנים על ידי מדיניות אבטחה ברמת שורה (RLS). בעוד שאנו מיישמים אמצעי אבטחה סבירים, אף העברת נתונים באינטרנט אינה מאובטחת לחלוטין. אתה משתמש בשירות על אחריותך שלך.

9. הצעות בינה מלאכותית
תכונת "הצעות AI" שולחת הקשר טיול אנונימי (מספר יום, שמות אירועים, שמות מיקומים) למודל AI (Anthropic Claude). לא נכלל מידע מזהה אישי מעבר לתוכן הטיול. בשימוש בתכונה זו, אתה מסכים להעברת נתונים זו.

10. אין אחריות — כלי תכנון טיולים בלבד
השירות מסופק "כמות שהוא" ו"כפי שהוא זמין" ללא אחריות מכל סוג שהוא. האפליקציה היא כלי תכנון בלבד. אנחנו לא אחראים ל:
• זמני נסיעה שגויים, שעות פתיחה או זמינות אירועים
• תנאי מזג אוויר, סיכוני בטיחות או סכנות ביעד כלשהו
• הפסדים כספיים הנובעים מתוכניות טיול שנעשו באמצעות האפליקציה
• אובדן נתונים עקב תקלות טכניות
• החלטות שהתקבלו במהלך הטיול בפועל בהתבסס על מידע באפליקציה

11. הגבלת אחריות
במידה המרבית המותרת על פי חוק, המפתח לא יהיה אחראי לכל נזק עקיף, מקרי, מיוחד או תוצאתי הנובע מהשימוש שלך בשירות, לרבות אך לא רק אובדן נתונים, פגיעה גופנית או הפסד כספי במהלך הנסיעה.

12. אחריות המשתמש
אתה מסכים ל:
• ספק מידע מדויק ולא להתחזות לאחרים
• לא להשתמש בשירות למטרות בלתי חוקיות
• לא לנסות לבצע הנדסה לאחור, לפרוץ או לשבש את השירות
• להיות אחראי לכל תוכן שאתה מוסיף לטיולים
• לשמור על פרטי הגישה לחשבונך

13. שמירת נתונים ומחיקה
תוכל למחוק את נתוני הטיול שלך בכל עת מתוך האפליקציה. כדי לבקש מחיקת חשבון מלאה ומחיקת כל הנתונים האישיים, צור איתנו קשר בכתובת האימייל המופיעה למטה. נעבד בקשות מחיקה תוך 30 ימים.

14. שינויים בתנאים אלה
אנו עשויים לעדכן תנאים אלה מעת לעת. שינויים מהותיים יועברו באמצעות הודעה באפליקציה. המשך השימוש לאחר ההודעה מהווה קבלה.

15. הדין החל
תנאים אלה כפופים לדיני מדינת ישראל. כל סכסוך יהיה נתון לסמכות השיפוט הבלעדית של בתי המשפט בתל אביב, ישראל.

16. יצירת קשר
לשאלות, בקשות נתונים או חששות: guy9d2g5@gmail.com`;

export default function TermsModal() {
  const { acceptTerms } = useAppStore();
  const { locale } = useI18n();
  const isHe = locale === 'he';
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const onScroll = () => {
      const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 40;
      if (nearBottom) setScrolledToBottom(true);
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const termsText = isHe ? TERMS_HE : TERMS_EN;
  const sections = termsText.split('\n\n').filter(Boolean);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(0,0,0,0.72)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          padding: '0 0 env(safe-area-inset-bottom, 0px)',
        }}
      >
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 38 }}
          dir={isHe ? 'rtl' : 'ltr'}
          style={{
            width: '100%',
            maxWidth: 600,
            maxHeight: '92dvh',
            background: 'var(--surface)',
            borderRadius: '24px 24px 0 0',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.28)',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '20px 24px 16px',
            borderBottom: '1px solid var(--border)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 24 }}>📋</span>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
                {isHe ? 'תנאי שימוש ופרטיות' : 'Terms of Use & Privacy'}
              </h2>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>
              {isHe
                ? 'כדי להמשיך, אנא קרא את התנאים הבאים עד הסוף ואשר אותם.'
                : 'To continue, please read the following terms in full and accept them.'}
            </p>
          </div>

          {/* Scrollable body */}
          <div
            ref={bodyRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px 24px',
              scrollbarWidth: 'thin',
              scrollbarColor: 'var(--border-strong) transparent',
            }}
          >
            {/* EN + HE both shown, separated */}
            {[
              { label: '🇺🇸 English', text: TERMS_EN },
              { label: '🇮🇱 עברית', text: TERMS_HE },
            ].map(({ label, text }) => {
              const isHebrew = label.includes('עברית');
              const parts = text.split('\n\n').filter(Boolean);
              return (
                <div key={label} dir={isHebrew ? 'rtl' : 'ltr'} style={{ marginBottom: 36 }}>
                  <div style={{
                    display: 'inline-block',
                    fontSize: 11, fontWeight: 700,
                    color: 'var(--text-3)',
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    marginBottom: 14,
                    padding: '3px 8px',
                    background: 'var(--bg)',
                    borderRadius: 6,
                    border: '1px solid var(--border)',
                  }}>
                    {label}
                  </div>
                  {parts.map((block, i) => {
                    const isHeading = /^\d+\.\s/.test(block) || block === block.toUpperCase() || i === 0;
                    if (isHeading && i === 0) {
                      const [titleLine, ...rest] = block.split('\n');
                      return (
                        <div key={i} style={{ marginBottom: 16 }}>
                          <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
                            {titleLine}
                          </h3>
                          {rest.map((l, j) => (
                            <p key={j} style={{ fontSize: 11, color: 'var(--text-3)', margin: 0, lineHeight: 1.5 }}>{l}</p>
                          ))}
                        </div>
                      );
                    }
                    if (/^\d+\.\s/.test(block)) {
                      const [heading, ...body] = block.split('\n');
                      return (
                        <div key={i} style={{ marginBottom: 14 }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{heading}</p>
                          {body.map((line, j) => (
                            <p key={j} style={{ fontSize: 12, color: 'var(--text-2)', margin: '0 0 3px', lineHeight: 1.6 }}>
                              {line}
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return (
                      <p key={i} style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 12, lineHeight: 1.6 }}>
                        {block}
                      </p>
                    );
                  })}
                </div>
              );
            })}

            {/* Scroll hint */}
            {!scrolledToBottom && (
              <div style={{
                textAlign: 'center', paddingBottom: 8,
                fontSize: 11, color: 'var(--text-3)', fontStyle: 'italic',
              }}>
                {isHe ? '↓ גלול למטה כדי לקרוא ולאשר' : '↓ Scroll to the bottom to accept'}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border)',
            flexShrink: 0,
            background: 'var(--surface)',
          }}>
            {!scrolledToBottom && (
              <p style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', marginBottom: 10 }}>
                {isHe ? 'יש לגלול עד הסוף לפני האישור' : 'Read to the end before accepting'}
              </p>
            )}
            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={!scrolledToBottom}
              onClick={acceptTerms}
              style={{
                width: '100%',
                padding: '14px 20px',
                borderRadius: 'var(--radius-lg)',
                border: 'none',
                cursor: scrolledToBottom ? 'pointer' : 'not-allowed',
                background: scrolledToBottom
                  ? 'linear-gradient(135deg, var(--brand), var(--brand-hover))'
                  : 'var(--border)',
                color: scrolledToBottom ? 'white' : 'var(--text-3)',
                fontSize: 15,
                fontWeight: 700,
                transition: 'all 0.2s ease',
                boxShadow: scrolledToBottom ? 'var(--shadow-md)' : 'none',
              }}
            >
              {isHe ? '✓ אני מסכים לתנאים ולמדיניות הפרטיות' : '✓ I agree to the Terms & Privacy Policy'}
            </motion.button>
            <p style={{ fontSize: 10, color: 'var(--text-3)', textAlign: 'center', marginTop: 10, lineHeight: 1.5 }}>
              {isHe
                ? 'האפליקציה מסופקת "כמות שהיא". אין להסתמך עליה למידע בטיחות קריטי.'
                : 'The app is provided "as-is". Do not rely on it for critical safety decisions during travel.'}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
