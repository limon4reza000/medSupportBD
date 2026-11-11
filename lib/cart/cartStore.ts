import { db } from "@/lib/mockDb";

export interface ICartItemPayload {
  medicineId: string;
  quantity: number;
  unitType?: "BOX" | "STRIP" | "PIECE";
}

// Global in-memory cart store indexed by pharmacyId
const globalForCart = globalThis as unknown as {
  medgoCartStore?: Map<string, ICartItemPayload[]>;
};

export const serverCartStore = globalForCart.medgoCartStore ?? new Map<string, ICartItemPayload[]>();
if (process.env.NODE_ENV !== "production") {
  globalForCart.medgoCartStore = serverCartStore;
}

// Seed default cart items for pharm-01
if (!serverCartStore.has("pharm-01")) {
  serverCartStore.set("pharm-01", [
    { medicineId: "med-01", quantity: 10, unitType: "BOX" }, // Napa
    { medicineId: "med-02", quantity: 5, unitType: "BOX" },  // Seclo
  ]);
}
