import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sendLeadEmail } from '@/lib/email/resend';

export async function POST(request: NextRequest) {
  try {
    const { subject, fields } = await request.json();

    if (typeof subject !== 'string' || !subject.trim() || !fields || typeof fields !== 'object') {
      return NextResponse.json({ error: 'subject and fields are required' }, { status: 400 });
    }

    // Recipients are fixed in env, so this can't relay mail — but cap the payload
    // anyway so a bot can't stuff an unbounded blob into the inbox.
    const safe = Object.fromEntries(
      Object.entries(fields as Record<string, unknown>)
        .slice(0, 40)
        .map(([k, v]) => [String(k).slice(0, 100), String(v ?? '').slice(0, 5000)])
    );

    const sent = await sendLeadEmail(subject.slice(0, 200), safe);
    return NextResponse.json({ success: sent });
  } catch (error) {
    console.error('[notify-lead] error:', error);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}
