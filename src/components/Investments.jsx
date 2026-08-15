import React, { useState } from 'react';
import { 
  TrendingUp, Plus, Trash2, Edit3, DollarSign, Wallet, 
  Landmark, Building2, LineChart, Coins, Sparkles, PieChart
} from 'lucide-react';

export default function Investments({ investments, onCreateInvestment, onDeleteInvestment, onAddYield }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isYieldModalOpen, setIsYieldModalOpen] = useState(false);
  const [selectedInvest, setSelectedYieldInvest] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  // Estados Novo Investimento
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Renda Fixa');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Estado Atualizar Rendimento
  const [yieldValue, setYieldValue] = useState('');

  const formatCurrency = (val) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val) || 0);

  // Cálculos de Totais
  const totalInvested = investments.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
  const totalYield = investments.reduce((acc, i) => acc + (Number(i.yieldTotal) || 0), 0);
  const totalPortfolio = totalInvested + totalYield;
  const yieldPercentage = totalInvested > 0 ? ((totalYield / totalInvested) * 100).toFixed(2) : '0.00';

  // Categorias disponíveis
  const categoryConfig = {
    'Renda Fixa': { label: 'Renda Fixa', icon: Landmark, color: '#10b981', ringColor: 'stroke-emerald-500' },
    'FIIs': { label: 'FIIs', icon: Building2, color: '#06b6d4', ringColor: 'stroke-cyan-500' },
    'Ações': { label: 'Ações', icon: LineChart, color: '#8b5cf6', ringColor: 'stroke-purple-500' },
    'Cripto': { label: 'Cripto', icon: Coins, color: '#f59e0b', ringColor: 'stroke-amber-500' },
    'Outros': { label: 'Outros', icon: Sparkles, color: '#64748b', ringColor: 'stroke-slate-500' },
  };

  // Cálculo da distribuição por classe para o gráfico de rosca
  const categoryTotals = investments.reduce((acc, item) => {
    const cat = item.category || 'Outros';
    const totalVal = (Number(item.amount) || 0) + (Number(item.yieldTotal) || 0);
    acc[cat] = (acc[cat] || 0) + totalVal;
    return acc;
  }, {});

  const filterOptions = [
    { id: 'all', label: 'Todos' },
    { id: 'Renda Fixa', label: 'Renda Fixa' },
    { id: 'FIIs', label: 'FIIs' },
    { id: 'Ações', label: 'Ações' },
    { id: 'Cripto', label: 'Cripto' },
    { id: 'Outros', label: 'Outros' },
  ];

  // Filtra os investimentos pela pílula selecionada
  const filteredInvestments = investments.filter(item => {
    if (activeFilter === 'all') return true;
    return item.category === activeFilter;
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name || !amount) return;

    const newInvest = {
      id: `inv-${Date.now()}`,
      name,
      category,
      amount: parseFloat(amount.replace(',', '.')),
      yieldTotal: 0,
      date,
    };

    onCreateInvestment(newInvest);
    setName('');
    setAmount('');
    setIsModalOpen(false);
  };

  const handleOpenYieldModal = (invest) => {
    setSelectedYieldInvest(invest);
    setYieldValue(String(invest.yieldTotal || ''));
    setIsYieldModalOpen(true);
  };

  const handleSaveYield = (e) => {
    e.preventDefault();
    if (!selectedInvest || yieldValue === '') return;

    const parsedVal = parseFloat(yieldValue.replace(',', '.'));
    onAddYield(selectedInvest.id, parsedVal);

    setYieldValue('');
    setSelectedYieldInvest(null);
    setIsYieldModalOpen(false);
  };

  // Preparação dos arcos do Gráfico de Rosca (SVG Donut)
  let cumulativePercent = 0;
  const donutSegments = Object.entries(categoryTotals).map(([cat, val]) => {
    const percent = totalPortfolio > 0 ? (val / totalPortfolio) * 100 : 0;
    const strokeDasharray = `${percent} ${100 - percent}`;
    const strokeDashoffset = -cumulativePercent;
    cumulativePercent += percent;
    return {
      cat,
      val,
      percent: percent.toFixed(1),
      color: categoryConfig[cat]?.color || '#06b6d4',
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="space-y-4">
      
      {/* Card Principal: Patrimônio Total Líquido */}
      <div className="p-4 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl shadow-2xl space-y-4 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between relative z-10 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-100 uppercase tracking-wider">Carteira de Investimentos</h3>
              <p className="text-[10px] text-slate-400">Patrimônio e Rentabilidade Real</p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-md shadow-emerald-500/20 active:scale-95 transition"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Aporte</span>
          </button>
        </div>

        {/* Destaque do Patrimônio Total */}
        <div className="relative z-10 space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Patrimônio Total Atual</span>
          <h2 className="text-3xl font-black text-slate-100 tracking-tight">
            {formatCurrency(totalPortfolio)}
          </h2>
        </div>

        {/* Linha com Total Aportado e Lucro */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/80 relative z-10">
          <div className="p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-0.5">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Total Aportado</span>
            <p className="text-xs font-black text-slate-200">{formatCurrency(totalInvested)}</p>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-0.5 text-right">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Lucro / Rendimento</span>
            <div className="flex items-center justify-end gap-1.5">
              <p className={`text-xs font-black ${totalYield >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {totalYield >= 0 ? '+' : ''}{formatCurrency(totalYield)}
              </p>
              <span className={`text-[8px] font-black px-1.5 py-0.2 rounded-md border ${
                totalYield >= 0 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}>
                {totalYield >= 0 ? '+' : ''}{yieldPercentage}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Distribuição por Classe (Donut Minimalista Neon) */}
      {totalPortfolio > 0 && (
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <PieChart className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-extrabold text-slate-100 uppercase tracking-wider">Alocação por Classe</h3>
          </div>

          <div className="flex items-center justify-between gap-4 pt-1">
            {/* Gráfico Circular SVG */}
            <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#0f172a" strokeWidth="4" />
                {donutSegments.map((seg, i) => (
                  <circle
                    key={i}
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="4"
                    strokeDasharray={seg.strokeDasharray}
                    strokeDashoffset={seg.strokeDashoffset}
                    className="transition-all duration-700"
                  />
                ))}
              </svg>
              <div className="absolute text-center">
                <span className="text-[10px] font-black text-slate-200">{investments.length}</span>
                <span className="block text-[7px] font-bold text-slate-500 uppercase">Ativos</span>
              </div>
            </div>

            {/* Legenda Lateral Interativa */}
            <div className="flex-1 space-y-1.5">
              {donutSegments.map((seg, i) => (
                <div key={i} className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }} />
                    <span className="font-bold text-slate-300">{seg.cat}</span>
                  </div>
                  <span className="font-black text-slate-200">{seg.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pílulas de Filtro por Classe */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
        {filterOptions.map(opt => {
          const isActive = activeFilter === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setActiveFilter(opt.id)}
              className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold whitespace-nowrap active:scale-95 transition ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 shadow-sm'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Lista de Ativos Modernos */}
      <div className="bg-slate-900/80 rounded-3xl border border-slate-800 overflow-hidden shadow-xl p-3.5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
          <h3 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider">Meus Ativos</h3>
          <span className="text-[10px] text-slate-400 font-semibold">{filteredInvestments.length} ativo(s)</span>
        </div>

        <div className="space-y-2 pt-1">
          {filteredInvestments.length > 0 ? (
            filteredInvestments.map(item => {
              const itemYield = Number(item.yieldTotal) || 0;
              const itemAmount = Number(item.amount) || 0;
              const currentTotal = itemAmount + itemYield;
              const IconComp = categoryConfig[item.category]?.icon || Landmark;

              return (
                <div 
                  key={item.id} 
                  className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-3 hover:bg-slate-800/30 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-cyan-400 shrink-0">
                        <IconComp className="w-4 h-4" />
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-100 leading-tight">{item.name}</p>
                          <span className="text-[8px] font-black px-1.5 py-0.2 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-400 mt-0.5">Aporte: {item.date}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Atual</span>
                      <p className="text-xs font-black text-slate-100">{formatCurrency(currentTotal)}</p>
                      <p className={`text-[9px] font-bold ${itemYield >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {itemYield >= 0 ? '+' : ''}{formatCurrency(itemYield)}
                      </p>
                    </div>
                  </div>

                  {/* Ações do Ativo Otimizadas para Celular */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/50">
                    <span className="text-[9px] text-slate-500 font-medium">
                      Aportado: {formatCurrency(itemAmount)}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenYieldModal(item)}
                        className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 text-[10px] font-extrabold px-2.5 py-1 rounded-xl flex items-center gap-1 active:scale-95 transition"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Atualizar Rendimento</span>
                      </button>

                      <button
                        onClick={() => onDeleteInvestment(item.id)}
                        className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition"
                        title="Excluir Ativo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">
              Nenhum ativo encontrado nesta classe.
            </div>
          )}
        </div>
      </div>

      {/* Modal Novo Aporte */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-extrabold text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-3">Novo Aporte de Investimento</h3>
            
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nome do Ativo</label>
                <input
                  type="text"
                  placeholder="Ex: CDB Inter, Tesouro Selic, MXRF11, Bitcoin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Classe</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Renda Fixa">Renda Fixa</option>
                    <option value="FIIs">FIIs (Imobiliário)</option>
                    <option value="Ações">Ações</option>
                    <option value="Cripto">Criptomoedas</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Valor Aportado R$</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-bold"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Data do Aporte</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-950 border border-slate-800 text-slate-400 py-3 rounded-2xl text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black py-3 rounded-2xl text-xs uppercase"
                >
                  Salvar Aporte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Atualizar Rendimento Total Acumulado */}
      {isYieldModalOpen && selectedInvest && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-5 shadow-2xl space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-100 uppercase tracking-wider">Atualizar Rendimento</h3>
              <p className="text-xs text-cyan-400 font-bold mt-1">{selectedInvest.name}</p>
            </div>

            <form onSubmit={handleSaveYield} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Digite o Rendimento Total Atual R$</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ex: 0.90"
                  value={yieldValue}
                  onChange={(e) => setYieldValue(e.target.value)}
                  className="w-full bg-slate-950 border border-cyan-500/50 rounded-2xl p-3 text-xl font-black text-cyan-400 focus:outline-none"
                  required
                  autoFocus
                />
                <p className="text-[10px] text-slate-500 pt-1">
                  Digite o valor exato do lucro acumulado que aparece na sua corretora. O app atualiza o total automaticamente.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsYieldModalOpen(false)}
                  className="flex-1 bg-slate-950 border border-slate-800 text-slate-400 py-3 rounded-2xl text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black py-3 rounded-2xl text-xs uppercase"
                >
                  Atualizar Lucro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}