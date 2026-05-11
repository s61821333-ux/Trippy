'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';

interface Step {
  emoji: string;
  title: string;
  titleHe: string;
  body: string;
  bodyHe: string;
  hint?: string;
  hintHe?: string;
}

const STEPS: Step[] = [
  {
    emoji: '👋',
    title: "Welcome to Trippy!",
    titleHe: "ברוכים הבאים ל-Trippy!",
    body: "This is the demo trip — Negev Desert Adventure. Let's take a quick tour of the main features.",
    bodyHe: "זוהי טיול ההדגמה — מסע מדבר הנגב. בואו נסיין סיור קצר בתכונות העיקריות.",
  },
  {
    emoji: '🗓️',
    title: "Day Cards",
    titleHe: "כרטיסי יום",
    body: "Scroll down to see all 4 trip days. Tap any day card to open the hour-by-hour itinerary.",
    bodyHe: "גלול למטה לראות את כל 4 ימי הטיול. הקש על כל כרטיס יום לפתיחת המסלול שעה-שעה.",
    hint: "↓ Scroll down on the dashboard",
    hintHe: "↓ גלול למטה בלוח המחוונים",
  },
  {
    emoji: '🗺️',
    title: "Itinerary (Explore tab)",
    titleHe: "מסלול (לשונית חקור)",
    body: "Tap the Explore tab at the bottom. Swipe left/right between days. Add events with the + button, or tap a gap to get AI suggestions.",
    bodyHe: "הקש על לשונית 'חקור' בתחתית. החלק שמאל/ימין בין הימים. הוסף אירועים עם כפתור +, או הקש על פרק זמן פנוי להצעות AI.",
    hint: "⚡ Yellow gaps = free time for more activities",
    hintHe: "⚡ פרקים צהובים = זמן פנוי לפעילויות נוספות",
  },
  {
    emoji: '🎒',
    title: "Packing List",
    titleHe: "רשימת ציוד",
    body: "The Pack tab shows your packing checklist. Tap items to check them off as you pack. You can also add custom items.",
    bodyHe: "לשונית 'ציוד' מציגה את רשימת האריזה שלך. הקש על פריטים כדי לסמן אותם. תוכל גם להוסיף פריטים.",
  },
  {
    emoji: '✨',
    title: "AI Suggestions",
    titleHe: "הצעות AI",
    body: "On the Explore screen, look for ⚡ free-time badges between events. Tap 'Get Suggestions' for AI-powered activity ideas based on your location.",
    bodyHe: "במסך החקור, חפש תגי ⚡ זמן פנוי בין אירועים. הקש 'קבל הצעות' לרעיונות פעילות מבוססי AI לפי מיקומך.",
    hint: "🤖 Works best when online",
    hintHe: "🤖 עובד טוב יותר כשמחובר לאינטרנט",
  },
  {
    emoji: '🎉',
    title: "You're ready!",
    titleHe: "אתה מוכן!",
    body: "Start planning your real trip — tap 'Leave Trip' in Settings to return to the home screen and create your own adventure.",
    bodyHe: "התחל לתכנן את הטיול האמיתי שלך — הקש 'עזוב טיול' בהגדרות כדי לחזור ולצור את ההרפתקה שלך.",
  },
];

export default function TourOverlay() {
  const { setShowTour } = useAppStore();
  const { locale } = useI18n();
  const isHe = locale === 'he';
  const [step, setStep] = useState(0);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const next = () => {
    if (isLast) {
      setShowTour(false);
    } else {
      setStep(s => s + 1);
    }
  };

  const skip = () => setShowTour(false);

  return (
    <AnimatePresence>
      <motion.div
        key="tour-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 9000,
          background: 'rgba(10, 8, 6, 0.72)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
        onClick={skip}
      >
        <motion.div
          key={`step-${step}`}
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
          onClick={e => e.stopPropagation()}
          style={{
            background: 'var(--surface)',
            borderRadius: 24,
            padding: '32px 28px 28px',
            maxWidth: 400,
            width: '100%',
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--border)',
          }}
        >
          {/* Emoji */}
          <div style={{
            fontSize: 52, textAlign: 'center', marginBottom: 20, lineHeight: 1,
          }}>
            {current.emoji}
          </div>

          {/* Title */}
          <h2 style={{
            fontSize: 22, fontWeight: 800,
            color: 'var(--text)', textAlign: 'center',
            letterSpacing: '-0.02em', marginBottom: 12,
          }}>
            {isHe ? current.titleHe : current.title}
          </h2>

          {/* Body */}
          <p style={{
            fontSize: 14, lineHeight: 1.65,
            color: 'var(--text-2)', textAlign: 'center', marginBottom: 16,
          }}>
            {isHe ? current.bodyHe : current.body}
          </p>

          {/* Hint */}
          {current.hint && (
            <div style={{
              background: 'var(--brand-muted)',
              border: '1px solid rgba(59,110,82,0.2)',
              borderRadius: 10, padding: '8px 14px',
              fontSize: 12, fontWeight: 600, color: 'var(--brand)',
              textAlign: 'center', marginBottom: 20,
            }}>
              {isHe ? current.hintHe : current.hint}
            </div>
          )}
          {!current.hint && <div style={{ marginBottom: 20 }} />}

          {/* Progress dots */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 24,
          }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{
                width: i === step ? 20 : 6,
                height: 6, borderRadius: 3,
                background: i === step ? 'var(--brand)' : 'var(--border-strong)',
                transition: 'all 0.25s ease',
              }} />
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={skip}
              style={{
                flex: 1, padding: '12px 0',
                borderRadius: 12, fontSize: 13, fontWeight: 600,
                background: 'var(--bg)', color: 'var(--text-2)',
                border: '1px solid var(--border)', cursor: 'pointer',
              }}
            >
              {isHe ? 'דלג' : 'Skip'}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={next}
              style={{
                flex: 2, padding: '12px 0',
                borderRadius: 12, fontSize: 14, fontWeight: 700,
                background: 'var(--brand)', color: 'white',
                border: 'none', cursor: 'pointer',
              }}
            >
              {isLast
                ? (isHe ? "בואו נתחיל! 🚀" : "Let's go! 🚀")
                : (isHe ? 'הבא ←' : 'Next →')}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
