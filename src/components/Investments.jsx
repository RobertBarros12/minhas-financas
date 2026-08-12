import React, { useState } from 'react';
import { TrendingUp, Plus, DollarSign, Trash2, ArrowUpRight, Award, ShieldCheck } from 'lucide-react';

export default function Investments({ investments = [], onCreateInvestment, onDeleteInvestment, onAddYield }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isYieldModalOpen, setIsYieldModalOpen] = useState(false);
  const [selectedInvest, setSelectedYieldInvest] = useState(null);

  // Estados Novo Investimento
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Renda Fixa (CDB / Tesouro)');
  const [amount, setAmount] = useState('');

  // Estado Novo Rendimento/Dividendo
  const [yieldAmount, setYieldAmount] = useState('');

  const formatCurrency = (val) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val) || 0);

  // Cálculos Consolidados
  const totalInvested = investments.reduce((acc, item) => acc + Number(item.amount || 0), 0);
  const totalYields = investments.reduce((acc, item) => acc + Number(item.yieldTotal || 0), 0);
  
  // Porcentagem de Lucro
  const profitPercentage = totalInvested > 0 
    ? ((totalYields / totalInvested) * 100).toFixed(2) 
    : '0.00';

  const categoryBadgeColors = {
    'Renda Fixa (CDB / Tesouro)': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    'Ações & Fundos Imobiliários': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    'Criptomoedas & Ativos Digitais': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    'Fundos de Investimento / Previdência': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name || !amount) return;

    const newInvest = {
      id: Date.now().toString(),
      name,
      category,
      amount: parseFloat(amount.replace(',', '.')),
      yieldTotal: 0,
      date: new Date().toISOString().split('T')[0],
    };

    onCreateInvestment(newInvest);
    setName('');
    setAmount('');
    setIsModalOpen(false);
  };

  const handleYieldSubmit = (e) => {
    e.preventDefault();
    if (!yieldAmount || !selectedInvest) return;

    const val = parseFloat(yieldAmount.replace(',', '.'));
    onAddYield(selectedInvest.id, val, selectedInvest.name);

    setYieldAmount('');
    setSelectedYieldInvest(null);
    setIsYieldModalOpen(false);
  };

  return (
    <div className="space-y-4">
      
      {/* 1. CARDS DE PATRIMÔNIO E LUCRO REAL */}
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
            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition"
          >
            <Plus className="w-3.5 h-3.5" /> + Aporte
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Investido</span>
            <h2 className="text-xl font-black text-slate-100 mt-0.5">{formatCurrency(totalInvested)}</h2>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lucro / Rendimento</span>
            <div className="flex items-center justify-end gap-1 mt-0.5">
              <h2 className="text-xl font-black text-emerald-400">+{formatCurrency(totalYields)}</h2>
              <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md">
                +{profitPercentage}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. LISTA DE ATIVOS COM SELOS E BOTÃO DE LUCRO */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-3 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Meus Ativos</h3>
          <span className="text-[10px] text-slate-400">{investments.length} ativo(s)</span>
        </div>

        <div className="divide-y divide-slate-800/60">
          {investments && investments.length > 0 ? (
            investments.map(item => {
              const badgeStyle = categoryBadgeColors[item.category] || 'bg-slate-800 text-slate-300 border-slate-700';
              const itemYield = Number(item.yieldTotal || 0);

              return (
                <div key={item.id} className="p-3.5 space-y-2 hover:bg-slate-800/40 transition">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-100">{item.name}</p>
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md border ${badgeStyle}`}>
                          {item.category.split(' ')[0]}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">Aportado em {item.date}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-black text-emerald-400">{formatCurrency(item.amount)}</p>
                      {itemYield > 0 && (
                        <p className="text-[10px] font-bold text-emerald-400">
                          Lucro: +{formatCurrency(itemYield)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Ações Rápidas por Ativo */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800/40">
                    <button
                      onClick={() => {
                        setSelectedYieldInvest(item);
                        setIsYieldModalOpen(true);
                      }}
                      className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1 transition"
                    >
                      <ArrowUpRight className="w-3 h-3" /> + Lançar Dividendo/Lucro
                    </button>

                    <button
                      onClick={() => onDeleteInvestment(item.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded transition"
                      title="Excluir investimento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">
              Nenhum investimento registrado. Clique em "+ Aporte" para começar!
            </div>
          )}
        </div>
      </div>

      {/* MODAL NOVO APORTE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl">
            <h3 className="text-xs font-extrabold text-slate-100 uppercase tracking-wider">Novo Aporte de Investimento</h3>
            
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Nome do Ativo / Banco</label>
                <input
                  type="text"
                  placeholder="Ex: CDB Sofisa 110%, Tesouro Selic, MXRF11"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Classe do Investimento</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Renda Fixa (CDB / Tesouro)">Renda Fixa (CDB / Tesouro / LCI)</option>
                  <option value="Ações & Fundos Imobiliários">Ações & Fundos Imobiliários (FIIs)</option>
                  <option value="Criptomoedas & Ativos Digitais">Criptomoedas (Bitcoin / ETH)</option>
                  <option value="Fundos de Investimento / Previdência">Fundos / Previdência Privada</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-emerald-400 uppercase">Valor R$</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-lg font-black text-emerald-400 focus:outline-none focus:border-emerald-500"
                  required
                  autoFocus
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
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 font-black uppercase"
                >
                  Confirmar Aporte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL LANÇAR DIVIDENDO/LUCRO */}
      {isYieldModalOpen && selectedInvest && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl">
            <h3 className="text-xs font-extrabold text-slate-100 uppercase tracking-wider">
              Lançar Lucro/Dividendo em "{selectedInvest.name}"
            </h3>

            <p className="text-[11px] text-slate-400">
              Esse valor entrará como dinheiro novo na sua conta corrente no Início!
            </p>
            
            <form onSubmit={handleYieldSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-cyan-400 uppercase">Valor do Lucro R$</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={yieldAmount}
                  onChange={(e) => setYieldAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-lg font-black text-cyan-400 focus:outline-none focus:border-cyan-500"
                  required
                  autoFocus
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsYieldModalOpen(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 font-black uppercase"
                >
                  Receber Lucro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}