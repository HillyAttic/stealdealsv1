import { jwtVerify, SignJWT } from 'jose';

// Types for gated content
export interface GatedContentClaim {
  contentId: string;
  contentType: 'plot' | 'franchise' | 'vacant';
  unlockedAt: number;
  expiresAt?: number;
}

export interface GatedContentToken {
  unlockedContent: GatedContentClaim[];
  iat: number;
  exp: number;
}

// Configuration
const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXT_PUBLIC_GATED_CONTENT_SECRET || 'stealdeals-gated-content-secret-key-2024'
);

const TOKEN_EXPIRY_DAYS = 365; // 1 year
const STORAGE_KEY = 'stealdeals_gated_content_token';
const COOKIE_NAME = 'gated_content_auth';

export class GatedContentService {
  private static instance: GatedContentService;
  private currentToken: string | null = null;
  private unlockedContent: Map<string, GatedContentClaim> = new Map();

  private constructor() {
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
    }
  }

  public static getInstance(): GatedContentService {
    if (!GatedContentService.instance) {
      GatedContentService.instance = new GatedContentService();
    }
    return GatedContentService.instance;
  }

  /**
   * Load unlocked content from storage (localStorage and cookies)
   */
  private loadFromStorage(): void {
    try {
      // Try localStorage first
      const storedToken = localStorage.getItem(STORAGE_KEY);
      if (storedToken) {
        this.verifyAndLoadToken(storedToken);
        return;
      }

      // Fallback to cookies
      const cookieToken = this.getCookie(COOKIE_NAME);
      if (cookieToken) {
        this.verifyAndLoadToken(cookieToken);
        return;
      }
    } catch (error) {
      console.error('[GatedContent] Error loading from storage:', error);
      this.clearStorage();
    }
  }

  /**
   * Verify and load token data
   */
  private async verifyAndLoadToken(token: string): Promise<void> {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET) as { payload: GatedContentToken };
      
      this.currentToken = token;
      this.unlockedContent.clear();
      
      // Load unlocked content into map
      payload.unlockedContent.forEach(claim => {
        // Check if content hasn't expired
        if (!claim.expiresAt || claim.expiresAt > Date.now()) {
          this.unlockedContent.set(claim.contentId, claim);
        }
      });
      
      console.log('[GatedContent] Loaded unlocked content:', this.unlockedContent.size, 'items');
    } catch (error) {
      console.error('[GatedContent] Token verification failed:', error);
      this.clearStorage();
    }
  }

  /**
   * Create a new JWT token with unlocked content
   */
  private async createToken(claims: GatedContentClaim[]): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const expiryTime = now + (TOKEN_EXPIRY_DAYS * 24 * 60 * 60);

    return await new SignJWT({
      unlockedContent: claims,
    } as GatedContentToken)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(now)
      .setExpirationTime(expiryTime)
      .sign(JWT_SECRET);
  }

  /**
   * Save token to storage
   */
  private saveToStorage(token: string): void {
    try {
      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, token);
      
      // Also save as HTTP-only style cookie for additional persistence
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + TOKEN_EXPIRY_DAYS);
      
      document.cookie = `${COOKIE_NAME}=${token}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
    } catch (error) {
      console.error('[GatedContent] Error saving to storage:', error);
    }
  }

  /**
   * Get cookie value
   */
  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  /**
   * Clear all storage
   */
  private clearStorage(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    } catch (error) {
      console.error('[GatedContent] Error clearing storage:', error);
    }
  }

  /**
   * Check if content is unlocked
   */
  public isContentUnlocked(contentId: string): boolean {
    const claim = this.unlockedContent.get(contentId);
    if (!claim) return false;
    
    // Check expiry if set
    if (claim.expiresAt && claim.expiresAt < Date.now()) {
      this.unlockedContent.delete(contentId);
      return false;
    }
    
    return true;
  }

  /**
   * Unlock content
   */
  public async unlockContent(
    contentId: string, 
    contentType: 'plot' | 'franchise' | 'vacant',
    expiryDays?: number
  ): Promise<void> {
    const now = Date.now();
    const expiresAt = expiryDays ? now + (expiryDays * 24 * 60 * 60 * 1000) : undefined;
    
    const claim: GatedContentClaim = {
      contentId,
      contentType,
      unlockedAt: now,
      expiresAt
    };
    
    this.unlockedContent.set(contentId, claim);
    
    // Create new token with all unlocked content
    const allClaims = Array.from(this.unlockedContent.values());
    const newToken = await this.createToken(allClaims);
    
    this.currentToken = newToken;
    this.saveToStorage(newToken);
    
    console.log('[GatedContent] Unlocked content:', contentId);
  }

  /**
   * Get all unlocked content IDs for a specific type
   */
  public getUnlockedContentByType(contentType: 'plot' | 'franchise' | 'vacant'): string[] {
    return Array.from(this.unlockedContent.values())
      .filter(claim => claim.contentType === contentType)
      .map(claim => claim.contentId);
  }

  /**
   * Get unlocked content count
   */
  public getUnlockedCount(): number {
    return this.unlockedContent.size;
  }

  /**
   * Reset all unlocked content (for testing)
   */
  public resetAllContent(): void {
    this.unlockedContent.clear();
    this.currentToken = null;
    this.clearStorage();
    console.log('[GatedContent] Reset all unlocked content');
  }

  /**
   * Get debug info
   */
  public getDebugInfo(): {
    hasToken: boolean;
    unlockedCount: number;
    unlockedItems: GatedContentClaim[];
  } {
    return {
      hasToken: !!this.currentToken,
      unlockedCount: this.unlockedContent.size,
      unlockedItems: Array.from(this.unlockedContent.values())
    };
  }
}

// Export singleton instance
export const gatedContentService = GatedContentService.getInstance();