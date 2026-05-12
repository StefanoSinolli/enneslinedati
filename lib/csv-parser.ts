import Papa from 'papaparse';
import { Spesa, Entrata } from '@/types';

export interface CSVRow {
  [key: string]: string;
}

// Funzione per parsare i CSV delle spese mensili
export function parseCSVSpese(csvText: string, mese: string, anno: number): { spese: Spesa[], entrate: Entrata[] } {
  const result = Papa.parse<CSVRow>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const spese: Spesa[] = [];
  const entrate: Entrata[] = [];

  result.data.forEach((row, index) => {
    // Processa SPESE
    if (row['SPESE'] && row['SPESE'].trim() !== '') {
      const pagatoValue = row['PAGATO']?.replace(',', '.') || '0';
      const daPagareValue = row['DA PAGARE']?.replace(',', '.') || '0';
      
      const pagato = parseFloat(pagatoValue) || 0;
      const daPagare = parseFloat(daPagareValue) || 0;
      
      spese.push({
        id: `spesa-${anno}-${mese}-${index}`,
        descrizione: row['SPESE'],
        importo: daPagare,  // Importo = daPagare (totale della spesa)
        daPagare: daPagare,
        pagato: pagato,
        scadenza: row['SCADENZA'] || undefined,
        mese,
        anno,
      });
    }

    // Processa ENTRATE
    if (row['ENTRATE'] && row['ENTRATE'].trim() !== '' && row['ENTRATE'] !== '-') {
      const fatturatoValue = row['FATTURATO']?.replace(',', '.') || '0';
      const fatturato = parseFloat(fatturatoValue) || 0;
      
      // Converti "-" in null per categoria
      const categoriaValue = row['SERVIZIO']?.trim();
      const categoria = (categoriaValue === '-' || !categoriaValue) ? null : categoriaValue;
      
      // Converti "-" e valori vuoti in null per macchinario
      const macchinarioValue = row['MACCHINARI']?.trim();
      const macchinario = (macchinarioValue === '-' || !macchinarioValue) ? null : macchinarioValue;
      
      entrate.push({
        id: `entrata-${anno}-${mese}-${index}`,
        cliente: row['ENTRATE'],
        servizio: row['Info'] || '',  // Il servizio vero è nella colonna "Info"
        fatturato: fatturato || 0,
        tipoPagamento: (row['TIPO PAGAMENTO'] as any) || '-',
        categoria: categoria as any,  // La categoria (E/M/P) è nella colonna "SERVIZIO"
        macchinario: macchinario as any,
        info: row['Info'] || undefined,
        data: `${mese} ${anno}`,
        mese,
        anno,
      });
    }
  });

  return { spese, entrate };
}

// Funzione per parsare il resoconto annuale
export function parseCSVResoconto(csvText: string) {
  const result = Papa.parse<CSVRow>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  return result.data;
}

// Funzione helper per convertire numero con virgola
export function parseItalianNumber(value: string): number {
  if (!value || value === '-' || value.trim() === '') return 0;
  const parsed = parseFloat(value.replace('.', '').replace(',', '.'));
  return isNaN(parsed) ? 0 : parsed;
}
