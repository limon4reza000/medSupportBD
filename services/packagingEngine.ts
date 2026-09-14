import {
  IMedicine,
  ITradeOffer,
  PackagingBreakdown,
  PackagingUnit,
  TradeCalculationResult,
  TradeSchemeType,
} from "@/types/domain";

/**
 * Packaging & Trade Bonus Engine
 * Implements unit hierarchy conversion (Box -> Strip -> Piece)
 * and evaluates dynamic B2B pharmaceutical trade schemes (e.g. 10+1 free, slab discounts).
 */
export class PackagingEngine {
  /**
   * Convert any packaging unit (BOX, STRIP, PIECE) into exact atomic loose units (tablets/capsules).
   */
  public static calculateLooseUnits(
    medicine: Pick<IMedicine, "piecesPerStrip" | "stripsPerBox">,
    unit: PackagingUnit,
    quantity: number
  ): number {
    if (quantity <= 0) return 0;
    const piecesPerStrip = medicine.piecesPerStrip || 10;
    const stripsPerBox = medicine.stripsPerBox || 10;
    const piecesPerBox = piecesPerStrip * stripsPerBox;

    switch (unit) {
      case PackagingUnit.BOX:
        return quantity * piecesPerBox;
      case PackagingUnit.STRIP:
        return quantity * piecesPerStrip;
      case PackagingUnit.PIECE:
        return quantity;
      default:
        return quantity;
    }
  }

  /**
   * Decompose an arbitrary count of loose units into standardized billable packaging units.
   * e.g. 235 loose tablets with 100/box and 10/strip -> 2 Boxes, 3 Strips, 5 Loose Pieces.
   */
  public static breakdownLooseUnits(
    medicine: Pick<IMedicine, "piecesPerStrip" | "stripsPerBox">,
    totalLoosePieces: number
  ): PackagingBreakdown {
    if (totalLoosePieces <= 0) {
      return { boxes: 0, strips: 0, pieces: 0, totalLoosePieces: 0 };
    }

    const piecesPerStrip = medicine.piecesPerStrip || 10;
    const stripsPerBox = medicine.stripsPerBox || 10;
    const piecesPerBox = piecesPerStrip * stripsPerBox;

    const boxes = Math.floor(totalLoosePieces / piecesPerBox);
    const remainderAfterBoxes = totalLoosePieces % piecesPerBox;

    const strips = Math.floor(remainderAfterBoxes / piecesPerStrip);
    const pieces = remainderAfterBoxes % piecesPerStrip;

    return {
      boxes,
      strips,
      pieces,
      totalLoosePieces,
    };
  }

  /**
   * Calculate trade price, discount slabs, and bonus units awarded for an order item.
   */
  public static evaluateTradeAndBonus(
    medicine: IMedicine,
    orderedUnit: PackagingUnit,
    orderedQty: number,
    activeOffer?: ITradeOffer | null
  ): TradeCalculationResult {
    const looseUnitsBilled = this.calculateLooseUnits(medicine, orderedUnit, orderedQty);
    const unitTradePrice = Number(medicine.tradePricePerPiece);
    const grossPrice = Number((looseUnitsBilled * unitTradePrice).toFixed(2));

    let bonusLooseUnits = 0;
    let bonusSummary = "Standard Billing (No Trade Bonus)";
    let discountPercentage = 0;
    let discountAmount = 0;

    if (activeOffer && activeOffer.isActive) {
      const now = new Date();
      const start = new Date(activeOffer.startDate);
      const end = new Date(activeOffer.endDate);

      if (now >= start && now <= end) {
        switch (activeOffer.schemeType) {
          case TradeSchemeType.BUY_X_GET_Y_FREE: {
            // Check qualifying units
            // e.g. Buy 10 Boxes -> Get 1 Box Free
            let qualifyingMultiplier = 0;

            if (orderedUnit === activeOffer.qualifyingUnit) {
              qualifyingMultiplier = Math.floor(orderedQty / activeOffer.minQualifyingQty);
            } else {
              // Convert both to loose units to check threshold
              const minQualifyingLoose = this.calculateLooseUnits(
                medicine,
                activeOffer.qualifyingUnit,
                activeOffer.minQualifyingQty
              );
              qualifyingMultiplier = Math.floor(looseUnitsBilled / minQualifyingLoose);
            }

            if (qualifyingMultiplier > 0) {
              const bonusQtyAwarded = qualifyingMultiplier * activeOffer.bonusQty;
              bonusLooseUnits = this.calculateLooseUnits(
                medicine,
                activeOffer.bonusUnit,
                bonusQtyAwarded
              );
              bonusSummary = `Scheme Applied: Buy ${activeOffer.minQualifyingQty} Get ${activeOffer.bonusQty} Free (${bonusQtyAwarded} ${activeOffer.bonusUnit} bonus = +${bonusLooseUnits} loose pcs free)`;
            }
            break;
          }

          case TradeSchemeType.SLAB_DISCOUNT: {
            // Check if minimum qualifying threshold reached
            const minQualifyingLoose = this.calculateLooseUnits(
              medicine,
              activeOffer.qualifyingUnit,
              activeOffer.minQualifyingQty
            );

            if (looseUnitsBilled >= minQualifyingLoose) {
              discountPercentage = Number(activeOffer.discountPercent || 0);
              discountAmount = Number(((grossPrice * discountPercentage) / 100).toFixed(2));
              bonusSummary = `Slab Discount: ${discountPercentage}% off on >= ${activeOffer.minQualifyingQty} ${activeOffer.qualifyingUnit}`;
            }
            break;
          }

          case TradeSchemeType.BONUS_RATIO: {
            // e.g. 5% loose bonus pieces
            const ratioPercent = Number(activeOffer.discountPercent || 5);
            bonusLooseUnits = Math.floor((looseUnitsBilled * ratioPercent) / 100);
            bonusSummary = `Bonus Ratio Scheme: +${ratioPercent}% Free Loose Units (+${bonusLooseUnits} pieces)`;
            break;
          }

          case TradeSchemeType.FLAT_CASH_DISCOUNT: {
            if (activeOffer.flatDiscountAmount) {
              discountAmount = Number(activeOffer.flatDiscountAmount);
              bonusSummary = `Flat Cash Discount: ৳${discountAmount} off`;
            }
            break;
          }
        }
      }
    }

    const vatPercentage = Number(medicine.vatPercentage || 2.4);
    const taxableAmount = Math.max(0, grossPrice - discountAmount);
    const vatAmount = Number(((taxableAmount * vatPercentage) / 100).toFixed(2));
    const netItemTotal = Number((taxableAmount + vatAmount).toFixed(2));

    return {
      medicineId: medicine.id,
      orderedUnit,
      orderedQty,
      looseUnitsBilled,
      bonusLooseUnits,
      bonusSummary,
      unitTradePrice,
      grossPrice,
      discountPercentage,
      discountAmount,
      vatAmount,
      netItemTotal,
    };
  }
}
