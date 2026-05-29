'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/cn';
import { blurUpVariants } from '@/lib/motion';

// ─── Card ─────────────────────────────────────────────────────────────────────

interface CardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  /** Skip entrance animation (use when already inside a stagger container) */
  noAnimate?: boolean;
}

export function Card({
  children, className, hover = false, glass = false, noAnimate = false, ...props
}: CardProps) {
  return (
    <motion.div
      variants={noAnimate ? undefined : blurUpVariants}
      initial={noAnimate ? undefined : 'hidden'}
      animate={noAnimate ? undefined : 'visible'}
      whileHover={hover ? {
        y: -3,
        boxShadow: '0 20px 48px oklch(13% 0.012 55 / 12%), 0 6px 16px oklch(13% 0.012 55 / 7%)',
        transition: { duration: 0.3, ease: [0.25, 0, 0, 1] },
      } : undefined}
      className={cn(
        // Base: directional border system (top/left specular, bottom/right shadow)
        'relative overflow-hidden rounded-2xl',
        'border-[1px] border-solid',
        // Layered shadow
        glass ? [
          'bg-[oklch(99%_0.004_80/60%)] backdrop-blur-[40px]',
          '[--sat:saturate(1.85)]',
          'border-[oklch(100%_0_0/10%)] border-t-[oklch(100%_0_0/48%)] border-l-[oklch(100%_0_0/28%)]',
          'border-b-[oklch(13%_0.012_55/6%)] border-r-[oklch(13%_0.012_55/4%)]',
          'shadow-[0_4px_16px_oklch(13%_0.012_55/8%),0_2px_6px_oklch(13%_0.012_55/5%),inset_0_1px_0_oklch(100%_0_0/60%)]',
        ] : [
          'bg-[var(--bg-warm)]',
          'border-[var(--border)] border-t-[oklch(100%_0_0/60%)] border-l-[oklch(100%_0_0/40%)]',
          'shadow-[0_2px_8px_oklch(13%_0.012_55/6%),0_1px_2px_oklch(13%_0.012_55/4%),inset_0_1px_0_oklch(100%_0_0/50%)]',
        ],
        'transition-[box-shadow,transform] duration-300',
        className
      )}
      {...props}
    >
      {/* Top-edge specular highlight */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px z-10"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, oklch(100% 0 0 / 55%) 30%, oklch(100% 0 0 / 55%) 70%, transparent 100%)',
        }}
      />
      {children}
    </motion.div>
  );
}

// ─── CardHeader / CardBody ────────────────────────────────────────────────────

export function CardHeader({
  children, className,
}: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('px-5 pt-5 pb-3', className)}>{children}</div>
  );
}

export function CardBody({
  children, className,
}: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('px-5 pb-5', className)}>{children}</div>
  );
}

// ─── CardSection (full-bleed divider inside card) ─────────────────────────────

export function CardSection({
  children, className,
}: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('px-5 py-3 border-t border-[var(--border)]', className)}>
      {children}
    </div>
  );
}
