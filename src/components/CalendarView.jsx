import React, { useState } from 'react';
import { Calendar as CalendarIcon, CheckCircle2, Clock, AlertTriangle, Filter } from 'lucide-react';

export default function CalendarView({ transactions = [], currentMonth = 7, currentYear = 2026 }) {
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [agendaFilter, setAgendaFilter] = useState('all'); // 'all', 'expense', 'income'

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  // Mapeia os lançamentos pertencentes ao dia
  const getTransactionsForDay = (dayNum) => {
    const formattedDay = String(dayNum).padStart(2, '0');
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const targetDateStr = `${formattedDay}/${formattedMonth}`;

    return transactions.filter(t => {
      const isSameMonthYear = (t.month === currentMonth && t.year === currentYear) || !t.month;
      if (!isSameMonthYear) return false;

      if (!t.date) return false;
      
      if (t.date.includes('/')) {
        return t.date.startsWith(targetDateStr) || t.date === targetDateStr;
      } else if (t.date.includes('-')) {
        const parts = t.date.split('-');
        return parseInt(parts[2], 10) === dayNum && parseInt(parts[1], 10) === (currentMonth + 1);
      }
      return false;
    });
  };

  const filterTransactions = (list) => {
    if (agendaFilter === 'expense') return list.filter(t => t.type === 'expense');
    if (agendaFilter === 'income') return list.filter(t => t.type === 'income');
    return list;
  };

  const selectedDayTransactions = filterTransactions(getTransactionsForDay(selectedDay));

  // Totais do dia selecionado
  const selectedDayIncomes = selectedDayTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const selectedDayExpenses = selectedDayTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

  // Painel de Urgências (Contas com status 'pending')
  const urgentUpcoming = transactions.filter(t => t.type === 'expense' && t.status === 'pending');

  return (
    <div className="space-y-3.5 animate-fade-in">
      
      {/* 🔔 PAINEL DE URGÊNCIAS & COMPROMISSOS PENDENTES */}
      {urgentUpcoming.length > 0 && (
        <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-amber-500/30 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <AlertTriangle className="w-4 h-4" />
              <span>Contas Pendentes de Acompanhamento</span>
            </div>
            <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
              {urgentUpcoming.length} pendente(s)
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {urgentUpcoming.map((item, idx) => (
              <div key={idx} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 shrink-0 text-xs space-y-0.5 min-w-[180px]">
                <p className="font-bold text-slate-200 truncate">{item.description}</p>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">Vencimento: {item.date}</span>
                  <span className="font-extrabold text-amber-400">{formatCurrency(item.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🎯 FILTROS RÁPIDOS DA AGENDA */}
      <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span>Visualização da Agenda:</span>
        </div>

        <div className="flex gap-1">
          {[
            { id: 'all', label: 'Tudo' },
            { id: 'expense', label: 'Contas' },
            { id: 'income', label: 'Ganhos' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setAgendaFilter(f.id)}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition ${
                agendaFilter === f.id
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'bg-slate-950/60 text-slate-400 border border-slate-800/60'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 📆 GRADE DO CALENDÁRIO COM CORES POR STATUS REAL */}
      <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 shadow-xl space-y-2">
        <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <CalendarIcon className="w-4 h-4 text-cyan-400" />
            <span>Calendário de {monthNames[currentMonth]} {currentYear}</span>
          </div>
          <span className="text-[10px] text-slate-400">Selecione o dia desejado</span>
        </div>

        {/* Dias da Semana */}
        <div className="grid grid-cols-7 gap-1 text-center pt-1">
          {daysOfWeek.map((day, idx) => (
            <span key={idx} className="text-[10px] font-bold text-slate-400 uppercase">
              {day}
            </span>
          ))}
        </div>

        {/* Células de Dias */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-10 sm:h-12"></div>
          ))}

          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dayTx = filterTransactions(getTransactionsForDay(dayNum));
            const isSelected = selectedDay === dayNum;

            const dayExpenses = dayTx.filter(t => t.type === 'expense');
            const hasIncome = dayTx.some(t => t.type === 'income');
            const hasExpense = dayExpenses.length > 0;

            // REGRA CORRIGIDA DE STATUS REAL:
            // 1. Tem despesas e pelo menos UMA está PENDENTE -> Fundo Vermelho de Alerta
            const hasPendingExpense = dayExpenses.some(t => t.status === 'pending');
            // 2. Tem despesas e TODAS estão PAGAS/QUITADAS -> Fundo Verde
            const isAllExpensesPaid = hasExpense && dayExpenses.every(t => t.status === 'paid');

            return (
              <button
                key={dayNum}
                onClick={() => setSelectedDay(dayNum)}
                className={`h-10 sm:h-12 rounded-xl border flex flex-col items-center justify-between p-1 transition-all relative ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold shadow-sm'
                    : hasPendingExpense
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-300' // Conta Pendente = Vermelho Alerta
                    : isAllExpensesPaid
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' // Conta Quitada = Verde Sucesso
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/40'
                }`}
              >
                <span className="text-xs">{dayNum}</span>

                {/* Bolinhas Indicadoras de Lançamento */}
                <div className="flex gap-1 items-center pb-0.5">
                  {hasIncome && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-500/50"></span>
                  )}
                  {hasExpense && (
                    <span className={`w-1.5 h-1.5 rounded-full ${hasPendingExpense ? 'bg-rose-400 shadow-rose-500/50' : 'bg-emerald-400 shadow-emerald-500/50'} shadow-sm`}></span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ⚡ DETALHAMENTO DO DIA SELECIONADO */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden space-y-0">
        <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div>
            <h4 className="text-xs font-bold text-slate-200">
              Detalhamento do dia {selectedDay} de {monthNames[currentMonth]}
            </h4>
            <div className="flex items-center gap-3 text-[10px] pt-0.5">
              <span className="text-emerald-400 font-semibold">+ Entrada: {formatCurrency(selectedDayIncomes)}</span>
              <span className="text-rose-400 font-semibold">- Saída: {formatCurrency(selectedDayExpenses)}</span>
            </div>
          </div>
          <span className="text-[10px] text-slate-400">{selectedDayTransactions.length} item(ns)</span>
        </div>

        <div className="divide-y divide-slate-800/60">
          {selectedDayTransactions.length > 0 ? (
            selectedDayTransactions.map((item) => (
              <div key={item.id} className="p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-slate-200">{item.description}</p>
                  <p className="text-[10px] text-slate-400">{item.category} • {item.paymentMethod}</p>
                </div>

                <div className="text-right">
                  <p className={`text-xs font-bold ${item.type === 'income' ? 'text-emerald-400' : 'text-slate-200'}`}>
                    {item.type === 'income' ? '+ ' : '- '}{formatCurrency(item.amount)}
                  </p>
                  
                  {item.status === 'paid' ? (
                    <span className="text-[10px] text-emerald-400 flex items-center justify-end gap-0.5 mt-0.5 font-medium">
                      <CheckCircle2 className="w-3 h-3" /> Concluído
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-400 flex items-center justify-end gap-0.5 mt-0.5 font-medium">
                      <Clock className="w-3 h-3" /> Previsto
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-xs text-slate-500 space-y-1">
              <p>Nenhum lançamento registrado para este dia.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}