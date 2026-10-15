'use client';

import { useEffect } from 'react';
import { notifyLead } from '@/lib/notifyLead';

/**
 * Mirrors every lead form on the site to the Resend inbox.
 *
 * One document-level listener instead of an onSubmit on each of the ~11 lead forms.
 * A form counts as a lead form when it carries a formsubmit.co `_subject` field,
 * which keeps search/login/newsletter forms out.
 *
 * Capture phase on purpose: it runs before the page's own submit handlers, so the
 * mirrored request is in flight before a handler can start navigating away.
 */
export function LeadMirror() {
  useEffect(() => {
    const onSubmitting = (e: Event) => {
      const form = e.target;
      if (!(form instanceof HTMLFormElement)) return;
      if (!form.querySelector('input[name="_subject"]')) return;
      notifyLead(new FormData(form));
    };

    document.addEventListener('submit', onSubmitting, true);
    return () => document.removeEventListener('submit', onSubmitting, true);
  }, []);

  return null;
}
