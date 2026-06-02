'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, m, MotionConfig } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { screenVariants, spring } from '@/lib/motion';
import { useAppStore } from '@/lib/store';
import { I18nProvider, useI18n } from '@/lib/i18n';
import { createClient } from '@/utils/supabase/client';
import dynamic from 'next/dynamic';
import NavBar_V2 from './NavBar_V2';

const LoginScreen        = dynamic(() => import('./screens/LoginScreen'));
import { CompassLoader, LoaderStyles, BRAND_THEME } from './ui/TripLoaders';
import { ToastProvider, useToast } from './ui/Toast';

const Splash_V2         = dynamic(() => import('./screens/Splash_V2'));
const Welcome_V2        = dynamic(() => import('./screens/Welcome_V2'));
const Home_V2           = dynamic(() => import('./screens/Home_V2'));
const DashboardScreen   = dynamic(() => import('./screens/Dashboard_V2'));
const DayScreen         = dynamic(() => import('./screens/DayDetail_V2'));
const SuppliesScreen    = dynamic(() => import('./screens/Packing_V2'));
const SettingsScreen    = dynamic(() => import('./screens/Settings_V2'));
const NotesScreen       = dynamic(() => import('./screens/NotesScreen'));
const MapScreen         = dynamic(() => import('./screens/Map_V2'));
const CrewScreen        = dynamic(() => import('./screens/Crew_V2'));
const TourOverlay        = dynamic(() => import('./TourOverlay'));
const TripEntryAnimation = dynamic(() => import('./TripEntryAnimation'));
const TermsModal         = dynamic(() => import('./TermsModal'));
const OnboardingScreen   = dynamic(() => import('./OnboardingScreen'));

// Watches network status, wires online/offline events, flushes pending changes on reconnect
function OfflineWatcher() {
  const { setIsOffline, flushPendingChanges } = useAppStore();
  const { show } = useToast();

  useEffect(() => {
    const goOnline = () => {
      setIsOffline(false);
      const count = useAppStore.getState().pendingChanges.length;
      flushPendingChanges().then(() => {
        if (count > 0) show(`Back online — ${count} change${count > 1 ? 's' : ''} synced ✓`);
      }).catch(() => {});
    };
    const goOffline = () => setIsOffline(true);
    if (!navigator.onLine) setIsOffline(true);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

// Watches lastBudgetAlert and fires toasts when budget thresholds are crossed
function BudgetAlertWatcher() {
  const lastBudgetAlert = useAppStore(s => s.lastBudgetAlert);
  const { show } = useToast();
  const tripDbId = useAppStore(s => s.tripDbId);
  const currencyByTrip = useAppStore(s => s.currencyByTrip);

  useEffect(() => {
    if (!lastBudgetAlert) return;
    const currency = (tripDbId && currencyByTrip[tripDbId]) || '';
    const fmt = (n: number) => `${currency} ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (lastBudgetAlert.type === 'over') {
      show(`⚠️ Over budget! Exceeded by ${fmt(lastBudgetAlert.remaining)}`);
    } else {
      show(`💛 80% of budget used — ${fmt(lastBudgetAlert.remaining)} remaining`);
    }
    useAppStore.setState({ lastBudgetAlert: null });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastBudgetAlert]);
  return null;
}

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
      : lastSyncError === 'join_failed'
      ? (locale === 'he' ? '⚠️ לא ניתן היה לטעון את הטיול — נסה שוב' : '⚠️ Could not load the trip — please try again')
      : isRLS
      ? (locale === 'he' ? 'לא ניתן לשמור. נסה שוב.' : "Couldn't save. Please try again.")
      : `DB error: ${lastSyncError}`;
    show(msg);
    useAppStore.setState({ lastSyncError: null });
  }, [lastSyncError]);
  return null;
}

const screenTransition = spring.default;

function Shell() {
  // Single Supabase client instance — survives React 18 Strict Mode's double-invoke of effects.
  // A fresh createClient() on the second run would fire INITIAL_SESSION before cookies are re-read,
  // causing a brief redirect to 'welcome' even for authenticated users.
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);

  // Granular selectors — each group only re-renders Shell when its slice changes (ME-5)
  const screen          = useAppStore(s => s.screen);
  const isGlobalLoading = useAppStore(s => s.isGlobalLoading);
  const themeMode       = useAppStore(s => s.themeMode);

  const { setScreen, setThemeMode, checkAuth, loadTripById, subscribeToTrip,
          recordDemoClick, clearTripEntry, logout } = useAppStore(
    useShallow(s => ({
      setScreen:       s.setScreen,
      setThemeMode:    s.setThemeMode,
      checkAuth:       s.checkAuth,
      loadTripById:    s.loadTripById,
      subscribeToTrip: s.subscribeToTrip,
      recordDemoClick: s.recordDemoClick,
      clearTripEntry:  s.clearTripEntry,
      logout:          s.logout,
    }))
  );

  const { trip, tripDbId, tripEntryCountries, authUser, termsAccepted, showTour } = useAppStore(
    useShallow(s => ({
      trip:               s.trip,
      tripDbId:           s.tripDbId,
      tripEntryCountries: s.tripEntryCountries,
      authUser:           s.authUser,
      termsAccepted:      s.termsAccepted,
      showTour:           s.showTour,
    }))
  );

  const { highContrast, reducedMotion } = useAppStore(
    useShallow(s => ({ highContrast: s.highContrast, reducedMotion: s.reducedMotion }))
  );

  const { isOffline, pendingChanges, setIsOffline, flushPendingChanges } = useAppStore(
    useShallow(s => ({
      isOffline:          s.isOffline,
      pendingChanges:     s.pendingChanges,
      setIsOffline:       s.setIsOffline,
      flushPendingChanges: s.flushPendingChanges,
    }))
  );
  const { isRTL } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [osDark, setOsDark] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showEntryAnim, setShowEntryAnim] = useState(false);
  const [entryCountries, setEntryCountries] = useState<string[]>([]);
  const prevScreen = React.useRef(screen);

  const resolvedDark = themeMode === 'dark' || (themeMode === 'system' && osDark);

  useEffect(() => {
    setMounted(true);

    // Dev-only test hooks: lets Playwright inject/read store state
    if (process.env.NODE_ENV !== 'production') {
      (window as unknown as Record<string, unknown>).__trippySetState__ =
        (patch: Record<string, unknown>) => useAppStore.setState(patch as unknown as Parameters<typeof useAppStore.setState>[0]);
      (window as unknown as Record<string, unknown>).__trippyGetScreen__ =
        () => useAppStore.getState().screen;
    }

    // Stash any pending join trip ID from invite link redirect
    const params = new URLSearchParams(window.location.search);
    const joinId = params.get('join');
    if (joinId) {
      window.history.replaceState({}, '', '/');
      sessionStorage.setItem('trippy-pending-join', joinId);
    }

    // onAuthStateChange fires immediately with INITIAL_SESSION on every page load.
    // If the session is valid → confirm/update authUser.
    // If no session (expired or logged out) → clear persisted authUser and go to login.
    // Re-use the same Supabase client across Strict Mode re-runs so the second invocation
    // sees the already-loaded session and never fires INITIAL_SESSION with a null session.
    if (!supabaseRef.current) supabaseRef.current = createClient();
    const supabase = supabaseRef.current;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const username = session.user.user_metadata?.full_name ?? session.user.email?.split('@')[0] ?? 'Traveler';
        useAppStore.setState({ authUser: { id: session.user.id, username }, userId: session.user.id });
        // After sign-in: move to home if still on an unauthenticated screen
        const cur = useAppStore.getState().screen;
        if (cur === 'login' || cur === 'welcome' || cur === 'splash') {
          setScreen('home');
        }
      } else if (event === 'SIGNED_OUT' || event === 'INITIAL_SESSION') {
        useAppStore.setState({ authUser: null, userId: null });
        // After splash auto-advance, land on welcome (not legacy login).
        // Skip in test mode — __trippySetState__ presence means a test is injecting state.
        const cur = useAppStore.getState().screen;
        const isTestMode = process.env.NODE_ENV !== 'production' &&
          !!(window as unknown as Record<string, unknown>).__trippySetState__;
        if (!isTestMode && cur !== 'splash') setScreen('welcome');
      }
    });

    // Show onboarding on first-ever device visit
    if (!localStorage.getItem('trippy-onboarded')) {
      setShowOnboarding(true);
    }

    // Reload trip data from DB if the user has a stored tripDbId (no auto-navigation).
    checkAuth();

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // After auth resolves, auto-load a trip joined via invite link
  useEffect(() => {
    if (!authUser) return;
    const pendingJoin = sessionStorage.getItem('trippy-pending-join');
    if (!pendingJoin) return;
    sessionStorage.removeItem('trippy-pending-join');
    loadTripById(pendingJoin).catch(() => {
      useAppStore.setState({ lastSyncError: 'join_failed' });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]);

  // Real-time: subscribe to trip changes so co-participants see each other's updates
  useEffect(() => {
    if (!tripDbId) return;
    const unsubscribe = subscribeToTrip(tripDbId);
    return unsubscribe;
  }, [tripDbId]);

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

  // Detect initial OS dark preference and watch for live changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setOsDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setOsDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Keep body background in sync with the resolved theme (prevents flash on page load)
  useEffect(() => {
    if (typeof document !== 'undefined') {
      // Propagate data-dark to <html> so var(--bg) resolves correctly on body/html
      // (data-dark on the inner div doesn't affect var(--bg) resolution on ancestors)
      document.documentElement.dataset.dark = resolvedDark ? 'true' : '';
      document.body.style.background = 'var(--bg)';
    }
  }, [resolvedDark]);

  // Service Worker registration
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  if (!mounted) {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 28,
        background: 'var(--bg)',
      }}>
        <LoaderStyles />
        <CompassLoader theme={BRAND_THEME} size={160} />
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 22, fontWeight: 700, letterSpacing: '-0.04em', color: 'var(--text)',
          lineHeight: 1,
          direction: 'ltr',
          unicodeBidi: 'isolate',
        }}>
          Trippy<span style={{ color: 'var(--terra)' }}>.</span>
        </span>
      </div>
    );
  }

  const showNav = trip && screen !== 'login' && screen !== 'home' && screen !== 'splash' && screen !== 'welcome';

  // MotionConfig: 'always' when user toggled reducedMotion, 'user' to respect OS setting
  const motionReduced = reducedMotion ? 'always' : 'user';

  return (
    <ToastProvider>
      <SyncErrorWatcher />
      <BudgetAlertWatcher />
      <OfflineWatcher />
      <MotionConfig reducedMotion={motionReduced}>
        <div
          dir={isRTL ? 'rtl' : 'ltr'}
          data-dark={resolvedDark ? 'true' : undefined}
          data-high-contrast={highContrast ? 'true' : undefined}
          data-reduced-motion={reducedMotion ? 'true' : undefined}
          className="fixed inset-0 flex flex-col overflow-hidden"
          style={{
            background: 'var(--bg)',
            paddingTop: 'env(safe-area-inset-top, 0px)',
            paddingLeft: 'env(safe-area-inset-left, 0px)',
            paddingRight: 'env(safe-area-inset-right, 0px)',
          }}
        >
          {/* Offline banner — shown above nav and content */}
          {isOffline && (
            <div style={{
              background: 'var(--danger-bg)',
              borderBottom: '1px solid var(--danger)',
              padding: '6px var(--page-px)',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--danger)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              zIndex: 9999,
            }}>
              📡 Offline{pendingChanges.length > 0
                ? ` — ${pendingChanges.length} change${pendingChanges.length > 1 ? 's' : ''} pending`
                : ' — viewing saved data'}
            </div>
          )}

          {showNav && (
            <NavBar_V2
              active={screen}
              onChange={s => setScreen(s)}
              onSettings={() => setScreen('settings')}
              onSwitch={() => setScreen('home')}
              onLogout={() => logout()}
              onNotes={() => setScreen('notes')}
            />
          )}

          <div className="flex-1 flex flex-col relative overflow-hidden w-full">
            <AnimatePresence mode="wait" initial={false}>
              <m.div
                key={screen}
                variants={screenVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={screenTransition}
                className={`screen-inset${showNav ? ' screen-inset-nav' : ''} flex flex-col overflow-hidden`}
              >
                <div className="w-full h-full">
                  <div className="w-full h-full">
                    {screen === 'splash' ? (
                      <Splash_V2 />
                    ) : screen === 'welcome' ? (
                      <Welcome_V2 />
                    ) : screen === 'login' ? (
                      <LoginScreen />
                    ) : !trip || screen === 'home' ? (
                      <Home_V2 />
                    ) : screen === 'dashboard' ? (
                      <DashboardScreen />
                    ) : screen === 'day' ? (
                      <DayScreen />
                    ) : screen === 'map' ? (
                      <MapScreen />
                    ) : screen === 'crew' ? (
                      <CrewScreen />
                    ) : screen === 'supplies' ? (
                      <SuppliesScreen />
                    ) : screen === 'settings' ? (
                      <SettingsScreen />
                    ) : screen === 'notes' ? (
                      <NotesScreen />
                    ) : null}
                  </div>
                </div>
              </m.div>
            </AnimatePresence>
          </div>
          {showTour && <TourOverlay />}

          {/* Terms modal: shown on first real login (not demo) */}
          {authUser && !termsAccepted && <TermsModal />}

          {/* Onboarding: shown only on first-ever device visit */}
          <AnimatePresence>
            {showOnboarding && (
              <OnboardingScreen onDone={() => setShowOnboarding(false)} />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showEntryAnim && (
              <TripEntryAnimation
                countries={entryCountries}
                onDone={() => setShowEntryAnim(false)}
              />
            )}
          </AnimatePresence>

          {/* Global loading overlay — shown during loadTripById / createTrip */}
          <AnimatePresence>
            {isGlobalLoading && (
              <m.div
                key="global-loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                style={{
                  position: 'fixed', inset: 0, zIndex: 9990,
                  background: 'var(--bg)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: 28,
                }}
              >
                <LoaderStyles />
                <CompassLoader theme={BRAND_THEME} size={200} />
                <span style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 22, fontWeight: 700, letterSpacing: '-0.04em',
                  color: 'var(--text)', lineHeight: 1,
                  direction: 'ltr',
                  unicodeBidi: 'isolate',
                }}>
                  Trippy<span style={{ color: 'var(--terra)' }}>.</span>
                </span>
              </m.div>
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
