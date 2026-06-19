import { NextRequest } from 'next/server'
import { unstable_cache } from 'next/cache'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/env'

const ALLOWED_BASES = ['USD', 'EUR', 'ILS', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'THB', 'AED', 'TRY', 'INR', 'MXN', 'SGD']

function buildCachedFetcher(base: string) {
  return unstable_cache(
    async () => {
      const res = await fetch(`https://open.er-api.com/v6/latest/${base}`, { cache: 'no-store' })
      if (!res.ok) throw new Error(`Exchange rate fetch failed: ${res.status}`)
      const data = await res.json()
      if (data.result !== 'success') throw new Error('Exchange rate API returned non-success')
      return data.rates as Record<string, number>
    },
    [`exchange-rates-${base}`],
    { revalidate: 3600 },
  )
}

// GET /api/exchange-rates?base=USD
// Server-side proxy with 1-hour Next.js cache. Eliminates direct external API
// calls from the browser on every dashboard mount.
export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(SUPABASE_URL(), SUPABASE_ANON_KEY(), {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (c) => { try { c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {} },
    },
  })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Not authenticated' }, { status: 401 })

  const base = (request.nextUrl.searchParams.get('base') ?? 'USD').toUpperCase()

  if (!ALLOWED_BASES.includes(base)) {
    return Response.json({ error: 'Unsupported base currency' }, { status: 400 })
  }

  try {
    const getCachedRates = buildCachedFetcher(base)
    const rates = await getCachedRates()
    return Response.json(rates, {
      headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' },
    })
  } catch (err: any) {
    return Response.json(
      { error: 'Exchange rate fetch failed' },
      {
        status: 502,
        headers: { 'Cache-Control': 'no-store' },
      },
    )
  }
}
