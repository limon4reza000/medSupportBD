const fs = require('fs');
const path = require('path');

const datasetPath = path.join(__dirname, '..', 'lib', 'data', 'medicineDataset.json');
const outDir = path.join(__dirname, '..', 'medicine list csv');

if (!fs.existsSync(datasetPath)) {
  console.error('medicineDataset.json not found. Run scripts/build-medicine-catalog.js first.');
  process.exit(1);
}

console.log('Loading cleaned dataset...');
const raw = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
const medicines = raw.medicines || [];

console.log(`Loaded ${medicines.length} clean medicine records.`);

// Helper to escape CSV cell
function escapeCsv(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

const csvHeader = [
  'id',
  'code',
  'brand_name',
  'generic_name',
  'strength',
  'dosage_form',
  'company',
  'dar_no',
  'mrp_per_piece',
  'trade_price_per_piece',
  'pieces_per_strip',
  'strips_per_box',
  'dgda_approved',
  'requires_cold_chain'
].join(',');

function toCsvRow(m) {
  return [
    escapeCsv(m.id),
    escapeCsv(m.code),
    escapeCsv(m.brandName),
    escapeCsv(m.genericName),
    escapeCsv(m.strength),
    escapeCsv(m.dosageForm),
    escapeCsv(m.manufacturer),
    escapeCsv(m.darNo),
    m.mrpPerPiece !== undefined ? m.mrpPerPiece : 0,
    m.tradePricePerPiece !== undefined ? m.tradePricePerPiece : 0,
    m.piecesPerStrip || 10,
    m.stripsPerBox || 10,
    m.dgdaApproved ? 'true' : 'false',
    m.requiresColdChain ? 'true' : 'false'
  ].join(',');
}

// 1. Write full clean CSV
const fullCsvPath = path.join(outDir, 'cleaned_medicine_catalog.csv');
const fullRows = [csvHeader, ...medicines.map(toCsvRow)];
fs.writeFileSync(fullCsvPath, fullRows.join('\n'), 'utf8');
console.log(`✅ Generated full CSV: ${fullCsvPath} (${(fs.statSync(fullCsvPath).size / 1024 / 1024).toFixed(2)} MB)`);

// 2. Write split CSVs in 3 parts (~14,000 rows each)
const chunkSize = Math.ceil(medicines.length / 3);
for (let i = 0; i < 3; i++) {
  const start = i * chunkSize;
  const end = Math.min(start + chunkSize, medicines.length);
  const chunkMeds = medicines.slice(start, end);
  const partPath = path.join(outDir, `cleaned_medicines_part${i + 1}.csv`);
  const chunkRows = [csvHeader, ...chunkMeds.map(toCsvRow)];
  fs.writeFileSync(partPath, chunkRows.join('\n'), 'utf8');
  console.log(`✅ Part ${i + 1} (${chunkMeds.length} rows): ${partPath} (${(fs.statSync(partPath).size / 1024 / 1024).toFixed(2)} MB)`);
}

console.log('🎉 Clean export completed successfully!');
