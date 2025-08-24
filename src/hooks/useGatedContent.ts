import { useState, useEffect, useCallback } from 'react';

interface UnlockedContent {
  [franchiseId: string]: boolean;
}

export function useGatedContent() {
  const [unlockedContent, setUnlockedContent] = useState<UnlockedContent>({});

  // Load unlocked content from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('stealdeals-unlocked-investor-kits');
      if (stored) {
        setUnlockedContent(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading unlocked content:', error);
    }
  }, []);

  // Save to localStorage whenever unlockedContent changes
  useEffect(() => {
    try {
      localStorage.setItem('stealdeals-unlocked-investor-kits', JSON.stringify(unlockedContent));
    } catch (error) {
      console.error('Error saving unlocked content:', error);
    }
  }, [unlockedContent]);

  // Check if content is unlocked for a specific franchise
  const isContentUnlocked = useCallback((franchiseId: string): boolean => {
    return unlockedContent[franchiseId] || false;
  }, [unlockedContent]);

  // Unlock content for a specific franchise
  const unlockContent = useCallback((franchiseId: string) => {
    setUnlockedContent(prev => ({
      ...prev,
      [franchiseId]: true
    }));
  }, []);

  // Reset all unlocked content (for testing purposes)
  const resetUnlockedContent = useCallback(() => {
    setUnlockedContent({});
    localStorage.removeItem('stealdeals-unlocked-investor-kits');
  }, []);

  return {
    isContentUnlocked,
    unlockContent,
    resetUnlockedContent
  };
}