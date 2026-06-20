'use client';
import { useEffect } from 'react';

export default function SplashRemover() {
  useEffect(() => {
    const el = document.getElementById('trippy-splash');
    if (!el) return;
    el.style.opacity = '0';
    el.style.pointerEvents = 'none';
    const t = setTimeout(() => el.remove(), 600);
    return () => clearTimeout(t);
  }, []);
  return null;
}
