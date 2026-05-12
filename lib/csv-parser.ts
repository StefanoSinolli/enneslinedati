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
      const pagatoRaw = row['PAGATO']?.trim();
      const pagatoValue = (pagatoRaw === '-' || !pagatoRaw) ? '0' : pagatoRaw.replace(',', '.');
      
      const daPagareRaw = row['DA PAGARE']?.trim();
      const daPagareValue = (daPagareRaw === '-' || !daPagareRaw) ? '0' : daPagareRaw.replace(',', '.');
      
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

    // Processa ENTRATE - controlla se c'è almeno un dato entrata (fatturato o cliente)
    const fatturatoRaw = row['FATTURATO']?.trim();
    const fatturatoValue = (fatturatoRaw === '-' || !fatturatoRaw) ? '0' : fatturatoRaw.replace(',', '.');
    const fatturato = parseFloat(fatturatoValue) || 0;
    const clienteValue = row['ENTRATE']?.trim();
    
    // Importa l'entrata se c'è un cliente O se c'è un fatturato
    if ((clienteValue && clienteValue !== '-') || fatturato > 0) {
      // Se il cliente è vuoto o "-", usa "Cliente Ignoto"
      const cliente = (clienteValue && clienteValue !== '-') ? clienteValue : 'Cliente Ignoto';
      
      // Converti "-" in null per categoria, e mappa i codici macchinario
      const categoriaValue = row['SERVIZIO']?.trim();
      let categoria: string | null = null;
      
      if (categoriaValue && categoriaValue !== '-') {
        // Mappa i codici macchinario → M (Macchinari)
        if (['L', 'RF', 'C', 'PS', 'PRESSO'].includes(categoriaValue)) {
          categoria = 'M';
        } 
        // Categorie valide: E, M, P
        else if (['E', 'M', 'P'].includes(categoriaValue)) {
          categoria = categoriaValue;
        }
        // Altro → null
        else {
          categoria = null;
        }
      }
      
      // Converti "-" e valori vuoti in null per macchinario
      const macchinarioValue = row['MACCHINARI']?.trim();
      const macchinario = (macchinarioValue === '-' || !macchinarioValue) ? null : macchinarioValue;
      
      // Gestisci servizio: "-" o vuoto → stringa vuota
      const servizioValue = row['Info']?.trim();
      const servizio = (servizioValue === '-' || !servizioValue) ? '' : servizioValue;
      
      // Gestisci tipo pagamento: vuoto o "-" → "-"
      const tipoPagamentoValue = row['TIPO PAGAMENTO']?.trim();
      const tipoPagamento = (!tipoPagamentoValue || tipoPagamentoValue === '-') ? '-' : tipoPagamentoValue;
      
      entrate.push({
        id: `entrata-${anno}-${mese}-${index}`,
        cliente: cliente,
        servizio: servizio,
        fatturato: fatturato,
        tipoPagamento: tipoPagamento as any,
        categoria: categoria as any,  // La categoria (E/M/P) è nella colonna "SERVIZIO"
        macchinario: macchinario as any,
        info: servizio || undefined,
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
