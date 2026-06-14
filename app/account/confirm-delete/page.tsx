'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

type Status = 'loading' | 'success' | 'error'

function ConfirmDeleteContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<Status>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Invalid confirmation link.')
      return
    }

    fetch(`/api/account/delete/confirm?token=${encodeURIComponent(token)}`, { method: 'POST' })
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
        setMessage('Network error - your account has not been deleted.')
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
          <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>
            Your account has been deleted.
          </div>
          <div style={{ fontSize: 13, color: '#666', lineHeight: 1.5 }}>
            All your personal data has been removed. Thank you for using Triplly.
          </div>
        </>
      )}

      {status === 'error' && (
        <>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>
            Could not delete account
          </div>
          <div style={{ fontSize: 13, color: '#666', lineHeight: 1.5, marginBottom: 20 }}>
            {message || 'Your account has not been deleted.'}
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

export default function ConfirmDeletePage() {
  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#F4EFE8', padding: 24,
      fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
    }}>
      <Suspense fallback={
        <div style={{ fontSize: 16, color: '#555' }}>Loading…</div>
      }>
        <ConfirmDeleteContent />
      </Suspense>
    </div>
  )
}
