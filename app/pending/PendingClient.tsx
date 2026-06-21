'use client'

import { useEffect, useState } from 'react'

type Status = 'pending' | 'rejected' | 'blocked'

const COMPASS_SVG = (
  <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true">
    <circle cx="28" cy="28" r="26" stroke="currentColor" strokeWidth="2" opacity="0.18" />
    <circle cx="28" cy="28" r="20" stroke="currentColor" strokeWidth="1.5" opacity="0.10" />
    <circle cx="28" cy="28" r="3" fill="currentColor" opacity="0.5" />
    <polygon
      id="trippy-compass-needle"
      points="28,8 31,28 28,30 25,28"
      fill="var(--terra)"
      style={{
        transformBox: 'fill-box',
        transformOrigin: 'center',
        animation: 'ts-seek 3s ease-in-out infinite',
      }}
    />
    <polygon points="28,48 31,28 28,26 25,28" fill="currentColor" opacity="0.25" />
    <text x="28" y="18" textAnchor="middle" fontSize="7" fill="currentColor" opacity="0.35" fontFamily="var(--font-sans)">N</text>
  </svg>
)

export default function PendingClient({ status }: { status: Status }) {
  const [dots, setDots] = useState('.')
  const [checked, setChecked] = useState(false)

  // Pulsing ellipsis
  useEffect(() => {
    if (status !== 'pending') return
    const t = setInterval(() => setDots((d) => (d.length >= 3 ? '.' : d + '.')), 600)
    return () => clearInterval(t)
  }, [status])

  // Poll every 30 s for approval
  useEffect(() => {
    if (status !== 'pending') return
    const poll = async () => {
      try {
        const res = await fetch('/api/approval-status')
        if (!res.ok) return
        const data = await res.json()
        if (data.status === 'approved') {
          window.location.href = '/app'
        } else {
          setChecked(true)
        }
      } catch { /* silent */ }
    }
    poll() // immediate first check
    const interval = setInterval(poll, 30_000)
    return () => clearInterval(interval)
  }, [status])

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        padding: '24px 16px',
      }}
    >
      <style>{`
        @keyframes ts-seek {
          0%, 100% { transform: rotate(-14deg); }
          50%       { transform: rotate(14deg); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.45; transform: scale(0.85); }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(12px); filter: blur(4px); }
          to   { opacity: 1; transform: translateY(0);    filter: blur(0);   }
        }
      `}</style>

      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          background: 'var(--surface)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          padding: '40px 32px 36px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          animation: 'fade-up 0.45s cubic-bezier(0.34,1.56,0.64,1) both',
        }}
      >
        {/* Logo mark */}
        <div style={{ color: 'var(--brand)' }}>{COMPASS_SVG}</div>

        {/* Wordmark */}
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '26px',
            color: 'var(--text)',
            letterSpacing: '-0.02em',
            margin: 0,
          }}
        >
          Trippy<span style={{ color: 'var(--terra)' }}>.</span>
        </p>

        {/* State-specific content */}
        {status === 'pending' && (
          <>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h1
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '20px',
                  fontWeight: 700,
                  color: 'var(--text)',
                  margin: 0,
                  lineHeight: 1.3,
                }}
              >
                You&rsquo;re on the list
              </h1>
              <p
                style={{
                  fontSize: '15px',
                  color: 'var(--text-2)',
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                Guy will review your request and approve you shortly. Hang tight — this usually takes just a few minutes.
              </p>
            </div>

            {/* Pulsing status indicator */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--success-bg)',
                borderRadius: 'var(--radius-full)',
                padding: '8px 16px',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--success)',
                  display: 'inline-block',
                  animation: 'pulse-dot 1.4s ease-in-out infinite',
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: '13px', color: 'var(--success)', fontWeight: 600 }}>
                {checked ? `Checking${dots}` : `Request sent${dots}`}
              </span>
            </div>
          </>
        )}

        {status === 'rejected' && (
          <>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h1
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '20px',
                  fontWeight: 700,
                  color: 'var(--text)',
                  margin: 0,
                }}
              >
                Access not approved
              </h1>
              <p style={{ fontSize: '15px', color: 'var(--text-2)', margin: 0, lineHeight: 1.6 }}>
                Your request wasn&rsquo;t approved. If you think this is a mistake, reach out to Guy directly.
              </p>
            </div>
            <a
              href="/api/signout"
              style={{
                fontSize: '14px',
                color: 'var(--text-3)',
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
              }}
            >
              Sign out
            </a>
          </>
        )}

        {status === 'blocked' && (
          <>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h1
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '20px',
                  fontWeight: 700,
                  color: 'var(--text)',
                  margin: 0,
                }}
              >
                Access suspended
              </h1>
              <p style={{ fontSize: '15px', color: 'var(--text-2)', margin: 0, lineHeight: 1.6 }}>
                Your access to Trippy has been suspended.
              </p>
            </div>
          </>
        )}

        {/* Footer — sign out link for pending state */}
        {status === 'pending' && (
          <p style={{ fontSize: '13px', color: 'var(--text-3)', margin: 0 }}>
            Not you?{' '}
            <a
              href="/api/signout"
              style={{
                color: 'var(--text-2)',
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
              }}
            >
              Sign out
            </a>
          </p>
        )}
      </div>
    </main>
  )
}
