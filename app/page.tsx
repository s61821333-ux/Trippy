import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import LandingSignIn from './components/LandingSignIn';
import LandingNextGuard from './components/LandingNextGuard';

export const metadata = {
  title: 'Trippy — Volunteer Trip Planner',
};

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect('/app');

  return (
    <>
      <LandingNextGuard />
      <div style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 20px',
        background: 'var(--bg)',
        gap: 0,
      }}>

        {/* Logo */}
        <svg width="52" height="52" viewBox="0 0 240 240" fill="none" aria-hidden="true" style={{ marginBottom: 20 }}>
          <path d="M120 36 L138 120 L120 124 L102 120 Z" fill="var(--terra)" />
          <path d="M120 204 L102 120 L120 116 L138 120 Z" fill="var(--brand)" />
          <path d="M204 120 L120 102 L116 120 L120 138 Z" fill="var(--sand)" opacity="0.75" />
          <path d="M36 120 L120 138 L124 120 L120 102 Z" fill="var(--sand)" opacity="0.75" />
          <circle cx="120" cy="120" r="6" fill="var(--text)" />
        </svg>

        {/* Wordmark */}
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 42,
          fontWeight: 400,
          letterSpacing: '-0.03em',
          color: 'var(--text)',
          lineHeight: 1,
          margin: '0 0 10px',
        }}>
          Trippy<span style={{ color: 'var(--terra)' }}>.</span>
        </h1>

        {/* Demo label */}
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.13em',
          textTransform: 'uppercase',
          color: 'var(--text-3)',
          margin: '0 0 40px',
        }}>
          Volunteering demo
        </p>

        {/* Sign-in buttons */}
        <LandingSignIn />

      </div>
    </>
  );
}
