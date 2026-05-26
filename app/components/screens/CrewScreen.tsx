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
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
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
    }}>
      {/* ── Header ── */}
      <div style={{
        padding: 'var(--space-5) var(--page-px) var(--space-3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--text-xl)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          color: 'var(--text)',
          margin: 0,
        }}>
          {t('crewTitle')}
        </h1>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--text-3)',
          letterSpacing: '0.08em',
        }}>
          {participants.length} {participants.length === 1 ? t('onePerson') : t('people')}
        </div>
      </div>

      {/* ── Members section ── */}
      <SectionHeader label={t('crewMembers')} />
      <Card>
        {participants.length === 0 ? (
          <div style={{
            padding: 'var(--space-6)',
            textAlign: 'center',
            color: 'var(--text-3)',
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-sm)',
          }}>
            {t('crewNoMembers')}
          </div>
        ) : (
          <m.div variants={sectionVariants} initial="hidden" animate="visible">
            {participants.map((p, i) => {
              const isMe = p.name === nickname;
              const isPrimary = i === 0;
              const roleLabel = isPrimary ? t('crewOwnerLabel') : t('crewMemberLabel');

              return (
                <React.Fragment key={p.id ?? p.name}>
                  <m.div
                    variants={listItemVariants}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      padding: 'var(--space-3) var(--space-4)',
                    }}
                  >
                    <Avatar name={p.name} color={p.color} size={40} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 600,
                        fontSize: 'var(--text-base)',
                        color: 'var(--text)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}>
                        {p.name}
                        {isMe && (
                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 10,
                            fontWeight: 600,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: 'var(--terra)',
                            background: 'var(--terra-muted)',
                            padding: '1px 6px',
                            borderRadius: 'var(--radius-full)',
                          }}>
                            you
                          </span>
                        )}
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        color: isPrimary ? 'var(--brand)' : 'var(--text-3)',
                        letterSpacing: '0.06em',
                        marginTop: 2,
                      }}>
                        {roleLabel}
                      </div>
                    </div>

                    {/* Owner indicator */}
                    {isPrimary && (
                      <div style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: 'var(--brand-muted, rgba(59,110,82,0.12))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                      }}>
                        ✦
                      </div>
                    )}
                  </m.div>
                  {i < participants.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </m.div>
        )}
      </Card>

      {/* ── Invite section (owner only or anyone with link) ── */}
      <div style={{ marginTop: 'var(--space-5)' }}>
        <SectionHeader label={t('crewInviteTitle')} />
        <Card>
          {/* Email invite row */}
          <div style={{
            padding: 'var(--space-3) var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            borderBottom: '1px solid var(--border)',
          }}>
            <Icon name="user" size={18} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
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
                flex: 1,
                border: 'none',
                background: 'transparent',
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-sm)',
                color: 'var(--text)',
                outline: 'none',
                minWidth: 0,
              }}
            />
            <m.button
              onClick={handleSendInvite}
              disabled={sending || !emailValue.trim().includes('@')}
              whileTap={{ scale: 0.95 }}
              transition={spring.snap}
              aria-label={t('sendInvite')}
              style={{
                background: sending || !emailValue.trim().includes('@') ? 'var(--surface-strong)' : 'var(--terra)',
                color: sending || !emailValue.trim().includes('@') ? 'var(--text-3)' : '#fff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: '6px 14px',
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.06em',
                cursor: sending || !emailValue.trim().includes('@') ? 'not-allowed' : 'pointer',
                transition: 'background 0.18s ease, color 0.18s ease',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
                flexShrink: 0,
              }}
            >
              {sending ? '…' : t('sendInvite')}
            </m.button>
          </div>

          {/* Copy link row */}
          <m.button
            onClick={handleCopyLink}
            whileTap={{ scale: 0.98 }}
            transition={spring.snap}
            aria-label={t('copyLink')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              padding: 'var(--space-3) var(--space-4)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
              userSelect: 'none',
              textAlign: 'start',
            }}
          >
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              background: 'var(--surface-strong)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              flexShrink: 0,
            }}>
              🔗
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                color: 'var(--text)',
              }}>
                {t('crewCopyLink')}
              </div>
              <div style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-xs)',
                color: 'var(--text-3)',
                marginTop: 1,
              }}>
                {t('quickLinkLabel')}
              </div>
            </div>
            <AnimatePresence mode="wait">
              {linkCopying ? (
                <m.span
                  key="check"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={spring.snap}
                  style={{ color: 'var(--brand)', fontSize: 18 }}
                >
                  ✓
                </m.span>
              ) : (
                <m.span key="chevron" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Icon name="chevR" size={16} style={{ color: 'var(--text-3)' }} />
                </m.span>
              )}
            </AnimatePresence>
          </m.button>
        </Card>
      </div>

      {/* ── Pending invitations ── */}
      {pendingInvitations.length > 0 && (
        <div style={{ marginTop: 'var(--space-5)' }}>
          <SectionHeader label={t('crewPending')} />
          <Card>
            <m.div variants={sectionVariants} initial="hidden" animate="visible">
              {pendingInvitations.map((inv, i) => (
                <React.Fragment key={inv.id}>
                  <m.div
                    variants={listItemVariants}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      padding: 'var(--space-3) var(--space-4)',
                    }}
                  >
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'var(--surface-strong)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Icon name="user" size={18} style={{ color: 'var(--text-3)' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 600,
                        color: 'var(--text)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {inv.tripName}
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        color: 'var(--text-3)',
                        letterSpacing: '0.06em',
                        marginTop: 2,
                      }}>
                        {t('pendingLabel')}
                      </div>
                    </div>
                  </m.div>
                  {i < pendingInvitations.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </m.div>
          </Card>
        </div>
      )}

      {/* ── Bottom spacer for FAB area ── */}
      <div style={{ height: 'var(--space-8)' }} />
    </div>
  );
}
