export interface MedicineTypeInfo {
  label: "Tablet" | "Syrup" | "Capsule" | "Injection" | "Powder" | "Ointment" | "Eye Drops" | "Inhaler";
  badgeClass: string;
  btnClass: string;
}

/**
 * Resolves the accurate clinical dosage form, readable type label, and badge theme
 * for any medicine in the database.
 */
export function getMedicineTypeBadge(med: {
  dosageForm?: string;
  brandName?: string;
  genericName?: string;
  strength?: string;
}): MedicineTypeInfo {
  const form = (med.dosageForm || "").toUpperCase();
  const name = (med.brandName || "").toLowerCase();
  const generic = (med.genericName || "").toLowerCase();
  const strength = (med.strength || "").toLowerCase();

  // 1. CAPSULES
  if (
    form === "CAPSULE" ||
    name.includes("capsule") ||
    name.includes("cap ") ||
    name.endsWith(" cap") ||
    generic.includes("capsule") ||
    name.includes("acidex") ||
    name.includes("cozycap") ||
    name.includes("softgel")
  ) {
    return {
      label: "Capsule",
      badgeClass: "bg-purple-50 text-purple-700 border-purple-200/90",
      btnClass: "bg-[#8b5cf6] hover:bg-[#7c3aed]",
    };
  }

  // 2. SYRUPS / ORAL LIQUIDS / CHEMICAL FLUIDS
  if (
    form === "SYRUP" ||
    strength.includes("ml") ||
    strength.includes("mm") || // Common OCR artifact for ml in export dataset
    name.includes("syrup") ||
    name.includes("suspension") ||
    name.includes("acetone") ||
    name.includes("methylene chloride") ||
    name.includes("isopropyl alcohol") ||
    name.includes("liquid") ||
    name.includes("solution") ||
    name.includes("elixir") ||
    name.includes("pediatric drop")
  ) {
    return {
      label: "Syrup",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200/90",
      btnClass: "bg-[#ea580c] hover:bg-[#c2410c]",
    };
  }

  // 3. INJECTIONS & INFUSIONS
  if (
    form === "INJECTION" ||
    name.includes("inj") ||
    name.includes("infusion") ||
    name.includes("vial") ||
    name.includes("ampoule") ||
    strength.includes("vial") ||
    strength.includes("ampoule") ||
    strength.includes("iv") ||
    strength.includes("im")
  ) {
    return {
      label: "Injection",
      badgeClass: "bg-rose-50 text-rose-700 border-rose-200/90",
      btnClass: "bg-[#e11d48] hover:bg-[#be123c]",
    };
  }

  // 4. POWDERS & ORAL REHYDRATION SALTS
  if (
    name.includes("boric acid") ||
    name.includes("powder") ||
    name.includes("o r s") ||
    name.includes("ors") ||
    name.includes("sachet") ||
    (strength.includes("gm") && parseFloat(strength) >= 50 && !name.includes("zinc"))
  ) {
    return {
      label: "Powder",
      badgeClass: "bg-pink-50 text-pink-700 border-pink-200/90",
      btnClass: "bg-[#f43f5e] hover:bg-[#e11d48]",
    };
  }

  // 5. OINTMENTS & TOPICAL CREAMS
  if (
    form === "CREAM_OINTMENT" ||
    name.includes("cream") ||
    name.includes("ointment") ||
    name.includes("gel") ||
    name.includes("lotion")
  ) {
    return {
      label: "Ointment",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/90",
      btnClass: "bg-[#059669] hover:bg-[#047857]",
    };
  }

  // 6. EYE & EAR DROPS
  if (
    form === "EYE_DROPS" ||
    name.includes("eye drop") ||
    name.includes("ear drop") ||
    name.includes("ophthalmic")
  ) {
    return {
      label: "Eye Drops",
      badgeClass: "bg-teal-50 text-teal-700 border-teal-200/90",
      btnClass: "bg-[#0d9488] hover:bg-[#0f766e]",
    };
  }

  // 7. INHALERS & RESPIRATORY SPRAYS
  if (
    form === "INHALER" ||
    name.includes("inhaler") ||
    name.includes("spray") ||
    name.includes("rotacap") ||
    name.includes("aerosol")
  ) {
    return {
      label: "Inhaler",
      badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200/90",
      btnClass: "bg-[#4f46e5] hover:bg-[#4338ca]",
    };
  }

  // 8. TABLETS (Standard Oral Solid Dosage)
  return {
    label: "Tablet",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200/90",
    btnClass: "bg-[#2563eb] hover:bg-[#1d4ed8]",
  };
}
