'use client';

import { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface SmartScrollButtonProps {
  /** Show the button only when the user has scrolled down this many pixels */
  showAfterScroll?: number;
  /** Custom className for styling */
  className?: string;
  /** Whether to show scroll progress indicator */
  showProgress?: boolean;
}

export function SmartScrollButton({ 
  showAfterScroll = 300,
  className = '',
  showProgress = false
}: SmartScrollButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isNearBottom, setIsNearBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const totalScroll = docHeight - winHeight;
      
      // Show button after scrolling down the specified amount
      setIsVisible(scrollTop > showAfterScroll);
      
      // Calculate scroll progress
      const currentProgress = Math.min((scrollTop / totalScroll) * 100, 100);
      setScrollProgress(currentProgress);
      
      // Check if user is near bottom (within 20% of total scroll)
      const bottomThreshold = totalScroll * 0.8; // 80% scrolled = near bottom
      setIsNearBottom(scrollTop >= bottomThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [showAfterScroll]);

  const handleScrollClick = () => {
    if (isNearBottom) {
      // Scroll to top
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      // Scroll to bottom
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
    }
  };

  if (!isVisible) {
    return null;
  }

  const buttonLabel = isNearBottom ? 'Scroll to top' : 'Scroll to bottom';
  const IconComponent = isNearBottom ? FaChevronUp : FaChevronDown;

  return (
    <button
      onClick={handleScrollClick}
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
      aria-label={buttonLabel}
      title={buttonLabel}
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
      <IconComponent className="w-5 h-5 relative z-10 transition-transform duration-300" />
    </button>
  );
}