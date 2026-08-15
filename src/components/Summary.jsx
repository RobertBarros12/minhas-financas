import React, { useState } from 'react';
import { Eye, EyeOff, TrendingUp, TrendingDown, ShieldCheck, AlertCircle, Calendar } from 'lucide-react';

export default function Summary({ balance, expense, pendingExpense, income, previousBalance }) {
  const [hideValues, setHideValues] = useState(false);

  const formatCurrency = (val) => {
    if (hideValues) return '••••••';
    const num = Number(val) || 0;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
  };

  const freeToSpend = balance - pendingExpense;

  // Cálculo da Meta Semanal de Gastos Livres (considerando 4 semanas médias no mês)
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysRemaining = Math.max(1, daysInMonth - today.getDate());
  const weeksRemaining = Math.max(1, Math.ceil(daysRemaining / 7));
  const weeklyAllowance = Math.max(0, freeToSpend / weeksRemaining);

  // Porcentagem gasta em relação aos ganhos
  const expenseRatio = income > 0 ? (expense / income) * 100 : 0;

  return (
    <div className="space-y-3.5">
      
      {/* Alerta de Caixa Inteligente Compacto */}
      <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[11px] font-bold text-slate-300">Visão Inteligente de Caixa</span>
        </div>
        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg border ${
          expenseRatio > 80 
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        }`}>
          {expenseRatio > 80 ? 'Ritmo Alto' : 'Saudável'}
        </span>
      </div>

      {/* Meta Semanal de Gastos Livres com Barra Dinâmica */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-950 border border-slate-800 shadow-lg space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Meta Semanal Livre</p>
              <p className="text-[9px] text-slate-500">Restam ~{weeksRemaining} semana(s)</p>
            </div>
          </div>
          <p className="text-sm font-black text-cyan-400">{formatCurrency(weeklyAllowance)}<span className="text-[10px] text-slate-500 font-semibold">/sem</span></p>
        </div>

        {/* Barra de Ritmo de Gastos */}
        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800/60">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              expenseRatio > 80 
                ? 'bg-gradient-to-r from-amber-500 to-rose-500' 
                : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
            }`}
            style={{ width: `${Math.min(100, expenseRatio || 15)}%` }}
          />
        </div>
      </div>

      {/* Card Principal de Saldo (Estilo Cartão Black / Glassmorphism) */}
      <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-2xl space-y-4">
        
        {/* Glow decorativo de fundo */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Cabeçalho do Card com Botão de Ocultar Valor */}
        <div className="flex items-center justify-between relative z-10">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            Saldo Atual em Conta
          </span>

          <button
            onClick={() => setHideValues(!hideValues)}
            className="p-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-cyan-400 transition active:scale-95"
            title={hideValues ? 'Mostrar Valores' : 'Ocultar Valores'}
          >
            {hideValues ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Valor do Saldo */}
        <div className="relative z-10">
          <h2 className="text-3xl font-black tracking-tight text-slate-100">
            {formatCurrency(balance)}
          </h2>
          
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[11px] font-semibold text-slate-400">Livre para Gastar:</span>
            <span className={`text-xs font-extrabold ${freeToSpend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatCurrency(freeToSpend)}
            </span>
          </div>
        </div>

        {/* Grid com Entradas e Saídas Lado a Lado */}
        <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-800/80 relative z-10">
          <div className="p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-0.5">
            <div className="flex items-center gap-1 text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Entradas</span>
            </div>
            <p className="text-xs font-black text-slate-200">{formatCurrency(income)}</p>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-0.5 text-right">
            <div className="flex items-center justify-end gap-1 text-rose-400">
              <span className="text-[9px] font-bold uppercase tracking-wider">Saídas Pagas</span>
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
            <p className="text-xs font-black text-rose-400">- {formatCurrency(expense)}</p>
          </div>
        </div>

      </div>

    </div>
  );
}