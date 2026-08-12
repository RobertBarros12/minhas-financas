import React, { useState } from 'react';
import { TrendingUp, Plus, Trash2, Edit3, DollarSign, Wallet } from 'lucide-react';

export default function Investments({ investments, onCreateInvestment, onDeleteInvestment, onAddYield }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isYieldModalOpen, setIsYieldModalOpen] = useState(false);
  const [selectedInvest, setSelectedYieldInvest] = useState(null);

  // Estados Novo Investimento
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Renda Fixa');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Estado Atualizar Rendimento Acumulado
  const [yieldValue, setYieldValue] = useState('');

  const formatCurrency = (val) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val) || 0);

  const totalInvested = investments.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
  const totalYield = investments.reduce((acc, i) => acc + (Number(i.yieldTotal) || 0), 0);
  const totalPortfolio = totalInvested + totalYield;
  const yieldPercentage = totalInvested > 0 ? ((totalYield / totalInvested) * 100).toFixed(2) : '0.00';

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
    // Já carrega o valor atual no campo para facilitar o ajuste de centavos
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

  return (
    <div className="space-y-4">
      {/* Resumo da Carteira */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-100 uppercase tracking-wider">Carteira de Investimentos</h3>
              <p className="text-[10px] text-slate-400">Patrimônio e Lucro em Tempo Real</p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>+ Aporte</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Investido</p>
            <p className="text-lg font-black text-slate-100">{formatCurrency(totalInvested)}</p>
          </div>

          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lucro / Rendimento</p>
            <div className="flex items-center justify-end gap-1.5 mt-0.5">
              <p className={`text-lg font-black ${totalYield >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {totalYield >= 0 ? '+' : ''}{formatCurrency(totalYield)}
              </p>
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md border ${
                totalYield >= 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              }`}>
                {totalYield >= 0 ? '+' : ''}{yieldPercentage}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Ativos */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-3 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Meus Ativos</h3>
          <span className="text-[10px] text-slate-400">{investments.length} ativo(s)</span>
        </div>

        <div className="divide-y divide-slate-800/60">
          {investments.length > 0 ? (
            investments.map(item => {
              const itemYield = Number(item.yieldTotal) || 0;
              return (
                <div key={item.id} className="p-3.5 space-y-2 hover:bg-slate-800/40 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-100">{item.name}</p>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">Aportado em {item.date}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-black text-emerald-400">{formatCurrency(item.amount)}</p>
                      <p className={`text-[10px] font-bold ${itemYield >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        Lucro: {itemYield >= 0 ? '+' : ''}{formatCurrency(itemYield)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800/40">
                    <button
                      onClick={() => handleOpenYieldModal(item)}
                      className="bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 text-cyan-400 text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Atualizar Rendimento</span>
                    </button>

                    <button
                      onClick={() => onDeleteInvestment(item.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-rose-500/10 transition"
                      title="Excluir Ativo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">
              Nenhum ativo cadastrado na carteira.
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
                  placeholder="Ex: 1.17"
                  value={yieldValue}
                  onChange={(e) => setYieldValue(e.target.value)}
                  className="w-full bg-slate-950 border border-cyan-500/50 rounded-2xl p-3 text-xl font-black text-cyan-400 focus:outline-none"
                  required
                  autoFocus
                />
                <p className="text-[10px] text-slate-500 pt-1">
                  Digite o valor exato do lucro acumulado que aparece na sua corretora (ex: 1.17). O app vai atualizar o total sem duplicar!
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