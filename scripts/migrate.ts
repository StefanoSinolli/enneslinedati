import { config } from 'dotenv';
import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

// Carica le variabili d'ambiente dal file .env.local
config({ path: join(process.cwd(), '.env.local') });

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL_UNPOOLED,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  console.log('🚀 Connessione al database...');
  
  try {
    // Leggi lo schema SQL
    const schemaPath = join(process.cwd(), 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    
    // Esegui lo schema (dividi per statement)
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    console.log(`📝 Esecuzione di ${statements.length} statement SQL...`);
    
    for (const statement of statements) {
      if (statement.length > 0) {
        await pool.query(statement);
      }
    }
    
    console.log('✅ Schema creato con successo!');
    console.log('');
    console.log('Tabelle create:');
    console.log('  - spese');
    console.log('  - entrate');
    console.log('');
    
    // Verifica le tabelle
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('📊 Tabelle nel database:');
    result.rows.forEach((t: any) => console.log(`  - ${t.table_name}`));
    
    await pool.end();
    
  } catch (error) {
    console.error('❌ Errore durante la migrazione:', error);
    process.exit(1);
  }
}

runMigration();
