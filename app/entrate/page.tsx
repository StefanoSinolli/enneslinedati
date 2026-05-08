'use client';

import { useEffect, useState } from 'react';
import { LocalDB } from '@/lib/database';
import { Entrata } from '@/types';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

export default function EntratePage() {
  const [entrate, setEntrate] = useState<Entrata[]>([]);
  const [filteredEntrate, setFilteredEntrate] = useState<Entrata[]>([]);
  const [annoFiltro, setAnnoFiltro] = useState<number>(2026);
  const [meseFiltro, setMeseFiltro] = useState<string>('TUTTI');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEntrata, setEditingEntrata] = useState<Entrata | null>(null);

  const mesi = ['GENNAIO', 'FEBBRAIO', 'MARZO', 'APRILE', 'MAGGIO', 'GIUGNO', 'LUGLIO', 'AGOSTO', 'SETTEMBRE', 'OTTOBRE', 'NOVEMBRE', 'DICEMBRE'];

  useEffect(() => {
    loadEntrate();
  }, []);

  useEffect(() => {
    filterEntrate();
  }, [entrate, annoFiltro, meseFiltro, searchTerm]);

  const loadEntrate = () => {
    setEntrate(LocalDB.getEntrateAll());
  };

  const filterEntrate = () => {
    let filtered = entrate.filter(e => e.anno === annoFiltro);
    
    if (meseFiltro !== 'TUTTI') {
      filtered = filtered.filter(e => e.mese === meseFiltro);
    }

    if (searchTerm) {
      filtered = filtered.filter(e => 
        e.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.servizio?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEntrate(filtered);
  };

  const handleDelete = (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questa entrata?')) {
      LocalDB.deleteEntrata(id);
      loadEntrate();
    }
  };

  const handleEdit = (entrata: Entrata) => {
    setEditingEntrata(entrata);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingEntrata({
      id: `entrata-${Date.now()}`,
      cliente: '',
      servizio: '',
      fatturato: 0,
      tipoPagamento: 'B',
      categoria: 'E',
      data: '',
      mese: meseFiltro !== 'TUTTI' ? meseFiltro : 'GENNAIO',
      anno: annoFiltro,
    });
    setShowModal(true);
  };

  const handleSave = (entrata: Entrata) => {
    LocalDB.saveEntrata(entrata);
    loadEntrate();
    setShowModal(false);
    setEditingEntrata(null);
  };

  const totaleEntrate = filteredEntrate.reduce((sum, e) => sum + (e.fatturato || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Entrate</h1>
          <p className="text-gray-600 mt-1">Gestisci le tue entrate</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nuova Entrata</span>
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
                placeholder="Cerca per cliente o servizio..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Statistiche */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-sm p-6 text-white mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-purple-100">Totale Entrate</p>
            <p className="text-3xl font-bold mt-1">€ {totaleEntrate.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-purple-100">Numero Entrate</p>
            <p className="text-3xl font-bold mt-1">{filteredEntrate.length}</p>
          </div>
          <div>
            <p className="text-purple-100">Clienti Unici</p>
            <p className="text-3xl font-bold mt-1">{new Set(filteredEntrate.map(e => e.cliente)).size}</p>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Servizio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pagamento</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Fatturato</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEntrate.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Nessuna entrata trovata
                  </td>
                </tr>
              ) : (
                filteredEntrate.map((entrata) => (
                  <tr key={entrata.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entrata.mese} {entrata.anno}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {entrata.cliente}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {entrata.servizio}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        entrata.categoria === 'E' ? 'bg-purple-100 text-purple-800' :
                        entrata.categoria === 'M' ? 'bg-pink-100 text-pink-800' :
                        'bg-cyan-100 text-cyan-800'
                      }`}>
                        {entrata.categoria === 'E' ? 'Estetica' : entrata.categoria === 'M' ? 'Macchinari' : 'Prodotti'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        entrata.tipoPagamento === 'B' ? 'bg-green-100 text-green-800' :
                        entrata.tipoPagamento === 'C' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {entrata.tipoPagamento === 'B' ? 'Bancomat' : entrata.tipoPagamento === 'C' ? 'Contanti' : 'Altro'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-green-600">
                      € {(entrata.fatturato || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(entrata)}
                        className="text-purple-600 hover:text-purple-900 mr-3"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(entrata.id)}
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
      {showModal && editingEntrata && (
        <EntrataModal
          entrata={editingEntrata}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingEntrata(null);
          }}
        />
      )}
    </div>
  );
}

function EntrataModal({ entrata, onSave, onClose }: { entrata: Entrata, onSave: (e: Entrata) => void, onClose: () => void }) {
  const [formData, setFormData] = useState(entrata);
  const mesi = ['GENNAIO', 'FEBBRAIO', 'MARZO', 'APRILE', 'MAGGIO', 'GIUGNO', 'LUGLIO', 'AGOSTO', 'SETTEMBRE', 'OTTOBRE', 'NOVEMBRE', 'DICEMBRE'];

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
              {entrata.id.includes('entrata-' + Date.now().toString().slice(0, -3)) ? 'Nuova Entrata' : 'Modifica Entrata'}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Cliente *</label>
              <input
                type="text"
                value={formData.cliente}
                onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Servizio</label>
              <input
                type="text"
                value={formData.servizio}
                onChange={(e) => setFormData({ ...formData, servizio: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fatturato *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.fatturato}
                  onChange={(e) => setFormData({ ...formData, fatturato: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="E">Estetica</option>
                  <option value="M">Macchinari</option>
                  <option value="P">Prodotti</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pagamento</label>
                <select
                  value={formData.tipoPagamento}
                  onChange={(e) => setFormData({ ...formData, tipoPagamento: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="B">Bancomat</option>
                  <option value="C">Contanti</option>
                  <option value="N">Altro</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
              <textarea
                value={formData.info || ''}
                onChange={(e) => setFormData({ ...formData, info: e.target.value })}
                rows={3}
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
