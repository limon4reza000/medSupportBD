import { CreditAuditResult, IPharmacy } from "@/types/domain";

/**
 * Credit & Pharmacy Ledger Risk Engine.
 * Enforces credit ceiling policies and checks overdue receivables to prevent non-performing debt.
 */
export class CreditLedgerEngine {
  /**
   * Audit whether a pharmacy is eligible to place an order of a given net amount on credit.
   *
   * @param pharmacy The pharmacy record containing credit limit & balance
   * @param newOrderNetTotal The net payable total of the proposed order
   * @param oldestUnpaidInvoiceDate Optional date of the earliest overdue invoice
   */
  public static auditPharmacyCredit(
    pharmacy: IPharmacy,
    newOrderNetTotal: number,
    oldestUnpaidInvoiceDate?: Date | string | null
  ): CreditAuditResult {
    const creditLimit = Number(pharmacy.creditLimit || 0);
    const currentBalance = Number(pharmacy.currentBalance || 0);
    const orderAmount = Number(newOrderNetTotal.toFixed(2));
    const projectedBalance = Number((currentBalance + orderAmount).toFixed(2));
    const availableCredit = Number((creditLimit - currentBalance).toFixed(2));

    // 1. Explicit admin block flag check
    if (pharmacy.isCreditBlocked) {
      return {
        pharmacyId: pharmacy.id,
        tradeName: pharmacy.tradeName,
        creditLimit,
        currentOutstandingBalance: currentBalance,
        newOrderAmount: orderAmount,
        projectedBalance,
        availableCredit,
        isApproved: false,
        isBlockedByLimit: false,
        isBlockedByOverdue: false,
        rejectionReason: "Pharmacy account is flagged as manually BLOCKED by Depot Administration.",
      };
    }

    // 2. Overdue Aging Check
    let isBlockedByOverdue = false;
    let overdueDays = 0;

    if (oldestUnpaidInvoiceDate) {
      const now = new Date();
      const invoiceDate = new Date(oldestUnpaidInvoiceDate);
      const diffTime = now.getTime() - invoiceDate.getTime();
      overdueDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      const maxDaysAllowed = pharmacy.creditDaysLimit || 30;
      if (overdueDays > maxDaysAllowed) {
        isBlockedByOverdue = true;
      }
    }

    if (isBlockedByOverdue) {
      return {
        pharmacyId: pharmacy.id,
        tradeName: pharmacy.tradeName,
        creditLimit,
        currentOutstandingBalance: currentBalance,
        newOrderAmount: orderAmount,
        projectedBalance,
        availableCredit,
        isApproved: false,
        isBlockedByLimit: false,
        isBlockedByOverdue: true,
        overdueDays,
        rejectionReason: `Order Blocked: Unpaid invoice aging (${overdueDays} days) exceeds maximum credit term (${pharmacy.creditDaysLimit} days). Settlement required before new order cutting.`,
      };
    }

    // 3. Credit Ceiling Check
    const isBlockedByLimit = projectedBalance > creditLimit;

    if (isBlockedByLimit) {
      const excessAmount = Number((projectedBalance - creditLimit).toFixed(2));
      return {
        pharmacyId: pharmacy.id,
        tradeName: pharmacy.tradeName,
        creditLimit,
        currentOutstandingBalance: currentBalance,
        newOrderAmount: orderAmount,
        projectedBalance,
        availableCredit,
        isApproved: false,
        isBlockedByLimit: true,
        isBlockedByOverdue: false,
        rejectionReason: `Credit Limit Exceeded: Order of ৳${orderAmount.toLocaleString()} pushes balance to ৳${projectedBalance.toLocaleString()}, exceeding limit of ৳${creditLimit.toLocaleString()} by ৳${excessAmount.toLocaleString()}.`,
      };
    }

    // Passed all risk gates
    return {
      pharmacyId: pharmacy.id,
      tradeName: pharmacy.tradeName,
      creditLimit,
      currentOutstandingBalance: currentBalance,
      newOrderAmount: orderAmount,
      projectedBalance,
      availableCredit,
      isApproved: true,
      isBlockedByLimit: false,
      isBlockedByOverdue: false,
    };
  }
}
