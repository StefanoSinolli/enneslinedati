// Tipi per il gestionale Ennesline

export type TipoPagamento = 'B' | 'C' | 'N'; // Bancomat, Contanti, Altro
export type CategoriaServizio = 'E' | 'M' | 'P'; // Estetica, Macchinari, Prodotti
export type TipoMacchinario = 'L' | 'RF' | 'C' | 'PRESSO'; // Laser, Radiofrequenza, Cellutrim, Presso

export interface Spesa {
  id: string;
  descrizione: string;
  importo: number;
  daPagare: number;
  pagato: number;
  scadenza?: string;
  mese: string;
  anno: number;
}

export interface Entrata {
  id: string;
  cliente: string;
  servizio: string;
  fatturato: number;
  tipoPagamento: TipoPagamento | '-';
  categoria: CategoriaServizio;
  macchinario?: TipoMacchinario;
  info?: string;
  data: string;
  mese: string;
  anno: number;
}

export interface ResocontoMensile {
  mese: string;
  anno: number;
  totaleSpese: number;
  totalePagato: number;
  totaleDaPagare: number;
  totaleEntrate: number;
  entrateB: number;
  entrateC: number;
  entrateN: number;
  entrateProdotti: number;
  entrateEstetica: number;
  entrateMacchinari: number;
  fatturato: number;
  clientiNuovi: number;
  appuntamenti: number;
}

export interface StatisticheLaser {
  laser: number;
  cellutrim: number;
  rf: number;
  presso: number;
}
