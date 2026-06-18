'use client';
import { useEffect } from 'react';

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    // When a newly-installed SW takes control, reload once so the page runs the
    // fresh code/assets instead of the stale ones the old SW was serving.
    // Guards: only reload when a controller already existed (an UPDATE, not the
    // first-ever install), and only once, to avoid reload loops.
    let reloaded = false;
    const hadController = !!navigator.serviceWorker.controller;
    const onControllerChange = () => {
      if (reloaded || !hadController) return;
      reloaded = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        // Actively check for a newer SW on every load so deploys roll out fast.
        reg.update().catch(() => {});
      })
      .catch(() => {});

    return () => navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
  }, []);
  return null;
}
