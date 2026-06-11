'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import Icon from './Icon';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div role="alert" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 12, padding: '48px 24px', textAlign: 'center',
        }}>
          <Icon name="offline" size={40} color="var(--danger)" />
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 600, color: 'var(--lg-ink)', margin: 0 }}>
            Something went wrong
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="lg-btn lg-btn-forest"
            style={{ padding: '0 20px', height: 44, fontSize: 14 }}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
