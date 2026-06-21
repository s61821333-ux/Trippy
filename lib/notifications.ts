import { RESEND_API_KEY, ADMIN_EMAIL, APP_URL } from './env'

/**
 * Fires a Resend email to the admin when a new user requests access.
 * Silently no-ops if RESEND_API_KEY or ADMIN_EMAIL are not set.
 * Always called fire-and-forget (.catch(() => {})) — never blocks the auth redirect.
 */
export async function sendNewUserNotification(
  userEmail: string,
  displayName: string,
): Promise<void> {
  const apiKey = RESEND_API_KEY()
  const adminEmail = ADMIN_EMAIL()
  if (!apiKey || !adminEmail) return

  const adminUrl = `${APP_URL()}/g-ctrl`

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Trippy <onboarding@resend.dev>',
      to: adminEmail, // trippy.trippy2026@gmail.com
      subject: `New access request — ${displayName}`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#faf8f4;font-family:-apple-system,BlinkMacSystemFont,'DM Sans',system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;background:#fff;border-radius:24px;border:1px solid #e8e2d8;overflow:hidden;box-shadow:0 4px 24px rgba(28,17,8,0.08)">
        <tr>
          <td style="background:linear-gradient(135deg,oklch(45% 0.150 152),oklch(30% 0.090 158));padding:28px 32px">
            <p style="margin:0;color:rgba(255,255,255,0.8);font-size:13px;letter-spacing:0.05em;text-transform:uppercase">Trippy · Access Request</p>
            <h1 style="margin:8px 0 0;color:#fff;font-size:22px;font-weight:700;line-height:1.2">Someone wants in ✈️</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px">
            <p style="margin:0 0 4px;font-size:17px;font-weight:600;color:#1c1108">${displayName}</p>
            <p style="margin:0 0 24px;font-size:14px;color:#6b6055">${userEmail}</p>
            <a href="${adminUrl}"
               style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,oklch(45% 0.150 152),oklch(30% 0.090 158));color:#fff;text-decoration:none;border-radius:9999px;font-size:15px;font-weight:600;letter-spacing:0.01em">
              Review in admin panel →
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px 24px;border-top:1px solid #f0ebe3">
            <p style="margin:0;font-size:12px;color:#a09890">letsexploring.com · Trippy admin</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    }),
  })
}
