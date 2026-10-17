'use client';

import { usePathname } from 'next/navigation';
import { trackLead, whatsappUrl, GENERIC_WHATSAPP_MSG } from '@/lib/meta';

// Bottom-left floating WhatsApp button (desktop only; mobile gets StickyCtaBar).
export default function ChatBotWrapper() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;

  return (
    <a
      href={whatsappUrl(GENERIC_WHATSAPP_MSG)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      onClick={() => trackLead('whatsapp')}
      className="fixed bottom-4 left-4 z-[9999] hidden md:block h-16 w-16 transition-transform hover:scale-110"
    >
      <img
        src="/images/whatsapp.gif"
        alt="Chat with us on WhatsApp"
        className="h-full w-full object-contain"
      />
    </a>
  );
}

/* ---- Wealth Calculator chatbot (commented out for now) ----

'use client';
import { useEffect } from 'react';

export default function ChatBotWrapper() {
  useEffect(() => {
    // Create wrapper div with more space for the button
    const chatbotWrapper = document.createElement('div');
    chatbotWrapper.id = 'stealdeals-chatbot-wrapper';
    chatbotWrapper.style.cssText = 'position: fixed; bottom: 10px; left: 10px; z-index: 9999; width: 75px; height: 75px; overflow: visible; pointer-events: none;';

    // Create iframe for chatbot
    const chatbotFrame = document.createElement('iframe');
    chatbotFrame.id = 'stealdeals-chatbot-frame';
    chatbotFrame.src = '/completechatbot_AIpowered.htm';
    chatbotFrame.frameBorder = '0';
    chatbotFrame.scrolling = 'no';
    // Set transparency (using setAttribute to avoid TypeScript errors)
    chatbotFrame.setAttribute('allowTransparency', 'true');
    // Set larger dimensions to ensure button is fully visible
    chatbotFrame.style.cssText = 'border: none; position: absolute; bottom: 0; left: 0; width: 75px; height: 75px; z-index: 9999; background: transparent; transition: all 0.3s ease; pointer-events: auto;';

    // Add iframe to wrapper
    chatbotWrapper.appendChild(chatbotFrame);

    // Add wrapper to body
    document.body.appendChild(chatbotWrapper);

    // Handle communication with iframe
    window.addEventListener('message', function(event) {
      if (event.data === 'chatbot-opened') {
        chatbotWrapper.style.width = '350px';
        chatbotWrapper.style.height = '590px';
        chatbotFrame.style.width = '350px';
        chatbotFrame.style.height = '590px';
      } else if (event.data === 'chatbot-closed') {
        chatbotWrapper.style.width = '75px';
        chatbotWrapper.style.height = '75px';
        chatbotFrame.style.width = '75px';
        chatbotFrame.style.height = '75px';
      }
    });

    return () => {
      document.body.removeChild(chatbotWrapper);
      window.removeEventListener('message', () => {});
    };
  }, []);

  return null;
}

---- */
