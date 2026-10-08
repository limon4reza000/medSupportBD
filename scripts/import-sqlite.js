/**
 * SQLite Bulk Importer for MedSupplyBD (40,500+ Medicines)
 * Creates the database schema and performs high-speed bulk inserts in batches inside transactions.
 *
 * Usage:
 * npm install better-sqlite3 (or sqlite3)
 * node scripts/import-sqlite.js
 */

const fs = require('fs');
const path = require('path');

async function importToSqlite() {
  let Database;
  try {
    Database = require('better-sqlite3');
  } catch (e) {
    console.log('💡 "better-sqlite3" not found. Falling back to standard sqlite3 or creating a SQL dump script.');
    createSqlDump();
    return;
  }

  const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
  console.log(`Connecting to SQLite database at: ${dbPath}`);
  const db = new Database(dbPath);

  // Enable WAL mode for high write speed
  db.pragma('journal_mode = WAL');

  // Create Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS medicines (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      brand_name TEXT NOT NULL,
      generic_name TEXT NOT NULL,
      strength TEXT,
      dosage_form TEXT NOT NULL,
      manufacturer TEXT NOT NULL,
      description TEXT,
      pieces_per_strip INTEGER DEFAULT 10,
      strips_per_box INTEGER DEFAULT 10,
      mrp_per_piece REAL DEFAULT 0,
      trade_price_per_piece REAL DEFAULT 0,
      vat_percentage REAL DEFAULT 2.4,
      dar_no TEXT,
      dgda_approved INTEGER DEFAULT 1,
      requires_cold_chain INTEGER DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_med_brand ON medicines(brand_name);
    CREATE INDEX IF NOT EXISTS idx_med_generic ON medicines(generic_name);
    CREATE INDEX IF NOT EXISTS idx_med_mfg ON medicines(manufacturer);
  `);

  const datasetPath = path.join(__dirname, '..', 'lib', 'data', 'medicineDataset.json');
  const { medicines } = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));

  console.log(`Inserting ${medicines.length} records in batches...`);

  const insert = db.prepare(`
    INSERT OR REPLACE INTO medicines (
      id, code, brand_name, generic_name, strength, dosage_form, manufacturer,
      description, pieces_per_strip, strips_per_box, mrp_per_piece, trade_price_per_piece,
      vat_percentage, dar_no, dgda_approved, requires_cold_chain
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?
    )
  `);

  const insertMany = db.transaction((rows) => {
    for (const m of rows) {
      insert.run(
        m.id,
        m.code,
        m.brandName,
        m.genericName,
        m.strength,
        m.dosageForm,
        m.manufacturer,
        m.description,
        m.piecesPerStrip || 10,
        m.stripsPerBox || 10,
        m.mrpPerPiece || 0,
        m.tradePricePerPiece || 0,
        m.vatPercentage || 2.4,
        m.darNo,
        m.dgdaApproved ? 1 : 0,
        m.requiresColdChain ? 1 : 0
      );
    }
  });

  const BATCH_SIZE = 1000;
  let count = 0;
  for (let i = 0; i < medicines.length; i += BATCH_SIZE) {
    const chunk = medicines.slice(i, i + BATCH_SIZE);
    insertMany(chunk);
    count += chunk.length;
    console.log(`Inserted ${count}/${medicines.length} rows...`);
  }

  console.log('✅ SQLite import completed successfully!');
}

function createSqlDump() {
  const datasetPath = path.join(__dirname, '..', 'lib', 'data', 'medicineDataset.json');
  const { medicines } = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
  const sqlDumpPath = path.join(__dirname, '..', 'medicine list csv', 'medicines_dump.sql');

  console.log(`Generating SQL dump at: ${sqlDumpPath}...`);
  const lines = [
    'BEGIN TRANSACTION;',
    `CREATE TABLE IF NOT EXISTS medicines (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      brand_name TEXT NOT NULL,
      generic_name TEXT NOT NULL,
      strength TEXT,
      dosage_form TEXT NOT NULL,
      manufacturer TEXT NOT NULL,
      description TEXT,
      pieces_per_strip INTEGER DEFAULT 10,
      strips_per_box INTEGER DEFAULT 10,
      mrp_per_piece REAL DEFAULT 0,
      trade_price_per_piece REAL DEFAULT 0,
      vat_percentage REAL DEFAULT 2.4,
      dar_no TEXT,
      dgda_approved INTEGER DEFAULT 1,
      requires_cold_chain INTEGER DEFAULT 0
    );`
  ];

  for (const m of medicines) {
    const esc = (s) => (s ? `'${String(s).replace(/'/g, "''")}'` : 'NULL');
    lines.push(`INSERT OR REPLACE INTO medicines VALUES (${esc(m.id)}, ${esc(m.code)}, ${esc(m.brandName)}, ${esc(m.genericName)}, ${esc(m.strength)}, ${esc(m.dosageForm)}, ${esc(m.manufacturer)}, ${esc(m.description)}, ${m.piecesPerStrip || 10}, ${m.stripsPerBox || 10}, ${m.mrpPerPiece || 0}, ${m.tradePricePerPiece || 0}, ${m.vatPercentage || 2.4}, ${esc(m.darNo)}, ${m.dgdaApproved ? 1 : 0}, ${m.requiresColdChain ? 1 : 0});`);
  }

  lines.push('COMMIT;');
  fs.writeFileSync(sqlDumpPath, lines.join('\n'), 'utf8');
  console.log(`✅ Generated standalone SQL dump: ${sqlDumpPath} (${(fs.statSync(sqlDumpPath).size / 1024 / 1024).toFixed(2)} MB)`);
}

importToSqlite().catch(console.error);
