# Next.js Full App Redesign — Agent Instructions (2027-Ready)

> **For the AI Agent:** Execute every phase in order. Do not skip steps. Do not ask for confirmation between sub-tasks unless a decision is blocking. Write all code directly to disk. Run terminal commands and show output before proceeding.

---

## 0. Pre-Flight: Environment Setup

```bash
# Verify tools are available
node -v        # must be >=18
npx -v
git status     # confirm clean working tree before starting

# Install required packages
npm install framer-motion @radix-ui/react-* class-variance-authority clsx tailwind-merge
npm install -D @tailwindcss/typography prettier prettier-plugin-tailwindcss
npx shadcn@latest init   # choose: TypeScript, app router, CSS variables: YES
```

**Agent must confirm:** all installs exit 0 before continuing.

---

## Phase 1: AUDIT — Map the Entire App

### 1.1 — File Tree Scan
```bash
# Run in project root
find . -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.css" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.next/*" \
  | sort > /tmp/app-file-tree.txt

cat /tmp/app-file-tree.txt
```

### 1.2 — Component Inventory
```bash
# Count and list all components
find ./components -name "*.tsx" | wc -l
find ./app -name "page.tsx" | xargs grep -l "export default"
```

### 1.3 — Design Debt Detection
```bash
# Find hardcoded colors (2020-era pattern)
grep -rn "bg-gray\|text-gray\|border-gray\|#[0-9a-fA-F]\{3,6\}" \
  --include="*.tsx" --include="*.css" . \
  ! -path "*/node_modules/*" > /tmp/hardcoded-colors.txt

# Find hardcoded shadows (flat design remnants)
grep -rn "shadow-md\|shadow-lg\|shadow-sm\|box-shadow" \
  --include="*.tsx" --include="*.css" . \
  ! -path "*/node_modules/*" > /tmp/old-shadows.txt

# Find non-variable fonts
grep -rn "font-sans\|font-mono\|Arial\|Roboto\|Inter" \
  --include="*.tsx" --include="*.css" . \
  ! -path "*/node_modules/*" > /tmp/old-fonts.txt

echo "=== Audit Summary ==="
wc -l /tmp/hardcoded-colors.txt /tmp/old-shadows.txt /tmp/old-fonts.txt
```

### 1.4 — Screenshot Every Page (Visual Baseline)
```bash
npm install -D playwright @playwright/test
npx playwright install chromium

# Create screenshot script
cat > /tmp/screenshot-all.js << 'EOF'
const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  // Start dev server first: npm run dev
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  const routes = [
    '/',
    // Agent: add all routes found in app/ directory here
  ];

  fs.mkdirSync('./screenshots/before', { recursive: true });

  for (const route of routes) {
    await page.goto(`http://localhost:3000${route}`);
    await page.waitForLoadState('networkidle');
    const name = route.replace(/\//g, '_') || 'home';
    await page.screenshot({ path: `./screenshots/before/${name}.png`, fullPage: true });
    console.log(`✓ Captured: ${route}`);
  }

  await browser.close();
})();
EOF

# Run dev server in background, then screenshot
npm run dev &
sleep 5
node /tmp/screenshot-all.js
```

> **Agent:** Store screenshot paths. You will use them for before/after comparison at Phase 5.

---

## Phase 2: DESIGN SYSTEM — Build the Token Foundation

### 2.1 — Create Central Token File

Create `/tokens/design-system.ts`:

```typescript
// tokens/design-system.ts
// THE SINGLE SOURCE OF TRUTH — all components must consume from here

export const tokens = {
  // ─── COLORS ──────────────────────────────────────────────
  colors: {
    // Primary brand (choose ONE dominant color, sharp accent)
    brand: {
      50:  'oklch(97% 0.02 265)',
      100: 'oklch(93% 0.05 265)',
      500: 'oklch(55% 0.22 265)',
      600: 'oklch(48% 0.22 265)',
      900: 'oklch(20% 0.10 265)',
    },
    accent: 'oklch(75% 0.30 35)',   // sharp warm accent
    surface: {
      base:    'oklch(98% 0.005 265)',
      raised:  'oklch(96% 0.008 265)',
      overlay: 'oklch(94% 0.010 265)',
    },
    text: {
      primary:   'oklch(15% 0.01 265)',
      secondary: 'oklch(45% 0.01 265)',
      muted:     'oklch(65% 0.01 265)',
    },
    border: {
      subtle: 'oklch(90% 0.005 265)',
      strong: 'oklch(75% 0.010 265)',
    },
  },

  // ─── TYPOGRAPHY ──────────────────────────────────────────
  // Use variable fonts from Google Fonts or Fontsource
  typography: {
    display: '"Instrument Serif", "Playfair Display Variable", Georgia, serif',
    body:    '"DM Sans Variable", "Outfit Variable", sans-serif',
    mono:    '"JetBrains Mono Variable", "Fira Code", monospace',
    sizes: {
      xs:   'clamp(0.70rem, 1vw,   0.75rem)',
      sm:   'clamp(0.85rem, 1.2vw, 0.875rem)',
      base: 'clamp(1rem,   1.5vw, 1.0625rem)',
      lg:   'clamp(1.1rem, 2vw,   1.25rem)',
      xl:   'clamp(1.3rem, 2.5vw, 1.5rem)',
      '2xl':'clamp(1.6rem, 3vw,   2rem)',
      '3xl':'clamp(2rem,   4vw,   3rem)',
      '4xl':'clamp(2.5rem, 5vw,   4rem)',
    },
    leading: {
      tight:  '1.1',
      normal: '1.5',
      loose:  '1.8',
    },
    tracking: {
      tight:  '-0.04em',
      normal: '-0.01em',
      wide:   '0.06em',
      wider:  '0.12em',
    },
  },

  // ─── SPACING ─────────────────────────────────────────────
  // Optical spacing — not uniform grid
  spacing: {
    '3xs': '0.125rem',
    '2xs': '0.25rem',
    xs:    '0.5rem',
    sm:    '0.75rem',
    md:    '1rem',
    lg:    '1.5rem',
    xl:    '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '6rem',
    '5xl': '8rem',
  },

  // ─── DEPTH / SHADOWS ─────────────────────────────────────
  // 2027: layered depth, not flat hard shadows
  shadows: {
    sm:  '0 1px 2px oklch(0% 0 0 / 4%), 0 1px 4px oklch(0% 0 0 / 3%)',
    md:  '0 4px 6px oklch(0% 0 0 / 4%), 0 8px 24px oklch(0% 0 0 / 6%)',
    lg:  '0 8px 16px oklch(0% 0 0 / 5%), 0 24px 48px oklch(0% 0 0 / 8%)',
    xl:  '0 16px 32px oklch(0% 0 0 / 6%), 0 48px 80px oklch(0% 0 0 / 10%)',
    glow: '0 0 0 1px var(--brand-500-30), 0 0 24px var(--brand-500-20)',
    inner: 'inset 0 1px 0 oklch(100% 0 0 / 8%), inset 0 -1px 0 oklch(0% 0 0 / 6%)',
  },

  // ─── BORDER RADIUS ───────────────────────────────────────
  radius: {
    sm:   '0.375rem',
    md:   '0.625rem',
    lg:   '1rem',
    xl:   '1.5rem',
    '2xl':'2rem',
    full: '9999px',
  },

  // ─── MOTION ──────────────────────────────────────────────
  // 2027: physics-based, intentional, never decorative
  motion: {
    duration: {
      instant: '80ms',
      fast:    '150ms',
      normal:  '250ms',
      slow:    '400ms',
      enter:   '500ms',
    },
    easing: {
      snap:    'cubic-bezier(0.25, 0, 0, 1)',
      spring:  'cubic-bezier(0.34, 1.56, 0.64, 1)',
      smooth:  'cubic-bezier(0.4, 0, 0.2, 1)',
      exit:    'cubic-bezier(0.4, 0, 1, 1)',
    },
    // Framer Motion variants (import and use in components)
    variants: {
      fadeUp: {
        hidden:  { opacity: 0, y: 20, filter: 'blur(4px)' },
        visible: { opacity: 1, y: 0,  filter: 'blur(0px)',
          transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }
        },
      },
      stagger: {
        visible: { transition: { staggerChildren: 0.07 } },
      },
    },
  },

  // ─── BLUR / GLASS ────────────────────────────────────────
  blur: {
    sm:   'blur(4px)',
    md:   'blur(12px)',
    lg:   'blur(24px)',
    xl:   'blur(48px)',
  },
} as const;
```

### 2.2 — Inject Tokens into Tailwind

```typescript
// tailwind.config.ts — REPLACE existing config entirely
import type { Config } from 'tailwindcss'
import { tokens } from './tokens/design-system'

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand:   tokens.colors.brand,
        accent:  { DEFAULT: tokens.colors.accent },
        surface: tokens.colors.surface,
      },
      fontFamily: {
        display: [tokens.typography.display],
        body:    [tokens.typography.body],
        mono:    [tokens.typography.mono],
      },
      borderRadius: tokens.radius,
      boxShadow:    tokens.shadows,
      transitionTimingFunction: tokens.motion.easing,
      transitionDuration: tokens.motion.duration,
    },
  },
  plugins: [require('@tailwindcss/typography')],
} satisfies Config
```

### 2.3 — CSS Variables in globals.css

```css
/* app/globals.css — replace existing */
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,300..700&family=JetBrains+Mono:wght@400;500&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --brand-500: 55% 0.22 265;
    --brand-500-20: oklch(55% 0.22 265 / 20%);
    --brand-500-30: oklch(55% 0.22 265 / 30%);
    --accent:    75% 0.30 35;
    --radius:    0.625rem;
    
    /* Smooth scrolling */
    scroll-behavior: smooth;
    
    /* Better font rendering */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
  }

  /* Dark mode automatic */
  @media (prefers-color-scheme: dark) {
    :root { color-scheme: dark; }
  }

  * {
    border-color: oklch(var(--brand-500) / 10%);
  }

  body {
    font-family: var(--font-body), sans-serif;
    background: oklch(98% 0.005 265);
    color: oklch(15% 0.01 265);
  }
}

/* Grain texture overlay — 2027 essential */
@layer utilities {
  .grain::before {
    content: '';
    position: fixed;
    inset: -200%;
    width: 400%;
    height: 400%;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
    opacity: 0.025;
    pointer-events: none;
    z-index: 9999;
    animation: grain 0.5s steps(1) infinite;
  }

  @keyframes grain {
    0%, 100% { transform: translate(0, 0); }
    10%       { transform: translate(-2%, -3%); }
    20%       { transform: translate(3%, 2%); }
    30%       { transform: translate(-1%, 4%); }
    40%       { transform: translate(4%, -1%); }
    50%       { transform: translate(-3%, 3%); }
    60%       { transform: translate(2%, -4%); }
    70%       { transform: translate(-4%, 1%); }
    80%       { transform: translate(1%, -2%); }
    90%       { transform: translate(-2%, 4%); }
  }
}
```

---

## Phase 3: COMPONENT REBUILD — Core UI Primitives

> **Agent:** Rebuild each component from scratch. Do NOT wrap old components. Write to `components/ui/`.

### 3.1 — Button Component

```bash
cat > components/ui/button.tsx << 'EOF'
'use client'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    'relative inline-flex items-center justify-center gap-2',
    'font-body font-medium tracking-tight',
    'rounded-md transition-all duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
    'disabled:pointer-events-none disabled:opacity-40',
    'select-none',
  ].join(' '),
  {
    variants: {
      variant: {
        primary: [
          'bg-brand-500 text-white',
          'shadow-[0_1px_0_oklch(0%_0_0/20%)_inset,0_-1px_0_oklch(0%_0_0/10%)_inset]',
          'hover:bg-brand-600 active:scale-[0.98]',
        ],
        secondary: [
          'bg-surface-raised border border-surface-overlay',
          'text-text-primary shadow-sm',
          'hover:bg-surface-overlay active:scale-[0.98]',
        ],
        ghost: [
          'text-text-secondary hover:text-text-primary',
          'hover:bg-surface-raised active:scale-[0.98]',
        ],
        destructive: [
          'bg-red-500 text-white hover:bg-red-600 active:scale-[0.98]',
        ],
      },
      size: {
        sm:   'h-8  px-3   text-sm',
        md:   'h-10 px-4   text-sm',
        lg:   'h-12 px-6   text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
)

interface ButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'children'>,
    VariantProps<typeof buttonVariants> {
  children?: React.ReactNode
  loading?: boolean
}

export function Button({ className, variant, size, loading, children, ...props }: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={loading}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </motion.button>
  )
}
EOF
```

### 3.2 — Card Component (Layered Depth)

```bash
cat > components/ui/card.tsx << 'EOF'
'use client'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glass?: boolean
}

export function Card({ children, className, hover = false, glass = false }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0, 0, 1] }}
      whileHover={hover ? { y: -2, boxShadow: '0 16px 40px oklch(0% 0 0 / 10%)' } : undefined}
      className={cn(
        'rounded-xl border border-surface-overlay',
        glass
          ? 'bg-white/60 backdrop-blur-md'
          : 'bg-surface-raised',
        'shadow-md',
        'transition-shadow duration-300',
        className
      )}
    >
      {children}
    </motion.div>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-6 pt-6 pb-4', className)}>{children}</div>
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-6 pb-6', className)}>{children}</div>
}
EOF
```

### 3.3 — Input Component

```bash
cat > components/ui/input.tsx << 'EOF'
'use client'
import { forwardRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?:  string
  error?: string
  icon?:  React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, icon, className, ...props }, ref) => {
    const [focused, setFocused] = useState(false)

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-text-secondary tracking-tight">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={cn(
              'w-full rounded-lg border bg-surface-raised px-3.5 py-2.5',
              'text-sm text-text-primary placeholder:text-text-muted',
              'transition-all duration-150 outline-none',
              focused
                ? 'border-brand-500 shadow-[0_0_0_3px_oklch(var(--brand-500)/12%)]'
                : 'border-border-subtle hover:border-border-strong',
              error && 'border-red-400 focus:shadow-[0_0_0_3px_oklch(50%_0.20_25/15%)]',
              icon && 'pl-10',
              className
            )}
            {...props}
          />
        </div>
        {(hint || error) && (
          <p className={cn('text-xs', error ? 'text-red-500' : 'text-text-muted')}>
            {error ?? hint}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'
EOF
```

### 3.4 — Page Transition Wrapper

```bash
cat > components/ui/page-transition.tsx << 'EOF'
'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0,  filter: 'blur(0px)' }}
        exit={{    opacity: 0, y: -8, filter: 'blur(4px)' }}
        transition={{ duration: 0.35, ease: [0.25, 0, 0, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
EOF
```

---

## Phase 4: LAYOUT REDESIGN

### 4.1 — Root Layout

```bash
cat > app/layout.tsx << 'EOF'
import type { Metadata } from 'next'
import { PageTransition } from '@/components/ui/page-transition'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'App', template: '%s | App' },
  description: '',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <body className="grain min-h-dvh bg-surface-base font-body antialiased">
        <PageTransition>
          {children}
        </PageTransition>
      </body>
    </html>
  )
}
EOF
```

### 4.2 — Navigation (Floating, Blur)

```bash
cat > components/layout/navbar.tsx << 'EOF'
'use client'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 20))

  return (
    <motion.header
      className="fixed top-0 inset-x-0 z-50 flex justify-center px-4 pt-3"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0,   opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0, 0, 1] }}
    >
      <nav
        className={[
          'flex items-center gap-6 px-5 py-2.5 rounded-2xl',
          'transition-all duration-300',
          scrolled
            ? 'bg-white/80 backdrop-blur-xl shadow-lg border border-surface-overlay'
            : 'bg-transparent',
        ].join(' ')}
      >
        <Link href="/" className="font-display text-lg font-semibold tracking-tight">
          Logo
        </Link>
        {/* Agent: add nav items here based on app routes */}
      </nav>
    </motion.header>
  )
}
EOF
```

---

## Phase 5: PAGE-BY-PAGE EXECUTION

### 5.1 — Agent Workflow Per Page

For **each page** found in Phase 1:

```
1. Read current page file
2. Identify: layout structure, data fetching, interactive states
3. Rewrite using:
   - tokens from design-system.ts
   - components from components/ui/
   - Framer Motion for all enter animations
   - staggered children (staggerChildren: 0.06)
   - no hardcoded colors or shadows
4. Run: npx tsc --noEmit   ← must pass before moving on
5. Take new screenshot
6. Compare before/after
```

### 5.2 — Animation Pattern for Every Page

```typescript
// Use this pattern on EVERY page section
import { motion } from 'framer-motion'

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
}

const item = {
  hidden:  { opacity: 0, y: 16, filter: 'blur(3px)' },
  visible: { opacity: 1, y: 0,  filter: 'blur(0px)',
    transition: { duration: 0.45, ease: [0.25, 0, 0, 1] }
  },
}

// In JSX:
<motion.section variants={container} initial="hidden" animate="visible">
  <motion.h1 variants={item}>...</motion.h1>
  <motion.p  variants={item}>...</motion.p>
  <motion.div variants={item}>...</motion.div>
</motion.section>
```

---

## Phase 6: EXTERNAL TOOLING (v0.dev + Claude API)

### 6.1 — v0.dev Integration (Vercel AI)

```bash
# Use v0.dev for complex UI sections you want to prototype fast
# Prompt template to use on v0.dev:

PROMPT:
"""
Build a [component name] for a Next.js 14 App Router app.
Style: 2027-era, fluid motion, layered depth, not flat.
Use: Tailwind CSS, Framer Motion, shadcn/ui.
Dark mode support. RTL support (dir="rtl").
Tokens: brand-500 oklch(55% 0.22 265), accent oklch(75% 0.30 35).
Font: DM Sans for body, Instrument Serif for display.
No Inter. No purple gradients. No hard box-shadows.
Add: entrance animation (fadeUp + blur), hover states.
"""

# After generating on v0.dev:
npx shadcn@latest add [component-url-from-v0]
```

### 6.2 — Claude API Batch Redesign Script

```bash
# Install Anthropic SDK
npm install @anthropic-ai/sdk

# Create batch redesign script
cat > scripts/redesign-component.mjs << 'EOF'
import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function redesignComponent(filePath) {
  const source = fs.readFileSync(filePath, 'utf-8')

  const message = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: `
You are a senior UI engineer redesigning a Next.js app to 2027 standards.

DESIGN RULES (non-negotiable):
- Use oklch() for all colors
- Tokens: brand oklch(55% 0.22 265), accent oklch(75% 0.30 35)
- Fonts: "DM Sans Variable" body, "Instrument Serif" display
- Framer Motion for ALL enter animations (fadeUp + blur pattern)
- Layered shadows (no flat box-shadow-md)
- No hardcoded colors
- No Inter, Roboto, Arial
- No purple gradients
- RTL support (Hebrew app)
- shadcn/ui base components

COMPONENT TO REDESIGN:
\`\`\`tsx
${source}
\`\`\`

Return ONLY the complete rewritten TSX file. No explanation. No markdown fences.
      `.trim(),
    }],
  })

  const redesigned = message.content[0].text
  const outPath = filePath.replace('/components/', '/components/redesigned/')
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, redesigned)
  console.log(`✓ Redesigned: ${filePath} → ${outPath}`)
}

// Run on all components
const files = process.argv.slice(2)
for (const file of files) {
  await redesignComponent(file)
  await new Promise(r => setTimeout(r, 1000)) // rate limit
}
EOF

# Execute on all components:
find ./components -name "*.tsx" | xargs node scripts/redesign-component.mjs
```

### 6.3 — Automated Screenshot Diff

```bash
npm install -D pixelmatch pngjs

cat > scripts/compare-screenshots.mjs << 'EOF'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'
import fs from 'fs'

const before = PNG.sync.read(fs.readFileSync(process.argv[2]))
const after  = PNG.sync.read(fs.readFileSync(process.argv[3]))
const { width, height } = before
const diff = new PNG({ width, height })

const changed = pixelmatch(before.data, after.data, diff.data, width, height, { threshold: 0.1 })
const percent  = ((changed / (width * height)) * 100).toFixed(1)

fs.writeFileSync('diff.png', PNG.sync.write(diff))
console.log(`Changed pixels: ${percent}%`)
if (parseFloat(percent) < 30) console.warn('⚠ Low change — check if redesign was applied')
EOF
```

---

## Phase 7: QUALITY GATES

Run these checks before marking any component done:

```bash
# TypeScript — zero errors
npx tsc --noEmit

# Lint
npx eslint . --ext .ts,.tsx --max-warnings 0

# Visual regression (before vs after)
node scripts/compare-screenshots.mjs screenshots/before/home.png screenshots/after/home.png

# Bundle size check
npx @next/bundle-analyzer  # should not increase >15% from original

# Accessibility
npx axe-cli http://localhost:3000 --include main

# Performance
npx lighthouse http://localhost:3000 --only-categories=performance --output json \
  | jq '.categories.performance.score'  # must be >= 0.85
```

---

## Phase 8: FINAL CLEANUP

```bash
# Remove all old component backups
rm -rf components/redesigned/

# Remove audit temp files
rm /tmp/hardcoded-colors.txt /tmp/old-shadows.txt /tmp/old-fonts.txt /tmp/app-file-tree.txt

# Format everything
npx prettier --write .

# Final build test
npm run build   # must exit 0

# Take final screenshots
node /tmp/screenshot-all.js  # saves to screenshots/after/
```

---

## Checklist for Agent Sign-Off

- [ ] Zero TypeScript errors
- [ ] Zero hardcoded colors remaining (verify with grep)
- [ ] All components use design-system.ts tokens
- [ ] All pages have Framer Motion entrance animations
- [ ] Navbar uses scroll-aware blur
- [ ] Page transitions work (AnimatePresence)
- [ ] Dark mode functional
- [ ] RTL layout intact
- [ ] Build passes: `npm run build`
- [ ] Lighthouse performance ≥ 85
- [ ] Before/after screenshots show visible improvement

---

## Reference: 2027 Design Checklist

| Element | ❌ 2020 | ✅ 2027 |
|---|---|---|
| Colors | hex / rgb | oklch() |
| Shadows | shadow-lg | layered multi-shadow |
| Fonts | Inter / Roboto | Variable fonts |
| Motion | none / CSS only | Framer Motion physics |
| Backgrounds | solid color | gradient mesh + grain |
| Cards | flat border | blur glass or depth |
| Buttons | flat / filled | morphic + state-aware |
| Layout | uniform grid | optical / asymmetric |
| Nav | static top bar | floating + scroll-blur |
| Transitions | none | AnimatePresence blur |
| Dark mode | classes manual | system-aware oklch |