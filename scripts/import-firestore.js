/**
 * Firestore Bulk Importer for MedSupplyBD (40,500+ Medicines)
 * Handles Firestore's 500 write operations per batch limit.
 *
 * Usage:
 * 1. Place your firebase serviceAccountKey.json in the project root (or set GOOGLE_APPLICATION_CREDENTIALS)
 * 2. npm install firebase-admin (if not already installed)
 * 3. Run: node scripts/import-firestore.js
 */

const fs = require('fs');
const path = require('path');

async function importToFirestore() {
  let admin;
  try {
    admin = require('firebase-admin');
  } catch (e) {
    console.error('❌ firebase-admin is not installed. Run: npm install firebase-admin');
    console.log('\nBelow is the code template you can use with your credentials.');
    return;
  }

  const keyPath = path.join(__dirname, '..', 'serviceAccountKey.json');
  if (!fs.existsSync(keyPath) && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error(`❌ serviceAccountKey.json not found at ${keyPath}.`);
    console.error('Please download your service account key from the Firebase Console (Project Settings > Service accounts) and save it as serviceAccountKey.json.');
    return;
  }

  if (fs.existsSync(keyPath)) {
    const serviceAccount = require(keyPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else {
    admin.initializeApp();
  }

  const db = admin.firestore();
  const datasetPath = path.join(__dirname, '..', 'lib', 'data', 'medicineDataset.json');
  const { medicines } = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));

  console.log(`📦 Preparing to bulk import ${medicines.length} medicines into Firestore collection 'medicines'...`);

  const BATCH_SIZE = 450; // Keep slightly below 500 limit for safety
  const collectionRef = db.collection('medicines');
  let batchCount = 0;
  let totalCommitted = 0;

  for (let i = 0; i < medicines.length; i += BATCH_SIZE) {
    const chunk = medicines.slice(i, i + BATCH_SIZE);
    const batch = db.batch();

    for (const med of chunk) {
      const docRef = collectionRef.doc(med.id);
      batch.set(docRef, {
        id: med.id,
        code: med.code,
        brandName: med.brandName,
        genericName: med.genericName,
        strength: med.strength,
        dosageForm: med.dosageForm,
        manufacturer: med.manufacturer,
        description: med.description,
        piecesPerStrip: med.piecesPerStrip,
        stripsPerBox: med.stripsPerBox,
        mrpPerPiece: med.mrpPerPiece,
        tradePricePerPiece: med.tradePricePerPiece,
        vatPercentage: med.vatPercentage,
        darNo: med.darNo,
        dgdaApproved: med.dgdaApproved,
        requiresColdChain: med.requiresColdChain,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    }

    await batch.commit();
    batchCount++;
    totalCommitted += chunk.length;
    console.log(`✅ Batch ${batchCount} committed: ${totalCommitted}/${medicines.length} records written.`);
  }

  console.log(`🎉 Successfully imported all ${totalCommitted} medicines into Firestore!`);
}

importToFirestore().catch(console.error);
