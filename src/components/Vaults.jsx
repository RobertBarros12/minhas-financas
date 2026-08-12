import React, { useState } from 'react';
import { Target, Plus, PiggyBank, ArrowUpRight, ArrowDownLeft, Trash2 } from 'lucide-react';

export default function Vaults({ vaults = [], onCreateVault, onUpdateVaultAmount, onDeleteVault }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');

  const [selectedVault, setSelectedVault] = useState(null);
  const [actionType, setActionType] = useState('add');
  const [actionAmount, setActionAmount] = useState('');

  const formatCurrency = (val) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val) || 0);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name || !targetAmount) return;

    const newVault = {
      id: Date.now().toString(),
      name,
      targetAmount: parseFloat(targetAmount.replace(',', '.')),
      currentAmount: 0,
    };

    onCreateVault(newVault);
    setName('');
    setTargetAmount('');
    setIsModalOpen(false);
  };

  const handleAction = (e) => {
    e.preventDefault();
    if (!actionAmount || !selectedVault) return;

    const val = parseFloat(actionAmount.replace(',', '.'));
    const delta = actionType === 'add' ? val : -val;

    onUpdateVaultAmount(selectedVault.id, delta);
    setActionAmount('');
    setSelectedVault(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <PiggyBank className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Caixinhas & Reservas</h3>
            <p className="text-[10px] text-slate-400">Guarde dinheiro focado em metas específicas</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition"
        >
          <Plus className="w-3.5 h-3.5" /> Nova Caixinha
        </button>
      </div>

      <div className="space-y-3">
        {vaults && vaults.length > 0 ? (
          vaults.map(vault => {
            const current = Number(vault.currentAmount || 0);
            const target = Number(vault.targetAmount || 1);
            const progress = Math.min(100, Math.round((current / target) * 100));

            return (
              <div key={vault.id} className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-xs font-bold text-slate-200">{vault.name}</h4>
                  </div>
                  
                  <button
                    onClick={() => onDeleteVault(vault.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 rounded transition"
                    title="Excluir Caixinha"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-baseline text-xs font-semibold">
                    <span className="text-sm font-black text-cyan-400">{formatCurrency(current)}</span>
                    <span className="text-slate-400 text-[10px]">Meta: {formatCurrency(target)} ({progress}%)</span>
                  </div>

                  <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => {
                      setSelectedVault(vault);
                      setActionType('add');
                    }}
                    className="py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 flex items-center justify-center gap-1 transition"
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" /> + Guardar
                  </button>
                  <button
                    onClick={() => {
                      setSelectedVault(vault);
                      setActionType('withdraw');
                    }}
                    className="py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 flex items-center justify-center gap-1 transition"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" /> - Resgatar
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-900/60 rounded-2xl border border-slate-800">
            Nenhuma Caixinha criada. Clique em "+ Nova Caixinha" para começar a guardar dinheiro!
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl">
            <h3 className="text-xs font-extrabold text-slate-100 uppercase tracking-wider">Criar Nova Caixinha</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Nome da Meta</label>
                <input
                  type="text"
                  placeholder="Ex: Reserva de Emergência, Viagem"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Valor da Meta R$</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ex: 5000,00"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950"
                >
                  Criar Caixinha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedVault && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl">
            <h3 className="text-xs font-extrabold text-slate-100 uppercase tracking-wider">
              {actionType === 'add' ? 'Guardar em' : 'Resgatar de'} "{selectedVault.name}"
            </h3>
            <form onSubmit={handleAction} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Valor R$</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={actionAmount}
                  onChange={(e) => setActionAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-lg font-black text-cyan-400 focus:outline-none focus:border-cyan-500"
                  required
                  autoFocus
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedVault(null)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}