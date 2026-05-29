'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

// ─── Variants ────────────────────────────────────────────────────────────────

const buttonVariants = cva(
  [
    // Base — morphic foundation
    'relative inline-flex items-center justify-center gap-2',
    'select-none cursor-pointer',
    'font-medium tracking-tight leading-none',
    'rounded-full border-0 outline-none',
    'transition-[box-shadow,background,color,opacity] duration-150',
    'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--brand)]',
    'disabled:pointer-events-none disabled:opacity-40',
    'overflow-hidden',
  ].join(' '),
  {
    variants: {
      variant: {
        // ── Primary: brand green fill with living inner specular ──
        primary: [
          'bg-[var(--brand)] text-[var(--text-inv)]',
          'shadow-[var(--shadow-sm),inset_0_1px_0_oklch(100%_0_0/18%),inset_0_-1px_0_oklch(0%_0_0/12%)]',
          'hover:bg-[var(--brand-hover)]',
          'hover:shadow-[var(--shadow-md),inset_0_1px_0_oklch(100%_0_0/22%)]',
        ],
        // ── Accent: terracotta — high-intent CTA ──
        accent: [
          'bg-[var(--terra)] text-[var(--text-inv)]',
          'shadow-[var(--shadow-sm),inset_0_1px_0_oklch(100%_0_0/18%),inset_0_-1px_0_oklch(0%_0_0/10%)]',
          'hover:bg-[var(--terra-hover)]',
          'hover:shadow-[var(--shadow-md),inset_0_1px_0_oklch(100%_0_0/22%)]',
        ],
        // ── Secondary: glass surface ──
        secondary: [
          'bg-[var(--surface)] text-[var(--text)]',
          'shadow-[var(--shadow-sm),inset_0_1px_0_oklch(100%_0_0/60%),inset_0_0_0_1px_oklch(13%_0.012_55/8%)]',
          'backdrop-blur-sm',
          'hover:bg-[var(--bg-warm)]',
          'hover:shadow-[var(--shadow-md),inset_0_1px_0_oklch(100%_0_0/72%)]',
        ],
        // ── Ghost: minimal, transparent ──
        ghost: [
          'bg-transparent text-[var(--text-2)]',
          'hover:bg-[oklch(13%_0.012_55/6%)] hover:text-[var(--text)]',
        ],
        // ── Danger ──
        danger: [
          'bg-[var(--danger-bg)] text-[var(--danger)]',
          'shadow-[inset_0_0_0_1px_oklch(48%_0.130_25/18%)]',
          'hover:bg-[oklch(48%_0.130_25/18%)]',
        ],
      },
      size: {
        sm:   'h-9  px-4   text-sm  gap-1.5',
        md:   'h-11 px-5   text-sm',
        lg:   'h-13 px-7   text-base gap-2.5',
        icon: 'h-11 w-11  p-0',
        'icon-sm': 'h-9 w-9 p-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

// ─── Types ───────────────────────────────────────────────────────────────────

interface ButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'children'>,
    VariantProps<typeof buttonVariants> {
  children?: React.ReactNode;
  loading?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Button({
  className, variant, size, loading, children, disabled, ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 0.8 }}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={loading ?? disabled}
      style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
      {...props}
    >
      {/* Specular sweep on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, oklch(100% 0 0 / 14%) 50%, transparent 60%)',
          backgroundSize: '200% 100%',
          backgroundPosition: '200% 0',
          transition: 'background-position 0.55s ease',
        }}
      />
      {loading && (
        <span
          className="absolute inset-0 flex items-center justify-center"
          aria-label="Loading"
        >
          <span
            className="h-4 w-4 rounded-full border-2 border-current border-t-transparent"
            style={{ animation: 'spin 0.8s linear infinite' }}
          />
        </span>
      )}
      <span
        className="relative z-10 inline-flex items-center gap-[inherit]"
        style={{ opacity: loading ? 0 : 1 }}
      >
        {children}
      </span>
    </motion.button>
  );
}

export { buttonVariants };
