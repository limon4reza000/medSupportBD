import {
  BatchAllocationDetail,
  FifoAllocationResult,
  IBatch,
} from "@/types/domain";

/**
 * Near-Expiry FIFO (First-In, First-Out) Batch Allocation Engine.
 * Prioritizes batches nearing expiry date first to prevent stock expiration losses in warehouses.
 * Filters out expired/quarantined batches and handles multi-batch splitting when a single batch has insufficient stock.
 */
export class BatchFifoEngine {
  /**
   * Allocate loose units from available batches according to FIFO expiry rules.
   *
   * @param batches Array of available batches for the specific medicine and depot
   * @param requestedLooseUnits Total loose units required (billed + bonus units)
   * @param options Configurable parameters such as min shelf life threshold
   */
  public static allocateFifoStock(
    medicineId: string,
    brandName: string,
    batches: IBatch[],
    requestedLooseUnits: number,
    options: {
      minimumDaysBeforeExpiry?: number; // e.g. 30 days buffer
      nearExpiryThresholdDays?: number;  // e.g. 90 days warning
    } = {}
  ): FifoAllocationResult {
    const minDays = options.minimumDaysBeforeExpiry ?? 30;
    const nearExpiryDays = options.nearExpiryThresholdDays ?? 90;
    const now = new Date();

    // 1. Filter out quarantined or expired/near-expired below minimum threshold
    const eligibleBatches = batches
      .filter((batch) => {
        if (batch.isQuarantined) return false;
        if (batch.availableLooseUnits <= 0) return false;

        const expiry = new Date(batch.expiryDate);
        const diffTime = expiry.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Skip if already expired or below minimum allowable shelf-life
        return diffDays >= minDays;
      })
      // 2. Sort by expiry date ASC (earliest expiring batch first)
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

    let remainingToAllocate = requestedLooseUnits;
    let allocatedTotal = 0;
    const allocations: BatchAllocationDetail[] = [];

    for (const batch of eligibleBatches) {
      if (remainingToAllocate <= 0) break;

      const expiry = new Date(batch.expiryDate);
      const diffTime = expiry.getTime() - now.getTime();
      const daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const isNearExpiry = daysUntilExpiry <= nearExpiryDays;

      // Deduct either the full remaining or the batch's full available capacity
      const allocatableFromThisBatch = Math.min(batch.availableLooseUnits, remainingToAllocate);

      if (allocatableFromThisBatch > 0) {
        allocations.push({
          batchId: batch.id,
          batchNumber: batch.batchNumber,
          expiryDate: batch.expiryDate,
          piecesAllocated: allocatableFromThisBatch,
          daysUntilExpiry,
          isNearExpiry,
          costBasis: Number(batch.costPricePerPiece || 0),
        });

        allocatedTotal += allocatableFromThisBatch;
        remainingToAllocate -= allocatableFromThisBatch;
      }
    }

    const isFullyAllocated = remainingToAllocate === 0;
    const shortageUnits = Math.max(0, remainingToAllocate);

    return {
      medicineId,
      brandName,
      requestedLooseUnits,
      allocatedLooseUnits: allocatedTotal,
      isFullyAllocated,
      shortageUnits,
      allocations,
    };
  }

  /**
   * Helper to check total available allocatable stock across all valid batches.
   */
  public static getTotalAvailableStock(batches: IBatch[], minDays: number = 30): number {
    const now = new Date();
    return batches
      .filter((b) => {
        if (b.isQuarantined || b.availableLooseUnits <= 0) return false;
        const diffDays = Math.ceil((new Date(b.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= minDays;
      })
      .reduce((sum, b) => sum + b.availableLooseUnits, 0);
  }
}
