const fs = require('fs');
const readline = require('readline');
const path = require('path');

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function mapDosageForm(rawForm) {
  const f = (rawForm || '').toLowerCase();
  if (f.includes('tablet') || f.includes('bolus') || f.includes('chewable') || f.includes('dispersible')) return 'TABLET';
  if (f.includes('capsule') || f.includes('cozycap')) return 'CAPSULE';
  if (f.includes('syrup') || f.includes('suspension') || f.includes('oral liquid') || f.includes('elixir') || f.includes('solution') || f.includes('drops')) return 'SYRUP';
  if (f.includes('injection') || f.includes('infusion')) return 'INJECTION';
  if (f.includes('cream') || f.includes('ointment') || f.includes('gel') || f.includes('lotion')) return 'CREAM_OINTMENT';
  if (f.includes('eye') || f.includes('ear') || f.includes('ophthalmic')) return 'EYE_DROPS';
  if (f.includes('inhal') || f.includes('spray') || f.includes('aerosol') || f.includes('respir')) return 'INHALER';
  return 'TABLET';
}

function extractGenericAndStrength(rawStr) {
  if (!rawStr) return { generic: 'Essential Medicine', strength: 'Standard' };
  
  // Clean raw string
  const cleaned = rawStr.replace(/\s+/g, ' ').trim();
  
  // Look for strength patterns like "500 mg", "20 mg", "500 mg + 65 mg", "125 mg/5 ml"
  const regex = /^(.*?)(?:\s+(\d+(?:\.\d+)?\s*(?:mg|gm|g|ml|mcg|iu|%|vial|ampoule|iu\/ml|mg\/5 ml|mcg\/dose)(?:\s*\+\s*\d+(?:\.\d+)?\s*(?:mg|gm|g|ml|mcg|iu|%))*)\s*)$/i;
  const m = cleaned.match(regex);
  if (m && m[1] && m[2]) {
    return {
      generic: m[1].trim(),
      strength: m[2].trim()
    };
  }
  
  const digitIdx = cleaned.search(/\d/);
  if (digitIdx > 0) {
    return {
      generic: cleaned.substring(0, digitIdx).trim(),
      strength: cleaned.substring(digitIdx).trim()
    };
  }
  
  return {
    generic: cleaned,
    strength: 'Standard'
  };
}

// Estimate realistic B2B price and retail MRP based on therapeutic profile
function estimatePricing(generic, dosageForm, strength) {
  const genLower = (generic || '').toLowerCase();
  let baseMrp = 5.00;

  if (genLower.includes('paracetamol')) {
    baseMrp = 3.00;
  } else if (genLower.includes('omeprazole') || genLower.includes('esomeprazole') || genLower.includes('pantoprazole') || genLower.includes('rabeprazole')) {
    baseMrp = 7.00;
  } else if (genLower.includes('azithromycin') || genLower.includes('cefixime') || genLower.includes('cefpodoxime') || genLower.includes('meropenem')) {
    baseMrp = 35.00;
  } else if (genLower.includes('ciprofloxacin') || genLower.includes('levofloxacin') || genLower.includes('amoxicillin')) {
    baseMrp = 15.00;
  } else if (genLower.includes('montelukast')) {
    baseMrp = 16.00;
  } else if (genLower.includes('cetirizine') || genLower.includes('fexofenadine') || genLower.includes('loratadine') || genLower.includes('bilastine')) {
    baseMrp = 8.00;
  } else if (genLower.includes('metformin') || genLower.includes('gliclazide') || genLower.includes('linagliptin') || genLower.includes('sitagliptin')) {
    baseMrp = 10.00;
  } else if (genLower.includes('amlodipine') || genLower.includes('losartan') || genLower.includes('telmisartan') || genLower.includes('bisoprolol')) {
    baseMrp = 9.00;
  } else if (genLower.includes('calcium') || genLower.includes('vitamin') || genLower.includes('iron')) {
    baseMrp = 8.50;
  } else if (dosageForm === 'INJECTION') {
    baseMrp = 75.00;
  } else if (dosageForm === 'SYRUP') {
    baseMrp = 55.00;
  } else if (dosageForm === 'EYE_DROPS') {
    baseMrp = 85.00;
  } else if (dosageForm === 'CREAM_OINTMENT') {
    baseMrp = 65.00;
  } else if (dosageForm === 'INHALER') {
    baseMrp = 250.00;
  } else {
    baseMrp = 6.50;
  }

  // Adjust for higher strength numbers
  if (strength.includes('1000') || strength.includes('1 gm')) {
    baseMrp *= 1.4;
  } else if (strength.includes('500 mg') && baseMrp < 10) {
    baseMrp = Math.max(baseMrp, 4.0);
  }

  baseMrp = Number(baseMrp.toFixed(2));
  // B2B Trade Price is ~81.6% of MRP (standard ~18.4% trade margin in BD)
  const tradePrice = Number((baseMrp * 0.816).toFixed(2));
  return { mrpPerPiece: baseMrp, tradePricePerPiece: tradePrice };
}

function estimatePackaging(dosageForm) {
  if (dosageForm === 'TABLET' || dosageForm === 'CAPSULE') {
    return { piecesPerStrip: 10, stripsPerBox: 10 };
  } else if (dosageForm === 'SYRUP' || dosageForm === 'INHALER' || dosageForm === 'CREAM_OINTMENT' || dosageForm === 'EYE_DROPS') {
    return { piecesPerStrip: 1, stripsPerBox: 1 };
  } else if (dosageForm === 'INJECTION') {
    return { piecesPerStrip: 1, stripsPerBox: 5 };
  }
  return { piecesPerStrip: 10, stripsPerBox: 10 };
}

module.exports = {
  parseCsvLine,
  mapDosageForm,
  extractGenericAndStrength,
  estimatePricing,
  estimatePackaging
};
