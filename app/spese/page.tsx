'use client';

import { useEffect, useState } from 'react';
import { LocalDB } from '@/lib/database';
import { Spesa } from '@/types';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

export default function SpesePage() {
  const [spese, setSpese] = useState<Spesa[]>([]);
  const [filteredSpese, setFilteredSpese] = useState<Spesa[]>([]);
  const [annoFiltro, setAnnoFiltro] = useState<number>(2026);
  const [meseFiltro, setMeseFiltro] = useState<string>('TUTTI');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSpesa, setEditingSpesa] = useState<Spesa | null>(null);

  const mesi = ['GENNAIO', 'FEBBRAIO', 'MARZO', 'APRILE', 'MAGGIO', 'GIUGNO', 'LUGLIO', 'AGOSTO', 'SETTEMBRE', 'OTTOBRE', 'NOVEMBRE', 'DICEMBRE'];

  useEffect(() => {
    loadSpese();
  }, []);

  useEffect(() => {
    filterSpese();
  }, [spese, annoFiltro, meseFiltro, searchTerm]);

  const loadSpese = async () => {
    const data = await LocalDB.getSpeseAll();
    setSpese(data);
  };

  const filterSpese = () => {
    let filtered = spese.filter(s => s.anno === annoFiltro);
    
    if (meseFiltro !== 'TUTTI') {
      filtered = filtered.filter(s => s.mese === meseFiltro);
    }

    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.descrizione.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSpese(filtered);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questa spesa?')) {
      await LocalDB.deleteSpesa(id);
      await loadSpese();
    }
  };

  const handleEdit = (spesa: Spesa) => {
    setEditingSpesa(spesa);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingSpesa({
      id: `spesa-${Date.now()}`,
      descrizione: '',
      importo: 0,
      pagato: 0,
      daPagare: 0,
      mese: meseFiltro !== 'TUTTI' ? meseFiltro : 'GENNAIO',
      anno: annoFiltro,
    });
    setShowModal(true);
  };

  const handleSave = async (spesa: Spesa) => {
    await LocalDB.saveSpesa(spesa);
    await loadSpese();
    setShowModal(false);
    setEditingSpesa(null);
  };

  const totaleSpese = filteredSpese.reduce((sum, s) => sum + s.daPagare, 0);  // Totale = somma daPagare
  const totalePagato = filteredSpese.reduce((sum, s) => sum + s.pagato, 0);
  const totaleDaPagare = filteredSpese.reduce((sum, s) => sum + s.daPagare, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Spese</h1>
          <p className="text-gray-600 mt-1">Gestisci le tue spese</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nuova Spesa</span>
        </button>
      </div>

      {/* Filtri */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Anno</label>
            <select
              value={annoFiltro}
              onChange={(e) => setAnnoFiltro(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value={2023}>2023</option>
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mese</label>
            <select
              value={meseFiltro}
              onChange={(e) => setMeseFiltro(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="TUTTI">Tutti i mesi</option>
              {mesi.map(mese => (
                <option key={mese} value={mese}>{mese}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Cerca</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cerca per descrizione..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Statistiche */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl shadow-sm p-6 text-white mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-red-100">Totale Spese</p>
            <p className="text-3xl font-bold mt-1">€ {totaleSpese.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-red-100">Già Pagato</p>
            <p className="text-3xl font-bold mt-1">€ {totalePagato.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-red-100">Da Pagare</p>
            <p className="text-3xl font-bold mt-1">€ {totaleDaPagare.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-red-100">Numero Spese</p>
            <p className="text-3xl font-bold mt-1">{filteredSpese.length}</p>
          </div>
        </div>
      </div>

      {/* Tabella */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrizione</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Importo</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Pagato</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Da Pagare</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scadenza</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSpese.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Nessuna spesa trovata
                  </td>
                </tr>
              ) : (
                filteredSpese.map((spesa) => (
                  <tr key={spesa.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {spesa.mese} {spesa.anno}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {spesa.descrizione}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                      € {spesa.importo.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                      € {spesa.pagato.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <span className={spesa.daPagare > 0 ? 'text-red-600 font-semibold' : 'text-gray-400'}>
                        € {spesa.daPagare.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {spesa.scadenza || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(spesa)}
                        className="text-purple-600 hover:text-purple-900 mr-3"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(spesa.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && editingSpesa && (
        <SpesaModal
          spesa={editingSpesa}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingSpesa(null);
          }}
        />
      )}
    </div>
  );
}

function SpesaModal({ spesa, onSave, onClose }: { spesa: Spesa, onSave: (s: Spesa) => void, onClose: () => void }) {
  const [formData, setFormData] = useState(spesa);
  const mesi = ['GENNAIO', 'FEBBRAIO', 'MARZO', 'APRILE', 'MAGGIO', 'GIUGNO', 'LUGLIO', 'AGOSTO', 'SETTEMBRE', 'OTTOBRE', 'NOVEMBRE', 'DICEMBRE'];

  // Ricalcola importo quando cambia daPagare
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      importo: prev.daPagare  // Importo = daPagare
    }));
  }, [formData.daPagare]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              {spesa.id.includes('spesa-' + Date.now().toString().slice(0, -3)) ? 'Nuova Spesa' : 'Modifica Spesa'}
            </h2>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Anno</label>
                <select
                  value={formData.anno}
                  onChange={(e) => setFormData({ ...formData, anno: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value={2023}>2023</option>
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mese</label>
                <select
                  value={formData.mese}
                  onChange={(e) => setFormData({ ...formData, mese: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  {mesi.map(mese => (
                    <option key={mese} value={mese}>{mese}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descrizione *</label>
              <input
                type="text"
                value={formData.descrizione}
                onChange={(e) => setFormData({ ...formData, descrizione: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pagato</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.pagato}
                  onChange={(e) => setFormData({ ...formData, pagato: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Da Pagare</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.daPagare}
                  onChange={(e) => setFormData({ ...formData, daPagare: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Importo Totale:</span>
                <span className="text-lg font-bold text-gray-900">
                  € {formData.importo.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Scadenza</label>
              <input
                type="text"
                value={formData.scadenza || ''}
                onChange={(e) => setFormData({ ...formData, scadenza: e.target.value })}
                placeholder="es: 15/01/2024"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Salva
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
