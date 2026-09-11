/**
 * HIRAD COMMERCE — IDEMPOTENCY REGISTRY
 * Prevents double financial charges, duplicate order creations, and replayed webhooks.
 */

export interface IdempotentRecord<T = unknown> {
  key: string;
  response: T;
  timestamp: number;
}

export class IdempotencyManager {
  private cache: Map<string, IdempotentRecord> = new Map();
  public ttlMs = 24 * 60 * 60 * 1000; // 24 hours

  has(key: string): boolean {
    const rec = this.cache.get(key);
    if (!rec) return false;
    if (Date.now() - rec.timestamp > this.ttlMs) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  get<T>(key: string): T | undefined {
    if (!this.has(key)) return undefined;
    return this.cache.get(key)?.response as T;
  }

  set<T>(key: string, response: T): void {
    this.cache.set(key, {
      key,
      response,
      timestamp: Date.now(),
    });
  }

  /**
   * Clears old cache records
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, rec] of this.cache.entries()) {
      if (now - rec.timestamp > this.ttlMs) {
        this.cache.delete(key);
      }
    }
  }
}
