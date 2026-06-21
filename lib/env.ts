/**
 * Server-only environment variable helpers.
 * These must NEVER be imported in client components — they reference
 * secrets that must not be bundled into browser JavaScript.
 *
 * NEXT_PUBLIC_ vars are intentionally NOT used here; this file provides
 * the server-side aliases so API routes never reference client-bundled names.
 */

function require(name: string): string {
  const val = process.env[name]
  if (!val) throw new Error(`Missing required server env var: ${name}`)
  return val
}

/** Supabase project URL — server alias for NEXT_PUBLIC_SUPABASE_URL */
export const SUPABASE_URL = () =>
  process.env.SUPABASE_URL ?? require('NEXT_PUBLIC_SUPABASE_URL')

/** Supabase anon/public key — server alias for NEXT_PUBLIC_SUPABASE_ANON_KEY */
export const SUPABASE_ANON_KEY = () =>
  process.env.SUPABASE_ANON_KEY ?? require('NEXT_PUBLIC_SUPABASE_ANON_KEY')

/** Supabase service-role key — bypasses RLS, NEVER expose to clients */
export const SUPABASE_SERVICE_ROLE_KEY = () =>
  require('SUPABASE_SERVICE_ROLE_KEY')

/** Google Maps / Places / Weather API key */
export const GOOGLE_MAPS_API_KEY = () =>
  process.env.GOOGLE_MAPS_API_KEY ?? ''

/** Anthropic API key */
export const ANTHROPIC_API_KEY = () =>
  require('ANTHROPIC_API_KEY')

/** App base URL (e.g. https://trippy.app) */
export const APP_URL = () =>
  process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

/** Supabase auth user ID of the single admin (Guy). Auto-approves on sign-in. */
export const ADMIN_USER_ID = () =>
  require('ADMIN_USER_ID')

/** Email address to send new-user notification emails to */
export const ADMIN_EMAIL = () =>
  process.env.ADMIN_EMAIL ?? ''

/** Resend API key for transactional email — optional; skipped if absent */
export const RESEND_API_KEY = () =>
  process.env.RESEND_API_KEY ?? ''
