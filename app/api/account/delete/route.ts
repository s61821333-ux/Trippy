import { NextResponse } from 'next/server'

// DELETE /api/account/delete - DEPRECATED
// Account deletion now requires a 2-step confirmation flow (SEC-4):
//   1. POST /api/account/delete/request  - sends confirmation email
//   2. POST /api/account/delete/confirm  - user clicks email link to confirm
//   3. POST /api/account/delete/cancel   - user can cancel within 24h
export async function DELETE() {
  return NextResponse.json(
    {
      error: 'Direct deletion is disabled. Use POST /api/account/delete/request to start the deletion flow.',
      docs: '/api/account/delete/request',
    },
    { status: 405 }
  )
}
