import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function fixDateColumns() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔧 Modificando il tipo della colonna scadenza (spese) a VARCHAR(20)...');
    
    await pool.query(`
      ALTER TABLE spese ALTER COLUMN scadenza TYPE VARCHAR(20);
    `);
    
    console.log('✅ Colonna scadenza modificata!');
    
    console.log('🔧 Modificando il tipo della colonna data (entrate) a VARCHAR(50)...');
    
    await pool.query(`
      ALTER TABLE entrate ALTER COLUMN data TYPE VARCHAR(50);
    `);
    
    console.log('✅ Colonna data modificata!');
    console.log('🎉 Tutte le modifiche completate!');
  } catch (error) {
    console.error('❌ Errore:', error);
  } finally {
    await pool.end();
  }
}

fixDateColumns();
