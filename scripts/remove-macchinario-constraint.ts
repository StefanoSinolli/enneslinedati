import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function removeMacchinarioConstraint() {
  try {
    console.log('Rimozione CHECK constraint su macchinario...');
    
    // Rimuovi il CHECK constraint
    await pool.query(`
      ALTER TABLE entrate 
      DROP CONSTRAINT IF EXISTS entrate_macchinario_check;
    `);
    
    console.log('✅ CHECK constraint su macchinario rimosso');
    console.log('✅ Macchinario ora accetta qualsiasi valore o NULL');
    
  } catch (error) {
    console.error('Errore:', error);
  } finally {
    await pool.end();
  }
}

removeMacchinarioConstraint();
