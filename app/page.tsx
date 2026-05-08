'use client';

import { useEffect, useState } from 'react';
import { LocalDB } from '@/lib/database';
import { Entrata, Spesa } from '@/types';
import { BarChart3, Euro, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function HomePage() {
  const [spese, setSpese] = useState<Spesa[]>([]);
  const [entrate, setEntrate] = useState<Entrata[]>([]);
  const [annoCorrente, setAnnoCorrente] = useState(2026);

  useEffect(() => {
    setSpese(LocalDB.getSpeseByAnno(annoCorrente));
    setEntrate(LocalDB.getEntrateByAnno(annoCorrente));
  }, [annoCorrente]);

  // Calcoli statistiche
  const totaleSpeseAnno = spese.reduce((sum, s) => sum + s.pagato, 0);
  const totaleEntrateAnno = entrate.reduce((sum, e) => sum + (e.fatturato || 0), 0);
  const saldo = totaleEntrateAnno - totaleSpeseAnno;
  const clienti = new Set(entrate.map(e => e.cliente)).size;

  // Dati per grafici mensili
  const mesi = ['GENNAIO', 'FEBBRAIO', 'MARZO', 'APRILE', 'MAGGIO', 'GIUGNO', 'LUGLIO', 'AGOSTO', 'SETTEMBRE', 'OTTOBRE', 'NOVEMBRE', 'DICEMBRE'];
  
  const datiMensili = mesi.map(mese => {
    const speseDelMese = spese.filter(s => s.mese === mese);
    const entrateDelMese = entrate.filter(e => e.mese === mese);
    
    return {
      mese: mese.substring(0, 3),
      spese: speseDelMese.reduce((sum, s) => sum + s.pagato, 0),
      entrate: entrateDelMese.reduce((sum, e) => sum + (e.fatturato || 0), 0),
    };
  });

  // Distribuzione per categoria
  const entratePerCategoria = [
    { name: 'Estetica', value: entrate.filter(e => e.categoria === 'E').reduce((sum, e) => sum + (e.fatturato || 0), 0), color: '#8b5cf6' },
    { name: 'Macchinari', value: entrate.filter(e => e.categoria === 'M').reduce((sum, e) => sum + (e.fatturato || 0), 0), color: '#ec4899' },
    { name: 'Prodotti', value: entrate.filter(e => e.categoria === 'P').reduce((sum, e) => sum + (e.fatturato || 0), 0), color: '#06b6d4' },
  ].filter(item => item.value > 0);

  // Distribuzione per tipo pagamento
  const entratePerPagamento = [
    { name: 'Bancomat', value: entrate.filter(e => e.tipoPagamento === 'B').reduce((sum, e) => sum + (e.fatturato || 0), 0), color: '#10b981' },
    { name: 'Contanti', value: entrate.filter(e => e.tipoPagamento === 'C').reduce((sum, e) => sum + (e.fatturato || 0), 0), color: '#f59e0b' },
    { name: 'Altro', value: entrate.filter(e => e.tipoPagamento === 'N').reduce((sum, e) => sum + (e.fatturato || 0), 0), color: '#6366f1' },
  ].filter(item => item.value > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Panoramica finanziaria</p>
        </div>
        <select
          value={annoCorrente}
          onChange={(e) => setAnnoCorrente(Number(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value={2024}>2024</option>
          <option value={2025}>2025</option>
          <option value={2026}>2026</option>
        </select>
      </div>

      {/* Cards statistiche */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Entrate Totali</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">€ {totaleEntrateAnno.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Spese Totali</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">€ {totaleSpeseAnno.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Saldo</p>
              <p className={`text-2xl font-bold mt-2 ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                € {saldo.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${saldo >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <Euro className={`w-6 h-6 ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Clienti</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{clienti}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Grafici */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Grafico Entrate vs Spese */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
            Entrate vs Spese Mensili
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={datiMensili}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mese" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: number | undefined) => value !== undefined ? `€ ${value.toLocaleString('it-IT', { minimumFractionDigits: 2 })}` : '€ 0'}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
              />
              <Legend />
              <Bar dataKey="entrate" fill="#10b981" name="Entrate" radius={[8, 8, 0, 0]} />
              <Bar dataKey="spese" fill="#ef4444" name="Spese" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Grafico Distribuzione per Categoria */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuzione Entrate per Categoria</h3>
          {entratePerCategoria.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={entratePerCategoria}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {entratePerCategoria.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number | undefined) => value !== undefined ? `€ ${value.toLocaleString('it-IT', { minimumFractionDigits: 2 })}` : '€ 0'} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              Nessun dato disponibile
            </div>
          )}
        </div>
      </div>

      {/* Distribuzione per tipo pagamento */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuzione per Tipo di Pagamento</h3>
        {entratePerPagamento.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={entratePerPagamento}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {entratePerPagamento.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number | undefined) => value !== undefined ? `€ ${value.toLocaleString('it-IT', { minimumFractionDigits: 2 })}` : '€ 0'} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-400">
            Nessun dato disponibile
          </div>
        )}
      </div>
    </div>
  );
}
