'use client';

import { Spesa, Entrata, ResocontoMensile } from '@/types';

const STORAGE_KEYS = {
  SPESE: 'ennesline_spese',
  ENTRATE: 'ennesline_entrate',
  RESOCONTI: 'ennesline_resoconti',
};

// Database locale usando localStorage
export class LocalDB {
  // SPESE
  static getSpeseAll(): Spesa[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.SPESE);
    return data ? JSON.parse(data) : [];
  }

  static saveSpesa(spesa: Spesa) {
    const spese = this.getSpeseAll();
    const index = spese.findIndex(s => s.id === spesa.id);
    if (index >= 0) {
      spese[index] = spesa;
    } else {
      spese.push(spesa);
    }
    localStorage.setItem(STORAGE_KEYS.SPESE, JSON.stringify(spese));
  }

  static saveSpeseAll(spese: Spesa[]) {
    localStorage.setItem(STORAGE_KEYS.SPESE, JSON.stringify(spese));
  }

  static deleteSpesa(id: string) {
    const spese = this.getSpeseAll().filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SPESE, JSON.stringify(spese));
  }

  // ENTRATE
  static getEntrateAll(): Entrata[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.ENTRATE);
    return data ? JSON.parse(data) : [];
  }

  static saveEntrata(entrata: Entrata) {
    const entrate = this.getEntrateAll();
    const index = entrate.findIndex(e => e.id === entrata.id);
    if (index >= 0) {
      entrate[index] = entrata;
    } else {
      entrate.push(entrata);
    }
    localStorage.setItem(STORAGE_KEYS.ENTRATE, JSON.stringify(entrate));
  }

  static saveEntrateAll(entrate: Entrata[]) {
    localStorage.setItem(STORAGE_KEYS.ENTRATE, JSON.stringify(entrate));
  }

  static deleteEntrata(id: string) {
    const entrate = this.getEntrateAll().filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.ENTRATE, JSON.stringify(entrate));
  }

  // FILTRI
  static getSpeseByAnno(anno: number): Spesa[] {
    return this.getSpeseAll().filter(s => s.anno === anno);
  }

  static getSpeseByMese(anno: number, mese: string): Spesa[] {
    return this.getSpeseAll().filter(s => s.anno === anno && s.mese === mese);
  }

  static getEntrateByAnno(anno: number): Entrata[] {
    return this.getEntrateAll().filter(e => e.anno === anno);
  }

  static getEntrateByMese(anno: number, mese: string): Entrata[] {
    return this.getEntrateAll().filter(e => e.anno === anno && e.mese === mese);
  }

  // CALCOLI
  static calcolaResocontoMensile(anno: number, mese: string): ResocontoMensile {
    const spese = this.getSpeseByMese(anno, mese);
    const entrate = this.getEntrateByMese(anno, mese);

    const totaleSpese = spese.reduce((sum, s) => sum + s.importo, 0);
    const totalePagato = spese.reduce((sum, s) => sum + s.pagato, 0);
    const totaleDaPagare = spese.reduce((sum, s) => sum + s.daPagare, 0);

    const totaleEntrate = entrate.reduce((sum, e) => sum + (e.fatturato || 0), 0);
    const entrateB = entrate.filter(e => e.tipoPagamento === 'B').reduce((sum, e) => sum + (e.fatturato || 0), 0);
    const entrateC = entrate.filter(e => e.tipoPagamento === 'C').reduce((sum, e) => sum + (e.fatturato || 0), 0);
    const entrateN = entrate.filter(e => e.tipoPagamento === 'N').reduce((sum, e) => sum + (e.fatturato || 0), 0);

    const entrateProdotti = entrate.filter(e => e.categoria === 'P').reduce((sum, e) => sum + (e.fatturato || 0), 0);
    const entrateEstetica = entrate.filter(e => e.categoria === 'E').reduce((sum, e) => sum + (e.fatturato || 0), 0);
    const entrateMacchinari = entrate.filter(e => e.categoria === 'M').reduce((sum, e) => sum + (e.fatturato || 0), 0);

    return {
      mese,
      anno,
      totaleSpese,
      totalePagato,
      totaleDaPagare,
      totaleEntrate,
      entrateB,
      entrateC,
      entrateN,
      entrateProdotti,
      entrateEstetica,
      entrateMacchinari,
      fatturato: totaleEntrate,
      clientiNuovi: 0, // Da implementare se necessario
      appuntamenti: entrate.length,
    };
  }

  // UTILITY
  static clearAll() {
    localStorage.removeItem(STORAGE_KEYS.SPESE);
    localStorage.removeItem(STORAGE_KEYS.ENTRATE);
    localStorage.removeItem(STORAGE_KEYS.RESOCONTI);
  }
}
