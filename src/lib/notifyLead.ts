/**
 * Fire-and-forget parallel copy of a lead to the Resend inbox.
 * Never throws and never blocks: the native formsubmit.co POST stays the source of truth.
 */
export function notifyLead(form: FormData): void {
  const fields = Object.fromEntries(form) as Record<string, string>;
  void fetch('/api/notify-lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subject: fields._subject || 'Stealdeals lead', fields }),
    // keepalive so the request survives the form navigation that follows
    keepalive: true,
  }).catch(() => {});
}
