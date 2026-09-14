/**
 * Stock Lock & Optimistic Concurrency Control Engine
 * Provides distributed stock reservation locks with TTL to prevent race conditions during concurrent order cutting.
 * Emulates Redis Redlock / distributed cache semantics in memory, with easy pluggability to standalone Redis instance.
 */

interface LockEntry {
  token: string;
  medicineId: string;
  batchId?: string;
  quantity: number;
  expiresAt: number;
  acquiredAt: number;
}

export class StockLockEngine {
  private static locks: Map<string, LockEntry[]> = new Map();
  private static readonly DEFAULT_TTL_MS = 1000 * 60 * 3; // 3 minutes lock TTL

  /**
   * Generates a unique lock token for a checkout session.
   */
  public static generateLockToken(): string {
    return `lock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Acquire a temporary stock reservation lock for a specific medicine/batch.
   */
  public static acquireLock(
    medicineId: string,
    quantity: number,
    availableUnits: number,
    ttlMs: number = this.DEFAULT_TTL_MS,
    token?: string
  ): { success: boolean; lockToken: string; lockedQty: number; error?: string } {
    this.cleanupExpiredLocks();

    const lockToken = token || this.generateLockToken();
    const existingMedicineLocks = this.locks.get(medicineId) || [];

    // Sum currently active reserved quantities across other concurrent checkouts
    const currentlyLocked = existingMedicineLocks.reduce((sum, item) => sum + item.quantity, 0);

    const netAvailable = availableUnits - currentlyLocked;

    if (quantity > netAvailable) {
      return {
        success: false,
        lockToken,
        lockedQty: 0,
        error: `Lock contention: Only ${netAvailable} units available (Requested: ${quantity}, Locked by concurrent checkout: ${currentlyLocked}).`,
      };
    }

    const now = Date.now();
    const entry: LockEntry = {
      token: lockToken,
      medicineId,
      quantity,
      acquiredAt: now,
      expiresAt: now + ttlMs,
    };

    existingMedicineLocks.push(entry);
    this.locks.set(medicineId, existingMedicineLocks);

    return {
      success: true,
      lockToken,
      lockedQty: quantity,
    };
  }

  /**
   * Release reservation locks by token upon successful transaction commit or cancellation.
   */
  public static releaseLock(lockToken: string): void {
    Array.from(this.locks.entries()).forEach(([medicineId, list]) => {
      const remaining = list.filter((item) => item.token !== lockToken);
      if (remaining.length === 0) {
        this.locks.delete(medicineId);
      } else {
        this.locks.set(medicineId, remaining);
      }
    });
  }

  /**
   * Get active locked quantity for a medicine.
   */
  public static getLockedQuantity(medicineId: string): number {
    this.cleanupExpiredLocks();
    const list = this.locks.get(medicineId) || [];
    return list.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Internal cleaner for expired TTL locks.
   */
  private static cleanupExpiredLocks(): void {
    const now = Date.now();
    Array.from(this.locks.entries()).forEach(([medicineId, list]) => {
      const active = list.filter((item) => item.expiresAt > now);
      if (active.length === 0) {
        this.locks.delete(medicineId);
      } else {
        this.locks.set(medicineId, active);
      }
    });
  }
}
