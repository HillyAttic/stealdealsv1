import { useState, useEffect, useCallback } from 'react';
import { gatedContentService } from '@/services/gatedContentService';

export type ContentType = 'franchise' | 'plot' | 'vacant';
export type ContentState = 'loading' | 'locked' | 'unlocked';

export function useSecureGatedContent(contentType: ContentType = 'franchise') {
  const [isClient, setIsClient] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [unlockedCount, setUnlockedCount] = useState(0);

  // Set client-side flag to prevent hydration issues
  useEffect(() => {
    setIsClient(true);
    setIsLoaded(true);
    setUnlockedCount(gatedContentService.getUnlockedCount());
  }, []);

  // Get content state for a specific content ID
  const getContentState = useCallback((contentId: string): ContentState => {
    if (!isClient || !isLoaded) {
      return 'loading';
    }
    
    const isUnlocked = gatedContentService.isContentUnlocked(contentId);
    return isUnlocked ? 'unlocked' : 'locked';
  }, [isClient, isLoaded]);

  // Check if content is unlocked for a specific content ID
  const isContentUnlocked = useCallback((contentId: string): boolean => {
    if (!isClient || !isLoaded) {
      return false;
    }
    
    return gatedContentService.isContentUnlocked(contentId);
  }, [isClient, isLoaded]);

  // Check if content is in loading state
  const isContentLoading = useCallback((contentId: string): boolean => {
    const state = getContentState(contentId);
    return state === 'loading';
  }, [getContentState]);

  // Unlock content for a specific content ID
  const unlockContent = useCallback(async (contentId: string, expiryDays?: number) => {
    if (!isClient) return;
    
    try {
      await gatedContentService.unlockContent(contentId, contentType, expiryDays);
      setUnlockedCount(gatedContentService.getUnlockedCount());
      
      console.log(`[SecureGatedContent] Unlocked ${contentType} content:`, contentId);
    } catch (error) {
      console.error(`[SecureGatedContent] Failed to unlock content ${contentId}:`, error);
    }
  }, [contentType, isClient]);

  // Get all unlocked content IDs for the current type
  const getUnlockedContent = useCallback((): string[] => {
    if (!isClient || !isLoaded) {
      return [];
    }
    
    return gatedContentService.getUnlockedContentByType(contentType);
  }, [contentType, isClient, isLoaded]);

  // Reset all unlocked content (for testing purposes)
  const resetUnlockedContent = useCallback(() => {
    if (!isClient) return;
    
    gatedContentService.resetAllContent();
    setUnlockedCount(0);
    console.log('[SecureGatedContent] Reset all unlocked content');
  }, [isClient]);

  // Unlock content with specific expiry (useful for different unlock types)
  const unlockContentWithExpiry = useCallback(async (
    contentId: string, 
    expiryDays: number = 365
  ) => {
    return unlockContent(contentId, expiryDays);
  }, [unlockContent]);

  // Check if any content is unlocked (useful for showing different UI states)
  const hasUnlockedContent = useCallback((): boolean => {
    return unlockedCount > 0;
  }, [unlockedCount]);

  // Get debug information
  const getDebugInfo = useCallback(() => {
    if (!isClient) return null;
    return gatedContentService.getDebugInfo();
  }, [isClient]);

  return {
    // Core functions
    isContentUnlocked,
    isContentLoading,
    getContentState,
    unlockContent,
    resetUnlockedContent,
    
    // Additional utility functions
    getUnlockedContent,
    unlockContentWithExpiry,
    hasUnlockedContent,
    getDebugInfo,
    
    // State flags
    isClient,
    isLoaded,
    unlockedCount
  };
}