-- Schema per il gestionale Ennesline
-- Database: PostgreSQL (Neon)

-- Tabella Spese
CREATE TABLE IF NOT EXISTS spese (
  id VARCHAR(255) PRIMARY KEY,
  descrizione TEXT NOT NULL,
  importo DECIMAL(10, 2) NOT NULL DEFAULT 0,
  da_pagare DECIMAL(10, 2) NOT NULL DEFAULT 0,
  pagato DECIMAL(10, 2) NOT NULL DEFAULT 0,
  scadenza VARCHAR(20),
  mese VARCHAR(20) NOT NULL,
  anno INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabella Entrate
CREATE TABLE IF NOT EXISTS entrate (
  id VARCHAR(255) PRIMARY KEY,
  cliente TEXT NOT NULL,
  servizio TEXT NOT NULL,
  fatturato DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tipo_pagamento VARCHAR(1) CHECK (tipo_pagamento IN ('B', 'C', 'N', '-')),
  categoria VARCHAR(1),
  macchinario VARCHAR(10),
  info TEXT,
  data VARCHAR(50) NOT NULL,
  mese VARCHAR(20) NOT NULL,
  anno INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indici per migliorare le performance
CREATE INDEX IF NOT EXISTS idx_spese_anno_mese ON spese(anno, mese);
CREATE INDEX IF NOT EXISTS idx_spese_anno ON spese(anno);
CREATE INDEX IF NOT EXISTS idx_entrate_anno_mese ON entrate(anno, mese);
CREATE INDEX IF NOT EXISTS idx_entrate_anno ON entrate(anno);
CREATE INDEX IF NOT EXISTS idx_entrate_categoria ON entrate(categoria);
CREATE INDEX IF NOT EXISTS idx_entrate_macchinario ON entrate(macchinario);
