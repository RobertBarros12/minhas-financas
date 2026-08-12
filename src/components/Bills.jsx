import React, { useState } from 'react';
import { CreditCard, Calendar, CheckCircle, Clock, Trash2, Car, ShoppingBag } from 'lucide-react';

export default function Bills({ transactions, onToggleStatus, onDelete }) {
  const [filter, setFilter] = useState('all');

  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
  };

  const now = new Date();
  const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // 1. Filtra estritamente as contas e compromissos com vencimento NO MÊS ATUAL
  const currentMonthBills = transactions.filter(t => {
    if (t.type !== 'expense') return false;
    
    const isThisMonth = t.date && t.date.startsWith(currentMonthYear);
    if (!isThisMonth) return false;

    const isBillMethod = 
      t.paymentMethod === 'Cartão de Crédito' || 
      t.paymentMethod === 'Crediário / Carnê' || 
      t.paymentMethod === 'Financiamento' ||
      t.category === 'Moradia & Contas Fixas' ||
      t.category === 'Contas de Consumo' ||
      t.category === 'Financiamentos & Empréstimos';

    return isBillMethod || t.status === 'pending';
  });

  // 2. Filtro pelas sub-abas superiores SEPARADAS
  const filteredBills = currentMonthBills.filter(t => {
    if (filter === 'cartao') return t.paymentMethod === 'Cartão de Crédito';
    if (filter === 'financiamento') return t.paymentMethod === 'Financiamento' || t.category === 'Financiamentos & Empréstimos';
    if (filter === 'parcelados') return t.paymentMethod === 'Crediário / Carnê' || (t.installments && t.installments > 1 && t.paymentMethod !== 'Cartão de Crédito');
    return true; // 'all' - Vencimentos do Mês
  });

  // 3. Cálculos dinâmicos sincronizados com o app
  const totalBillsAmount = filteredBills.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
  const totalPendingAmount = filteredBills
    .filter(t => t.status === 'pending')
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  return (
    <div className="space-y-4">
      {/* Sub-abas de Navegação Separadas */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'all', label: 'Vencimentos do Mês', icon: Calendar },
          { id: 'cartao', label: 'Cartão de Crédito', icon: CreditCard },
          { id: 'financiamento', label: 'Financiamentos', icon: Car },
          { id: 'parcelados', label: 'Parcelados / Carnê', icon: ShoppingBag },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = filter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                isActive
                  ? 'bg-cyan-500/10 border border-cyan-500 text-cyan-400'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total em Contas do Mês</p>
          <p className="text-base font-extrabold text-slate-100 mt-0.5">{formatCurrency(totalBillsAmount)}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">A Pagar (Pendente)</p>
          <p className="text-base font-extrabold text-amber-400 mt-0.5">{formatCurrency(totalPendingAmount)}</p>
        </div>
      </div>

      {/* Lista de Vencimentos */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-3 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Contas com Vencimento no Mês</h3>
          <span className="text-[10px] text-slate-400">{filteredBills.length} item(ns)</span>
        </div>

        <div className="divide-y divide-slate-800/60">
          {filteredBills.length > 0 ? (
            filteredBills.map(item => (
              <div key={item.id} className="p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-slate-200">{item.description}</p>
                  <p className="text-[10px] text-slate-400">Vencimento: {item.date} • {item.paymentMethod || 'Geral'}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-100">{formatCurrency(item.amount)}</p>
                    <button
                      onClick={() => onToggleStatus(item.id)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 mt-0.5 border transition ${
                        item.status === 'paid'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                      }`}
                    >
                      {item.status === 'paid' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      <span>{item.status === 'paid' ? 'Pago' : 'Pendente'}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => onDelete(item.id)}
                    className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition"
                    title="Excluir conta"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">
              Nenhuma conta para esta categoria no mês.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}