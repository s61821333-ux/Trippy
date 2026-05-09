'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { I18nProvider, useI18n } from '@/lib/i18n';
import NavBar from './NavBar';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import DayScreen from './screens/DayScreen';
import SuppliesScreen from './screens/SuppliesScreen';
import SettingsScreen from './screens/SettingsScreen';
import NotesScreen from './screens/NotesScreen';
import { ToastProvider } from './ui/Toast';

const screenVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -4 },
};

const screenTransition = {
  type: 'spring' as const,
  stiffness: 360,
  damping: 38,
  mass: 0.8,
};

function Shell() {
  const { screen, setScreen, trip, darkMode } = useAppStore();
  const { isRTL } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

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

  return (
    <ToastProvider>
      <div
        dir={isRTL ? 'rtl' : 'ltr'}
        data-dark={darkMode ? 'true' : undefined}
        className="relative flex flex-col w-screen h-[100dvh] overflow-hidden"
        style={{ background: 'var(--bg)' }}
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
      </div>
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
