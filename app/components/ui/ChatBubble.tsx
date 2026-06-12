'use client';

import React from 'react';
import { StampIcon } from './StampIcon';

interface ChatBubbleProps {
  text: React.ReactNode;
  stamp: string;
  side?: 'start' | 'end';
  style?: React.CSSProperties;
}

/** Onboarding chat bubble (HANDOFF A1): glass bubble anchored by a 44px stamp. */
export default function ChatBubble({ text, stamp, side = 'start', style }: ChatBubbleProps) {
  const isEnd = side === 'end';
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, flexDirection: isEnd ? 'row-reverse' : 'row', ...style }}>
      <StampIcon iconKey={stamp} size={44} aria-hidden="true" />
      <div
        className="chat-bubble"
        style={{
          borderBottomLeftRadius: isEnd ? 20 : 6,
          borderBottomRightRadius: isEnd ? 6 : 20,
          maxWidth: 260,
        }}
      >
        {text}
      </div>
    </div>
  );
}
