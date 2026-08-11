import React, { useState } from 'react';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Filter,
  ListFilter
} from 'lucide-react';

export default function TransactionList({ transactions = [], onToggleStatus, onDelete }) {
  const [filter, setFilter] = useState('all'); // 'all', 'income', 'expense', 'pending'

  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  // Aplicação dos Filtros
  const filteredTransactions = transactions.filter(item => {
    if (filter === 'income') return item.type === 'income';
    if (filter === 'expense') return item.type === 'expense';
    if (filter === 'pending') return item.status === 'pending';
    return true; // 'all'
  });

  return (
    <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl space-y-0">
      
      {/* Cabeçalho com Filtros Rápidos */}
      <div className="p-3.5 border-b border-slate-800/80 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-200">
            <ListFilter className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Extrato de Lançamentos</h3>
          </div>
          <span className="text-[10px] text-slate-400">{filteredTransactions.length} item(ns)</span>
        </div>

        {/* Pílulas de Filtro */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          {[
            { id: 'all', label: 'Tudo' },
            { id: 'expense', label: 'Gastos' },
            { id: 'income', label: 'Ganhos' },
            { id: 'pending', label: 'Pendentes' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition whitespace-nowrap ${
                filter === f.id
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 border border-slate-800/60 hover:text-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Transações */}
      <div className="divide-y divide-slate-800/60">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((item) => (
            <div key={item.id} className="p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition">
              
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl border ${
                  item.type === 'income'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                  {item.type === 'income' ? <ArrowUpCircle className="w-4 h-4" /> : <ArrowDownCircle className="w-4 h-4" />}
                </div>

                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-200">{item.description}</p>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <span>{item.date}</span>
                    <span>•</span>
                    <span className="text-slate-400">{item.category}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="text-right">
                  <p className={`text-xs font-extrabold ${item.type === 'income' ? 'text-emerald-400' : 'text-slate-100'}`}>
                    {item.type === 'income' ? '+ ' : '- '}{formatCurrency(item.amount)}
                  </p>
                  
                  {/* Botão para dar baixa ou alterar status na hora */}
                  <button 
                    onClick={() => onToggleStatus && onToggleStatus(item.id)}
                    className="mt-0.5 inline-flex"
                  >
                    {item.status === 'paid' ? (
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Pago
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 hover:bg-amber-500/20">
                        <Clock className="w-3 h-3" /> Pendente
                      </span>
                    )}
                  </button>
                </div>

                {/* Botão de Excluir Rápido */}
                {onDelete && (
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800/80 transition"
                    title="Excluir lançamento"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

            </div>
          ))
        ) : (
          <div className="p-8 text-center text-xs text-slate-500 space-y-1">
            <p>Nenhum lançamento encontrado para este filtro.</p>
          </div>
        )}
      </div>

    </div>
  );
}