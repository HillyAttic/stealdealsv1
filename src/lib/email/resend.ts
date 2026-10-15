// Minimal Resend client — their API is one POST, so no SDK dependency needed.
const RESEND_ENDPOINT = 'https://api.resend.com/emails';

const esc = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/**
 * Send a lead notification. Recipients come from LEAD_NOTIFY_EMAILS (comma separated)
 * so the same call can fan out to several inboxes in parallel.
 */
export async function sendLeadEmail(
  subject: string,
  fields: Record<string, unknown>
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('[lead-email] RESEND_API_KEY not set, skipping');
    return false;
  }

  const to = (process.env.LEAD_NOTIFY_EMAILS || 'stealdeals.co.in@gmail.com')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);

  // Skip formsubmit config keys (_subject, _next, _captcha) — they are not lead data.
  const rows = Object.entries(fields)
    .filter(([k, v]) => !k.startsWith('_') && v != null && String(v).trim() !== '')
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 16px 4px 0;font-weight:600;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:4px 0">${esc(String(v)).replace(/\n/g, '<br>')}</td></tr>`
    )
    .join('');

  const res = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // onboarding@resend.dev only delivers to the Resend account owner.
      // Set RESEND_FROM_EMAIL to an address on a verified domain for real recipients.
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to,
      subject,
      html: `<table style="font-family:system-ui,sans-serif;font-size:14px;border-collapse:collapse">${rows}</table>`,
    }),
  });

  if (!res.ok) {
    console.error('[lead-email] Resend rejected:', res.status, await res.text().catch(() => ''));
    return false;
  }
  return true;
}
