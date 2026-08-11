import React, { useState } from 'react';
import { X, Target, Plane, ShieldCheck, Car, Home } from 'lucide-react';

export default function GoalModal({ isOpen, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState('viagem');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !targetAmount) return;

    onSave({
      id: String(Date.now()),
      title,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount) || 0,
      deadline: deadline || 'Sem prazo',
      icon: category === 'viagem' ? Plane : ShieldCheck,
      color: category === 'viagem' ? 'from-cyan-500 to-blue-600' : 'from-emerald-500 to-teal-600'
    });

    setTitle('');
    setTargetAmount('');
    setCurrentAmount('');
    setDeadline('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            <span>Nova Meta / Sonho</span>
          </h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Título da Meta</label>
            <input
              type="text"
              placeholder="Ex: Viagem Disney, Entrada do Apto, Troca de Carro"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Valor Alvo (R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="15000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Já Guardado (R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Prazo Alvo</label>
              <input
                type="text"
                placeholder="Ex: Dez/2026"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Tipo</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="viagem">Viagem / Lazer</option>
                <option value="reserva">Reserva / Segurança</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold py-3.5 rounded-2xl text-sm transition shadow-lg shadow-cyan-500/20"
          >
            Criar Meta
          </button>
        </form>
      </div>
    </div>
  );
}