import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function fixMacchinarioConstraint() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔧 Rimuovendo il vecchio constraint...');
    await pool.query(`
      ALTER TABLE entrate DROP CONSTRAINT IF EXISTS entrate_macchinario_check;
    `);
    console.log('✅ Vecchio constraint rimosso!');
    
    console.log('🔧 Aggiungendo il nuovo constraint...');
    await pool.query(`
      ALTER TABLE entrate ADD CONSTRAINT entrate_macchinario_check 
      CHECK (macchinario IN ('L', 'RF', 'C', 'PRESSO', 'E', 'P', 'M') OR macchinario IS NULL);
    `);
    console.log('✅ Nuovo constraint aggiunto!');
    
    console.log('🎉 Modifica completata!');
  } catch (error) {
    console.error('❌ Errore:', error);
  } finally {
    await pool.end();
  }
}

fixMacchinarioConstraint();
