'use client';

import { useState, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';

interface ScrollToBottomProps {
  /** Show the button only when the user has scrolled down this many pixels */
  showAfterScroll?: number;
  /** Custom className for styling */
  className?: string;
  /** Whether to show scroll progress indicator */
  showProgress?: boolean;
}

export function ScrollToBottom({ 
  showAfterScroll = 300,
  className = '',
  showProgress = false
}: ScrollToBottomProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const toggleVisibility = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      
      // Show button after scrolling down the specified amount
      setIsVisible(scrollTop > showAfterScroll);
      
      // Calculate scroll progress
      if (showProgress) {
        const totalScroll = docHeight - winHeight;
        const currentProgress = Math.min((scrollTop / totalScroll) * 100, 100);
        setScrollProgress(currentProgress);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    
    // Initial check
    toggleVisibility();

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, [showAfterScroll, showProgress]);

  const scrollToBottom = () => {
    const documentHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );
    
    window.scrollTo({
      top: documentHeight,
      behavior: 'smooth'
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToBottom}
      className={`fixed bottom-6 right-6 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300 ${className}`}
      style={{
        backgroundColor: 'rgb(28, 110, 164)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgb(21, 77, 113)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'rgb(28, 110, 164)';
      }}
      aria-label="Scroll to bottom"
      title="Scroll to bottom"
    >
      {showProgress && (
        <div className="absolute inset-0 rounded-full">
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 36 36"
          >
            <path
              className="text-blue-200"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-white"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={`${scrollProgress}, 100`}
              strokeLinecap="round"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
        </div>
      )}
      <FaChevronDown className="w-5 h-5 relative z-10" />
    </button>
  );
}