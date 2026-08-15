import React, { useState } from 'react';
import { 
  PiggyBank, Plus, Minus, Trash2, ShieldCheck, Plane, 
  Car, Sparkles, Target, CheckCircle2, Circle, ChevronDown, 
  ChevronUp, Tag, ArrowUpRight, DollarSign, Wallet
} from 'lucide-react';

export default function Vaults({ vaults, onCreateVault, onUpdateVaultAmount, onDeleteVault, onUpdateVaultItems }) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isSubItemModalOpen, setIsSubItemModalOpen] = useState(false);
  
  const [selectedVault, setSelectedVault] = useState(null);
  const [expandedVaultId, setExpandedVaultId] = useState(null);
  const [depositType, setDepositType] = useState('add'); // 'add' ou 'sub'
  const [depositValue, setDepositValue] = useState('');

  // Estados Nova Caixinha
  const [vaultName, setVaultName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');

  // Estados Novo Sub-item / Etapa
  const [subItemTitle, setSubItemTitle] = useState('');
  const [subItemPlanned, setSubItemPlanned] = useState('');

  const formatCurrency = (val) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val) || 0);

  // Helper de cálculo de valores por caixinha
  const getVaultStats = (vault) => {
    const savedAmount = Number(vault.currentAmount) || 0;
    const items = vault.items || [];
    
    // Soma de gastos já pagos/executados nos sub-itens
    const spentAmount = items
      .filter(item => item.completed)
      .reduce((acc, item) => acc + (Number(item.actualAmount ?? item.plannedAmount) || 0), 0);

    const totalAchieved = savedAmount + spentAmount;
    const target = Number(vault.targetAmount) || 1;
    const progress = Math.min(100, Math.round((totalAchieved / target) * 100));
    const remaining = Math.max(0, target - totalAchieved);

    return { savedAmount, spentAmount, totalAchieved, target, progress, remaining, items };
  };

  // Cálculos Globais
  const totalSavedAll = vaults.reduce((acc, v) => acc + (Number(v.currentAmount) || 0), 0);
  const totalSpentAll = vaults.reduce((acc, v) => {
    const items = v.items || [];
    return acc + items.filter(i => i.completed).reduce((s, i) => s + (Number(i.actualAmount ?? i.plannedAmount) || 0), 0);
  }, 0);
  const totalAchievedAll = totalSavedAll + totalSpentAll;
  const totalTargetAll = vaults.reduce((acc, v) => acc + (Number(v.targetAmount) || 0), 0);
  const globalProgress = totalTargetAll > 0 ? Math.min(100, Math.round((totalAchievedAll / totalTargetAll) * 100)) : 0;

  // Sugestões Prontas
  const suggestions = [
    { name: 'Lollapalooza / Festival', target: '1800', icon: Plane, desc: 'Ingresso, viagem e consumação' },
    { name: 'Reserva de Emergência', target: '5000', icon: ShieldCheck, desc: 'Segurança financeira' },
    { name: 'Troca de Moto / Carro', target: '4000', icon: Car, desc: 'Entrada ou quitação' },
  ];

  const handleSelectSuggestion = (sug) => {
    setVaultName(sug.name);
    setTargetAmount(sug.target);
    setIsCreateModalOpen(true);
  };

  const handleCreateVault = (e) => {
    e.preventDefault();
    if (!vaultName || !targetAmount) return;

    const newVault = {
      id: `vault-${Date.now()}`,
      name: vaultName,
      targetAmount: parseFloat(targetAmount.replace(',', '.')),
      currentAmount: 0,
      items: [],
    };

    onCreateVault(newVault);
    setVaultName('');
    setTargetAmount('');
    setIsCreateModalOpen(false);
  };

  // Depósito / Resgate de saldo na caixinha
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

  // Adicionar Sub-item
  const handleOpenSubItemModal = (vault) => {
    setSelectedVault(vault);
    setSubItemTitle('');
    setSubItemPlanned('');
    setIsSubItemModalOpen(true);
  };

  const handleAddSubItem = (e) => {
    e.preventDefault();
    if (!selectedVault || !subItemTitle || !subItemPlanned) return;

    const newItem = {
      id: `item-${Date.now()}`,
      title: subItemTitle.trim(),
      plannedAmount: parseFloat(subItemPlanned.replace(',', '.')),
      actualAmount: null,
      completed: false,
    };

    const currentItems = selectedVault.items || [];
    const updatedItems = [...currentItems, newItem];

    onUpdateVaultItems(selectedVault.id, updatedItems);
    setIsSubItemModalOpen(false);
    setSubItemTitle('');
    setSubItemPlanned('');
  };

  // Marcar Sub-item como Comprado / Pago (com valor real)
  const handleToggleSubItem = (vault, itemId) => {
    const currentItems = vault.items || [];
    const targetItem = currentItems.find(i => i.id === itemId);
    if (!targetItem) return;

    if (!targetItem.completed) {
      // Pergunta o valor real pago para calcular economia ou acréscimo
      const promptVal = window.prompt(
        `Qual foi o valor REAL pago em "${targetItem.title}"?\n(Planejado: ${formatCurrency(targetItem.plannedAmount)})`,
        String(targetItem.plannedAmount)
      );
      if (promptVal === null) return; // cancelou
      const realPaid = parseFloat(promptVal.replace(',', '.')) || targetItem.plannedAmount;

      const updatedItems = currentItems.map(i =>
        i.id === itemId ? { ...i, completed: true, actualAmount: realPaid } : i
      );
      onUpdateVaultItems(vault.id, updatedItems);
    } else {
      // Desmarcar
      const updatedItems = currentItems.map(i =>
        i.id === itemId ? { ...i, completed: false, actualAmount: null } : i
      );
      onUpdateVaultItems(vault.id, updatedItems);
    }
  };

  const handleDeleteSubItem = (vault, itemId) => {
    const currentItems = vault.items || [];
    const updatedItems = currentItems.filter(i => i.id !== itemId);
    onUpdateVaultItems(vault.id, updatedItems);
  };

  const getVaultIcon = (name = '') => {
    const n = name.toLowerCase();
    if (n.includes('emergência') || n.includes('segurança')) return ShieldCheck;
    if (n.includes('lolla') || n.includes('festival') || n.includes('show') || n.includes('viagem') || n.includes('férias')) return Plane;
    if (n.includes('moto') || n.includes('carro') || n.includes('veículo')) return Car;
    return Target;
  };

  return (
    <div className="space-y-4">
      
      {/* Card Principal: Total Guardado + Já Gasto em Metas */}
      <div className="p-4 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl shadow-2xl space-y-4 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between relative z-10 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <PiggyBank className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-100 uppercase tracking-wider">Caixinhas & Metas</h3>
              <p className="text-[10px] text-slate-400">Planejamento e Execução Real</p>
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

        {/* Destaque do Progresso Real */}
        <div className="grid grid-cols-2 gap-2 relative z-10">
          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-0.5">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Guardado em Caixa</span>
            <p className="text-sm font-black text-slate-100">{formatCurrency(totalSavedAll)}</p>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-0.5 text-right">
            <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-400">Já Pago / Executado</span>
            <p className="text-sm font-black text-cyan-300">{formatCurrency(totalSpentAll)}</p>
          </div>
        </div>

        {/* Barra de Progresso Global Unificada */}
        {totalTargetAll > 0 && (
          <div className="space-y-1.5 pt-1 border-t border-slate-800/80 relative z-10">
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span className="text-slate-400">Progresso Real das Metas:</span>
              <span className="text-cyan-400 font-extrabold">{globalProgress}% ({formatCurrency(totalAchievedAll)} de {formatCurrency(totalTargetAll)})</span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/60">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${globalProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Lista de Caixinhas */}
      <div className="space-y-3">
        {vaults.length > 0 ? (
          vaults.map(vault => {
            const stats = getVaultStats(vault);
            const isExpanded = expandedVaultId === vault.id;
            const IconComp = getVaultIcon(vault.name);

            return (
              <div 
                key={vault.id}
                className="bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl overflow-hidden transition"
              >
                {/* Cabeçalho do Card */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                        <IconComp className="w-5 h-5" />
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-100">{vault.name}</h4>
                        <p className="text-[10px] text-slate-400">Meta: {formatCurrency(stats.target)}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-slate-100">{formatCurrency(stats.totalAchieved)}</span>
                      <span className="block text-[9px] font-bold text-cyan-400">{stats.progress}% concluído</span>
                    </div>
                  </div>

                  {/* Resumo em 2 colunas: Guardado x Já Comprado */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800/80 text-[10px]">
                    <div>
                      <span className="text-slate-500 block text-[8px] font-bold uppercase">Saldo Guardado:</span>
                      <span className="font-extrabold text-slate-200">{formatCurrency(stats.savedAmount)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-cyan-400/80 block text-[8px] font-bold uppercase">Comprado / Pago:</span>
                      <span className="font-extrabold text-cyan-300">{formatCurrency(stats.spentAmount)}</span>
                    </div>
                  </div>

                  {/* Barra de Progresso Real */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/80">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          stats.progress >= 100 
                            ? 'bg-gradient-to-r from-emerald-500 to-cyan-400' 
                            : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                        }`}
                        style={{ width: `${stats.progress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-slate-400 pt-0.5">
                      <span>{stats.progress >= 100 ? '🎉 Meta 100% Concluída!' : `Faltam ${formatCurrency(stats.remaining)}`}</span>
                      <button
                        onClick={() => onDeleteVault(vault.id)}
                        className="text-slate-500 hover:text-rose-400 flex items-center gap-0.5 transition"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Excluir</span>
                      </button>
                    </div>
                  </div>

                  {/* Botões de Aporte e Resgate */}
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

                {/* Seção Expansível de Sub-itens / Checklist da Meta */}
                <div className="bg-slate-950/60 border-t border-slate-800/80 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setExpandedVaultId(isExpanded ? null : vault.id)}
                      className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-300 hover:text-cyan-400 transition"
                    >
                      <span>Etapas & Gastos ({stats.items.length})</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-cyan-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
                    </button>

                    <button
                      onClick={() => handleOpenSubItemModal(vault)}
                      className="text-[9px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-lg flex items-center gap-1 hover:bg-cyan-500/20 transition"
                    >
                      <Plus className="w-3 h-3 stroke-[3]" />
                      <span>+ Adicionar Item</span>
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="space-y-2 pt-1 divide-y divide-slate-800/50">
                      {stats.items.length > 0 ? (
                        stats.items.map(item => {
                          const isDone = item.completed;
                          const effectiveAmount = isDone ? (item.actualAmount ?? item.plannedAmount) : item.plannedAmount;
                          const diff = isDone && item.actualAmount !== null ? item.plannedAmount - item.actualAmount : 0;

                          return (
                            <div key={item.id} className="pt-2 flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <button
                                  onClick={() => handleToggleSubItem(vault, item.id)}
                                  className={`w-5 h-5 rounded-lg flex items-center justify-center transition ${
                                    isDone ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30' : 'border border-slate-700 hover:border-cyan-500'
                                  }`}
                                  title={isDone ? 'Marcar como não comprado' : 'Marcar como comprado/pago'}
                                >
                                  {isDone && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                                </button>

                                <div>
                                  <p className={`text-xs font-semibold ${isDone ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                                    {item.title}
                                  </p>
                                  <div className="flex items-center gap-1.5 text-[9px] text-slate-500">
                                    <span>Planejado: {formatCurrency(item.plannedAmount)}</span>
                                    {isDone && diff !== 0 && (
                                      <span className={diff > 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                                        ({diff > 0 ? `Economizou ${formatCurrency(diff)}` : `+${formatCurrency(Math.abs(diff))}`})
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-extrabold ${isDone ? 'text-cyan-400' : 'text-slate-300'}`}>
                                  {formatCurrency(effectiveAmount)}
                                </span>
                                <button
                                  onClick={() => handleDeleteSubItem(vault, item.id)}
                                  className="text-slate-600 hover:text-rose-400 p-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-[10px] text-slate-500 text-center py-2">
                          Nenhum sub-item cadastrado. Clique em "+ Adicionar Item" para listar ingressos, passagens, etc.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          /* Estado Vazio */
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-3xl shadow-xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mx-auto">
              <PiggyBank className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider">Crie sua Primeira Meta</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Defina metas para festivais, viagens ou emergências e acompanhe cada compra.</p>
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

      {/* Modal Nova Caixinha */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-extrabold text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-3">Nova Meta / Caixinha</h3>

            <form onSubmit={handleCreateVault} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nome da Meta</label>
                <input
                  type="text"
                  placeholder="Ex: Lollapalooza, Reserva de Emergência, Férias"
                  value={vaultName}
                  onChange={(e) => setVaultName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Valor Total Objetivo R$</label>
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
                  Criar Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Adicionar Sub-item */}
      {isSubItemModalOpen && selectedVault && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-5 shadow-2xl space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-100 uppercase tracking-wider">Novo Item / Gasto Previsto</h3>
              <p className="text-xs text-cyan-400 font-bold mt-1">{selectedVault.name}</p>
            </div>

            <form onSubmit={handleAddSubItem} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Descrição do Item</label>
                <input
                  type="text"
                  placeholder="Ex: Ingresso Lolla Pass, Passagem aérea, Hotel"
                  value={subItemTitle}
                  onChange={(e) => setSubItemTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Valor Estimado / Planejado R$</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ex: 500.00"
                  value={subItemPlanned}
                  onChange={(e) => setSubItemPlanned(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-bold"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubItemModalOpen(false)}
                  className="flex-1 bg-slate-950 border border-slate-800 text-slate-400 py-3 rounded-2xl text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black py-3 rounded-2xl text-xs uppercase"
                >
                  Salvar Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Guardar ou Resgatar Saldo */}
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