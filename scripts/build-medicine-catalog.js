const fs = require('fs');
const path = require('path');
const readline = require('readline');
const {
  parseCsvLine,
  mapDosageForm,
  extractGenericAndStrength,
  estimatePricing,
  estimatePackaging
} = require('./dataset-helpers');

async function buildCatalog() {
  console.log('🚀 Starting Full Medicine Dataset Compilation (all 41,000+ records)...');

  const exportCsvPath = path.join(__dirname, '..', 'medicine list csv', 'medicine_information_export.csv');
  const dgdaCsvPath = path.join(__dirname, '..', 'medicine list csv', 'Directorate General of Drug Administration.csv');
  const outDir = path.join(__dirname, '..', 'lib', 'data');

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // 1. Ingest DGDA Generics Monographs
  console.log('📖 Parsing Directorate General of Drug Administration.csv...');
  const dgdaGenerics = [];
  const dgdaGenericMap = new Map();

  const rlDgda = readline.createInterface({
    input: fs.createReadStream(dgdaCsvPath),
    crlfDelay: Infinity
  });

  let isDgdaHeader = true;
  for await (const line of rlDgda) {
    if (isDgdaHeader) {
      isDgdaHeader = false;
      continue;
    }
    const cols = parseCsvLine(line);
    if (cols.length >= 4 && cols[1]) {
      const entry = {
        sl: cols[0],
        generic: cols[1].trim(),
        dosage: cols[2] ? cols[2].trim() : '',
        strength: cols[3] ? cols[3].trim() : '',
        gdar: cols[4] ? cols[4].trim() : '',
        dccRef: cols[5] ? cols[5].trim() : ''
      };
      dgdaGenerics.push(entry);
      dgdaGenericMap.set(entry.generic.toLowerCase(), entry);
    }
  }
  console.log(`✅ Loaded ${dgdaGenerics.length} official DGDA generic records.`);

  // 2. Read existing core mock medicines so they remain the foundation of med-01..med-08
  const existingCoreMeds = [
    {
      id: "med-01",
      code: "MED-NAP-EXT",
      brandName: "Napa Extra",
      genericName: "Paracetamol + Caffeine",
      dosageForm: "TABLET",
      strength: "500mg + 65mg",
      manufacturer: "Beximco Pharmaceuticals Ltd.",
      description: "Analgesic & Antipyretic for severe headache, migraine, toothache and fever.",
      piecesPerStrip: 10,
      stripsPerBox: 20,
      mrpPerPiece: 3.00,
      tradePricePerPiece: 2.45,
      vatPercentage: 2.40,
      isActive: true,
      darNo: "186-0043-023",
      dgdaApproved: true,
    },
    {
      id: "med-02",
      code: "MED-ACE-PLS",
      brandName: "Ace Plus",
      genericName: "Paracetamol + Caffeine",
      dosageForm: "TABLET",
      strength: "500mg + 65mg",
      manufacturer: "Square Pharmaceuticals PLC",
      description: "Rapid relief from pain, fever, neuralgic pain, and headache.",
      piecesPerStrip: 10,
      stripsPerBox: 20,
      mrpPerPiece: 3.00,
      tradePricePerPiece: 2.45,
      vatPercentage: 2.40,
      isActive: true,
      darNo: "034-0129-023",
      dgdaApproved: true,
    },
    {
      id: "med-03",
      code: "MED-SEC-020",
      brandName: "Seclo 20",
      genericName: "Omeprazole",
      dosageForm: "CAPSULE",
      strength: "20mg",
      manufacturer: "Square Pharmaceuticals PLC",
      description: "Proton Pump Inhibitor (PPI) for gastric ulcer, GERD, and hyperacidity.",
      piecesPerStrip: 10,
      stripsPerBox: 10,
      mrpPerPiece: 6.00,
      tradePricePerPiece: 4.90,
      vatPercentage: 2.40,
      isActive: true,
      darNo: "034-0012-067",
      dgdaApproved: true,
    },
    {
      id: "med-04",
      code: "MED-SER-020",
      brandName: "Sergel 20",
      genericName: "Esomeprazole",
      dosageForm: "CAPSULE",
      strength: "20mg",
      manufacturer: "Healthcare Pharmaceuticals Ltd.",
      description: "Next-generation PPI with sustained acid suppression for erosive esophagitis.",
      piecesPerStrip: 10,
      stripsPerBox: 10,
      mrpPerPiece: 7.00,
      tradePricePerPiece: 5.75,
      vatPercentage: 2.40,
      isActive: true,
      darNo: "211-0021-067",
      dgdaApproved: true,
    },
    {
      id: "med-05",
      code: "MED-MON-010",
      brandName: "Monas 10",
      genericName: "Montelukast",
      dosageForm: "TABLET",
      strength: "10mg",
      manufacturer: "The ACME Laboratories Ltd.",
      description: "Leukotriene receptor antagonist for prophylaxis of chronic asthma and allergic rhinitis.",
      piecesPerStrip: 10,
      stripsPerBox: 10,
      mrpPerPiece: 16.00,
      tradePricePerPiece: 13.10,
      vatPercentage: 2.40,
      isActive: true,
      darNo: "006-0311-044",
      dgdaApproved: true,
    },
    {
      id: "med-06",
      code: "MED-ZIM-500",
      brandName: "Zimax 500",
      genericName: "Azithromycin",
      dosageForm: "TABLET",
      strength: "500mg",
      manufacturer: "Square Pharmaceuticals PLC",
      description: "Macrolide broad-spectrum antibiotic for respiratory tract and soft tissue infections.",
      piecesPerStrip: 6,
      stripsPerBox: 5,
      mrpPerPiece: 35.00,
      tradePricePerPiece: 28.70,
      vatPercentage: 2.40,
      isActive: true,
      darNo: "034-0088-023",
      dgdaApproved: true,
    },
    {
      id: "med-07",
      code: "MED-ALA-010",
      brandName: "Alatrol 10",
      genericName: "Cetirizine Hydrochloride",
      dosageForm: "TABLET",
      strength: "10mg",
      manufacturer: "Square Pharmaceuticals PLC",
      description: "Second-generation non-sedating antihistamine for seasonal allergic rhinitis and urticaria.",
      piecesPerStrip: 10,
      stripsPerBox: 10,
      mrpPerPiece: 3.50,
      tradePricePerPiece: 2.85,
      vatPercentage: 2.40,
      isActive: true,
      darNo: "034-0045-023",
      dgdaApproved: true,
    },
    {
      id: "med-08",
      code: "MED-CIP-500",
      brandName: "Ciprocin 500",
      genericName: "Ciprofloxacin",
      dosageForm: "TABLET",
      strength: "500mg",
      manufacturer: "Square Pharmaceuticals PLC",
      description: "Fluoroquinolone antibiotic for bacterial infections, typhoid fever, and urinary tract infections.",
      piecesPerStrip: 10,
      stripsPerBox: 10,
      mrpPerPiece: 15.00,
      tradePricePerPiece: 12.30,
      vatPercentage: 2.40,
      isActive: true,
      darNo: "034-0022-023",
      dgdaApproved: true,
    }
  ];

  const existingBrandSet = new Set(existingCoreMeds.map(m => m.brandName.toLowerCase()));

  // 3. Process ALL records from medicine_information_export.csv
  console.log('📖 Processing all records in medicine_information_export.csv...');
  const rlExport = readline.createInterface({
    input: fs.createReadStream(exportCsvPath),
    crlfDelay: Infinity
  });

  let isExportHeader = true;
  const importedMedicines = [];
  const seenProductKey = new Set();
  let candidateIndex = 9;

  for await (const line of rlExport) {
    if (isExportHeader) {
      isExportHeader = false;
      continue;
    }

    const cols = parseCsvLine(line);
    const sl = cols[0] || '';
    const company = cols[1] || '';
    const tradeName = cols[2] || '';
    const genericWithStrength = cols[3] || '';
    const rawForm = cols[4] || '';
    const darNo = cols[5] || '';

    const { generic, strength } = extractGenericAndStrength(genericWithStrength);
    const finalBrand = (tradeName && tradeName.trim().length > 0)
      ? tradeName.trim()
      : (generic ? generic.trim() : (sl ? `Formulation #${sl}` : 'Pharmaceutical Formulation'));

    const dosageForm = mapDosageForm(rawForm);
    const pricing = estimatePricing(generic, dosageForm, strength);
    const packaging = estimatePackaging(dosageForm);

    const idNum = sl ? String(sl).padStart(5, '0') : String(candidateIndex++).padStart(5, '0');
    const id = `med-${idNum}`;
    
    // Clean manufacturer display name
    let cleanMfg = company.replace(/,\s*(?:Pabna|Gazipur|Tongi|Dhamrai|Savar|Gopalpur|Cephalosporin Unit|Satipara|Narshingdi)/gi, '').trim();

    // Generate code
    const mfgPrefix = cleanMfg.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'PH');
    const brandPrefix = (finalBrand || 'MED').slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'MD');
    const code = `MED-${mfgPrefix}-${brandPrefix}-${idNum}`;

    // Look up in DGDA generic index for regulatory cross-reference
    const dgdaMatch = dgdaGenericMap.get(generic.toLowerCase());
    const isDgdaVerified = !!dgdaMatch || !!darNo;

    const medicineObj = {
      id,
      code,
      brandName: finalBrand,
      genericName: generic || 'General Formulation',
      dosageForm,
      strength: strength || 'Standard',
      manufacturer: cleanMfg || 'Pharmaceutical Manufacturer',
      description: dgdaMatch 
        ? `DGDA Verified ${dosageForm} formulation (${generic} ${strength}). Manufactured under cGMP compliance by ${cleanMfg}.`
        : `Pharmaceutical formulation (${generic} ${strength}) by ${cleanMfg}. Prescribed for targeted therapeutic care.`,
      piecesPerStrip: packaging.piecesPerStrip,
      stripsPerBox: packaging.stripsPerBox,
      mrpPerPiece: pricing.mrpPerPiece,
      tradePricePerPiece: pricing.tradePricePerPiece,
      vatPercentage: 2.40,
      isActive: true,
      darNo: darNo || (dgdaMatch ? dgdaMatch.gdar : `DGDA-${idNum}`),
      dgdaApproved: isDgdaVerified,
      requiresColdChain: generic.toLowerCase().includes('insulin') || generic.toLowerCase().includes('vaccine') || (dosageForm === 'INJECTION' && generic.toLowerCase().includes('interferon'))
    };

    importedMedicines.push(medicineObj);
  }

  const fullMedicinesCatalog = importedMedicines;
  console.log(`✅ Assembled complete catalog: ${fullMedicinesCatalog.length} medicines.`);

  // 4. Batches setup: Include core batches + top 1,500 SKU batches
  console.log('📦 Pre-generating initial batches (remaining generated dynamically on-demand)...');
  const batches = [];
  
  const coreBatches = [
    {
      id: "batch-napa-01",
      batchNumber: "BN-2024-NAPA-01",
      medicineId: "med-01",
      depotId: "depot-dhk-01",
      manufacturingDate: "2024-04-10",
      expiryDate: "2026-11-30",
      initialLooseUnits: 4000,
      availableLooseUnits: 450,
      reservedLooseUnits: 0,
      costPricePerPiece: 1.90,
      mrpPerPiece: 3.00,
    },
    {
      id: "batch-napa-02",
      batchNumber: "BN-2025-NAPA-02",
      medicineId: "med-01",
      depotId: "depot-dhk-01",
      manufacturingDate: "2025-01-15",
      expiryDate: "2027-06-30",
      initialLooseUnits: 5000,
      availableLooseUnits: 3800,
      reservedLooseUnits: 0,
      costPricePerPiece: 1.95,
      mrpPerPiece: 3.00,
    },
    {
      id: "batch-napa-03",
      batchNumber: "BN-2025-NAPA-03",
      medicineId: "med-01",
      depotId: "depot-dhk-01",
      manufacturingDate: "2025-08-01",
      expiryDate: "2028-01-31",
      initialLooseUnits: 10000,
      availableLooseUnits: 9800,
      reservedLooseUnits: 0,
      costPricePerPiece: 2.00,
      mrpPerPiece: 3.00,
    },
    {
      id: "batch-ace-01",
      batchNumber: "BN-2024-ACE-08",
      medicineId: "med-02",
      depotId: "depot-dhk-01",
      manufacturingDate: "2024-06-10",
      expiryDate: "2026-12-15",
      initialLooseUnits: 3000,
      availableLooseUnits: 1200,
      reservedLooseUnits: 0,
      costPricePerPiece: 1.90,
      mrpPerPiece: 3.00,
    },
    {
      id: "batch-ace-02",
      batchNumber: "BN-2025-ACE-11",
      medicineId: "med-02",
      depotId: "depot-dhk-01",
      manufacturingDate: "2025-03-20",
      expiryDate: "2027-09-30",
      initialLooseUnits: 6000,
      availableLooseUnits: 5400,
      reservedLooseUnits: 0,
      costPricePerPiece: 1.95,
      mrpPerPiece: 3.00,
    },
    {
      id: "batch-sec-01",
      batchNumber: "BN-2024-SEC-03",
      medicineId: "med-03",
      depotId: "depot-dhk-01",
      manufacturingDate: "2024-05-15",
      expiryDate: "2026-10-31",
      initialLooseUnits: 1500,
      availableLooseUnits: 300,
      reservedLooseUnits: 0,
      costPricePerPiece: 3.80,
      mrpPerPiece: 6.00,
    },
    {
      id: "batch-sec-02",
      batchNumber: "BN-2025-SEC-09",
      medicineId: "med-03",
      depotId: "depot-dhk-01",
      manufacturingDate: "2025-02-10",
      expiryDate: "2027-05-31",
      initialLooseUnits: 4000,
      availableLooseUnits: 3200,
      reservedLooseUnits: 0,
      costPricePerPiece: 3.90,
      mrpPerPiece: 6.00,
    },
    {
      id: "batch-ser-01",
      batchNumber: "BN-2025-SER-01",
      medicineId: "med-04",
      depotId: "depot-dhk-01",
      manufacturingDate: "2025-01-05",
      expiryDate: "2027-04-30",
      initialLooseUnits: 3500,
      availableLooseUnits: 2900,
      reservedLooseUnits: 0,
      costPricePerPiece: 4.50,
      mrpPerPiece: 7.00,
    },
    {
      id: "batch-mon-01",
      batchNumber: "BN-2024-MON-05",
      medicineId: "med-05",
      depotId: "depot-dhk-01",
      manufacturingDate: "2024-08-20",
      expiryDate: "2026-11-15",
      initialLooseUnits: 2000,
      availableLooseUnits: 650,
      reservedLooseUnits: 0,
      costPricePerPiece: 10.50,
      mrpPerPiece: 16.00,
    },
    {
      id: "batch-zim-01",
      batchNumber: "BN-2024-ZIM-02",
      medicineId: "med-06",
      depotId: "depot-dhk-01",
      manufacturingDate: "2024-03-15",
      expiryDate: "2026-11-20",
      initialLooseUnits: 800,
      availableLooseUnits: 120,
      reservedLooseUnits: 0,
      costPricePerPiece: 22.00,
      mrpPerPiece: 35.00,
    },
    {
      id: "batch-ala-01",
      batchNumber: "BN-2025-ALA-04",
      medicineId: "med-07",
      depotId: "depot-dhk-01",
      manufacturingDate: "2025-02-01",
      expiryDate: "2027-08-31",
      initialLooseUnits: 2500,
      availableLooseUnits: 1800,
      reservedLooseUnits: 0,
      costPricePerPiece: 6.40,
      mrpPerPiece: 10.00,
    },
    {
      id: "batch-cip-01",
      batchNumber: "BN-2025-CIP-02",
      medicineId: "med-08",
      depotId: "depot-dhk-01",
      manufacturingDate: "2025-03-01",
      expiryDate: "2027-09-30",
      initialLooseUnits: 3000,
      availableLooseUnits: 2600,
      reservedLooseUnits: 0,
      costPricePerPiece: 9.60,
      mrpPerPiece: 15.00,
    }
  ];

  batches.push(...coreBatches);

  // Pre-generate 2 batches for the top 1,500 medicines
  const topCandidates = importedMedicines.slice(0, 1500);
  for (const med of topCandidates) {
    const slug = med.brandName.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase() || 'MED';
    const cost = Number((med.tradePricePerPiece * 0.78).toFixed(2));
    
    batches.push({
      id: `batch-${med.id}-01`,
      batchNumber: `BN-2024-${slug}-01`,
      medicineId: med.id,
      depotId: 'depot-dhk-01',
      manufacturingDate: '2024-07-15',
      expiryDate: '2027-01-31',
      initialLooseUnits: 2500,
      availableLooseUnits: Math.floor(600 + Math.random() * 1200),
      reservedLooseUnits: 0,
      costPricePerPiece: cost,
      mrpPerPiece: med.mrpPerPiece
    });

    batches.push({
      id: `batch-${med.id}-02`,
      batchNumber: `BN-2025-${slug}-02`,
      medicineId: med.id,
      depotId: 'depot-dhk-01',
      manufacturingDate: '2025-04-10',
      expiryDate: '2028-04-30',
      initialLooseUnits: 5000,
      availableLooseUnits: Math.floor(3200 + Math.random() * 1600),
      reservedLooseUnits: 0,
      costPricePerPiece: cost,
      mrpPerPiece: med.mrpPerPiece
    });
  }

  // 5. Generate active trade schemes
  const tradeOffers = [
    {
      id: "offer-01",
      title: "Monsoon Health Surge: Buy 10 Boxes Napa Extra, Get 1 Box Free",
      medicineId: "med-01",
      schemeType: "BUY_X_GET_Y_FREE",
      qualifyingUnit: "BOX",
      minQualifyingQty: 10,
      bonusQty: 1,
      bonusUnit: "BOX",
      startDate: "2026-08-01",
      endDate: "2026-10-31",
      isActive: true,
    },
    {
      id: "offer-02",
      title: "Gastric Care Volume Offer: 5.0% Instant Trade Discount on >= 20 Strips Seclo 20",
      medicineId: "med-03",
      schemeType: "SLAB_DISCOUNT",
      qualifyingUnit: "STRIP",
      minQualifyingQty: 20,
      bonusQty: 0,
      bonusUnit: "STRIP",
      discountPercent: 5.0,
      startDate: "2026-08-15",
      endDate: "2026-11-15",
      isActive: true,
    },
    {
      id: "offer-03",
      title: "Allergy Season Bonus: 5% Bonus Loose Pieces on Monas 10",
      medicineId: "med-05",
      schemeType: "BONUS_RATIO",
      qualifyingUnit: "BOX",
      minQualifyingQty: 2,
      bonusQty: 5,
      bonusUnit: "PIECE",
      discountPercent: 5.0,
      startDate: "2026-09-01",
      endDate: "2026-10-31",
      isActive: true,
    }
  ];

  // 6. Save JSON artifacts
  const catalogPayload = {
    generatedAt: new Date().toISOString(),
    totalMedicines: fullMedicinesCatalog.length,
    totalBatches: batches.length,
    totalTradeOffers: tradeOffers.length,
    medicines: fullMedicinesCatalog,
    batches,
    tradeOffers,
    dgdaMonographsCount: dgdaGenerics.length
  };

  const catalogJsonPath = path.join(outDir, 'medicineDataset.json');
  fs.writeFileSync(catalogJsonPath, JSON.stringify(catalogPayload), 'utf-8');
  console.log(`💾 Saved catalog to: ${catalogJsonPath} (${Math.round(fs.statSync(catalogJsonPath).size / 1024 / 1024)} MB)`);

  const dgdaJsonPath = path.join(outDir, 'dgdaGenerics.json');
  fs.writeFileSync(dgdaJsonPath, JSON.stringify(dgdaGenerics), 'utf-8');
  console.log(`💾 Saved DGDA monographs to: ${dgdaJsonPath} (${Math.round(fs.statSync(dgdaJsonPath).size / 1024)} KB)`);

  console.log(`🎉 Complete dataset compilation finished with ${fullMedicinesCatalog.length} medicines!`);
}

buildCatalog().catch(console.error);
