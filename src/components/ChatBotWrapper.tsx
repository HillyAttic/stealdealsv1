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