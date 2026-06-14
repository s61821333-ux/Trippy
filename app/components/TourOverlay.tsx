'use client';

import { useState, useEffect, useCallback } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { Screen } from '@/lib/types';
import { StampIcon } from './ui/StampIcon';

interface TourStep {
  id: string;
  stamp: string;
  title: string;
  titleHe: string;
  body: string;
  bodyHe: string;
  hint?: string;
  hintHe?: string;
  targetSelector?: string;
  navigateTo?: Screen;
}

const STEPS: TourStep[] = [
  {
    id: 'welcome',
    stamp: 'compass',
    title: 'Welcome to Triplly!',
    titleHe: 'ברוכים הבאים ל-Triplly!',
    body: "Plan trips with friends, hour by hour. Let's take a 60-second tour of the key features.",
    bodyHe: 'תכננו טיולים ביחד, שעה-שעה. בואו ניסייר ב-60 שניות בתכונות העיקריות.',
    navigateTo: 'dashboard',
  },
  {
    id: 'day-cards',
    stamp: 'map',
    title: 'Day-by-Day Schedule',
    titleHe: 'לוח זמנים יום-יום',
    body: 'Each card is one trip day. Tap it to open the hour-by-hour itinerary. The gold free-time chip shows open slots you can fill.',
    bodyHe: 'כל כרטיס הוא יום אחד בטיול. הקישו לפתיחת המסלול שעה-שעה. הצ\'יפ הזהוב מציין פרקי זמן פנויים.',
    targetSelector: '[data-tour="day-cards"]',
    navigateTo: 'dashboard',
  },
  {
    id: 'share',
    stamp: 'group',
    title: 'Invite Your Crew',
    titleHe: 'הזמינו את החבר׳ה',
    body: 'Tap the Crew button to invite friends by link or email. Everyone sees and edits the same trip in real time.',
    bodyHe: 'הקישו על כפתור הצוות להזמנת חברים בקישור או מייל. כולם רואים ועורכים את אותו טיול בזמן אמת.',
    targetSelector: '[data-tour="share-btn"]',
    navigateTo: 'dashboard',
  },
  {
    id: 'explore',
    stamp: 'pin',
    title: 'Explore Tab',
    titleHe: 'לשונית חקור',
    body: 'Tap here to open the full itinerary. Swipe left/right to switch days.',
    bodyHe: 'הקישו כאן לפתיחת המסלול המלא. החליקו שמאל/ימין לעבור בין ימים.',
    targetSelector: '[data-tour="nav-day"]',
    navigateTo: 'day',
  },
  {
    id: 'add-event',
    stamp: 'ticket',
    title: 'Add Events',
    titleHe: 'הוסיפו אירועים',
    body: 'Tap + to add a new activity - set the name, category, and end time. Tap any event to edit or delete it.',
    bodyHe: 'הקישו + להוסיף פעילות - הגדירו שם, קטגוריה ושעת סיום. הקישו על אירוע לעריכה או מחיקה.',
    hint: 'New events start right after the previous one',
    hintHe: 'אירועים חדשים מתחילים מיד אחרי האירוע הקודם',
    targetSelector: '[data-tour="add-event-fab"]',
    navigateTo: 'day',
  },
  {
    id: 'ai',
    stamp: 'stargaze',
    title: 'Local Ideas',
    titleHe: 'רעיונות מקומיים',
    body: 'Tap the sparkle button to get activity ideas for any free-time slot, based on your location.',
    bodyHe: 'הקישו על כפתור הניצוץ לקבלת רעיונות לכל פרק זמן פנוי, לפי מיקומכם.',
    hint: 'Responds in your chosen language',
    hintHe: 'מגיב בשפה שבחרתם',
    targetSelector: '[data-tour="ai-fab"]',
    navigateTo: 'day',
  },
  {
    id: 'pack',
    stamp: 'backpack',
    title: 'Packing List',
    titleHe: 'רשימת ציוד',
    body: 'Track everything you need to pack. Tap items to check them off. Add custom gear for your trip.',
    bodyHe: 'עקבו אחר כל מה שצריך לארוז. הקישו על פריטים לסימון. הוסיפו ציוד מותאם לטיול.',
    targetSelector: '[data-tour="nav-supplies"]',
    navigateTo: 'supplies',
  },
  {
    id: 'done',
    stamp: 'plane',
    title: "You're all set!",
    titleHe: 'אתם מוכנים!',
    body: "Start planning your real trip - create a new one from Settings, or keep exploring this demo.",
    bodyHe: 'התחילו לתכנן את הטיול האמיתי שלכם - צרו חדש בהגדרות, או המשיכו לחקור את ההדגמה.',
    navigateTo: 'dashboard',
  },
];

const PAD = 12;
const CARD_W = 320;
const CARD_H_APPROX = 270;

interface SpotRect { x: number; y: number; w: number; h: number }

function findTourEl(selector: string): Element | null {
  const all = document.querySelectorAll(selector);
  for (const el of Array.from(all)) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return el;
  }
  return null;
}

export default function TourOverlay() {
  const { setShowTour, setScreen } = useAppStore();
  const { locale } = useI18n();
  const isHe = locale === 'he';

  const [stepIdx, setStepIdx] = useState(0);
  const [spotRect, setSpotRect] = useState<SpotRect | null>(null);

  const step = STEPS[stepIdx];
  const isLast = stepIdx === STEPS.length - 1;

  const measureTarget = useCallback((selector?: string) => {
    if (!selector) { setSpotRect(null); return; }
    const doMeasure = () => {
      const el = findTourEl(selector);
      if (el) {
        const r = el.getBoundingClientRect();
        setSpotRect({ x: r.left, y: r.top, w: r.width, h: r.height });
      } else {
        setSpotRect(null);
      }
    };
    const id = setTimeout(doMeasure, 180);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (step.navigateTo) setScreen(step.navigateTo);
    return measureTarget(step.targetSelector);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIdx]);

  useEffect(() => {
    const handler = () => measureTarget(step.targetSelector);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [stepIdx, measureTarget, step.targetSelector]);

  const advance = () => {
    if (isLast) {
      localStorage.setItem('Triplly-tour-done', '1');
      setShowTour(false);
    } else {
      setStepIdx(i => i + 1);
    }
  };

  const skip = () => {
    localStorage.setItem('Triplly-tour-done', '1');
    setShowTour(false);
  };

  // Position tooltip: above or below spotlight, clamped to screen
  const vw = typeof window !== 'undefined' ? window.innerWidth : 390;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 844;

  let cardTop: number;
  let cardLeft: number;
  let isCenter = !spotRect;

  if (spotRect) {
    const spaceBelow = vh - (spotRect.y + spotRect.h + PAD);
    const useBelow = spaceBelow >= CARD_H_APPROX + 24;
    cardTop = useBelow
      ? spotRect.y + spotRect.h + PAD + 12
      : spotRect.y - PAD - CARD_H_APPROX - 20;
    const centered = spotRect.x + spotRect.w / 2 - CARD_W / 2;
    cardLeft = Math.max(14, Math.min(vw - CARD_W - 14, centered));
    // If card would be off-screen vertically, center it
    if (cardTop < 10 || cardTop + CARD_H_APPROX > vh - 10) isCenter = true;
  } else {
    cardTop = vh / 2 - CARD_H_APPROX / 2;
    cardLeft = vw / 2 - CARD_W / 2;
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9000, pointerEvents: 'all' }}>
      {/* Dark backdrop */}
      <div
        onClick={skip}
        style={{ position: 'absolute', inset: 0, background: 'rgba(10,8,6,0.80)' }}
      />

      {/* Spotlight ring - absorbs clicks so backdrop skip isn't triggered */}
      {spotRect && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: 'absolute',
            left: spotRect.x - PAD,
            top: spotRect.y - PAD,
            width: spotRect.w + PAD * 2,
            height: spotRect.h + PAD * 2,
            borderRadius: 16,
            boxShadow: '0 0 0 9999px rgba(10,8,6,0.80)',
            border: '2px solid rgba(255,255,255,0.50)',
            pointerEvents: 'all',
            cursor: 'default',
            zIndex: 1,
          }}
        />
      )}

      {/* Tooltip card */}
      <AnimatePresence mode="wait">
        <m.div
          key={`step-${stepIdx}`}
          initial={{ opacity: 0, y: 12, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 440, damping: 36 }}
          onClick={e => e.stopPropagation()}
          style={{
            position: 'absolute',
            width: CARD_W,
            ...(isCenter
              ? { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }
              : { left: cardLeft, top: cardTop }
            ),
            background: 'var(--surface)',
            borderRadius: 22,
            padding: '22px 20px 18px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.40)',
            border: '1px solid var(--border)',
            zIndex: 9002,
          }}
        >
          {/* Step icon */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <StampIcon iconKey={step.stamp} size={56} />
          </div>

          {/* Title */}
          <h2 style={{
            fontSize: 18, fontWeight: 800,
            color: 'var(--text)', textAlign: 'center',
            letterSpacing: '-0.02em', marginBottom: 9,
          }}>
            {isHe ? step.titleHe : step.title}
          </h2>

          {/* Body */}
          <p style={{
            fontSize: 13, lineHeight: 1.6,
            color: 'var(--text-2)', textAlign: 'center', marginBottom: 10,
          }}>
            {isHe ? step.bodyHe : step.body}
          </p>

          {/* Hint */}
          {step.hint && (
            <div style={{
              background: 'var(--brand-muted)',
              border: '1px solid rgba(59,110,82,0.2)',
              borderRadius: 10, padding: '6px 12px',
              fontSize: 11, fontWeight: 600, color: 'var(--brand)',
              textAlign: 'center', marginBottom: 14,
            }}>
              {isHe ? step.hintHe : step.hint}
            </div>
          )}
          {!step.hint && <div style={{ height: 14 }} />}

          {/* Progress dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginBottom: 16 }}>
            {STEPS.map((_, i) => (
              <m.div
                key={i}
                animate={{
                  width: i === stepIdx ? 20 : 6,
                  background: i === stepIdx ? 'var(--brand)' : 'var(--border-strong)',
                }}
                transition={{ duration: 0.2 }}
                style={{ height: 5, borderRadius: 3 }}
              />
            ))}
          </div>

          {/* Step counter */}
          <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', textAlign: 'center', marginBottom: 14 }}>
            {stepIdx + 1} / {STEPS.length}
          </p>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            {!isLast && (
              <m.button
                whileTap={{ scale: 0.95 }}
                onClick={skip}
                style={{
                  flex: 1, padding: '11px 0',
                  borderRadius: 12, fontSize: 12, fontWeight: 600,
                  background: 'var(--bg)', color: 'var(--text-2)',
                  border: '1px solid var(--border)', cursor: 'pointer',
                }}
              >
                {isHe ? 'דלג' : 'Skip'}
              </m.button>
            )}
            <m.button
              whileTap={{ scale: 0.97 }}
              onClick={advance}
              style={{
                flex: 2, padding: '11px 0',
                borderRadius: 12, fontSize: 14, fontWeight: 700,
                background: 'var(--brand)', color: 'white',
                border: 'none', cursor: 'pointer',
              }}
            >
              {isLast
                ? (isHe ? 'יאללה!' : "Let's go!")
                : (isHe ? 'הבא →' : 'Next →')}
            </m.button>
          </div>
        </m.div>
      </AnimatePresence>
    </div>
  );
}
