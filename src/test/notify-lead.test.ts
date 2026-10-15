import { sendLeadEmail } from '@/lib/email/resend';

// Only the logic module is imported: next/server pulls in Request/Response globals
// that this jest environment does not provide.
describe('sendLeadEmail', () => {
  const originalFetch = global.fetch;
  let calls: { url: string; init: RequestInit }[];

  beforeEach(() => {
    calls = [];
    process.env.RESEND_API_KEY = 'test_key';
    process.env.LEAD_NOTIFY_EMAILS = 'stealdeals.co.in@gmail.com, ops@stealdeals.co.in';
    global.fetch = jest.fn(async (url: unknown, init: unknown) => {
      calls.push({ url: String(url), init: init as RequestInit });
      return { ok: true, status: 200 } as Response;
    }) as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    delete process.env.RESEND_API_KEY;
    delete process.env.LEAD_NOTIFY_EMAILS;
  });

  const sentPayload = () => JSON.parse(calls[0].init.body as string);

  it('fans out to every configured inbox and escapes lead input', async () => {
    const ok = await sendLeadEmail('Contact Form Inquiry - Stealdeals', {
      _captcha: 'false',
      _subject: 'Contact Form Inquiry - Stealdeals',
      name: '<b>Bo</b>',
      email: 'bo@example.com',
      message: 'line one\nline two',
      empty: '',
    });

    expect(ok).toBe(true);
    expect(calls[0].url).toBe('https://api.resend.com/emails');
    expect(calls[0].init.headers).toMatchObject({ Authorization: 'Bearer test_key' });

    const payload = sentPayload();
    expect(payload.to).toEqual(['stealdeals.co.in@gmail.com', 'ops@stealdeals.co.in']);
    expect(payload.subject).toBe('Contact Form Inquiry - Stealdeals');
    // formsubmit config keys are not lead data
    expect(payload.html).not.toContain('_captcha');
    // HTML in user input must not survive as markup
    expect(payload.html).toContain('&lt;b&gt;Bo&lt;/b&gt;');
    // newlines render as breaks
    expect(payload.html).toContain('line one<br>line two');
  });

  it('sends from RESEND_FROM_EMAIL when set', async () => {
    process.env.RESEND_FROM_EMAIL = 'leads@stealdeals.co.in';

    await sendLeadEmail('Lead', { name: 'Bo' });

    expect(sentPayload().from).toBe('leads@stealdeals.co.in');
    delete process.env.RESEND_FROM_EMAIL;
  });

  it('falls back to onboarding@resend.dev when RESEND_FROM_EMAIL is unset', async () => {
    delete process.env.RESEND_FROM_EMAIL;

    await sendLeadEmail('Lead', { name: 'Bo' });

    expect(sentPayload().from).toBe('onboarding@resend.dev');
  });

  it('reports failure instead of throwing when Resend rejects', async () => {
    global.fetch = jest.fn(async () => ({
      ok: false,
      status: 403,
      text: async () => 'domain not verified',
    })) as unknown as typeof fetch;

    await expect(sendLeadEmail('Lead', { name: 'Bo' })).resolves.toBe(false);
  });

  it('skips sending when no API key is configured', async () => {
    delete process.env.RESEND_API_KEY;

    await expect(sendLeadEmail('Lead', { name: 'Bo' })).resolves.toBe(false);
    expect(calls).toHaveLength(0);
  });
});
