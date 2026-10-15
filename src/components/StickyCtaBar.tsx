'use client';

import { FaPhone, FaWhatsapp } from 'react-icons/fa';
import { trackLead, whatsappUrl, GENERIC_WHATSAPP_MSG } from '@/lib/meta';

// Mobile-only sticky Call + WhatsApp bar for Meta ad traffic.
export default function StickyCtaBar() {
  return (
    <div className="fixed bottom-0 inset-x-0 z-[9998] grid grid-cols-2 md:hidden pb-[env(safe-area-inset-bottom)]">
      <a
        href="tel:+919630403080"
        onClick={() => trackLead('call')}
        className="flex items-center justify-center gap-2 py-3 text-white font-semibold"
        style={{ backgroundColor: 'rgb(28, 110, 164)' }}
      >
        <FaPhone />
        Call Now
      </a>
      <a
        href={whatsappUrl(GENERIC_WHATSAPP_MSG)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackLead('whatsapp')}
        className="flex items-center justify-center gap-2 py-3 text-white font-semibold bg-[#25D366]"
      >
        <FaWhatsapp />
        WhatsApp
      </a>
    </div>
  );
}
