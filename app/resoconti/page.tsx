'use client';

import { useEffect, useState } from 'react';
import { LocalDB } from '@/lib/database';
import { ResocontoMensile } from '@/types';
import { FileText } from 'lucide-react';

export default function ResocontiPage() {
  const [resoconti, setResoconti] = useState<ResocontoMensile[]>([]);
  const [annoFiltro, setAnnoFiltro] = useState<number>(2026);

  const mesi = ['GENNAIO', 'FEBBRAIO', 'MARZO', 'APRILE', 'MAGGIO', 'GIUGNO', 'LUGLIO', 'AGOSTO', 'SETTEMBRE', 'OTTOBRE', 'NOVEMBRE', 'DICEMBRE'];

  useEffect(() => {
    loadResoconti();
  }, [annoFiltro]);

  const loadResoconti = async () => {
    const resocontiCalcolati = await Promise.all(
      mesi.map(mese => LocalDB.calcolaResocontoMensile(annoFiltro, mese))
    );
    setResoconti(resocontiCalcolati);
  };

  const totaleAnno = {
    spese: resoconti.reduce((sum, r) => sum + r.totaleSpese, 0),
    pagato: resoconti.reduce((sum, r) => sum + r.totalePagato, 0),
    daPagare: resoconti.reduce((sum, r) => sum + r.totaleDaPagare, 0),
    entrate: resoconti.reduce((sum, r) => sum + r.totaleEntrate, 0),
    saldo: resoconti.reduce((sum, r) => sum + (r.totaleEntrate - r.totalePagato), 0),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resoconti</h1>
          <p className="text-gray-600 mt-1">Riepilogo mensile e annuale</p>
        </div>
        <select
          value={annoFiltro}
          onChange={(e) => setAnnoFiltro(Number(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value={2023}>2023</option>
          <option value={2024}>2024</option>
          <option value={2025}>2025</option>
          <option value={2026}>2026</option>
        </select>
      </div>

      {/* Statistiche annuali */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <p className="text-sm text-gray-600 mb-2">Totale Spese</p>
          <p className="text-2xl font-bold text-red-600">
            € {totaleAnno.spese.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <p className="text-sm text-gray-600 mb-2">Spese Pagate</p>
          <p className="text-2xl font-bold text-orange-600">
            € {totaleAnno.pagato.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <p className="text-sm text-gray-600 mb-2">Da Pagare</p>
          <p className="text-2xl font-bold text-yellow-600">
            € {totaleAnno.daPagare.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <p className="text-sm text-gray-600 mb-2">Totale Entrate</p>
          <p className="text-2xl font-bold text-green-600">
            € {totaleAnno.entrate.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <p className="text-sm text-gray-600 mb-2">Saldo Anno</p>
          <p className={`text-2xl font-bold ${totaleAnno.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            € {totaleAnno.saldo.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Tabella resoconti mensili */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mese</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tot. Spese</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Pagato</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Da Pagare</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Entrate</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Bancomat</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Contanti</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Altro</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {resoconti.map((resoconto) => {
                const saldo = resoconto.totaleEntrate - resoconto.totalePagato;
                const hasDati = resoconto.totaleSpese > 0 || resoconto.totaleEntrate > 0;
                
                return (
                  <tr key={resoconto.mese} className={`hover:bg-gray-50 ${!hasDati && 'opacity-40'}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {resoconto.mese}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      € {resoconto.totaleSpese.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-orange-600">
                      € {resoconto.totalePagato.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <span className={resoconto.totaleDaPagare > 0 ? 'text-red-600 font-semibold' : 'text-gray-400'}>
                        € {resoconto.totaleDaPagare.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-green-600">
                      € {resoconto.totaleEntrate.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">
                      € {resoconto.entrateB.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">
                      € {resoconto.entrateC.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">
                      € {resoconto.entrateN.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold">
                      <span className={saldo >= 0 ? 'text-green-600' : 'text-red-600'}>
                        € {saldo.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {/* Riga totali */}
              <tr className="bg-gray-100 font-bold">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  TOTALE {annoFiltro}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  € {totaleAnno.spese.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-orange-600">
                  € {totaleAnno.pagato.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">
                  € {totaleAnno.daPagare.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                  € {totaleAnno.entrate.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  € {resoconti.reduce((sum, r) => sum + r.entrateB, 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  € {resoconti.reduce((sum, r) => sum + r.entrateC, 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  € {resoconti.reduce((sum, r) => sum + r.entrateN, 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${totaleAnno.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  € {totaleAnno.saldo.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Dettaglio categorie */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center mb-4">
            <FileText className="w-6 h-6 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Estetica</h3>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            € {resoconti.reduce((sum, r) => sum + r.entrateEstetica, 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center mb-4">
            <FileText className="w-6 h-6 text-pink-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Macchinari</h3>
          </div>
          <p className="text-2xl font-bold text-pink-600">
            € {resoconti.reduce((sum, r) => sum + r.entrateMacchinari, 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center mb-4">
            <FileText className="w-6 h-6 text-cyan-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Prodotti</h3>
          </div>
          <p className="text-2xl font-bold text-cyan-600">
            € {resoconti.reduce((sum, r) => sum + r.entrateProdotti, 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  );
}
