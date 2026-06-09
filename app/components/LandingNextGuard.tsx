'use client';
import { useEffect } from 'react';

export default function LandingNextGuard() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const next = params.get('next');
    if (next && /^https?:\/\/|^\/\//i.test(next)) {
      params.delete('next');
      const search = params.toString();
      history.replaceState(null, '', window.location.pathname + (search ? `?${search}` : '') + window.location.hash);
    }
  }, []);
  return null;
}
