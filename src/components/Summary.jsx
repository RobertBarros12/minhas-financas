import React, { useState } from 'react';
import { 
  Wallet, 
  TrendingDown, 
  Eye, 
  EyeOff, 
  ArrowUpRight, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  Lock,
  CalendarDays,
  Flame,
  Zap
} from 'lucide-react';

export default function Summary({ 
  balance = 0, 
  expense = 0, 
  previousBalance = 0,
  pendingExpense = 0,
  income = 0
}) {
  const [hideValues, setHideValues] = useState(false);

  const formatCurrency = (value) => {
    if (hideValues) return '••••••';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // 1. Sobra Livre Real (Saldo abatendo contas a pagar)
  const freeToSpend = balance - pendingExpense;
  const isHealthy = freeToSpend >= 0;

  // 2. Cálculo da Sua Ideia: LIMITES SEMANAIS
  const today = new Date();
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysLeft = Math.max(1, lastDayOfMonth - today.getDate() + 1);
  const weeksLeft = Math.max(1, Math.ceil(daysLeft / 7));
  
  // Limite semanal seguro para os dias restantes
  const weeklyLimit = freeToSpend > 0 ? freeToSpend / weeksLeft : 0;

  // 3. Termômetro do Mês (Ritmo de Consumo)
  const daysPassed = today.getDate();
  const monthProgressPercentage = Math.round((daysPassed / lastDayOfMonth) * 100);
  const totalIncome = income > 0 ? income : (balance + expense);
  const spentPercentage = totalIncome > 0 ? Math.round((expense / totalIncome) * 100) : 0;
  
  // Se o % gasto for maior que o % de dias decorridos + 15%, o termômetro esquenta!
  const isHeatingUp = spentPercentage > (monthProgressPercentage + 15);

  return (
    <div className="space-y-3 animate-fade-in">
      
      {/* 🔮 RADAR INTELIGENTE + RITMO DO MÊS */}
      <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 shadow-xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Visão Inteligente de Caixa</h4>
          </div>

          {/* Termômetro do Mês */}
          {isHeatingUp ? (
            <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <Flame className="w-3 h-3 text-rose-400 fill-rose-400/20" /> Ritmo de Gastos Alto
            </span>
          ) : (
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Ritmo sob Controle
            </span>
          )}
        </div>

        <p className="text-[11px] text-slate-300 leading-snug">
          {pendingExpense > 0 ? (
            <span>Você tem <strong className="text-amber-400">{formatCurrency(pendingExpense)}</strong> em contas a pagar este mês. Seu livre real é <strong className="text-emerald-400">{formatCurrency(freeToSpend)}</strong>.</span>
          ) : (
            <span>Parabéns, Robert! Todas as contas deste mês foram quitadas. Saldo 100% livre!</span>
          )}
        </p>
      </div>

      {/* 📅 SUA IDEIA INOVADORA: META DE GASTOS LIVRES POR SEMANA */}
      <div className="bg-gradient-to-r from-cyan-950/60 to-slate-900 p-4 rounded-2xl border border-cyan-500/30 shadow-xl space-y-2 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">Meta Semanal de Gastos Livres</p>
              <p className="text-[10px] text-slate-400">Limite seguro por semana até o mês acabar</p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-base font-extrabold text-cyan-400">{formatCurrency(weeklyLimit)}<span className="text-[10px] font-normal text-slate-400">/sem</span></p>
            <p className="text-[9px] text-slate-400">Faltam ~{weeksLeft} semana(s)</p>
          </div>
        </div>
      </div>

      {/* 💳 CARD PRINCIPAL DE SALDO E LIVRE PARA GASTAR */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800/80 p-5 rounded-3xl border border-slate-800/80 shadow-2xl relative overflow-hidden space-y-3.5">
        <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Saldo Atual em Conta</p>
              <button 
                onClick={() => setHideValues(!hideValues)}
                className="text-slate-500 hover:text-cyan-400 transition"
              >
                {hideValues ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            <p className={`text-3xl font-extrabold mt-1 tracking-tight ${isHealthy ? 'text-slate-100' : 'text-rose-400'}`}>
              {formatCurrency(balance)}
            </p>
          </div>

          <div className="bg-cyan-500/10 p-3.5 rounded-2xl border border-cyan-500/20 text-cyan-400 shadow-inner">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        {/* MÉTRICA DO LIVRE PARA GASTAR */}
        <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Livre para Gastar</p>
              <p className="text-xs text-slate-500">(Saldo descontando pendências)</p>
            </div>
          </div>
          <span className={`text-sm font-extrabold ${freeToSpend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatCurrency(freeToSpend)}
          </span>
        </div>

        {/* SOBRA DO MÊS ANTERIOR */}
        <div className="pt-1 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sobra do mês anterior:</span>
            <strong className="text-slate-200">{formatCurrency(previousBalance)}</strong>
          </div>

          <div className="flex items-center gap-1 text-[10px] font-bold">
            {isHealthy ? (
              <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Saudável
              </span>
            ) : (
              <span className="text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Alerta
              </span>
            )}
          </div>
        </div>
      </div>

      {/* TOTAL DE SAÍDAS PAGAS */}
      <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <TrendingDown className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-slate-300">Total de Saídas Pagas no Mês</span>
        </div>
        <p className="text-base font-bold text-rose-400">{formatCurrency(expense)}</p>
      </div>

    </div>
  );
}