/**
 * Retry utility functions for handling failed operations
 */

export interface RetryOptions {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryCondition?: (error: any) => boolean;
}

export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  retryCondition: (error) => {
    // Retry on network errors, server errors, but not on client errors
    if (error?.status) {
      return error.status >= 500 || error.status === 408 || error.status === 429;
    }
    // Retry on network/connection errors
    return error?.code === 'NETWORK_ERROR' || 
           error?.message?.includes('fetch') ||
           error?.message?.includes('network') ||
           error?.message?.includes('timeout');
  }
};

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: any;
  
  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry if this is the last attempt
      if (attempt === opts.maxAttempts) {
        break;
      }
      
      // Check if we should retry this error
      if (opts.retryCondition && !opts.retryCondition(error)) {
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        opts.baseDelay * Math.pow(opts.backoffFactor, attempt - 1),
        opts.maxDelay
      );
      
      console.warn(`[Retry] Attempt ${attempt} failed, retrying in ${delay}ms:`, error);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Create a retry wrapper for a function
 */
export function withRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: Partial<RetryOptions> = {}
): T {
  return ((...args: Parameters<T>) => {
    return retryWithBackoff(() => fn(...args), options);
  }) as T;
}

/**
 * Queue for managing failed operations that need to be retried
 */
export class RetryQueue {
  private queue: Array<{
    id: string;
    fn: () => Promise<any>;
    options: RetryOptions;
    attempts: number;
    lastAttempt: number;
  }> = [];
  
  private isProcessing = false;
  private processInterval: NodeJS.Timeout | null = null;
  
  constructor(private processIntervalMs: number = 5000) {
    this.startProcessing();
  }
  
  /**
   * Add an operation to the retry queue
   */
  add(
    id: string,
    fn: () => Promise<any>,
    options: Partial<RetryOptions> = {}
  ): void {
    const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
    
    // Remove existing item with same ID
    this.queue = this.queue.filter(item => item.id !== id);
    
    // Add new item
    this.queue.push({
      id,
      fn,
      options: opts,
      attempts: 0,
      lastAttempt: 0
    });
    
    console.log(`[RetryQueue] Added operation ${id} to queue`);
  }
  
  /**
   * Remove an operation from the queue
   */
  remove(id: string): void {
    this.queue = this.queue.filter(item => item.id !== id);
    console.log(`[RetryQueue] Removed operation ${id} from queue`);
  }
  
  /**
   * Get queue status
   */
  getStatus() {
    return {
      queueSize: this.queue.length,
      isProcessing: this.isProcessing,
      items: this.queue.map(item => ({
        id: item.id,
        attempts: item.attempts,
        lastAttempt: item.lastAttempt
      }))
    };
  }
  
  /**
   * Start processing the queue
   */
  private startProcessing(): void {
    if (this.processInterval) {
      return;
    }
    
    this.processInterval = setInterval(() => {
      this.processQueue();
    }, this.processIntervalMs);
  }
  
  /**
   * Stop processing the queue
   */
  stop(): void {
    if (this.processInterval) {
      clearInterval(this.processInterval);
      this.processInterval = null;
    }
  }
  
  /**
   * Process items in the queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    try {
      const now = Date.now();
      const itemsToProcess = this.queue.filter(item => {
        // Check if enough time has passed since last attempt
        const timeSinceLastAttempt = now - item.lastAttempt;
        const minDelay = item.options.baseDelay * Math.pow(item.options.backoffFactor, item.attempts);
        return timeSinceLastAttempt >= minDelay;
      });
      
      for (const item of itemsToProcess) {
        try {
          item.attempts++;
          item.lastAttempt = now;
          
          console.log(`[RetryQueue] Processing ${item.id}, attempt ${item.attempts}`);
          
          await item.fn();
          
          // Success - remove from queue
          this.remove(item.id);
          console.log(`[RetryQueue] Successfully processed ${item.id}`);
          
        } catch (error) {
          console.warn(`[RetryQueue] Failed to process ${item.id}, attempt ${item.attempts}:`, error);
          
          // Check if we should continue retrying
          if (item.attempts >= item.options.maxAttempts || 
              (item.options.retryCondition && !item.options.retryCondition(error))) {
            console.error(`[RetryQueue] Giving up on ${item.id} after ${item.attempts} attempts`);
            this.remove(item.id);
          }
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }
  
  /**
   * Clear all items from the queue
   */
  clear(): void {
    this.queue = [];
    console.log('[RetryQueue] Cleared all items from queue');
  }
}