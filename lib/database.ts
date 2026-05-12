'use client';

import { Spesa, Entrata, ResocontoMensile } from '@/types';

// Database usando API + PostgreSQL (Neon)
export class LocalDB {
  // SPESE
  static async getSpeseAll(): Promise<Spesa[]> {
    try {
      const res = await fetch('/api/spese');
      if (!res.ok) throw new Error('Errore nel caricamento spese');
      return await res.json();
    } catch (error) {
      console.error('Errore getSpeseAll:', error);
      return [];
    }
  }

  static async saveSpesa(spesa: Spesa): Promise<void> {
    try {
      // Verifica se la spesa esiste già
      const existing = await fetch(`/api/spese/${spesa.id}`);
      const isUpdate = existing.ok;

      if (isUpdate) {
        // Update
        const res = await fetch(`/api/spese/${spesa.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(spesa),
        });
        if (!res.ok) throw new Error('Errore aggiornamento spesa');
      } else {
        // Create
        const res = await fetch('/api/spese', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(spesa),
        });
        if (!res.ok) throw new Error('Errore creazione spesa');
      }
    } catch (error) {
      console.error('Errore saveSpesa:', error);
      throw error;
    }
  }

  static async saveSpeseAll(spese: Spesa[]): Promise<void> {
    try {
      for (const spesa of spese) {
        await this.saveSpesa(spesa);
      }
    } catch (error) {
      console.error('Errore saveSpeseAll:', error);
      throw error;
    }
  }

  static async deleteSpesa(id: string): Promise<void> {
    try {
      const res = await fetch(`/api/spese/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Errore eliminazione spesa');
    } catch (error) {
      console.error('Errore deleteSpesa:', error);
      throw error;
    }
  }

  // ENTRATE
  static async getEntrateAll(): Promise<Entrata[]> {
    try {
      const res = await fetch('/api/entrate');
      if (!res.ok) throw new Error('Errore nel caricamento entrate');
      return await res.json();
    } catch (error) {
      console.error('Errore getEntrateAll:', error);
      return [];
    }
  }

  static async saveEntrata(entrata: Entrata): Promise<void> {
    try {
      // Verifica se l'entrata esiste già
      const existing = await fetch(`/api/entrate/${entrata.id}`);
      const isUpdate = existing.ok;

      if (isUpdate) {
        // Update
        const res = await fetch(`/api/entrate/${entrata.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entrata),
        });
        if (!res.ok) throw new Error('Errore aggiornamento entrata');
      } else {
        // Create
        const res = await fetch('/api/entrate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entrata),
        });
        if (!res.ok) {
          const errorData = await res.json();
          console.error('Errore API creazione entrata:', errorData);
          throw new Error(`Errore creazione entrata: ${errorData.details || errorData.error}`);
        }
      }
    } catch (error) {
      console.error('Errore saveEntrata:', error);
      throw error;
    }
  }

  static async saveEntrateAll(entrate: Entrata[]): Promise<void> {
    try {
      for (const entrata of entrate) {
        await this.saveEntrata(entrata);
      }
    } catch (error) {
      console.error('Errore saveEntrateAll:', error);
      throw error;
    }
  }

  static async deleteEntrata(id: string): Promise<void> {
    try {
      const res = await fetch(`/api/entrate/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Errore eliminazione entrata');
    } catch (error) {
      console.error('Errore deleteEntrata:', error);
      throw error;
    }
  }

  // FILTRI
  static async getSpeseByAnno(anno: number): Promise<Spesa[]> {
    try {
      const res = await fetch(`/api/spese?anno=${anno}`);
      if (!res.ok) throw new Error('Errore nel caricamento spese per anno');
      return await res.json();
    } catch (error) {
      console.error('Errore getSpeseByAnno:', error);
      return [];
    }
  }

  static async getSpeseByMese(anno: number, mese: string): Promise<Spesa[]> {
    const spese = await this.getSpeseByAnno(anno);
    return spese.filter(s => s.mese === mese);
  }

  static async getEntrateByAnno(anno: number): Promise<Entrata[]> {
    try {
      const res = await fetch(`/api/entrate?anno=${anno}`);
      if (!res.ok) throw new Error('Errore nel caricamento entrate per anno');
      return await res.json();
    } catch (error) {
      console.error('Errore getEntrateByAnno:', error);
      return [];
    }
  }

  static async getEntrateByMese(anno: number, mese: string): Promise<Entrata[]> {
    const entrate = await this.getEntrateByAnno(anno);
    return entrate.filter(e => e.mese === mese);
  }

  // CALCOLI
  static async calcolaResocontoMensile(anno: number, mese: string): Promise<ResocontoMensile> {
    const spese = await this.getSpeseByMese(anno, mese);
    const entrate = await this.getEntrateByMese(anno, mese);

    const totaleSpese = spese.reduce((sum, s) => sum + s.daPagare, 0);  // Totale = somma daPagare
    const totalePagato = spese.reduce((sum, s) => sum + s.pagato, 0);
    const totaleDaPagare = totaleSpese - totalePagato;  // Rimanente = Totale - Pagato

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
  static async clearAll(): Promise<void> {
    try {
      const spese = await this.getSpeseAll();
      const entrate = await this.getEntrateAll();

      // Elimina tutte le spese
      for (const spesa of spese) {
        await this.deleteSpesa(spesa.id);
      }

      // Elimina tutte le entrate
      for (const entrata of entrate) {
        await this.deleteEntrata(entrata.id);
      }
    } catch (error) {
      console.error('Errore clearAll:', error);
      throw error;
    }
  }
}
