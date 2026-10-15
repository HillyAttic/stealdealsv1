// Meta Pixel helpers. All calls are client-only and guarded so SSR / missing pixel never throws.

type WindowWithFbq = Window & { fbq?: (...args: unknown[]) => void };

export function trackLead(source: 'whatsapp' | 'call' | 'form', contentName?: string) {
  (window as WindowWithFbq).fbq?.('track', 'Lead', {
    content_name: contentName || 'franchise-inquiry',
    content_category: source,
  });
}

export function trackViewContent(id: string, name: string) {
  (window as WindowWithFbq).fbq?.('track', 'ViewContent', {
    content_ids: [id],
    content_name: name,
    content_type: 'product',
  });
}

const WHATSAPP_NUMBER = '919630403080';

export function whatsappUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const GENERIC_WHATSAPP_MSG =
  'Hi, I am interested in franchise opportunities with Steal Deals. Please share details.';
