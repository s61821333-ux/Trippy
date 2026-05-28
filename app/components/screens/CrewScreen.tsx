'use client';

import React, { useState, useEffect, useRef } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { spring, listItemVariants } from '@/lib/motion';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { useToast } from '../ui/Toast';
import Icon from '../ui/Icon';

// ─── Colour ring for participant avatars ────────────────────────────────────

const AVATAR_COLORS = [
  '#C4714A', '#3B6E52', '#7B5EA7', '#4A8FC4', '#C4A44A',
  '#E07052', '#52A07B', '#A47B52', '#527BA0', '#A0527B',
];

function Avatar({ name, color, size = 40 }: { name: string; color?: string; size?: number }) {
  const bg = color || AVATAR_COLORS[Math.abs(name.charCodeAt(0)) % AVATAR_COLORS.length];
  const initials = name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-sans)',
        fontWeight: 700,
        fontSize: size * 0.38,
        color: '#fff',
        flexShrink: 0,
        letterSpacing: '-0.02em',
      }}
    >
      {initials || '?'}
    </div>
  );
}

// ─── Section header ─────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{
      padding: 'var(--space-2) var(--page-px)',
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.10em',
      textTransform: 'uppercase',
      color: 'var(--text-3)',
    }}>
      {label}
    </div>
  );
}

// ─── Glass card wrapper ──────────────────────────────────────────────────────

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      margin: '0 var(--page-px)',
      background: 'var(--surface)',
      backdropFilter: 'var(--glass-blur)',
      WebkitBackdropFilter: 'var(--glass-blur)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.40), 0 4px 16px rgba(26,20,16,0.07)',
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── Row divider ─────────────────────────────────────────────────────────────

function Divider() {
  return (
    <div style={{
      height: 1,
      marginInlineStart: 'calc(var(--space-4) + 40px + var(--space-3))',
      background: 'var(--border)',
    }} />
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function CrewScreen() {
  const { t } = useI18n();
  const { show } = useToast();

  const { trip, tripDbId, userId, nickname, inviteToTrip, createInviteLink,
          pendingInvitations, loadInvitations } = useAppStore(
    useShallow(s => ({
      trip:               s.trip,
      tripDbId:           s.tripDbId,
      userId:             s.userId,
      nickname:           s.nickname,
      inviteToTrip:       s.inviteToTrip,
      createInviteLink:   s.createInviteLink,
      pendingInvitations: s.pendingInvitations,
      loadInvitations:    s.loadInvitations,
    }))
  );

  const [emailValue, setEmailValue]   = useState('');
  const [sending, setSending]         = useState(false);
  const [linkCopying, setLinkCopying] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  const isOwner = trip?.createdBy
    ? trip.createdBy === userId
    : trip?.participants[0]?.name === nickname;

  useEffect(() => {
    if (tripDbId) loadInvitations().catch(() => {});
  }, [tripDbId]);

  if (!trip) return null;

  const participants = trip.participants ?? [];

  const handleSendInvite = async () => {
    const email = emailValue.trim();
    if (!email || !email.includes('@')) return;
    setSending(true);
    try {
      await inviteToTrip(email);
      show(t('inviteSent'));
      setEmailValue('');
      loadInvitations().catch(() => {});
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('limit')) show(t('inviteLimitReached'));
      else show(t('inviteFailed'));
    } finally {
      setSending(false);
    }
  };

  const handleCopyLink = async () => {
    if (linkCopying) return;
    setLinkCopying(true);
    try {
      const link = await createInviteLink();
      await navigator.clipboard.writeText(link);
      show(t('linkCopied'));
    } catch {
      show(t('noLink'));
    } finally {
      setTimeout(() => setLinkCopying(false), 1500);
    }
  };

  const sectionVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.055, delayChildren: 0.04 } },
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      overflowY: 'auto',
      overscrollBehaviorY: 'contain',
      paddingBottom: 'var(--space-8)',
      position: 'relative',
      background: 'var(--bg)',
    }}>
      {/* ── Multi-layer warm desert background ── */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'linear-gradient(170deg, #F5D4B8 0%, #ECC49A 30%, #D4A87A 60%, #C49060 100%)',
        opacity: 0.35,
      }} />
      <div style={{
        position: 'fixed', top: '-20%', right: '-20%', width: 400, height: 400,
        borderRadius: '50%', zIndex: 0, pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(255,220,170,0.50) 0%, transparent 70%)',
        filter: 'blur(60px)',
      }} />
      <div style={{
        position: 'fixed', bottom: '10%', left: '-15%', width: 350, height: 350,
        borderRadius: '50%', zIndex: 0, pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(200,150,90,0.35) 0%, transparent 70%)',
        filter: 'blur(50px)',
      }} />

      {/* Content (above background) */}
      <div style={{ position: 'relative', zIndex: 1 }}>

      {/* ── Header pill ── */}
      <div style={{
        padding: 'var(--page-pt) var(--page-px) 0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(255,255,255,0.80)', backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.90)',
          borderRadius: 9999, padding: '8px 16px',
          boxShadow: '0 2px 8px rgba(26,20,16,0.06)',
        }}>
          <Icon name="grid" size={16} style={{ color: 'var(--text-2)' }} />
          <span dir="ltr" style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--forest-dk)' }}>
            Trippy<span style={{ color: 'var(--terra)' }}>.</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'rgba(255,255,255,0.80)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.90)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(26,20,16,0.06)',
          }}>
            <Icon name="compass" size={16} style={{ color: 'var(--text-2)' }} />
          </div>
        </div>
      </div>

      {/* ── Floating compass circle ── */}
      <div style={{
        display: 'flex', justifyContent: 'center', paddingTop: 24, paddingBottom: 8,
      }}>
        <m.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.1 }}
          style={{
            width: 120, height: 120, borderRadius: '50%',
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,255,255,0.95)',
            boxShadow: '0 16px 48px rgba(26,20,16,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden',
          }}
        >
          {/* Compass line divider */}
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 1, background: 'rgba(26,20,16,0.12)' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 1, background: 'rgba(26,20,16,0.12)' }} />
          {/* Center dot */}
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--text)', zIndex: 1 }} />
          {/* North arrow */}
          <div style={{
            position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderBottom: '28px solid var(--terra)',
          }} />
          {/* South arrow */}
          <div style={{
            position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '28px solid var(--brand)',
          }} />
        </m.div>
      </div>

      {/* ── Main invite card ── */}
      <div style={{ padding: '0 var(--page-px) 16px' }}>
        <m.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28, delay: 0.15 }}
          style={{
            background: 'rgba(255,255,255,0.90)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,255,255,0.95)',
            borderRadius: 28,
            padding: '24px 20px',
            boxShadow: '0 8px 32px rgba(26,20,16,0.10)',
          }}
        >
          {/* Heading */}
          <h2 style={{
            fontSize: 22, fontWeight: 700,
            color: 'var(--text)', letterSpacing: '-0.02em',
            lineHeight: 1.2, marginBottom: 8,
          }}>
            Gather the tribe.
          </h2>
          <p style={{
            fontSize: 14, color: 'var(--text-2)',
            lineHeight: 1.55, marginBottom: 20,
          }}>
            Add friends by email to sync itineraries and share memories in real-time.
          </p>

          {/* Email input */}
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
            letterSpacing: '0.18em', color: 'var(--text-3)',
            textTransform: 'uppercase', marginBottom: 8,
          }}>
            {t('inviteByEmail')}
          </p>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: 14, padding: '10px 14px', marginBottom: 12,
          }}>
            <input
              ref={emailRef}
              type="email"
              dir="ltr"
              value={emailValue}
              onChange={e => setEmailValue(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSendInvite(); }}
              placeholder={t('inviteEmailPlaceholder')}
              aria-label={t('inviteByEmail')}
              style={{
                flex: 1, border: 'none', background: 'transparent',
                fontFamily: 'var(--font-sans)', fontSize: 14,
                color: 'var(--text)', outline: 'none', minWidth: 0,
              }}
            />
            <Icon name="user" size={16} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
          </div>

          {/* Send invites button */}
          <m.button
            onClick={handleSendInvite}
            disabled={sending || !emailValue.trim().includes('@')}
            whileTap={{ scale: 0.97 }}
            style={{
              width: '100%', padding: '15px 20px', minHeight: 52,
              background: sending || !emailValue.trim().includes('@') ? 'rgba(59,110,82,0.45)' : 'var(--brand)',
              color: '#fff', border: 'none', borderRadius: 9999,
              fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 700,
              letterSpacing: '-0.01em', cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(59,110,82,0.28)',
              marginBottom: 20,
            }}
          >
            {sending ? '…' : 'Send Invites'}
          </m.button>

          {/* Current crew */}
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
            letterSpacing: '0.18em', color: 'var(--text-3)',
            textTransform: 'uppercase', marginBottom: 12,
          }}>
            CURRENT CREW ({participants.length})
          </p>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
            {participants.slice(0, 4).map((p, i) => (
              <m.div
                key={p.id ?? p.name}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.05, type: 'spring', stiffness: 400, damping: 24 }}
                style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: p.color || AVATAR_COLORS[i % AVATAR_COLORS.length],
                  color: '#fff', fontSize: 14, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2.5px solid rgba(255,255,255,0.90)',
                  marginLeft: i > 0 ? -12 : 0,
                  boxShadow: '0 2px 8px rgba(26,20,16,0.10)',
                  flexShrink: 0, letterSpacing: '-0.02em',
                }}
              >
                {p.name[0]?.toUpperCase()}
              </m.div>
            ))}
            {participants.length > 4 && (
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'var(--terra)', color: '#fff',
                fontSize: 12, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2.5px solid rgba(255,255,255,0.90)',
                marginLeft: -12, flexShrink: 0,
              }}>
                +{participants.length - 4}
              </div>
            )}
          </div>

          {/* Magic link */}
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
            letterSpacing: '0.18em', color: 'var(--text-3)',
            textTransform: 'uppercase', marginBottom: 10,
          }}>
            MAGIC LINK
          </p>
          <m.button
            onClick={handleCopyLink}
            whileTap={{ scale: 0.97 }}
            style={{
              width: '100%', padding: '13px 20px',
              background: 'var(--bg)', border: '1px solid var(--border)',
              borderRadius: 9999, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 10,
              fontFamily: 'var(--font-sans)', fontSize: 14,
              fontWeight: 600, color: 'var(--text)',
            }}
          >
            <span style={{ fontSize: 18 }}>🔗</span>
            <span style={{ flex: 1, textAlign: 'left' }}>
              {linkCopying ? '✓ Copied!' : 'Copy Trip Link'}
            </span>
          </m.button>
        </m.div>
      </div>

      {/* ── Footer note ── */}
      <div style={{ padding: '0 var(--page-px) 16px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>ℹ️</span>
        <p style={{ fontSize: 12, fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--text-2)', lineHeight: 1.6 }}>
          Invited crew members will have full access to view and add suggested stops to the &quot;{trip.name}&quot; itinerary.
        </p>
      </div>

      {/* ── Pending invitations ── */}
      {pendingInvitations.length > 0 && (
        <div style={{ padding: '0 var(--page-px) 16px' }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
            letterSpacing: '0.18em', color: 'var(--text-3)',
            textTransform: 'uppercase', marginBottom: 10,
          }}>
            PENDING ({pendingInvitations.length})
          </p>
      </div>
      )}

      {/* ── Bottom spacer ── */}
      <div style={{ height: 'var(--space-8)' }} />

      </div>{/* end position:relative zIndex:1 content wrapper */}
    </div>
  );
}
