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

import { CompassLoader, LoaderStyles, BRAND_THEME } from './ui/TripLoaders';
import { ToastProvider, useToast } from './ui/Toast';

const ScreenFallback = () => (
  <div style={{ height: '100%', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <LoaderStyles />
    <CompassLoader theme={BRAND_THEME} size={56} />
  </div>
);

const Home_V2           = dynamic(() => import('./screens/Home_V2'),        { loading: ScreenFallback });
const DashboardScreen   = dynamic(() => import('./screens/Dashboard_V2'),   { loading: ScreenFallback });
const DayScreen         = dynamic(() => import('./screens/DayDetail_V2'),   { loading: ScreenFallback });
const SuppliesScreen    = dynamic(() => import('./screens/Packing_V2'),     { loading: ScreenFallback });
const SettingsScreen    = dynamic(() => import('./screens/Settings_V2'),    { loading: ScreenFallback });
const NotesScreen       = dynamic(() => import('./screens/NotesScreen'),    { loading: ScreenFallback });
const MapScreen         = dynamic(() => import('./screens/Map_V2'),         { loading: ScreenFallback });
const CrewScreen        = dynamic(() => import('./screens/Crew_V2'),        { loading: ScreenFallback });
const TourOverlay        = dynamic(() => import('./TourOverlay'));
const TripEntryAnimation = dynamic(() => import('./TripEntryAnimation'));
const TermsModal         = dynamic(() => import('./TermsModal'));
const WishlistSheet      = dynamic(() => import('./screens/WishlistSheet'));
const SecuritySettings   = dynamic(() => import('./screens/SecuritySettings'));
const MFAChallenge       = dynamic(() => import('./screens/MFAChallenge'));
const PersonaSheet       = dynamic(() => import('./PersonaSheet'));
const AISheetLazy        = dynamic(() => import('./Sheets_V2').then(m => ({ default: m.AISheet })));


// Watches network status, wires online/offline events, flushes pending changes on reconnect
function OfflineWatcher() {
  const { show } = useToast();
  const { locale } = useI18n();

  useEffect(() => {
    const goOnline = () => {
      const { setIsOffline, flushPendingChanges, pendingChanges } = useAppStore.getState();
      setIsOffline(false);
      const count = pendingChanges.length;
      flushPendingChanges().then(() => {
        if (count > 0) show(locale === 'he'
          ? `חזרת לרשת — ${count} ${count > 1 ? 'שינויים סונכרנו' : 'שינוי סונכרן'} ✓`
          : `Back online — ${count} change${count > 1 ? 's' : ''} synced ✓`);
      }).catch(() => {});
    };
    const goOffline = () => useAppStore.getState().setIsOffline(true);
    if (!navigator.onLine) useAppStore.getState().setIsOffline(true);
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

  useEffect(() => {
    if (!lastBudgetAlert) return;
    const { tripDbId, currencyByTrip } = useAppStore.getState();
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
  const lastSyncError = useAppStore(s => s.lastSyncError);
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
      : (locale === 'he' ? 'שגיאת סנכרון — יסונכרן בחיבור הבא' : 'Sync error — will retry on reconnect');
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
  const lastLoadedTripRef = useRef<string | null>(null);

  // Granular selectors — each group only re-renders Shell when its slice changes (ME-5)
  const screen          = useAppStore(s => s.screen);
  const isGlobalLoading = useAppStore(s => s.isGlobalLoading);
  const themeMode       = useAppStore(s => s.themeMode);

  const { setScreen, setThemeMode, checkAuth, loadTripById, subscribeToTrip,
          recordDemoClick, clearTripEntry, logout, setShowPersona } = useAppStore(
    useShallow(s => ({
      setScreen:       s.setScreen,
      setThemeMode:    s.setThemeMode,
      checkAuth:       s.checkAuth,
      loadTripById:    s.loadTripById,
      subscribeToTrip: s.subscribeToTrip,
      recordDemoClick: s.recordDemoClick,
      clearTripEntry:  s.clearTripEntry,
      logout:          s.logout,
      setShowPersona:  s.setShowPersona,
    }))
  );

  const { trip, tripDbId, tripEntryCountries, authUser, termsAccepted, termsChecked, showTour,
          showPersona, showSuggestions, activeDay } = useAppStore(
    useShallow(s => ({
      trip:               s.trip,
      tripDbId:           s.tripDbId,
      tripEntryCountries: s.tripEntryCountries,
      authUser:           s.authUser,
      termsAccepted:      s.termsAccepted,
      termsChecked:       s.termsChecked,
      showTour:           s.showTour,
      showPersona:        s.showPersona,
      showSuggestions:    s.showSuggestions,
      activeDay:          s.activeDay,
    }))
  );

  const { highContrast, reducedMotion } = useAppStore(
    useShallow(s => ({ highContrast: s.highContrast, reducedMotion: s.reducedMotion }))
  );

  const { isOffline, pendingChanges, pendingWriteCount, setIsOffline, flushPendingChanges } = useAppStore(
    useShallow(s => ({
      isOffline:           s.isOffline,
      pendingChanges:      s.pendingChanges,
      pendingWriteCount:   s.pendingWriteCount,
      setIsOffline:        s.setIsOffline,
      flushPendingChanges: s.flushPendingChanges,
    }))
  );
  const { isRTL } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [authResolved, setAuthResolved] = useState(false);
  const [osDark, setOsDark] = useState(false);
  const [showEntryAnim, setShowEntryAnim] = useState(false);
  const [entryCountries, setEntryCountries] = useState<string[]>([]);
  const [entryTripName, setEntryTripName] = useState<string | undefined>();
  const [showWishlist,    setShowWishlist]    = useState(false);
  const [showSecurity,    setShowSecurity]    = useState(false);
  const [showMfaChallenge, setShowMfaChallenge] = useState(false);
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

    // Strip external ?next params — prevent open redirect attacks where
    // a crafted URL like /?next=https://evil.com lingers in the address bar.
    {
      const p = new URLSearchParams(window.location.search);
      const next = p.get('next');
      if (next !== null && (!next.startsWith('/') || next.startsWith('//'))) {
        p.delete('next');
        const qs = p.toString();
        window.history.replaceState({}, '', qs ? `/app?${qs}` : '/app');
      }
    }

    // Stash any pending join trip ID from invite link redirect
    const params = new URLSearchParams(window.location.search);
    const joinId = params.get('join');
    if (joinId) {
      window.history.replaceState({}, '', '/app');
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
        // After sign-in: move away from any unauthenticated screen.
        // If the user already has a persisted trip, jump straight to dashboard so they
        // never see the home/trip-picker screen flash before loadTripById navigates there.
        const cur = useAppStore.getState().screen;
        if (cur === 'welcome' || cur === 'splash') {
          // Resolve auth immediately so the spinner goes away — don't block on the
          // MFA network call. The challenge overlay appears as soon as the check
          // completes (usually <1 s later); users without MFA never pay that cost.
          const { trip, tripDbId } = useAppStore.getState();
          if (trip) {
            setScreen('dashboard');
          } else if (!tripDbId) {
            setScreen('home');
          }
          // tripDbId exists but no trip yet: loadTripById is in-flight and will
          // navigate to 'dashboard' once ready. isGlobalLoading covers the wait.
          setAuthResolved(true);
          // MFA check runs outside the onAuthStateChange lock (calling auth methods
          // inside the callback deadlocks). Non-blocking — shows challenge if needed.
          setTimeout(async () => {
            try {
              const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
              if (aal?.nextLevel === 'aal2' && aal?.currentLevel !== 'aal2') {
                setShowMfaChallenge(true);
              }
            } catch { /* ignore — proceed normally if AAL check fails */ }
          }, 0);
        }
      } else if (event === 'SIGNED_OUT' || event === 'INITIAL_SESSION') {
        useAppStore.setState({ authUser: null, userId: null });
        const isTestMode = process.env.NODE_ENV !== 'production' &&
          !!(window as unknown as Record<string, unknown>).__trippyTestMode__;
        // Session gone — send the user back to the landing page instead of showing
        // the old login screen. In test mode keep the current screen so test scripts
        // can control auth state directly.
        if (!isTestMode) {
          window.location.href = '/';
          return;
        }
        setAuthResolved(true);
      }
    });

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
      setEntryTripName(useAppStore.getState().trip?.name);
      setShowEntryAnim(true);
      clearTripEntry();
    }
  }, [tripEntryCountries]);

  // If auth has resolved and the persisted trip body is missing, restore it from the DB.
  // This covers reloads where the Supabase session becomes available after the first bootstrap pass.
  useEffect(() => {
    if (!authUser || !tripDbId) return;
    if (trip && lastLoadedTripRef.current === tripDbId) return;
    if (trip) {
      lastLoadedTripRef.current = tripDbId;
      return;
    }
    if (lastLoadedTripRef.current === tripDbId) return;
    lastLoadedTripRef.current = tripDbId;
    loadTripById(tripDbId, { showLoader: true, showEntry: false }).catch(() => {
      lastLoadedTripRef.current = null;
    });
  }, [authUser, tripDbId, trip, loadTripById]);

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

  // Respect system prefers-contrast: more — enable high contrast on first visit if OS requests it.
  // Only auto-enables; never auto-disables so user manual toggle is preserved.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const contrastMq = window.matchMedia('(prefers-contrast: more)');
    if (contrastMq.matches && !useAppStore.getState().highContrast) {
      useAppStore.getState().toggleHighContrast();
    }
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches && !useAppStore.getState().highContrast) useAppStore.getState().toggleHighContrast();
    };
    contrastMq.addEventListener('change', handler);
    return () => contrastMq.removeEventListener('change', handler);
  }, []);

  // Keep body background and <html data-dark> in sync with the resolved theme.
  // Also writes a cookie so the layout server component can pre-apply the correct
  // theme on the next page load — eliminating any theme flash without a script tag.
  useEffect(() => {
    if (typeof document !== 'undefined') {
      // Must be the literal string 'false' (not '') — the CSS dark-mode media
      // query is keyed on :root:not([data-dark="false"]), so any other value
      // leaves dark tokens applied when the OS prefers dark.
      document.documentElement.dataset.dark = resolvedDark ? 'true' : 'false';
      document.body.style.background = 'var(--bg)';
      document.cookie = `trippy-dark=${resolvedDark ? 'true' : 'false'}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }, [resolvedDark]);

  // Service Worker registration lives in ServiceWorkerRegistrar (root layout) —
  // registering here as well was redundant.

  // Prevent iOS Safari pull-to-refresh (the gesture causes a full page reload
  // which shows the global loader). Allow vertical panning inside scroll containers
  // that are not at their top boundary.
  useEffect(() => {
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0].clientY; };
    const onTouchMove = (e: TouchEvent) => {
      const dy = e.touches[0].clientY - touchStartY;
      if (dy <= 0) return; // scrolling up — always fine
      // Walk up from the target to find a scrollable ancestor
      let el: Element | null = e.target as Element;
      while (el && el !== document.documentElement) {
        const style = window.getComputedStyle(el);
        const oy = style.overflowY;
        if (oy === 'auto' || oy === 'scroll') {
          if ((el as HTMLElement).scrollTop > 0) return; // not at top — allow
          break; // at top of scroll container → fall through to prevent
        }
        el = el.parentElement;
      }
      e.preventDefault();
    };
    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  if (!mounted || !authResolved) {
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

  const showNav = !!authUser && screen !== 'home';

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
            overscrollBehavior: 'none',
            touchAction: 'pan-x pan-y',
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
              📡 You're offline{pendingChanges.length > 0
                ? ` — ${pendingChanges.length} change${pendingChanges.length > 1 ? 's' : ''} will sync when you're back`
                : ' — viewing your saved plan'}
            </div>
          )}

          {/* Saving indicator — subtle dot shown while writes are in-flight */}
          {!isOffline && pendingWriteCount > 0 && (
            <div style={{
              position: 'fixed',
              bottom: 'calc(env(safe-area-inset-bottom, 0px) + 72px)',
              insetInlineEnd: 16,
              zIndex: 9000,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: 'var(--lg-surface, rgba(30,30,30,0.85))',
              backdropFilter: 'blur(8px)',
              borderRadius: 20,
              padding: '4px 10px',
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--text-2, #aaa)',
              pointerEvents: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: 'var(--lg-sky, #38bdf8)',
                animation: 'pulse 1.2s ease-in-out infinite',
              }} />
              <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
              Saving…
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
              onWishlist={() => setShowWishlist(true)}
              onAI={() => { if (trip) setShowPersona(true); }}
              onCrew={() => setScreen('crew')}
              wishlistOpen={showWishlist}
            />
          )}

          <main className="flex-1 flex flex-col relative overflow-hidden w-full">
            <AnimatePresence mode="wait" initial={false}>
              <m.div
                key={screen}
                variants={screenVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={screenTransition}
                className={`screen-inset${showNav && screen !== 'map' ? ' screen-inset-nav' : ''} flex flex-col overflow-hidden`}
              >
                <div className="w-full h-full">
                  <div className="w-full h-full">
                    {screen === 'splash' || screen === 'home' || !trip ? (
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
                      <SettingsScreen onSecurity={() => setShowSecurity(true)} />
                    ) : screen === 'notes' ? (
                      <NotesScreen />
                    ) : null}
                  </div>
                </div>
              </m.div>
            </AnimatePresence>
          </main>
          {showTour && <TourOverlay />}

          {/* Wishlist sheet */}
          {showWishlist && <WishlistSheet onClose={() => setShowWishlist(false)} />}

          {/* AI persona + suggestions sheets — available from any screen */}
          {showPersona && <PersonaSheet dayNumber={activeDay} />}
          {showSuggestions && !showPersona && <AISheetLazy dayNumber={activeDay} />}

          {/* Security settings sheet */}
          {showSecurity && <SecuritySettings onClose={() => setShowSecurity(false)} />}

          {/* MFA challenge — shown after OAuth if the account has MFA enrolled */}
          {showMfaChallenge && (
            <MFAChallenge
              onSuccess={() => {
                setShowMfaChallenge(false);
                const { trip, tripDbId } = useAppStore.getState();
                if (trip) setScreen('dashboard');
                else if (!tripDbId) setScreen('home');
                // tripDbId without trip: loadTripById is in-flight and will navigate
              }}
              onSignOut={() => {
                setShowMfaChallenge(false);
                logout();
              }}
            />
          )}

          {/* Terms modal: shown only after checkAuth has verified terms with the DB,
              preventing a flash for returning users whose persisted termsAccepted is stale */}
          {authUser && termsChecked && !termsAccepted && <TermsModal />}

          <AnimatePresence>
            {showEntryAnim && (
              <TripEntryAnimation
                countries={entryCountries}
                tripName={entryTripName}
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
