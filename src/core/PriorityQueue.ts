// Optimized implementation for testing
type Priority = 'low' | 'medium' | 'high' | 'critical';

export class PriorityQueue<T> {
  private queues: Map<Priority, Array<{ item: T; timestamp: number }>> = new Map();
  private priorityOrder: Priority[] = ['critical', 'high', 'medium', 'low'];

  constructor() {
    this.priorityOrder.forEach(priority => {
      this.queues.set(priority, []);
    });
  }

  enqueue(item: T, priority: Priority): void {
    const timestamp = Date.now();
    const queue = this.queues.get(priority);
    if (queue) {
      queue.push({ item, timestamp });
    }
  }

  dequeue(): T | null {
    for (const priority of this.priorityOrder) {
      const queue = this.queues.get(priority);
      if (queue && queue.length > 0) {
        const result = queue.shift();
        return result ? result.item : null;
      }
    }
    return null;
  }

  peek(): T | null {
    for (const priority of this.priorityOrder) {
      const queue = this.queues.get(priority);
      if (queue && queue.length > 0) {
        return queue[0].item;
      }
    }
    return null;
  }

  size(): number {
    let total = 0;
    this.queues.forEach(queue => total += queue.length);
    return total;
  }

  isEmpty(): boolean {
    return this.size() === 0;
  }

  clear(): void {
    this.queues.forEach(queue => queue.length = 0);
  }

  remove(predicate: (item: T) => boolean): boolean {
    for (const queue of this.queues.values()) {
      const index = queue.findIndex(entry => predicate(entry.item));
      if (index !== -1) {
        queue.splice(index, 1);
        return true;
      }
    }
    return false;
  }

  updatePriority(predicate: (item: T) => boolean, newPriority: Priority): boolean {
    for (const queue of this.queues.values()) {
      const index = queue.findIndex(entry => predicate(entry.item));
      if (index !== -1) {
        const entry = queue.splice(index, 1)[0];
        this.enqueue(entry.item, newPriority);
        return true;
      }
    }
    return false;
  }
}