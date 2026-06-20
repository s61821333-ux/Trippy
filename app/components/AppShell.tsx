'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, m, MotionConfig } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { screenVariants, spring } from '@/lib/motion';
import { useAppStore } from '@/lib/store';
import { I18nProvider, useI18n } from '@/lib/i18n';
import { createClient } from '@/utils/supabase/client';
import dynamic from 'next/dynamic';
import Icon from './ui/Icon';
import ErrorBoundary from './ui/ErrorBoundary';

import { CompassLoader, LoaderStyles, BRAND_THEME, DashboardSkeleton } from './ui/TripLoaders';
import { ToastProvider, useToast } from './ui/Toast';

const ScreenFallback = () => (
  <div style={{ height: '100%', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <LoaderStyles />
    <CompassLoader theme={BRAND_THEME} size={56} />
  </div>
);

const NavBar_V2         = dynamic(() => import('./NavBar_V2'));
const Home_V2           = dynamic(() => import('./screens/Home_V2'),        { loading: ScreenFallback });
const DashboardScreen   = dynamic(() => import('./screens/Dashboard_V2'),   { loading: ScreenFallback });
const DayScreen         = dynamic(() => import('./screens/DayDetail_V2'),   { loading: ScreenFallback });
const SuppliesScreen    = dynamic(() => import('./screens/Packing_V2'),     { loading: ScreenFallback });
const SettingsScreen    = dynamic(() => import('./screens/Settings_V2'),    { loading: ScreenFallback });
const NotesScreen       = dynamic(() => import('./screens/NotesScreen'),    { loading: ScreenFallback });
const MapScreen         = dynamic(() => import('./screens/Map_V2'),         { loading: ScreenFallback });
const TourOverlay        = dynamic(() => import('./TourOverlay'));
const TripEntryAnimation = dynamic(() => import('./TripEntryAnimation'));
const TermsModal         = dynamic(() => import('./TermsModal'));
const WishlistSheet      = dynamic(() => import('./screens/WishlistSheet'));
const SecuritySettings   = dynamic(() => import('./screens/SecuritySettings'));
const MFAChallenge       = dynamic(() => import('./screens/MFAChallenge'));
const PersonaSheet       = dynamic(() => import('./PersonaSheet'));
const AISheetLazy        = dynamic(() => import('./Sheets_V2').then(m => ({ default: m.AISheet })));
const AIMenuSheet        = dynamic(() => import('./screens/AIMenuSheet'));
const HaikoChat          = dynamic(() => import('./screens/HaikoChat'));


// Watches network status, wires online/offline events, flushes pending changes on reconnect
function OfflineWatcher() {
  const { show } = useToast();
  const { locale, t } = useI18n();

  useEffect(() => {
    const goOnline = () => {
      const { setIsOffline, flushPendingChanges, pendingChanges } = useAppStore.getState();
      setIsOffline(false);
      const count = pendingChanges.length;
      flushPendingChanges().then(() => {
        if (count > 0) show(locale === 'he'
          ? `חזרת לרשת - ${count} ${count > 1 ? 'שינויים סונכרנו' : 'שינוי סונכרן'} ✓`
          : `Back online - ${count} change${count > 1 ? 's' : ''} synced ✓`);
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
  const { locale, t } = useI18n();

  useEffect(() => {
    if (!lastBudgetAlert) return;
    const { tripDbId, currencyByTrip } = useAppStore.getState();
    const currency = (tripDbId && currencyByTrip[tripDbId]) || '';
    const fmtLocale = locale === 'he' ? 'he-IL' : 'en-US';
    const fmt = (n: number) => `${currency} ${Math.abs(n).toLocaleString(fmtLocale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (lastBudgetAlert.type === 'over') {
      const overBy = Math.abs(lastBudgetAlert.remaining);
      show(t('budgetOverAlert').replace('{amt}', fmt(overBy)));
    } else {
      show(t('budgetEightyAlert').replace('{amt}', fmt(lastBudgetAlert.remaining)));
    }
    useAppStore.setState({ lastBudgetAlert: null });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastBudgetAlert, locale]);
  return null;
}

// Watches lastSyncError globally and shows a toast - must live inside ToastProvider
function SyncErrorWatcher() {
  const lastSyncError = useAppStore(s => s.lastSyncError);
  const { show } = useToast();
  const { locale } = useI18n();
  useEffect(() => {
    if (!lastSyncError) return;
    const isRLS = lastSyncError.includes('row-level security') || lastSyncError.includes('violates') || lastSyncError.includes('rls');
    const msg = lastSyncError === 'not_authed'
      ? (locale === 'he' ? '⚠️ לא מחובר - שינויים נשמרו מקומית בלבד' : '⚠️ Not signed in - changes saved locally only')
      : lastSyncError === 'join_failed'
      ? (locale === 'he' ? '⚠️ לא ניתן היה לטעון את הטיול - נסה שוב' : '⚠️ Could not load the trip - please try again')
      : isRLS
      ? (locale === 'he' ? 'לא ניתן לשמור. נסה שוב.' : "Couldn't save. Please try again.")
      : (locale === 'he' ? 'שגיאת סנכרון - יסונכרן בחיבור הבא' : 'Sync error - will retry on reconnect');
    show(msg);
    useAppStore.setState({ lastSyncError: null });
  }, [lastSyncError]);
  return null;
}

const screenTransition = spring.default;

function Shell() {
  // Single Supabase client instance - survives React 18 Strict Mode's double-invoke of effects.
  // A fresh createClient() on the second run would fire INITIAL_SESSION before cookies are re-read,
  // causing a brief redirect to 'welcome' even for authenticated users.
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  const lastLoadedTripRef = useRef<string | null>(null);

  // Granular selectors - each group only re-renders Shell when its slice changes (ME-5)
  const screen          = useAppStore(s => s.screen);
  const isGlobalLoading = useAppStore(s => s.isGlobalLoading);
  const themeMode       = useAppStore(s => s.themeMode);

  const { setScreen, setThemeMode, checkAuth, loadTripById, subscribeToTrip,
          recordDemoClick, clearTripEntry, logout, setShowPersona, switchTrip } = useAppStore(
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
      switchTrip:      s.switchTrip,
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
  const { isRTL, locale, t } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [authResolved, setAuthResolved] = useState(false);
  const authTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [osDark, setOsDark] = useState(false);
  const [showEntryAnim, setShowEntryAnim] = useState(false);
  const [entryCountries, setEntryCountries] = useState<string[]>([]);
  const [entryTripName, setEntryTripName] = useState<string | undefined>();
  const [showWishlist,    setShowWishlist]    = useState(false);
  const [showSecurity,    setShowSecurity]    = useState(false);
  const [showMfaChallenge, setShowMfaChallenge] = useState(false);
  const [showAIMenu,      setShowAIMenu]      = useState(false);
  const [showHaiko,       setShowHaiko]       = useState(false);
  const prevScreen = React.useRef(screen);

  const resolvedDark = themeMode === 'dark' || (themeMode === 'system' && osDark);

  useEffect(() => {
    setMounted(true);

    // Dev-only test hooks: lets Playwright inject/read store state
    if (process.env.NODE_ENV !== 'production') {
      (window as unknown as Record<string, unknown>).__TrippySetState__ =
        (patch: Record<string, unknown>) => useAppStore.setState(patch as unknown as Parameters<typeof useAppStore.setState>[0]);
      (window as unknown as Record<string, unknown>).__TrippyGetScreen__ =
        () => useAppStore.getState().screen;
    }

    // Strip external ?next params - prevent open redirect attacks where
    // a crafted URL like /?next=https://evil.com lingers in the address bar.
    {
      const p = new URLSearchParams(window.location.search);
      const next = p.get('next');
      if (next !== null && (!next.startsWith('/') || next.startsWith('//'))) {
        p.delete('next');
        const qs = p.toString();
        const base = window.location.pathname;
        window.history.replaceState({}, '', qs ? `${base}?${qs}` : base);
      }
    }

    // Stash any pending join trip ID from invite link redirect
    const params = new URLSearchParams(window.location.search);
    const joinId = params.get('join');
    if (joinId) {
      window.history.replaceState({}, '', window.location.pathname);
      sessionStorage.setItem('Trippy-pending-join', joinId);
    }

    // Auth callback failure: /auth/callback redirects here with ?error=auth when the
    // code exchange fails (expired code, mismatched PKCE verifier, etc.).
    // Strip the param immediately so it doesn't persist in the URL, then redirect to
    // the landing page so the user can retry sign-in with a fresh PKCE flow.
    if (params.get('error') === 'auth') {
      window.history.replaceState({}, '', window.location.pathname);
      window.location.href = '/';
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
          // Resolve auth immediately so the spinner goes away - don't block on the
          // MFA network call. The challenge overlay appears as soon as the check
          // completes (usually <1 s later); users without MFA never pay that cost.
          setScreen('home');
          if (authTimeoutRef.current) { clearTimeout(authTimeoutRef.current); authTimeoutRef.current = null; }
          setAuthResolved(true);
          // MFA check runs outside the onAuthStateChange lock (calling auth methods
          // inside the callback deadlocks). Non-blocking - shows challenge if needed.
          setTimeout(async () => {
            try {
              const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
              if (aal?.nextLevel === 'aal2' && aal?.currentLevel !== 'aal2') {
                setShowMfaChallenge(true);
              }
            } catch { /* ignore - proceed normally if AAL check fails */ }
          }, 0);
        }
      } else if (event === 'SIGNED_OUT' || event === 'INITIAL_SESSION') {
        // In test mode, INITIAL_SESSION fires with no real session (Playwright has no
        // Supabase cookies). Don't wipe the injected authUser in that case, or the app
        // would unmount the authenticated screens mid-test. Production is unaffected:
        // __TrippyTestMode__ is never set there, and a real expired session still clears.
        const testModeInitial = event === 'INITIAL_SESSION'
          && !!(window as unknown as Record<string, unknown>).__TrippyTestMode__;
        if (!testModeInitial) {
          useAppStore.setState({ authUser: null, userId: null });
        }
        // In production: redirect immediately.
        // In dev/test: INITIAL_SESSION fires before Playwright can inject __TrippyTestMode__,
        // so defer the redirect check by one macrotask to allow test scripts to set the flag.
        // SIGNED_OUT always redirects unless already in test mode.
        const doRedirect = () => {
          // Navigate to the server-side signout endpoint: it calls supabase.auth.signOut()
          // via the server client (which reliably clears both regular and HttpOnly cookies via
          // Set-Cookie response headers) then redirects to '/'.
          // This replaces the old client-side cookie-wipe + reload approach, which failed on
          // iOS PWA and some cookie configurations where sb-* cookies were HttpOnly/domain-scoped.
          window.location.href = '/api/signout';
        };
        if (process.env.NODE_ENV === 'production') {
          doRedirect();
          return;
        }
        if (event === 'SIGNED_OUT') {
          const isTestMode = !!(window as unknown as Record<string, unknown>).__TrippyTestMode__;
          if (!isTestMode) { doRedirect(); return; }
          setAuthResolved(true);
        } else {
          // INITIAL_SESSION — defer 300 ms so Playwright's waitForFunction→evaluate round-trip
          // can set __TrippyTestMode__ before we decide to redirect.
          setTimeout(() => {
            const isTestMode = !!(window as unknown as Record<string, unknown>).__TrippyTestMode__;
            if (!isTestMode) { doRedirect(); } else { setAuthResolved(true); }
          }, 300);
        }
      }
    });

    // Reload trip data from DB if the user has a stored tripDbId (no auto-navigation).
    checkAuth();

    // Failsafe: if onAuthStateChange never fires (cold Supabase, network issue),
    // redirect to root after 10s so the user isn't stuck on the spinner forever.
    authTimeoutRef.current = setTimeout(() => {
      if (!useAppStore.getState().authUser) {
        window.location.href = '/';
      }
    }, 10_000);

    return () => {
      subscription.unsubscribe();
      if (authTimeoutRef.current) clearTimeout(authTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // After auth resolves, auto-load a trip joined via invite link
  useEffect(() => {
    if (!authUser) return;
    const pendingJoin = sessionStorage.getItem('Trippy-pending-join');
    if (!pendingJoin) return;
    sessionStorage.removeItem('Trippy-pending-join');
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
    // A persisted tripDbId means the user was INSIDE this trip when they last left
    // (switchTrip/leaveTrip/deleteTrip all clear tripDbId). On reload, restore them
    // to that trip. Go straight to the dashboard and let it render its skeleton while
    // the trip body loads in the background (showLoader:false) — a blocking full-screen
    // loader here just gets you stuck staring at a spinner. If the load fails, fall
    // back to the picker instead of leaving an empty skeleton hanging.
    useAppStore.setState({ screen: 'dashboard' });
    loadTripById(tripDbId, { showLoader: false, showEntry: false, navigate: true }).catch(() => {
      lastLoadedTripRef.current = null;
      switchTrip();
    });
  }, [authUser, tripDbId, trip, loadTripById, switchTrip]);

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

  // Respect system prefers-contrast: more - enable high contrast on first visit if OS requests it.
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
  // theme on the next page load - eliminating any theme flash without a script tag.
  useEffect(() => {
    if (typeof document !== 'undefined') {
      // Must be the literal string 'false' (not '') - the CSS dark-mode media
      // query is keyed on :root:not([data-dark="false"]), so any other value
      // leaves dark tokens applied when the OS prefers dark.
      document.documentElement.dataset.dark = resolvedDark ? 'true' : 'false';
      document.body.style.background = 'var(--bg)';
      document.cookie = `Trippy-dark=${resolvedDark ? 'true' : 'false'}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }, [resolvedDark]);

  // Service Worker registration lives in ServiceWorkerRegistrar (root layout) -
  // registering here as well was redundant.

  // Reset stuck global loader when app returns from background (PWA suspend/resume)
  useEffect(() => {
    const onVisible = () => {
      if (!document.hidden && useAppStore.getState().isGlobalLoading) {
        useAppStore.setState({ isGlobalLoading: false });
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  // Watchdog: a load that hangs past 5 s is treated as broken. Drop any stale
  // service-worker caches, abandon the trip, and return the user to the trip
  // picker so they are never trapped behind a frozen loader.
  useEffect(() => {
    if (!isGlobalLoading) return;
    const id = setTimeout(() => {
      if (!useAppStore.getState().isGlobalLoading) return;
      // Best-effort cache purge — a stale cached asset is the usual culprit.
      if (typeof caches !== 'undefined') {
        caches.keys().then(keys => keys.forEach(k => caches.delete(k))).catch(() => {});
      }
      lastLoadedTripRef.current = null;
      useAppStore.setState({ isGlobalLoading: false });
      switchTrip();
    }, 5000);
    return () => clearTimeout(id);
  }, [isGlobalLoading, switchTrip]);

  // Prevent iOS Safari pull-to-refresh (the gesture causes a full page reload
  // which shows the global loader). Allow vertical panning inside scroll containers
  // that are not at their top boundary.
  useEffect(() => {
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0].clientY; };
    const onTouchMove = (e: TouchEvent) => {
      const dy = e.touches[0].clientY - touchStartY;
      if (dy <= 0) return; // scrolling up - always fine
      // Walk up from the target to find a scrollable ancestor
      let el: Element | null = e.target as Element;
      while (el && el !== document.documentElement) {
        const style = window.getComputedStyle(el);
        const oy = style.overflowY;
        if (oy === 'auto' || oy === 'scroll') {
          if ((el as HTMLElement).scrollTop > 0) return; // not at top - allow
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

  // Row 807: dynamic page title per screen (before early return - Rules of Hooks)
  useEffect(() => {
    if (!mounted || !authResolved) return;
    const SCREEN_TITLES: Record<string, string> = {
      home: 'Trippy - Your Trips',
      dashboard: trip ? `${trip.name} - Trippy` : 'Dashboard - Trippy',
      day: 'Day Planner - Trippy',
      map: 'Map - Trippy',
      supplies: 'Packing - Trippy',
      settings: 'Settings - Trippy',
    };
    document.title = SCREEN_TITLES[screen] ?? 'Trippy';
  }, [mounted, authResolved, screen, trip?.name]);

  // Row 809: move focus to main content h1 after screen navigation (before early return)
  useEffect(() => {
    if (!mounted || !authResolved) return;
    const h1 = document.querySelector<HTMLElement>('#main-content h1');
    if (h1) {
      if (!h1.hasAttribute('tabindex')) h1.setAttribute('tabindex', '-1');
      h1.focus({ preventScroll: true });
    }
  }, [mounted, authResolved, screen]);

  // Block render only when we have no idea who the user is yet.
  // If persisted authUser is available from localStorage, show the app immediately —
  // onAuthStateChange will correct any stale state (redirect to / if expired).
  if (!mounted || (!authResolved && !authUser)) {
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

  const NAV_SCREENS = new Set(['dashboard', 'day', 'map', 'supplies', 'settings', 'notes']);
  const showNav = !!authUser && !!trip && NAV_SCREENS.has(screen);

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
          {/* Soft brand-tinted ambient background - shared by every screen */}
          <div className="app-ambient" aria-hidden="true" />

          {/* Row 808: skip link - visible on focus for keyboard users */}
          <a
            href="#main-content"
            style={{
              position: 'absolute',
              top: -999, left: 0, zIndex: 'var(--z-top)',
              padding: '8px 16px',
              background: 'var(--bg)',
              color: 'var(--brand)',
              fontWeight: 700,
              fontSize: 14,
              borderRadius: '0 0 8px 0',
              textDecoration: 'none',
              border: '2px solid var(--brand)',
            }}
            onFocus={e => { e.currentTarget.style.top = '0'; }}
            onBlur={e => { e.currentTarget.style.top = '-999px'; }}
          >
            {locale === 'he' ? 'דלג לתוכן הראשי' : 'Skip to main content'}
          </a>

          {/* Row 578: live region announces navigation for screen readers */}
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap' }}
          >
            {screen === 'home' ? (locale === 'he' ? 'ראשי' : 'Home')
              : screen === 'dashboard' ? (locale === 'he' ? 'לוח בקרה' : 'Dashboard')
              : screen === 'day' ? (locale === 'he' ? 'תכנון יום' : 'Day planner')
              : screen === 'map' ? (locale === 'he' ? 'מפה' : 'Map')
              : screen === 'supplies' ? (locale === 'he' ? 'ציוד' : 'Packing')
              : screen === 'settings' ? (locale === 'he' ? 'הגדרות' : 'Settings')
              : screen === 'notes' ? (locale === 'he' ? 'הערות' : 'Notes')
              : ''}
          </div>

          {/* Offline banner - shown above nav and content */}
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
              zIndex: 'var(--z-top)',
            }}>
              <Icon name="offline" size={14} style={{ color: 'var(--danger)', flexShrink: 0 }} />
              {pendingChanges.length === 0
                ? t('offlineViewing')
                : pendingChanges.length === 1
                  ? t('offlinePendingOne')
                  : t('offlinePendingMany').replace('{n}', String(pendingChanges.length))}
            </div>
          )}

          {/* Saving indicator - subtle pill shown while writes are in-flight */}
          {!isOffline && pendingWriteCount > 0 && (
            <div
              className="lg"
              style={{
                position: 'fixed',
                bottom: 'calc(env(safe-area-inset-bottom, 0px) + 72px)',
                insetInlineEnd: 16,
                zIndex: 'var(--z-top)',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                borderRadius: 20,
                padding: '4px 10px',
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--text-2)',
                pointerEvents: 'none',
              }}
            >
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: 'var(--lg-terra)',
                animation: 'pulse 1.2s ease-in-out infinite',
              }} />
              {t('saving')}
            </div>
          )}

          {showNav && (
            <NavBar_V2
              active={screen}
              onChange={s => setScreen(s)}
              onSettings={() => setScreen('settings')}
              onSwitch={() => switchTrip()}
              onLogout={() => logout()}
              onNotes={() => setScreen('notes')}
              onWishlist={() => setShowWishlist(true)}
              onAI={() => { if (trip) setShowAIMenu(true); }}
              wishlistOpen={showWishlist}
            />
          )}

          <main id="main-content" className="flex-1 flex flex-col relative overflow-hidden w-full">
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
                    <ErrorBoundary>
                      {!trip && tripDbId && screen === 'dashboard' ? (
                        /* Trip data loading while already navigated to dashboard */
                        <DashboardSkeleton />
                      ) : screen === 'splash' || screen === 'home' || !trip ? (
                        <Home_V2 />
                      ) : screen === 'dashboard' ? (
                        <DashboardScreen />
                      ) : screen === 'day' ? (
                        <DayScreen />
                      ) : screen === 'map' ? (
                        <MapScreen />
                      ) : screen === 'supplies' ? (
                        <SuppliesScreen />
                      ) : screen === 'settings' ? (
                        <SettingsScreen onSecurity={() => setShowSecurity(true)} />
                      ) : screen === 'notes' ? (
                        <NotesScreen />
                      ) : null}
                    </ErrorBoundary>
                  </div>
                </div>
              </m.div>
            </AnimatePresence>
          </main>
          {showTour && <TourOverlay />}

          {/* Wishlist sheet */}
          {showWishlist && <WishlistSheet onClose={() => setShowWishlist(false)} />}

          {/* AI assistant - Ask (Haiko chat) | Find (discovery) chooser */}
          {showAIMenu && (
            <AIMenuSheet
              onClose={() => setShowAIMenu(false)}
              onAsk={() => { setShowAIMenu(false); setShowHaiko(true); }}
              onFind={() => { setShowAIMenu(false); setShowPersona(true); }}
            />
          )}
          {showHaiko && <HaikoChat onClose={() => setShowHaiko(false)} />}

          {/* AI persona + suggestions sheets - available from any screen */}
          {showPersona && <PersonaSheet dayNumber={activeDay} />}
          {showSuggestions && !showPersona && <AISheetLazy dayNumber={activeDay} />}

          {/* Security settings sheet */}
          {showSecurity && <SecuritySettings onClose={() => setShowSecurity(false)} />}

          {/* MFA challenge - shown after OAuth if the account has MFA enrolled */}
          {showMfaChallenge && (
            <MFAChallenge
              onSuccess={() => {
                setShowMfaChallenge(false);
                setScreen('home');
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

          {/* Global loading overlay - shown during loadTripById / createTrip */}
          <AnimatePresence>
            {isGlobalLoading && (
              <m.div
                key="global-loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                style={{
                  position: 'fixed', inset: 0, zIndex: 'var(--z-top)',
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
