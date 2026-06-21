import type { Metadata } from 'next'
import PendingClient from './PendingClient'

export const metadata: Metadata = {
  title: 'Trippy — Access Request',
  robots: { index: false },
}

export default async function PendingPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const s = status === 'rejected' || status === 'blocked' ? status : 'pending'
  return <PendingClient status={s} />
}
