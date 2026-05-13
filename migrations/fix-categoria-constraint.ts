import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.ennes_POSTGRES_URL!);

async function fixCategoriaConstraint() {
  try {
    console.log('Rimozione CHECK constraint su categoria...');
    
    await sql`
      ALTER TABLE entrate 
      DROP CONSTRAINT IF EXISTS entrate_categoria_check
    `;
    
    console.log('✅ Constraint rimosso! Categoria può ora essere NULL.');
    
  } catch (error) {
    console.error('❌ Errore durante la migrazione:', error);
    throw error;
  }
}

fixCategoriaConstraint();
