'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { I18nProvider, useI18n } from '@/lib/i18n';
import NavBar from './NavBar';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import DayScreen from './screens/DayScreen';
import SuppliesScreen from './screens/SuppliesScreen';
import SettingsScreen from './screens/SettingsScreen';
import NotesScreen from './screens/NotesScreen';
import { ToastProvider, useToast } from './ui/Toast';
import TourOverlay from './TourOverlay';
import TripEntryAnimation from './TripEntryAnimation';

// Watches lastSyncError globally and shows a toast — must live inside ToastProvider
function SyncErrorWatcher() {
  const { lastSyncError } = useAppStore();
  const { show } = useToast();
  const { locale } = useI18n();
  useEffect(() => {
    if (!lastSyncError) return;
    const isRLS = lastSyncError.includes('row-level security') || lastSyncError.includes('violates') || lastSyncError.includes('rls');
    const msg = lastSyncError === 'not_authed'
      ? (locale === 'he' ? '⚠️ לא מחובר — שינויים נשמרו מקומית בלבד' : '⚠️ Not signed in — changes saved locally only')
      : isRLS
      ? (locale === 'he' ? '⚠️ שגיאת הרשאות DB — הפעל RLS Policy בלוח Supabase' : '⚠️ DB permissions — run RLS policies in Supabase dashboard')
      : `⚠️ Sync error — changes saved locally`;
    show(msg);
    useAppStore.setState({ lastSyncError: null });
  }, [lastSyncError]);
  return null;
}

const screenVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
};

const screenTransition = {
  type: 'spring' as const,
  stiffness: 360,
  damping: 38,
  mass: 0.8,
};

function Shell() {
  const { screen, setScreen, trip, darkMode, highContrast, reducedMotion, toggleDarkMode, showTour,
    tripEntryCountries, clearTripEntry, tripDbId, recordDemoClick, checkAuth, loadTripById, authUser } = useAppStore();
  const { isRTL } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [showEntryAnim, setShowEntryAnim] = useState(false);
  const [entryCountries, setEntryCountries] = useState<string[]>([]);
  const prevScreen = React.useRef(screen);

  useEffect(() => {
    setMounted(true);
    if (trip && screen === 'login') {
      setScreen('dashboard');
    }
    checkAuth();
    // Stash any pending join trip ID from invite link redirect
    const params = new URLSearchParams(window.location.search);
    const joinId = params.get('join');
    if (joinId) {
      window.history.replaceState({}, '', '/');
      sessionStorage.setItem('trippy-pending-join', joinId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // After auth resolves, auto-load a trip joined via invite link
  useEffect(() => {
    if (!authUser) return;
    const pendingJoin = sessionStorage.getItem('trippy-pending-join');
    if (!pendingJoin) return;
    sessionStorage.removeItem('trippy-pending-join');
    loadTripById(pendingJoin).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]);

  // Show entry animation when tripEntryCountries is set (trip just entered)
  useEffect(() => {
    if (tripEntryCountries) {
      setEntryCountries(tripEntryCountries);
      setShowEntryAnim(true);
      clearTripEntry();
    }
  }, [tripEntryCountries]);

  // Track demo clicks (when in demo mode: tripDbId is null and trip exists)
  const isDemo = !!trip && !tripDbId;
  useEffect(() => {
    if (!isDemo) return;
    const handler = () => recordDemoClick();
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [isDemo]);

  // On first ever visit, apply system dark mode preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const key = 'trippy-theme-init';
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, '1');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark && !darkMode) toggleDarkMode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Also react live to OS theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      const current = useAppStore.getState().darkMode;
      if (e.matches !== current) toggleDarkMode();
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.background = darkMode ? '#0E0C0A' : '#F4EFE8';
    }
  }, [darkMode]);

  if (!mounted) {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#F4EFE8',
      }}>
        <div style={{ fontSize: 36 }} className="an-float">🌍</div>
      </div>
    );
  }

  const showNav = trip && screen !== 'login';

  // MotionConfig: 'always' when user toggled reducedMotion, 'user' to respect OS setting
  const motionReduced = reducedMotion ? 'always' : 'user';

  return (
    <ToastProvider>
      <SyncErrorWatcher />
      <MotionConfig reducedMotion={motionReduced}>
        <div
          dir={isRTL ? 'rtl' : 'ltr'}
          data-dark={darkMode ? 'true' : undefined}
          data-high-contrast={highContrast ? 'true' : undefined}
          data-reduced-motion={reducedMotion ? 'true' : undefined}
          className="relative flex flex-col w-screen h-[100dvh] overflow-hidden"
          style={{
            background: 'var(--bg)',
            paddingLeft: 'env(safe-area-inset-left, 0px)',
            paddingRight: 'env(safe-area-inset-right, 0px)',
          }}
        >
          {showNav && (
            <NavBar active={screen} onChange={s => setScreen(s)} />
          )}

          <div className="flex-1 flex flex-col relative overflow-hidden w-full">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={screen}
                variants={screenVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={screenTransition}
                className={`screen-inset${showNav ? ' screen-inset-nav' : ''} flex flex-col overflow-hidden`}
              >
                <div className="w-full h-full flex justify-center">
                  <div className="w-full max-w-[1200px] h-full">
                    {!trip || screen === 'login' ? (
                      <LoginScreen />
                    ) : screen === 'dashboard' ? (
                      <DashboardScreen />
                    ) : screen === 'day' ? (
                      <DayScreen />
                    ) : screen === 'supplies' ? (
                      <SuppliesScreen />
                    ) : screen === 'settings' ? (
                      <SettingsScreen />
                    ) : screen === 'notes' ? (
                      <NotesScreen />
                    ) : null}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          {showTour && <TourOverlay />}

          <AnimatePresence>
            {showEntryAnim && (
              <TripEntryAnimation
                countries={entryCountries}
                onDone={() => setShowEntryAnim(false)}
              />
            )}
          </AnimatePresence>
        </div>
      </MotionConfig>
    </ToastProvider>
  );
}

export default function AppShell() {
  return (
    <I18nProvider>
      <Shell />
    </I18nProvider>
  );
}
