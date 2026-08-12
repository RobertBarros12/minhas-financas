import React, { useState } from 'react';
import { TrendingUp, Plus, DollarSign, PieChart, ShieldCheck, Trash2 } from 'lucide-react';

export default function Investments({ investments = [], onCreateInvestment, onDeleteInvestment }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Renda Fixa (CDB / Tesouro)');
  const [amount, setAmount] = useState('');

  const formatCurrency = (val) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val) || 0);

  const totalInvested = investments.reduce((acc, item) => acc + Number(item.amount || 0), 0);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name || !amount) return;

    const newInvest = {
      id: Date.now().toString(),
      name,
      category,
      amount: parseFloat(amount.replace(',', '.')),
      date: new Date().toISOString().split('T')[0],
    };

    onCreateInvestment(newInvest);
    setName('');
    setAmount('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Topo do Módulo de Investimentos */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-slate-100 uppercase tracking-wider">Patrimônio Investido</h3>
              <p className="text-[10px] text-slate-400">Seu dinheiro trabalhando por você</p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition"
          >
            <Plus className="w-3.5 h-3.5" /> + Aporte
          </button>
        </div>

        <div className="pt-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Acumulado</span>
          <h2 className="text-2xl font-black text-emerald-400 mt-0.5">{formatCurrency(totalInvested)}</h2>
        </div>
      </div>

      {/* Lista de Ativos Investidos */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-3 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Meus Ativos</h3>
          <span className="text-[10px] text-slate-400">{investments.length} ativo(s)</span>
        </div>

        <div className="divide-y divide-slate-800/60">
          {investments && investments.length > 0 ? (
            investments.map(item => (
              <div key={item.id} className="p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-slate-200">{item.name}</p>
                  <p className="text-[10px] text-slate-400">{item.category} • {item.date}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-emerald-400">
                    {formatCurrency(item.amount)}
                  </span>
                  <button
                    onClick={() => onDeleteInvestment(item.id)}
                    className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition"
                    title="Excluir investimento"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">
              Nenhum investimento registrado. Clique em "+ Aporte" para começar a investir!
            </div>
          )}
        </div>
      </div>

      {/* Modal de Cadastro de Investimento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl">
            <h3 className="text-xs font-extrabold text-slate-100 uppercase tracking-wider">Novo Aporte de Investimento</h3>
            
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Nome do Ativo / Banco</label>
                <input
                  type="text"
                  placeholder="Ex: CDB 110% Sofisa, Tesouro Selic, IVVB11"
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