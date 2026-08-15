import React, { useState } from 'react';
import { 
  PiggyBank, Plus, Minus, Trash2, ShieldCheck, Plane, 
  Car, Sparkles, Target, DollarSign, AlertCircle, TrendingUp 
} from 'lucide-react';

export default function Vaults({ vaults, onCreateVault, onUpdateVaultAmount, onDeleteVault }) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [selectedVault, setSelectedVault] = useState(null);
  const [depositType, setDepositType] = useState('add'); // 'add' ou 'sub'
  const [depositValue, setDepositValue] = useState('');

  // Formulário Nova Caixinha
  const [vaultName, setVaultName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');

  const formatCurrency = (val) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val) || 0);

  // Cálculos Globais
  const totalSaved = vaults.reduce((acc, v) => acc + (Number(v.currentAmount) || 0), 0);
  const totalTarget = vaults.reduce((acc, v) => acc + (Number(v.targetAmount) || 0), 0);
  const globalProgress = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;

  // Sugestões Prontas de Caixinhas
  const suggestions = [
    { name: 'Reserva de Emergência', target: '5000', icon: ShieldCheck, desc: '6 meses de custo fixo' },
    { name: 'Viagem & Férias', target: '2000', icon: Plane, desc: 'Passeios e lazer' },
    { name: 'Troca de Moto / Carro', target: '4000', icon: Car, desc: 'Entrada ou quitação' },
  ];

  const handleSelectSuggestion = (sug) => {
    setVaultName(sug.name);
    setTargetAmount(sug.target);
    setIsCreateModalOpen(true);
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!vaultName || !targetAmount) return;

    const newVault = {
      id: `vault-${Date.now()}`,
      name: vaultName,
      targetAmount: parseFloat(targetAmount.replace(',', '.')),
      currentAmount: 0,
    };

    onCreateVault(newVault);
    setVaultName('');
    setTargetAmount('');
    setIsCreateModalOpen(false);
  };

  const handleOpenAction = (vault, type) => {
    setSelectedVault(vault);
    setDepositType(type);
    setDepositValue('');
    setIsDepositModalOpen(true);
  };

  const handleSaveAction = (e) => {
    e.preventDefault();
    if (!selectedVault || !depositValue) return;

    const val = parseFloat(depositValue.replace(',', '.'));
    const delta = depositType === 'add' ? val : -val;

    onUpdateVaultAmount(selectedVault.id, delta, selectedVault.name);
    setIsDepositModalOpen(false);
    setDepositValue('');
    setSelectedVault(null);
  };

  const getVaultIcon = (name = '') => {
    const n = name.toLowerCase();
    if (n.includes('emergência') || n.includes('segurança')) return ShieldCheck;
    if (n.includes('viagem') || n.includes('férias') || n.includes('praia')) return Plane;
    if (n.includes('moto') || n.includes('carro') || n.includes('veículo')) return Car;
    return Target;
  };

  return (
    <div className="space-y-4">
      
      {/* Card Principal: Total Guardado & Progresso Global */}
      <div className="p-4 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl shadow-2xl space-y-4 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between relative z-10 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <PiggyBank className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-100 uppercase tracking-wider">Caixinhas & Reservas</h3>
              <p className="text-[10px] text-slate-400">Metas e Dinheiro Focado</p>
            </div>
          </div>

          <button
            onClick={() => {
              setVaultName('');
              setTargetAmount('');
              setIsCreateModalOpen(true);
            }}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-md shadow-cyan-500/20 active:scale-95 transition"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Nova Meta</span>
          </button>
        </div>

        {/* Destaque do Total Guardado */}
        <div className="relative z-10 space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Total Guardado em Reservas</span>
          <h2 className="text-3xl font-black text-slate-100 tracking-tight">
            {formatCurrency(totalSaved)}
          </h2>
        </div>

        {/* Barra de Progresso Global */}
        {totalTarget > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-slate-800/80 relative z-10">
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span className="text-slate-400">Progresso Geral das Metas:</span>
              <span className="text-cyan-400 font-extrabold">{globalProgress}% ({formatCurrency(totalSaved)} de {formatCurrency(totalTarget)})</span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/60">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                style={{ width: `${globalProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Lista de Caixinhas ou Sugestões */}
      <div className="space-y-3">
        {vaults.length > 0 ? (
          vaults.map(vault => {
            const current = Number(vault.currentAmount) || 0;
            const target = Number(vault.targetAmount) || 1;
            const progress = Math.min(100, Math.round((current / target) * 100));
            const remaining = Math.max(0, target - current);
            const IconComp = getVaultIcon(vault.name);

            return (
              <div 
                key={vault.id}
                className="p-4 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                      <IconComp className="w-5 h-5" />
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-100">{vault.name}</h4>
                      <p className="text-[10px] text-slate-400">Meta: {formatCurrency(target)}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-slate-100">{formatCurrency(current)}</span>
                    <span className="block text-[9px] font-bold text-cyan-400">{progress}% alcançado</span>
                  </div>
                </div>

                {/* Barra de Progresso Neon */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/80">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        progress >= 100 ? 'bg-gradient-to-r from-emerald-500 to-cyan-400' : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[9px] text-slate-400 pt-0.5">
                    <span>{progress >= 100 ? '🎉 Meta Atingida!' : `Faltam ${formatCurrency(remaining)}`}</span>
                    <button
                      onClick={() => onDeleteVault(vault.id)}
                      className="text-slate-500 hover:text-rose-400 flex items-center gap-0.5 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Excluir</span>
                    </button>
                  </div>
                </div>

                {/* Botões Rápidos de Aporte e Resgate Otimizados para Celular */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/60">
                  <button
                    onClick={() => handleOpenAction(vault, 'add')}
                    className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 py-2 rounded-2xl text-[11px] font-extrabold flex items-center justify-center gap-1 active:scale-95 transition"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Guardar</span>
                  </button>

                  <button
                    onClick={() => handleOpenAction(vault, 'sub')}
                    className="bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800 py-2 rounded-2xl text-[11px] font-extrabold flex items-center justify-center gap-1 active:scale-95 transition"
                  >
                    <Minus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Resgatar</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          /* Estado Vazio Inteligente com Sugestões Prontas */
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-3xl shadow-xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mx-auto">
              <PiggyBank className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider">Crie sua Primeira Caixinha</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Separe seu dinheiro do saldo livre para conquistar seus objetivos.</p>
            </div>

            <div className="space-y-2 pt-1 text-left">
              <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 px-1">Sugestões com 1 Toque:</p>
              {suggestions.map((sug, i) => {
                const SugIcon = sug.icon;
                return (
                  <button
                    key={i}
                    onClick={() => handleSelectSuggestion(sug)}
                    className="w-full p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between hover:border-cyan-500/40 hover:bg-slate-850 active:scale-95 transition shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400">
                        <SugIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-200">{sug.name}</p>
                        <p className="text-[9px] text-slate-400">{sug.desc}</p>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-1 rounded-lg">
                      + Criar
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal Criar Caixinha */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-extrabold text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-3">Nova Caixinha / Meta</h3>

            <form onSubmit={handleCreate} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nome da Caixinha</label>
                <input
                  type="text"
                  placeholder="Ex: Reserva de Emergência, IPVA, Férias"
                  value={vaultName}
                  onChange={(e) => setVaultName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Meta Total Objetivo R$</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-bold"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 bg-slate-950 border border-slate-800 text-slate-400 py-3 rounded-2xl text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black py-3 rounded-2xl text-xs uppercase"
                >
                  Criar Caixinha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Guardar ou Resgatar Dinheiro */}
      {isDepositModalOpen && selectedVault && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-5 shadow-2xl space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-100 uppercase tracking-wider">
                {depositType === 'add' ? 'Guardar Dinheiro' : 'Resgatar Dinheiro'}
              </h3>
              <p className="text-xs text-cyan-400 font-bold mt-1">{selectedVault.name}</p>
            </div>

            <form onSubmit={handleSaveAction} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {depositType === 'add' ? 'Valor a Guardar R$' : 'Valor a Resgatar R$'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={depositValue}
                  onChange={(e) => setDepositValue(e.target.value)}
                  className="w-full bg-slate-950 border border-cyan-500/50 rounded-2xl p-3 text-xl font-black text-cyan-400 focus:outline-none"
                  required
                  autoFocus
                />
                <p className="text-[10px] text-slate-500 pt-1">
                  {depositType === 'add'
                    ? 'Esse valor será abatido do saldo da conta corrente e guardado nesta reserva.'
                    : 'Esse valor sairá da caixinha e retornará diretamente para o saldo disponível.'}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDepositModalOpen(false)}
                  className="flex-1 bg-slate-950 border border-slate-800 text-slate-400 py-3 rounded-2xl text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`flex-1 font-black py-3 rounded-2xl text-xs uppercase ${
                    depositType === 'add'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950'
                      : 'bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950'
                  }`}
                >
                  {depositType === 'add' ? 'Confirmar Aporte' : 'Confirmar Resgate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}