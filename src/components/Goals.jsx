import React, { useState } from 'react';
import { Target, Plane, ShieldCheck, Plus, Sparkles, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import GoalModal from './GoalModal';

export default function Goals({ onAddExpense }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goalsList, setGoalsList] = useState([
    {
      id: '1',
      title: 'Viagem dos Sonhos (Orlando / Disney)',
      targetAmount: 15000.00,
      currentAmount: 14500.00, // Faltam R$ 500 para completar
      deadline: 'Dez/2026',
      icon: Plane,
      color: 'from-cyan-500 to-blue-600',
    },
    {
      id: '2',
      title: 'Reserva de Emergência (6 Meses)',
      targetAmount: 12000.00,
      currentAmount: 12000.00, // Já atingida!
      deadline: 'Out/2026',
      icon: ShieldCheck,
      color: 'from-emerald-500 to-teal-600',
    },
  ]);

  // Função para aportar dinheiro na meta e disparar os Confetes ao completar 100%
  const handleAddDeposit = (goal) => {
    const amountStr = prompt(`Quanto deseja aportar na meta "${goal.title}"? (R$)`);
    if (!amountStr) return;
    const depositVal = parseFloat(amountStr);
    if (isNaN(depositVal) || depositVal <= 0) return;

    setGoalsList(prev => prev.map(item => {
      if (item.id === goal.id) {
        const newCurrent = item.currentAmount + depositVal;
        
        // Se bateu 100% ou mais com esse aporte -> Dispara os Confetes de Vitória!
        if (newCurrent >= item.targetAmount && item.currentAmount < item.targetAmount) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }

        return { ...item, currentAmount: newCurrent };
      }
      return item;
    }));

    // Registra a saída no extrato global para abater do saldo em conta
    if (onAddExpense) {
      onAddExpense({
        id: String(Date.now()),
        description: `Aporte Meta: ${goal.title}`,
        amount: depositVal,
        type: 'expense',
        paymentMethod: 'Pix / Débito',
        category: 'Investimento / Reserva',
        status: 'paid',
        date: 'Hoje',
        installments: 1
      });
    }
  };

  const handleSaveGoal = (newGoal) => {
    setGoalsList([newGoal, ...goalsList]);
  };

  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100">Metas & Objetivos</h3>
            <p className="text-[11px] text-slate-400">Planejamento e comemoração de conquistas</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 px-3 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nova Meta</span>
        </button>
      </div>

      <div className="space-y-3">
        {goalsList.map((goal) => {
          const GoalIcon = goal.icon || Target;
          const percentage = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const isCompleted = percentage >= 100;

          return (
            <div 
              key={goal.id} 
              className={`p-5 rounded-2xl border space-y-3 shadow-xl relative overflow-hidden transition-all ${
                isCompleted 
                  ? 'bg-slate-900/90 border-emerald-500/40 shadow-emerald-500/10' 
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${
                    isCompleted 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-slate-800 text-cyan-400 border-slate-700/60'
                  }`}>
                    {isCompleted ? <Trophy className="w-5 h-5 text-amber-400 animate-bounce" /> : <GoalIcon className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                      <span>{goal.title}</span>
                      {isCompleted && <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                    </h4>
                    <p className="text-[10px] text-slate-400">Prazo alvo: {goal.deadline}</p>
                  </div>
                </div>

                <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full border ${
                  isCompleted 
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                    : 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
                }`}>
                  {isCompleted ? 'Conquistado! 🎉' : `${percentage}%`}
                </span>
              </div>

              {/* Barra de Progresso */}
              <div className="space-y-1.5">
                <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div 
                    className={`h-full rounded-full bg-gradient-to-r ${goal.color || 'from-cyan-500 to-blue-600'} transition-all duration-500`} 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center text-[11px] text-slate-400 pt-0.5">
                  <span>Guardado: <strong className="text-slate-200">{formatCurrency(goal.currentAmount)}</strong></span>
                  
                  {!isCompleted ? (
                    <button 
                      onClick={() => handleAddDeposit(goal)}
                      className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 px-2 py-0.5 rounded-lg border border-cyan-500/20 transition active:scale-95"
                    >
                      + Guardar Mais
                    </button>
                  ) : (
                    <span className="text-emerald-400 font-bold">Meta Bateu!</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <GoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveGoal}
      />
    </div>
  );
}