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
      const importo = parseFloat(row['PAGATO']?.replace(',', '.') || '0');
      const daPagare = parseFloat(row['DA PAGARE']?.replace(',', '.') || '0');
      
      spese.push({
        id: `spesa-${anno}-${mese}-${index}`,
        descrizione: row['SPESE'],
        importo: importo + daPagare,
        daPagare,
        pagato: importo,
        scadenza: row['SCADENZA'] || undefined,
        mese,
        anno,
      });
    }

    // Processa ENTRATE
    if (row['ENTRATE'] && row['ENTRATE'].trim() !== '' && row['ENTRATE'] !== '-') {
      const fatturato = parseFloat(row['FATTURATO']?.replace(',', '.') || '0');
      
      entrate.push({
        id: `entrata-${anno}-${mese}-${index}`,
        cliente: row['ENTRATE'],
        servizio: row['SERVIZIO'] || '',
        fatturato,
        tipoPagamento: (row['TIPO PAGAMENTO'] as any) || '-',
        categoria: (row['SERVIZIO'] as any) || 'E',
        macchinario: row['MACCHINARI'] as any,
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
  if (!value || value === '-') return 0;
  return parseFloat(value.replace('.', '').replace(',', '.'));
}
