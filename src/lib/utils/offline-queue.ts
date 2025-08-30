/**
 * Offline queue for managing operations when connection is lost
 */

export interface QueuedOperation {
  id: string;
  type: 'wishlist_add' | 'wishlist_remove' | 'activity_log';
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

export interface OfflineQueueOptions {
  maxQueueSize: number;
  maxRetries: number;
  retryInterval: number;
  storageKey: string;
}

const DEFAULT_OPTIONS: OfflineQueueOptions = {
  maxQueueSize: 100,
  maxRetries: 5,
  retryInterval: 5000,
  storageKey: 'stealdeals_offline_queue'
};

export class OfflineQueue {
  private queue: QueuedOperation[] = [];
  private isOnline = true;
  private isProcessing = false;
  private retryInterval: NodeJS.Timeout | null = null;
  private options: OfflineQueueOptions;
  
  constructor(options: Partial<OfflineQueueOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.loadFromStorage();
    this.setupOnlineListener();
    this.startProcessing();
  }
  
  /**
   * Add an operation to the offline queue
   */
  add(operation: Omit<QueuedOperation, 'id' | 'timestamp' | 'retryCount'>): void {
    const queuedOp: QueuedOperation = {
      ...operation,
      id: `${operation.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0
    };
    
    // Remove oldest items if queue is full
    while (this.queue.length >= this.options.maxQueueSize) {
      const removed = this.queue.shift();
      console.warn(`[OfflineQueue] Queue full, removed oldest operation: ${removed?.id}`);
    }
    
    this.queue.push(queuedOp);
    this.saveToStorage();
    
    console.log(`[OfflineQueue] Added operation ${queuedOp.id} to queue`);
    
    // Try to process immediately if online
    if (this.isOnline) {
      this.processQueue();
    }
  }
  
  /**
   * Remove an operation from the queue
   */
  remove(id: string): void {
    const initialLength = this.queue.length;
    this.queue = this.queue.filter(op => op.id !== id);
    
    if (this.queue.length < initialLength) {
      this.saveToStorage();
      console.log(`[OfflineQueue] Removed operation ${id} from queue`);
    }
  }
  
  /**
   * Get queue status
   */
  getStatus() {
    return {
      isOnline: this.isOnline,
      queueSize: this.queue.length,
      isProcessing: this.isProcessing,
      operations: this.queue.map(op => ({
        id: op.id,
        type: op.type,
        timestamp: op.timestamp,
        retryCount: op.retryCount
      }))
    };
  }
  
  /**
   * Clear all operations from the queue
   */
  clear(): void {
    this.queue = [];
    this.saveToStorage();
    console.log('[OfflineQueue] Cleared all operations from queue');
  }
  
  /**
   * Set up online/offline event listeners
   */
  private setupOnlineListener(): void {
    if (typeof window === 'undefined') return;
    
    this.isOnline = navigator.onLine;
    
    window.addEventListener('online', () => {
      console.log('[OfflineQueue] Connection restored, processing queue');
      this.isOnline = true;
      this.processQueue();
    });
    
    window.addEventListener('offline', () => {
      console.log('[OfflineQueue] Connection lost, operations will be queued');
      this.isOnline = false;
    });
  }
  
  /**
   * Start the retry processing interval
   */
  private startProcessing(): void {
    if (this.retryInterval) return;
    
    this.retryInterval = setInterval(() => {
      if (this.isOnline && this.queue.length > 0) {
        this.processQueue();
      }
    }, this.options.retryInterval);
  }
  
  /**
   * Stop the retry processing interval
   */
  stop(): void {
    if (this.retryInterval) {
      clearInterval(this.retryInterval);
      this.retryInterval = null;
    }
  }
  
  /**
   * Process queued operations
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || !this.isOnline || this.queue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    try {
      // Process operations in order
      const operationsToProcess = [...this.queue];
      
      for (const operation of operationsToProcess) {
        try {
          await this.processOperation(operation);
          this.remove(operation.id);
        } catch (error) {
          console.warn(`[OfflineQueue] Failed to process operation ${operation.id}:`, error);
          
          // Increment retry count
          operation.retryCount++;
          
          // Remove if max retries exceeded
          if (operation.retryCount >= operation.maxRetries) {
            console.error(`[OfflineQueue] Max retries exceeded for operation ${operation.id}, removing`);
            this.remove(operation.id);
          } else {
            this.saveToStorage();
          }
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }
  
  /**
   * Process a single operation
   */
  private async processOperation(operation: QueuedOperation): Promise<void> {
    console.log(`[OfflineQueue] Processing operation ${operation.id} (${operation.type})`);
    
    switch (operation.type) {
      case 'wishlist_add':
        await this.processWishlistAdd(operation.data);
        break;
      case 'wishlist_remove':
        await this.processWishlistRemove(operation.data);
        break;
      case 'activity_log':
        await this.processActivityLog(operation.data);
        break;
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  }
  
  /**
   * Process wishlist add operation
   */
  private async processWishlistAdd(data: any): Promise<void> {
    const response = await fetch('/api/user/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyId: data.propertyId,
        metadata: data.metadata
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to add to wishlist');
    }
  }
  
  /**
   * Process wishlist remove operation
   */
  private async processWishlistRemove(data: any): Promise<void> {
    const response = await fetch('/api/user/wishlist', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyId: data.propertyId
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to remove from wishlist');
    }
  }
  
  /**
   * Process activity log operation
   */
  private async processActivityLog(data: any): Promise<void> {
    const response = await fetch('/api/user/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to log activity');
    }
  }
  
  /**
   * Save queue to localStorage
   */
  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.options.storageKey, JSON.stringify(this.queue));
    } catch (error) {
      console.error('[OfflineQueue] Failed to save queue to storage:', error);
    }
  }
  
  /**
   * Load queue from localStorage
   */
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(this.options.storageKey);
      if (stored) {
        this.queue = JSON.parse(stored);
        console.log(`[OfflineQueue] Loaded ${this.queue.length} operations from storage`);
      }
    } catch (error) {
      console.error('[OfflineQueue] Failed to load queue from storage:', error);
      this.queue = [];
    }
  }
}

// Global offline queue instance
let globalOfflineQueue: OfflineQueue | null = null;

/**
 * Get the global offline queue instance
 */
export function getOfflineQueue(): OfflineQueue {
  if (!globalOfflineQueue) {
    globalOfflineQueue = new OfflineQueue();
  }
  return globalOfflineQueue;
}