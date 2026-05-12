import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function fixCategoria() {
  try {
    console.log('Modifica constraint categoria per permettere NULL...');
    
    // Rimuovi il vincolo NOT NULL
    await pool.query(`
      ALTER TABLE entrate 
      ALTER COLUMN categoria DROP NOT NULL;
    `);
    
    console.log('✅ Categoria può ora essere NULL');
    console.log('✅ Il CHECK constraint permette già E, M, P');
    
    // Verifica
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'entrate' AND column_name = 'categoria';
    `);
    
    console.log('Stato colonna categoria:', result.rows[0]);
    
  } catch (error) {
    console.error('Errore:', error);
  } finally {
    await pool.end();
  }
}

fixCategoria();
