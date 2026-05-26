'use client';

import { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { spring } from '@/lib/motion';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { useToast } from '../../ui/Toast';
import { dbGetTripEmailInvitations, dbCancelInvitation } from '@/lib/db';

interface PendingEmail {
  id: string;
  email: string;
  status: string;
  created_at?: string;
}

export default function CrewScreen() {
  const { trip, tripDbId, authUser, inviteToTrip, createInviteLink, leaveTrip, deleteTrip } = useAppStore();
  const { t } = useI18n();
  const { show } = useToast();

  const [inviteEmail, setInviteEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [pendingEmails, setPendingEmails] = useState<PendingEmail[]>([]);
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const MAX_INVITES = 4;

  const isOwner = trip?.createdBy && authUser?.id
    ? trip.createdBy === authUser.id
    : false;

  useEffect(() => {
    if (!tripDbId) return;
    dbGetTripEmailInvitations(tripDbId)
      .then(rows => setPendingEmails(rows.filter(r => r.status === 'pending')))
      .catch(() => {});
  }, [tripDbId]);

  async function handleSend() {
    const email = inviteEmail.trim();
    if (!email || !email.includes('@')) { show('Enter a valid email'); return; }
    if (pendingEmails.length >= MAX_INVITES) { show(t('inviteLimitReached')); return; }
    setSending(true);
    try {
      await inviteToTrip(email);
      show(t('inviteSent'));
      setInviteEmail('');
      if (tripDbId) {
        const rows = await dbGetTripEmailInvitations(tripDbId);
        setPendingEmails(rows.filter(r => r.status === 'pending'));
      }
    } catch {
      show(t('inviteFailed'));
    } finally {
      setSending(false);
    }
  }

  async function handleCopyLink() {
    try {
      const link = await createInviteLink();
      await navigator.clipboard.writeText(link);
      setCopySuccess(true);
      show(t('linkCopied'));
      setTimeout(() => setCopySuccess(false), 2500);
    } catch {
      show(t('noLink'));
    }
  }

  async function handleCancel(id: string) {
    try {
      await dbCancelInvitation(id);
      setPendingEmails(p => p.filter(r => r.id !== id));
      setCancelConfirmId(null);
    } catch {
      show('Could not cancel invitation');
    }
  }

  if (!trip) return null;

  const participants = trip.participants ?? [];

  return (
    <div style={{
      flex: 1, overflowY: 'auto', padding: '0 var(--page-px)',
      paddingBottom: 'calc(var(--nav-h) + var(--space-4))',
    }}>
      {/* Header */}
      <div style={{ padding: 'var(--space-4) 0 var(--space-4)' }}>
        <h1 style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--text-xl)',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          color: 'var(--text)',
          marginBottom: 4,
        }}>
          {t('crewTitle')}
        </h1>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
          {participants.length} {participants.length === 1 ? t('onePerson') : t('people')}
        </p>
      </div>

      {/* Members list */}
      <section style={{ marginBottom: 'var(--space-6)' }}>
        <h2 style={sectionHeadStyle}>{t('crewMembers')}</h2>
        <div style={{
          background: 'var(--surface)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-3)',
          overflow: 'hidden',
        }}>
          {participants.length === 0 ? (
            <p style={{ padding: 'var(--space-4)', color: 'var(--text-3)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)' }}>
              {t('crewNoMembers')}
            </p>
          ) : (
            participants.map((p, i) => {
              const isMe = p.name === useAppStore.getState().nickname;
              const isCreator = trip.createdBy && authUser?.id && trip.createdBy === authUser.id && isMe;
              return (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: 'var(--space-3) var(--space-4)',
                  borderBottom: i < participants.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: p.color || 'var(--terra-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 700, fontSize: 14,
                    color: 'var(--text-inv)',
                    flexShrink: 0,
                  }}>
                    {p.initials}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{
                      fontFamily: 'var(--font-sans)', fontWeight: 600,
                      fontSize: 'var(--text-sm)', color: 'var(--text)',
                    }}>
                      {p.name}{isMe ? ' (you)' : ''}
                    </span>
                    <div style={{
                      marginTop: 2,
                      fontFamily: 'var(--font-mono)', fontSize: 10,
                      letterSpacing: '0.08em',
                      color: isCreator ? 'var(--terra)' : 'var(--text-3)',
                      textTransform: 'uppercase',
                    }}>
                      {isCreator ? t('crewOwnerLabel') : t('crewMemberLabel')}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Invite section */}
      <section style={{ marginBottom: 'var(--space-6)' }}>
        <h2 style={sectionHeadStyle}>{t('crewInviteTitle')}</h2>

        {/* Email invite */}
        <div style={{
          background: 'var(--surface)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-3)',
          padding: 'var(--space-4)',
          marginBottom: 'var(--space-3)',
        }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)', marginBottom: 'var(--space-2)' }}>
            {t('crewInviteByEmail')}
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="email"
              placeholder={t('inviteEmailPlaceholder')}
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              disabled={pendingEmails.length >= MAX_INVITES}
              dir="auto"
              style={{
                flex: 1,
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-2)',
                padding: '9px 12px',
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-sm)',
                color: 'var(--text)',
                outline: 'none',
              }}
            />
            <m.button
              onClick={handleSend}
              disabled={sending || !inviteEmail.trim() || pendingEmails.length >= MAX_INVITES}
              whileTap={{ scale: 0.93 }}
              transition={spring.snap}
              style={{
                padding: '9px 16px',
                background: 'var(--terra)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-2)',
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                fontSize: 'var(--text-sm)',
                cursor: sending ? 'not-allowed' : 'pointer',
                opacity: sending ? 0.6 : 1,
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
                whiteSpace: 'nowrap',
              }}
            >
              {sending ? '…' : t('sendInvite')}
            </m.button>
          </div>

          {/* Pending invitations */}
          <AnimatePresence>
            {pendingEmails.length > 0 && (
              <m.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ marginTop: 'var(--space-3)', overflow: 'hidden' }}
              >
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', color: 'var(--text-3)', marginBottom: 6, textTransform: 'uppercase' }}>
                  {t('crewPending')} ({pendingEmails.length}/{MAX_INVITES})
                </p>
                {pendingEmails.map(row => (
                  <div key={row.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '6px 0',
                    borderBottom: '1px solid var(--border)',
                  }}>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-2)' }}>
                      {row.email}
                    </span>
                    {cancelConfirmId === row.id ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => handleCancel(row.id)} style={dangerBtnStyle}>
                          Confirm
                        </button>
                        <button onClick={() => setCancelConfirmId(null)} style={ghostBtnStyle}>
                          Keep
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setCancelConfirmId(row.id)} style={ghostBtnStyle}>
                        {t('cancelInvite')}
                      </button>
                    )}
                  </div>
                ))}
              </m.div>
            )}
          </AnimatePresence>
        </div>

        {/* Copy link */}
        <m.button
          onClick={handleCopyLink}
          whileTap={{ scale: 0.97 }}
          transition={spring.snap}
          style={{
            width: '100%',
            padding: 'var(--space-3) var(--space-4)',
            background: 'var(--surface)',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            border: `1px solid ${copySuccess ? 'var(--success)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-3)',
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
            fontSize: 'var(--text-sm)',
            color: copySuccess ? 'var(--success)' : 'var(--text)',
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'color 0.2s, border-color 0.2s',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
          }}
        >
          {copySuccess ? t('linkCopied') : t('crewCopyLink')}
        </m.button>
      </section>

      {/* Danger zone */}
      <section style={{ marginBottom: 'var(--space-8)' }}>
        <h2 style={{ ...sectionHeadStyle, color: 'var(--danger)' }}>Danger Zone</h2>
        <div style={{
          background: 'var(--danger-bg)',
          border: '1px solid var(--danger)',
          borderRadius: 'var(--radius-3)',
          padding: 'var(--space-4)',
          display: 'flex', flexDirection: 'column', gap: 'var(--space-3)',
        }}>
          <m.button
            onClick={async () => {
              if (!window.confirm('Leave this trip? You can rejoin with an invite link.')) return;
              await leaveTrip();
            }}
            whileTap={{ scale: 0.97 }}
            transition={spring.snap}
            style={dangerBtnFullStyle}
          >
            {t('leaveTrip')}
          </m.button>

          {isOwner && (
            <m.button
              onClick={async () => {
                if (!window.confirm('Delete this trip permanently? All data will be lost.')) return;
                await deleteTrip();
              }}
              whileTap={{ scale: 0.97 }}
              transition={spring.snap}
              style={{ ...dangerBtnFullStyle, background: 'var(--danger)' }}
            >
              Delete Trip
            </m.button>
          )}
        </div>
      </section>
    </div>
  );
}

const sectionHeadStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.10em',
  textTransform: 'uppercase',
  color: 'var(--text-3)',
  marginBottom: 'var(--space-2)',
};

const ghostBtnStyle: React.CSSProperties = {
  padding: '4px 8px',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-1)',
  background: 'transparent',
  fontFamily: 'var(--font-sans)',
  fontSize: 12,
  color: 'var(--text-2)',
  cursor: 'pointer',
};

const dangerBtnStyle: React.CSSProperties = {
  padding: '4px 8px',
  border: '1px solid var(--danger)',
  borderRadius: 'var(--radius-1)',
  background: 'transparent',
  fontFamily: 'var(--font-sans)',
  fontSize: 12,
  color: 'var(--danger)',
  cursor: 'pointer',
};

const dangerBtnFullStyle: React.CSSProperties = {
  width: '100%',
  padding: 'var(--space-3)',
  background: 'transparent',
  border: '1px solid var(--danger)',
  borderRadius: 'var(--radius-2)',
  fontFamily: 'var(--font-sans)',
  fontWeight: 600,
  fontSize: 'var(--text-sm)',
  color: 'var(--danger)',
  cursor: 'pointer',
  textAlign: 'center',
  WebkitTapHighlightColor: 'transparent',
  touchAction: 'manipulation',
};
