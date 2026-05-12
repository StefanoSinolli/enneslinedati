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
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
    fileName: string;
    recordsProcessed: number;
  } | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, anno: number, mese: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setSuccess(null);
    setStats(null);
    setProgress({ current: 0, total: 1, fileName: file.name, recordsProcessed: 0 });

    try {
      const text = await file.text();
      const { spese, entrate } = parseCSVSpese(text, mese, anno);

      setProgress({ current: 0, total: 1, fileName: file.name, recordsProcessed: spese.length + entrate.length });

      // Merge dei dati: aggiorna se esiste, crea se nuovo
      await LocalDB.saveSpeseAll(spese);
      await LocalDB.saveEntrateAll(entrate);

      setProgress({ current: 1, total: 1, fileName: file.name, recordsProcessed: spese.length + entrate.length });
      setSuccess(`Importazione completata: ${mese} ${anno} (merge)`);
      setStats({ spese: spese.length, entrate: entrate.length });
    } catch (err) {
      setError(`Errore durante l'importazione: ${err}`);
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(null), 2000); // Nascondi dopo 2 secondi
    }
  };

  const handleBatchImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    setError(null);
    setSuccess(null);
    setProgress(null);

    let totalSpese = 0;
    let totalEntrate = 0;
    const filesArray = Array.from(files);

    try {
      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];
        
        // Estrai mese e anno dal nome del file
        // Formato: "GENNAIO 2024-GENNAIO 2024.csv"
        const match = file.name.match(/([A-Z]+)\s+(\d{4})/);
        if (!match) {
          console.warn(`Nome file non valido: ${file.name}`);
          continue;
        }

        const mese = match[1];
        const anno = parseInt(match[2]);

        setProgress({ 
          current: i, 
          total: filesArray.length, 
          fileName: file.name, 
          recordsProcessed: totalSpese + totalEntrate 
        });

        const text = await file.text();
        const { spese, entrate } = parseCSVSpese(text, mese, anno);

        // Merge dei dati: aggiorna se esiste, crea se nuovo
        await LocalDB.saveSpeseAll(spese);
        await LocalDB.saveEntrateAll(entrate);

        totalSpese += spese.length;
        totalEntrate += entrate.length;
        
        setProgress({ 
          current: i + 1, 
          total: filesArray.length, 
          fileName: file.name, 
          recordsProcessed: totalSpese + totalEntrate 
        });
      }

      setSuccess(`Importazione completata: ${filesArray.length} file processati (merge)`);
      setStats({ spese: totalSpese, entrate: totalEntrate });
    } catch (err) {
      setError(`Errore durante l'importazione: ${err}`);
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(null), 2000); // Nascondi dopo 2 secondi
    }
  };

  const handleClearData = async () => {
    if (confirm('Sei sicuro di voler eliminare tutti i dati? Questa azione non può essere annullata.')) {
      await LocalDB.clearAll();
      setSuccess('Tutti i dati sono stati eliminati');
      setStats(null);
    }
  };

  const handleDeleteMonth = async (anno: number, mese: string) => {
    if (confirm(`Sei sicuro di voler eliminare TUTTI i dati di ${mese} ${anno}? Questa azione non può essere annullata.`)) {
      setLoading(true);
      setError(null);
      setSuccess(null);

      try {
        await LocalDB.deleteSpeseByMese(anno, mese);
        await LocalDB.deleteEntrateByMese(anno, mese);
        setSuccess(`Dati di ${mese} ${anno} eliminati con successo`);
      } catch (err) {
        setError(`Errore durante l'eliminazione: ${err}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleExportData = async () => {
    try {
      const spese = await LocalDB.getSpeseAll();
      const entrate = await LocalDB.getEntrateAll();
      
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        data: {
          spese,
          entrate,
        },
        stats: {
          totalSpese: spese.length,
          totalEntrate: entrate.length,
        }
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ennesline-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccess(`Esportati ${spese.length} spese e ${entrate.length} entrate`);
    } catch (err) {
      setError(`Errore durante l'esportazione: ${err}`);
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const text = await file.text();
      const importData = JSON.parse(text);

      if (!importData.data || !importData.data.spese || !importData.data.entrate) {
        throw new Error('Formato file non valido');
      }

      await LocalDB.saveSpeseAll(importData.data.spese);
      await LocalDB.saveEntrateAll(importData.data.entrate);

      setSuccess(`Importati con successo ${importData.data.spese.length} spese e ${importData.data.entrate.length} entrate`);
      setStats({
        spese: importData.data.spese.length,
        entrate: importData.data.entrate.length,
      });
    } catch (err) {
      setError(`Errore durante l'importazione JSON: ${err}`);
    } finally {
      setLoading(false);
      // Reset input
      event.target.value = '';
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

      {/* Progress bar */}
      {progress && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-blue-900 font-medium">
              Importazione in corso... {progress.current}/{progress.total}
            </p>
            <p className="text-blue-700 text-sm">
              {Math.round((progress.current / progress.total) * 100)}%
            </p>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            ></div>
          </div>
          <p className="text-blue-700 text-sm">
            📄 {progress.fileName} • {progress.recordsProcessed} record processati
          </p>
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
          {[2023, 2024, 2025, 2026].map(anno => (
            <div key={anno} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Anno {anno}</h3>
              <div className="space-y-2">
                {['GENNAIO', 'FEBBRAIO', 'MARZO', 'APRILE', 'MAGGIO', 'GIUGNO', 
                  'LUGLIO', 'AGOSTO', 'SETTEMBRE', 'OTTOBRE', 'NOVEMBRE', 'DICEMBRE'].map(mese => (
                  <div key={mese} className="flex items-center justify-between gap-2">
                    <span className="text-sm text-gray-600 w-12">{mese.substring(0, 3)}</span>
                    <div className="flex gap-1">
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
                      <button
                        onClick={() => handleDeleteMonth(anno, mese)}
                        disabled={loading}
                        className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100 transition-colors disabled:opacity-50"
                        title={`Elimina tutti i dati di ${mese} ${anno}`}
                      >
                        🗑️
                      </button>
                    </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Export/Import */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Backup e Sincronizzazione</h3>
            <div className="space-y-2">
              <button
                onClick={handleExportData}
                className="w-full bg-green-50 text-green-600 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors font-medium"
              >
                📥 Esporta Tutti i Dati (JSON)
              </button>
              <div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                  id="import-json"
                  disabled={loading}
                />
                <label
                  htmlFor="import-json"
                  className="w-full block text-center bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium cursor-pointer"
                >
                  📤 Importa Dati da JSON
                </label>
              </div>
            </div>
          </div>

          {/* Verifica e Cancella */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Gestione Dati</h3>
            <div className="space-y-2">
              <button
                onClick={async () => {
                  const spese = await LocalDB.getSpeseAll();
                  const entrate = await LocalDB.getEntrateAll();
                  alert(`Dati salvati:\n- ${spese.length} spese\n- ${entrate.length} entrate\n\nAnni presenti:\nSpese: ${[...new Set(spese.map(s => s.anno))].join(', ')}\nEntrate: ${[...new Set(entrate.map(e => e.anno))].join(', ')}`);
                }}
                className="w-full bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium"
              >
                ℹ️ Verifica Dati Salvati
              </button>
              <button
                onClick={handleClearData}
                className="w-full bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors font-medium"
              >
                🗑️ Elimina Tutti i Dati
              </button>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>💡 Come sincronizzare i dati:</strong>
          </p>
          <ol className="text-sm text-blue-700 mt-2 ml-4 list-decimal space-y-1">
            <li>Lavora in locale e modifica i tuoi dati</li>
            <li>Clicca su "Esporta Tutti i Dati" per scaricare il file JSON</li>
            <li>Apri l'app su Vercel (online)</li>
            <li>Clicca su "Importa Dati da JSON" e carica il file</li>
            <li>I tuoi dati sono ora sincronizzati online!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
