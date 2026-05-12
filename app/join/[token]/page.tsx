'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

type PageStatus = 'loading' | 'ready' | 'not_found' | 'joining' | 'joined'

interface TripInfo {
  tripId: string
  tripName: string
  tripTheme: string | null
}

const THEME_EMOJI: Record<string, string> = {
  desert: '🏜️', nature: '🌲', city: '🌆', beach: '🏖️',
  mountain: '⛰️', snow: '❄️', lake: '🏞️', space: '🚀', sunset: '🌅',
}

export default function JoinPage() {
  const { token } = useParams() as { token: string }
  const [status, setStatus] = useState<PageStatus>('loading')
  const [tripInfo, setTripInfo] = useState<TripInfo | null>(null)
  const [isAuthed, setIsAuthed] = useState(false)
  const [joinError, setJoinError] = useState('')

  useEffect(() => {
    if (!token) return
    const supabase = createClient()

    // Check auth + fetch trip info in parallel
    Promise.all([
      supabase.auth.getSession(),
      fetch(`/api/invite/${token}`).then(r => r.json()),
    ]).then(([{ data: { session } }, info]) => {
      setIsAuthed(!!session?.user)
      if (info.error) {
        setStatus('not_found')
      } else {
        setTripInfo({ tripId: info.tripId, tripName: info.tripName, tripTheme: info.tripTheme })
        setStatus('ready')
      }
    }).catch(() => setStatus('not_found'))
  }, [token])

  const handleSignIn = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent('/join/' + token)}`,
      },
    })
  }

  const handleJoin = async () => {
    if (!tripInfo) return
    setJoinError('')
    setStatus('joining')
    const r = await fetch(`/api/invite/${token}`, { method: 'POST' })
    const data = await r.json()
    if (r.ok) {
      setStatus('joined')
      // Give the user a moment to see the success message, then redirect
      setTimeout(() => { window.location.href = `/?join=${data.tripId}` }, 1400)
    } else {
      setJoinError(data.error ?? 'Could not join trip — please try again')
      setStatus('ready')
    }
  }

  const emoji = tripInfo?.tripTheme ? (THEME_EMOJI[tripInfo.tripTheme] ?? '🌍') : '🌍'

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#F4EFE8',
      padding: '24px',
      fontFamily: '"DM Sans", system-ui, sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: '2.8rem', marginBottom: 8 }}>🌍</div>
          <div style={{
            fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.03em',
            color: 'oklch(52% 0.18 195)',
          }}>
            Trippy
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: 20,
          padding: '28px 24px',
          boxShadow: '0 4px 32px rgba(0,0,0,0.10)',
        }}>

          {status === 'loading' && (
            <div style={{ textAlign: 'center', color: '#888', fontSize: 14, padding: '16px 0' }}>
              Loading…
            </div>
          )}

          {status === 'not_found' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>😕</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>
                Invite not found
              </div>
              <div style={{ fontSize: 13, color: '#666', lineHeight: 1.5 }}>
                This invite link may be invalid or the trip was deleted.
              </div>
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  marginTop: 20, padding: '10px 20px', borderRadius: 10,
                  background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.1)',
                  fontSize: 13, fontWeight: 600, color: '#444', cursor: 'pointer',
                }}
              >
                Go to Trippy
              </button>
            </div>
          )}

          {(status === 'ready' || status === 'joining') && tripInfo && (
            <>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ fontSize: 52, marginBottom: 12, lineHeight: 1 }}>{emoji}</div>
                <div style={{
                  fontSize: 20, fontWeight: 800, color: '#1a1a1a',
                  letterSpacing: '-0.02em', marginBottom: 6,
                }}>
                  {tripInfo.tripName}
                </div>
                <div style={{ fontSize: 13, color: '#666' }}>
                  You've been invited to join this trip ✈️
                </div>
              </div>

              {joinError && (
                <div style={{
                  color: '#c53030', fontSize: 12, textAlign: 'center',
                  marginBottom: 14, padding: '8px 12px',
                  background: 'rgba(197,48,48,0.06)', borderRadius: 8,
                }}>
                  {joinError}
                </div>
              )}

              {!isAuthed ? (
                <button
                  onClick={handleSignIn}
                  style={{
                    width: '100%', padding: '13px 16px', borderRadius: 12,
                    background: 'oklch(52% 0.18 195)', color: 'white',
                    fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="white"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="rgba(255,255,255,0.82)"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="rgba(255,255,255,0.65)"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="rgba(255,255,255,0.5)"/>
                  </svg>
                  Sign in with Google to join
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button
                    onClick={handleJoin}
                    disabled={status === 'joining'}
                    style={{
                      width: '100%', padding: '13px 16px', borderRadius: 12,
                      background: 'oklch(52% 0.18 195)', color: 'white',
                      fontWeight: 700, fontSize: 15, border: 'none',
                      cursor: status === 'joining' ? 'not-allowed' : 'pointer',
                      opacity: status === 'joining' ? 0.7 : 1,
                      transition: 'opacity 0.15s',
                    }}
                  >
                    {status === 'joining' ? 'Joining…' : '✈️ Join Trip'}
                  </button>
                  <button
                    onClick={() => window.location.href = '/'}
                    style={{
                      width: '100%', padding: '11px 16px', borderRadius: 12,
                      background: 'rgba(0,0,0,0.04)', color: '#555',
                      fontWeight: 600, fontSize: 14,
                      border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer',
                    }}
                  >
                    Decline
                  </button>
                </div>
              )}
            </>
          )}

          {status === 'joined' && (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#1a1a1a', marginBottom: 6 }}>
                You've joined the trip!
              </div>
              <div style={{ fontSize: 13, color: '#888' }}>Opening your itinerary…</div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
