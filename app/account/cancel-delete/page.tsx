'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

type Status = 'loading' | 'success' | 'error'

function CancelDeleteContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<Status>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Invalid cancellation link.')
      return
    }

    fetch(`/api/account/delete/cancel?token=${encodeURIComponent(token)}`, { method: 'POST' })
      .then(async (res) => {
        const data = await res.json()
        if (res.ok) {
          setStatus('success')
        } else {
          setStatus('error')
          setMessage(data.error ?? 'Something went wrong.')
        }
      })
      .catch(() => {
        setStatus('error')
        setMessage('Network error — please try again.')
      })
  }, [token])

  return (
    <div style={{
      width: '100%', maxWidth: 380,
      background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(16px)',
      border: '1px solid rgba(0,0,0,0.08)', borderRadius: 20,
      padding: '32px 24px', textAlign: 'center',
      boxShadow: '0 4px 32px rgba(0,0,0,0.10)',
    }}>
      {status === 'loading' && (
        <>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
          <div style={{ fontSize: 16, color: '#555' }}>Processing…</div>
        </>
      )}

      {status === 'success' && (
        <>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🎉</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>
            Account deletion cancelled.
          </div>
          <div style={{ fontSize: 13, color: '#666', lineHeight: 1.5, marginBottom: 20 }}>
            You're still in — nothing has changed.
          </div>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '10px 20px', borderRadius: 10,
              background: 'oklch(45% 0.12 155)', border: 'none',
              fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer',
            }}
          >
            Go to app
          </button>
        </>
      )}

      {status === 'error' && (
        <>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>
            Could not cancel deletion
          </div>
          <div style={{ fontSize: 13, color: '#666', lineHeight: 1.5, marginBottom: 20 }}>
            {message}
          </div>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '10px 20px', borderRadius: 10,
              background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.1)',
              fontSize: 13, fontWeight: 600, color: '#444', cursor: 'pointer',
            }}
          >
            Go to app
          </button>
        </>
      )}
    </div>
  )
}

export default function CancelDeletePage() {
  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#F4EFE8', padding: 24,
      fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
    }}>
      <Suspense fallback={
        <div style={{ fontSize: 16, color: '#555' }}>Loading…</div>
      }>
        <CancelDeleteContent />
      </Suspense>
    </div>
  )
}
