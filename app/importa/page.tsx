'use client';

import { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { LocalDB } from '@/lib/database';
import { parseCSVSpese } from '@/lib/csv-parser';

export default function ImportaPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{spese: number, entrate: number} | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, anno: number, mese: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setSuccess(null);
    setStats(null);

    try {
      const text = await file.text();
      const { spese, entrate } = parseCSVSpese(text, mese, anno);

      // Salva i dati
      const speseEsistenti = LocalDB.getSpeseAll();
      const entrateEsistenti = LocalDB.getEntrateAll();

      // Rimuovi dati esistenti per questo mese/anno per evitare duplicati
      const speseFiltered = speseEsistenti.filter(s => !(s.anno === anno && s.mese === mese));
      const entrateFiltered = entrateEsistenti.filter(e => !(e.anno === anno && e.mese === mese));

      LocalDB.saveSpeseAll([...speseFiltered, ...spese]);
      LocalDB.saveEntrateAll([...entrateFiltered, ...entrate]);

      setSuccess(`Importazione completata: ${mese} ${anno}`);
      setStats({ spese: spese.length, entrate: entrate.length });
    } catch (err) {
      setError(`Errore durante l'importazione: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    let totalSpese = 0;
    let totalEntrate = 0;

    try {
      for (const file of Array.from(files)) {
        // Estrai mese e anno dal nome del file
        // Formato: "GENNAIO 2024-GENNAIO 2024.csv"
        const match = file.name.match(/([A-Z]+)\s+(\d{4})/);
        if (!match) {
          console.warn(`Nome file non valido: ${file.name}`);
          continue;
        }

        const mese = match[1];
        const anno = parseInt(match[2]);

        const text = await file.text();
        const { spese, entrate } = parseCSVSpese(text, mese, anno);

        // Salva i dati
        const speseEsistenti = LocalDB.getSpeseAll();
        const entrateEsistenti = LocalDB.getEntrateAll();

        const speseFiltered = speseEsistenti.filter(s => !(s.anno === anno && s.mese === mese));
        const entrateFiltered = entrateEsistenti.filter(e => !(e.anno === anno && e.mese === mese));

        LocalDB.saveSpeseAll([...speseFiltered, ...spese]);
        LocalDB.saveEntrateAll([...entrateFiltered, ...entrate]);

        totalSpese += spese.length;
        totalEntrate += entrate.length;
      }

      setSuccess(`Importazione completata: ${files.length} file processati`);
      setStats({ spese: totalSpese, entrate: totalEntrate });
    } catch (err) {
      setError(`Errore durante l'importazione: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = () => {
    if (confirm('Sei sicuro di voler eliminare tutti i dati? Questa azione non può essere annullata.')) {
      LocalDB.clearAll();
      setSuccess('Tutti i dati sono stati eliminati');
      setStats(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Importa Dati CSV</h1>
        <p className="text-gray-600 mt-1">Carica i tuoi file CSV per popolare il gestionale</p>
      </div>

      {/* Messaggi di feedback */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
          <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-green-800 font-medium">{success}</p>
            {stats && (
              <p className="text-green-700 text-sm mt-1">
                {stats.spese} spese e {stats.entrate} entrate importate
              </p>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Card importazione multipla */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
        <div className="flex items-center mb-4">
          <Upload className="w-6 h-6 text-purple-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Importazione Multipla</h2>
        </div>
        <p className="text-gray-600 mb-4">
          Seleziona più file CSV contemporaneamente. Il sistema riconoscerà automaticamente il mese e l'anno dal nome del file.
        </p>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
          <input
            type="file"
            accept=".csv"
            multiple
            onChange={handleBatchImport}
            className="hidden"
            id="batch-upload"
            disabled={loading}
          />
          <label htmlFor="batch-upload" className="cursor-pointer">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-700 font-medium mb-1">
              {loading ? 'Caricamento in corso...' : 'Clicca per selezionare i file CSV'}
            </p>
            <p className="text-sm text-gray-500">Formato: MESE ANNO-MESE ANNO.csv</p>
          </label>
        </div>
      </div>

      {/* Card importazione singola per mese/anno */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Importazione Singola</h2>
        <p className="text-gray-600 mb-4">Carica file CSV specifici per mese e anno:</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[2024, 2025, 2026].map(anno => (
            <div key={anno} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Anno {anno}</h3>
              <div className="space-y-2">
                {['GENNAIO', 'FEBBRAIO', 'MARZO', 'APRILE', 'MAGGIO', 'GIUGNO', 
                  'LUGLIO', 'AGOSTO', 'SETTEMBRE', 'OTTOBRE', 'NOVEMBRE', 'DICEMBRE'].map(mese => (
                  <div key={mese} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{mese.substring(0, 3)}</span>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => handleFileUpload(e, anno, mese)}
                      className="hidden"
                      id={`upload-${anno}-${mese}`}
                      disabled={loading}
                    />
                    <label
                      htmlFor={`upload-${anno}-${mese}`}
                      className="cursor-pointer text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded hover:bg-purple-100 transition-colors"
                    >
                      Carica
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Utility */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Utility</h2>
        <button
          onClick={handleClearData}
          className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors font-medium"
        >
          Elimina Tutti i Dati
        </button>
        <p className="text-sm text-gray-500 mt-2">
          Attenzione: questa azione eliminerà permanentemente tutti i dati importati.
        </p>
      </div>
    </div>
  );
}
