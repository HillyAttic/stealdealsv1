import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LeadMirror } from '@/components/LeadMirror';

/**
 * The whole point of LeadMirror is that one document-level listener replaces an
 * onSubmit on each of the ~11 lead forms. These tests pin the two things that
 * would silently break that: which forms it picks up, and double-sending.
 */
describe('LeadMirror', () => {
  const originalFetch = global.fetch;
  let bodies: { subject: string; fields: Record<string, string> }[];

  beforeEach(() => {
    bodies = [];
    global.fetch = jest.fn(async (_url: unknown, init: unknown) => {
      bodies.push(JSON.parse((init as RequestInit).body as string));
      return { ok: true, status: 200 } as Response;
    }) as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  const leadForm = (
    <form action="https://formsubmit.co/ishank@stealdeals.co.in" method="POST">
      <input type="hidden" name="_subject" value="Franchise Inquiry - Acme" />
      <input type="hidden" name="_captcha" value="false" />
      <input name="name" defaultValue="Bo" />
      <button type="submit">Send</button>
    </form>
  );

  it('mirrors a native lead form exactly once', async () => {
    render(
      <>
        <LeadMirror />
        {leadForm}
      </>
    );

    await userEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => expect(bodies).toHaveLength(1));
    expect(bodies[0].subject).toBe('Franchise Inquiry - Acme');
    expect(bodies[0].fields.name).toBe('Bo');
  });

  it('ignores forms that are not leads', async () => {
    render(
      <>
        <LeadMirror />
        <form action="/search" method="GET">
          <input name="q" defaultValue="plots" />
          <button type="submit">Search</button>
        </form>
      </>
    );

    await userEvent.click(screen.getByRole('button', { name: 'Search' }));

    await waitFor(() => expect(bodies).toHaveLength(0));
  });

  // GatedContentModal / PlotGatedContentModal: preventDefault, then copy the fields
  // into a detached form and call submit() on it. Per spec submit() fires no submit
  // event; jsdom fires one anyway, so stub it out to match real browsers.
  it('sends once when a handler preventDefaults and resubmits programmatically', async () => {
    const submit = jest
      .spyOn(HTMLFormElement.prototype, 'submit')
      .mockImplementation(() => {});

    function ModalLikeForm() {
      return (
        <form
          action="https://formsubmit.co/ishank@stealdeals.co.in"
          method="POST"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const tempForm = document.createElement('form');
            tempForm.action = 'https://formsubmit.co/ishank@stealdeals.co.in';
            tempForm.method = 'POST';
            for (const [k, v] of formData.entries()) {
              const input = document.createElement('input');
              input.type = 'hidden';
              input.name = k;
              input.value = v.toString();
              tempForm.appendChild(input);
            }
            document.body.appendChild(tempForm);
            tempForm.submit();
            document.body.removeChild(tempForm);
          }}
        >
          <input type="hidden" name="_subject" value="Investor Discovery Kit Request" />
          <input name="name" defaultValue="Bo" />
          <button type="submit">Unlock</button>
        </form>
      );
    }

    render(
      <>
        <LeadMirror />
        <ModalLikeForm />
      </>
    );

    await userEvent.click(screen.getByRole('button', { name: 'Unlock' }));

    await waitFor(() => expect(bodies).toHaveLength(1));
    expect(bodies[0].subject).toBe('Investor Discovery Kit Request');
    submit.mockRestore();
  });
});
