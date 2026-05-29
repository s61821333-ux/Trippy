import sys
sys.stdout.reconfigure(encoding='utf-8')

new_section = '''\
        {/* Clean Light Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04, duration: 0.4, ease: [0.25, 0, 0, 1] }}
          style={{ padding: 'calc(var(--page-pt) + 4px) var(--page-px) 0' }}
        >
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
            letterSpacing: '0.20em', textTransform: 'uppercase',
            color: 'var(--terra)', margin: '0 0 8px',
          }}>
            {currentTripDay !== null ? t('day').toUpperCase() + ' ' + currentTripDay : 'GOOD MORNING, CREW'}
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, gap: 12 }}>
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.2rem, 8vw, 3.2rem)',
              fontWeight: 400, fontStyle: 'italic',
              letterSpacing: '-0.02em',
              color: 'var(--text)', lineHeight: 1.05, margin: 0, flex: 1,
            }}>
              {trip.name}
            </h1>
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.12, type: 'spring', stiffness: 320, damping: 24 }}
              style={{
                width: 52, height: 52, borderRadius: 18, flexShrink: 0,
                background: 'linear-gradient(135deg, #F5C842, #E8A800)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26, boxShadow: '0 4px 14px rgba(232,168,0,0.30)',
              }}
            >
              {themeIcon}
            </motion.div>
          </div>
        </motion.div>

        {/* Countdown card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.42, ease: [0.25, 0, 0, 1] }}
          style={{ padding: '0 var(--page-px)', marginBottom: 12 }}
        >
          <div style={{
            background: 'white', borderRadius: 'var(--radius-lg)', padding: '18px 20px',
            boxShadow: '0 2px 16px rgba(26,20,16,0.07)', border: '1px solid rgba(26,20,16,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              {daysUntil !== null && daysUntil > 0 ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 3 }}>
                    <span style={{ fontSize: 38, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.05em', lineHeight: 1 }}>{daysUntil}</span>
                    <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-2)' }}>{t('days')}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0, fontWeight: 500 }}>
                    {'until you fly' + (trip.startDate && endDate ? ' · ' + fmtDate(trip.startDate, 0, locale) + ' → ' + fmtDate(trip.startDate, trip.days - 1, locale) : '')}
                  </p>
                </>
              ) : currentTripDay !== null ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 3 }}>
                    <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--terra)', letterSpacing: '-0.04em', lineHeight: 1 }}>{t('day')} {currentTripDay}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0 }}>{'of ' + trip.days + ' · on the road'}</p>
                </>
              ) : (
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-2)', margin: 0 }}>Trip complete</p>
              )}
            </div>
            <div style={{ display: 'flex' }}>
              {trip.participants.slice(0, 4).map((p, i) => (
                <div key={p.id} style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: p.color ?? STRIPE_COLORS[i % STRIPE_COLORS.length],
                  color: 'white', fontSize: 11, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2.5px solid white', marginLeft: i > 0 ? -10 : 0,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.12)', letterSpacing: '-0.02em',
                }}>
                  {p.initials}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* AI Insight card (mint) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.42, ease: [0.25, 0, 0, 1] }}
          style={{ padding: '0 var(--page-px)', marginBottom: 20 }}
          onClick={() => setScreen('day')}
        >
          <div style={{
            borderRadius: 'var(--radius-lg)', padding: '13px 16px',
            background: 'oklch(93% 0.028 158)', border: '1px solid oklch(83% 0.055 156)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 15, flexShrink: 0, color: 'var(--brand)' }}>✶</span>
            <p style={{ fontSize: 13, lineHeight: 1.55, color: 'oklch(30% 0.06 158)', fontWeight: 500, margin: 0, flex: 1 }}>
              {insights.length > 0
                ? insights[0].title + ' — ' + insights[0].description
                : trip.days + ' ' + t('days') + ' · ' + totalEvents + ' events planned.' + (daysUntil !== null && daysUntil > 0 ? ' ' + daysUntil + ' days to go.' : '')}
            </p>
            <span style={{ fontSize: 14, color: 'var(--brand)', fontWeight: 700, flexShrink: 0 }}>→</span>
          </div>
        </motion.div>

        {/* Today schedule */}
        {todayEvs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            style={{ padding: '0 var(--page-px)', marginBottom: 20 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--terra)', margin: 0 }}>
                {'TODAY · ' + t('day').toUpperCase() + ' ' + currentDisplayDay}
              </p>
              <button
                onClick={() => handleDayClick(currentDisplayDay)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, color: 'var(--brand)', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}
              >
                {'See all ' + trip.days + ' days'}
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid rgba(26,20,16,0.07)', boxShadow: '0 2px 12px rgba(26,20,16,0.05)' }}>
              {todayEvs.slice(0, 4).map((ev, i) => (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.18 + i * 0.05 }}
                  onClick={() => handleDayClick(currentDisplayDay)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'white', borderBottom: i < Math.min(todayEvs.length, 4) - 1 ? '1px solid rgba(26,20,16,0.06)' : 'none', cursor: 'pointer' }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.02em', flexShrink: 0, width: 42 }}>{ev.time}</span>
                  <div style={{ width: 38, height: 38, borderRadius: 13, flexShrink: 0, background: CAT_META[ev.category].bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                    {CAT_META[ev.category].icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: '0 0 1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t(ev.name)}</p>
                    {ev.location && <p style={{ fontSize: 11, color: 'var(--text-3)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{'📍 ' + ev.location}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
'''

with open('app/components/screens/DashboardScreen.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Replace lines 393 through 656 (0-indexed, inclusive)
new_lines = lines[:393] + [new_section] + lines[657:]

with open('app/components/screens/DashboardScreen.tsx', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print('Done. Total lines:', len(new_lines))
