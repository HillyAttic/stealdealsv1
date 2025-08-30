import { describe, it, expect } from '@jest/globals';;
import { useWishlist } from '@/hooks/useWishlist';

describe('useWishlist hook', () => {
  it('should export the hook', () => {
    expect(useWishlist).toBeDefined();
    expect(typeof useWishlist).toBe('function');
  });
});