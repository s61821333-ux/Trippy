'use client'

import { useEffect, useState, useCallback } from 'react'

type Status = 'pending' | 'approved' | 'rejected' | 'blocked'
type TabKey = Status | 'all'

interface UserRow {
  user_id: string
  email: string
  display_name: string
  status: Status
  requested_at: string
  decided_at: string | null
}

interface Stats {
  pending: number
  approved: number
  rejected: number
  blocked: number
  total_users: number
  total_trips: number
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

const AVATAR_COLORS = [
  'oklch(65% 0.198 42)',   // terra
  'oklch(45% 0.150 152)',  // brand
  'oklch(72% 0.162 73)',   // sand
  'oklch(50% 0.090 155)',  // success
  'oklch(60% 0.162 30)',   // coral
]

function avatarColor(userId: string) {
  let hash = 0
  for (const c of userId) hash = (hash * 31 + c.charCodeAt(0)) | 0
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'blocked', label: 'Blocked' },
]

export default function AdminClient() {
  const [tab, setTab] = useState<TabKey>('pending')
  const [users, setUsers] = useState<UserRow[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<Set<string>>(new Set())

  const fetchStats = useCallback(async () => {
    const res = await fetch('/api/admin/stats')
    if (res.ok) setStats(await res.json())
  }, [])

  const fetchUsers = useCallback(async (status: TabKey) => {
    setLoading(true)
    const url = status === 'all' ? '/api/admin/approvals' : `/api/admin/approvals?status=${status}`
    const res = await fetch(url)
    if (res.ok) {
      const data = await res.json()
      setUsers(data.users ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchStats()
    fetchUsers(tab)
  }, [tab, fetchStats, fetchUsers])

  const decide = async (userId: string, action: 'approve' | 'reject' | 'block') => {
    setRemoving((s) => new Set(s).add(userId))
    try {
      await fetch(`/api/admin/approvals/${userId}/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      setUsers((prev) => prev.filter((u) => u.user_id !== userId))
      fetchStats()
    } finally {
      setRemoving((s) => { const n = new Set(s); n.delete(userId); return n })
    }
  }

  return (
    <main
      style={{
        minHeight: '100dvh',
        background: 'var(--bg)',
        padding: '0 0 40px',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'var(--surface)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          borderBottom: '1px solid var(--border)',
          padding: '20px 20px 16px',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--text)' }}>
            Trippy<span style={{ color: 'var(--terra)' }}>.</span>
          </span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--text-3)',
              background: 'var(--bg-alt)',
              borderRadius: 'var(--radius-full)',
              padding: '3px 10px',
            }}
          >
            Admin
          </span>
        </div>

        {/* Stats pills */}
        {stats && (
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
            {[
              { label: 'Pending', value: stats.pending, color: 'var(--warning)' },
              { label: 'Approved', value: stats.approved, color: 'var(--success)' },
              { label: 'Users', value: stats.total_users, color: 'var(--text-2)' },
              { label: 'Trips', value: stats.total_trips, color: 'var(--brand)' },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                style={{
                  flexShrink: 0,
                  background: 'var(--surface-strong)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-full)',
                  padding: '6px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span style={{ fontSize: '17px', fontWeight: 700, color }}>{value}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          padding: '14px 16px 0',
          overflowX: 'auto',
        }}
      >
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              flexShrink: 0,
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              border: tab === key ? '1.5px solid var(--brand)' : '1px solid var(--border)',
              background: tab === key ? 'var(--brand-muted)' : 'transparent',
              color: tab === key ? 'var(--brand)' : 'var(--text-2)',
              fontSize: '14px',
              fontWeight: tab === key ? 700 : 400,
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {label}
            {key === 'pending' && stats?.pending ? (
              <span
                style={{
                  marginLeft: '6px',
                  background: 'var(--terra)',
                  color: '#fff',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '1px 6px',
                }}
              >
                {stats.pending}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* User list */}
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {loading && (
          <p style={{ color: 'var(--text-3)', fontSize: '14px', textAlign: 'center', padding: '32px 0' }}>
            Loading…
          </p>
        )}

        {!loading && users.length === 0 && (
          <p style={{ color: 'var(--text-3)', fontSize: '14px', textAlign: 'center', padding: '32px 0' }}>
            No {tab} users.
          </p>
        )}

        {users.map((u) => {
          const isRemoving = removing.has(u.user_id)
          return (
            <div
              key={u.user_id}
              style={{
                background: 'var(--surface)',
                backdropFilter: 'var(--glass-blur)',
                WebkitBackdropFilter: 'var(--glass-blur)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                opacity: isRemoving ? 0.4 : 1,
                transition: 'opacity 0.25s',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: avatarColor(u.user_id),
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '15px',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {initials(u.display_name || u.email)}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: '15px',
                    fontWeight: 600,
                    color: 'var(--text)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {u.display_name || '—'}
                </p>
                <p
                  style={{
                    margin: '2px 0 0',
                    fontSize: '13px',
                    color: 'var(--text-3)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {u.email}
                </p>
                <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--text-3)' }}>
                  {timeAgo(u.requested_at)}
                </p>
              </div>

              {/* Actions */}
              {tab === 'pending' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                  <button
                    disabled={isRemoving}
                    onClick={() => decide(u.user_id, 'approve')}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 'var(--radius-full)',
                      border: 'none',
                      background: 'var(--brand)',
                      color: '#fff',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    Approve
                  </button>
                  <button
                    disabled={isRemoving}
                    onClick={() => decide(u.user_id, 'reject')}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--border-strong)',
                      background: 'transparent',
                      color: 'var(--danger)',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    Reject
                  </button>
                </div>
              )}

              {tab === 'approved' && (
                <button
                  disabled={isRemoving}
                  onClick={() => decide(u.user_id, 'block')}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border-strong)',
                    background: 'transparent',
                    color: 'var(--danger)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    flexShrink: 0,
                  }}
                >
                  Block
                </button>
              )}

              {(tab === 'rejected' || tab === 'blocked') && (
                <button
                  disabled={isRemoving}
                  onClick={() => decide(u.user_id, 'approve')}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 'var(--radius-full)',
                    border: 'none',
                    background: 'var(--brand)',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    flexShrink: 0,
                  }}
                >
                  Approve
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Refresh button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
        <button
          onClick={() => { fetchStats(); fetchUsers(tab) }}
          style={{
            padding: '10px 24px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--text-2)',
            fontSize: '14px',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
          }}
        >
          Refresh
        </button>
      </div>
    </main>
  )
}
