import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Summary from './components/Summary';
import TransactionModal from './components/TransactionModal';
import Bills from './components/Bills';
import QuickShortcuts from './components/QuickShortcuts';
import Vaults from './components/Vaults';
import Investments from './components/Investments';
import { 
  Plus, LayoutDashboard, CreditCard, BarChart2, Calendar as CalendarIcon, 
  CheckCircle2, Clock, Trophy, Flame, Trash2, ChevronDown, 
  ChevronUp, ShieldCheck, AlertTriangle, RefreshCw, Zap,
  ChevronLeft, ChevronRight, PiggyBank, TrendingUp
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('inicio');
  const [transactions, setTransactions] = useState([]);
  const [vaults, setVaults] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quickData, setQuickData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Seletor de Mês/Ano no topo
  const [selectedMonthYear, setSelectedMonthYear] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  // Estados do Calendário
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  // Ranking: 'items' (Maiores Gastos) ou 'categories' (Por Categoria)
  const [rankingMode, setRankingMode] = useState('items');
  const [expandedCategory, setExpandedCategory] = useState(null);

  useEffect(() => {
    fetchTransactions();
    fetchVaults();
    fetchInvestments();
  }, []);

  async function fetchTransactions() {
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (!error && data) {
      setTransactions(data);
    }
    setLoading(false);
  }

  function fetchVaults() {
    const local = localStorage.getItem('minhas_financas_vaults');
    if (local) {
      try { setVaults(JSON.parse(local)); } catch (e) {}
    }
  }

  function fetchInvestments() {
    const local = localStorage.getItem('minhas_financas_investments');
    if (local) {
      try { setInvestments(JSON.parse(local)); } catch (e) {}
    }
  }

  const saveVaults = (newVaults) => {
    setVaults(newVaults);
    localStorage.setItem('minhas_financas_vaults', JSON.stringify(newVaults));
  };

  const saveInvestments = (newInvestments) => {
    setInvestments(newInvestments);
    localStorage.setItem('minhas_financas_investments', JSON.stringify(newInvestments));
  };

  const handleCreateVault = (newVault) => {
    saveVaults([...vaults, newVault]);
  };

  const handleUpdateVaultAmount = (vaultId, delta, vaultName) => {
    const updated = vaults.map(v => {
      if (v.id === vaultId) {
        const nextAmount = Math.max(0, Number(v.currentAmount || 0) + delta);
        return { ...v, currentAmount: nextAmount };
      }
      return v;
    });
    saveVaults(updated);

    const isAdding = delta > 0;
    const tx = {
      id: `vault-${Date.now()}`,
      description: isAdding ? `Guardado em Reserva: ${vaultName}` : `Resgate de Reserva: ${vaultName}`,
      amount: Math.abs(delta).toFixed(2),
      type: isAdding ? 'expense' : 'income',
      category: 'Reserva & Caixinhas',
      paymentMethod: 'Conta Corrente / Pix',
      status: 'paid',
      date: new Date().toISOString().split('T')[0],
      installments: 1,
      isRecurring: false,
    };

    handleSaveTransaction(tx);
  };

  const handleDeleteVault = (vaultId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta Caixinha?')) return;
    saveVaults(vaults.filter(v => v.id !== vaultId));
  };

  const handleCreateInvestment = (newInvest) => {
    saveInvestments([...investments, newInvest]);

    const investTx = {
      id: `invest-${Date.now()}`,
      description: `Aporte Investimento: ${newInvest.name}`,
      amount: Number(newInvest.amount).toFixed(2),
      type: 'expense',
      category: 'Investimentos & Aplicações',
      paymentMethod: 'Conta Corrente / Pix',
      status: 'paid',
      date: newInvest.date || new Date().toISOString().split('T')[0],
      installments: 1,
      isRecurring: false,
    };

    handleSaveTransaction(investTx);
  };

  const handleDeleteInvestment = (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este investimento?')) return;
    saveInvestments(investments.filter(i => i.id !== id));
  };

  const handleAddYield = (investId, val, investName) => {
    const updated = investments.map(i => {
      if (i.id === investId) {
        return { ...i, yieldTotal: Number(i.yieldTotal || 0) + val };
      }
      return i;
    });
    saveInvestments(updated);

    const yieldTx = {
      id: `yield-${Date.now()}`,
      description: `Rendimento: ${investName}`,
      amount: val.toFixed(2),
      type: 'income',
      category: 'Rendimentos & Outros',
      paymentMethod: 'Conta Corrente / Pix',
      status: 'paid',
      date: new Date().toISOString().split('T')[0],
      installments: 1,
      isRecurring: false,
    };

    handleSaveTransaction(yieldTx);
  };

  async function handleSaveTransaction(newTx) {
    const payload = {
      id: newTx.id,
      description: newTx.description,
      amount: newTx.amount,
      type: newTx.type,
      category: newTx.category,
      payment_method: newTx.paymentMethod,
      status: newTx.status,
      date: newTx.date,
      installments: newTx.installments || 1,
      is_recurring: newTx.isRecurring || false,
    };

    const { error } = await supabase.from('transactions').insert([payload]);

    if (error) {
      console.error('Erro ao salvar no Supabase:', error);
      alert('Erro ao salvar no banco de dados.');
    } else {
      setTransactions(prev => [newTx, ...prev]);
    }
  }

  async function handleToggleStatus(id) {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    const newStatus = tx.status === 'paid' ? 'pending' : 'paid';

    const { error } = await supabase
      .from('transactions')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      setTransactions(prev =>
        prev.map(t => (t.id === id ? { ...t, status: newStatus } : t))
      );
    }
  }

  async function handleDeleteTransaction(id) {
    const targetTx = transactions.find(t => t.id === id);
    if (!targetTx) return;

    const baseDescription = targetTx.description.replace(/\s\(\d+\/\d+\)$/, '');
    const relatedParcelCount = transactions.filter(t => t.description.startsWith(baseDescription)).length;

    let deleteGroup = false;
    if (relatedParcelCount > 1) {
      deleteGroup = window.confirm(
        `Deseja excluir TODAS as ${relatedParcelCount} parcelas registradas para "${baseDescription}"?\n\nClique em OK para apagar TODAS ou Cancelar para apagar SOMENTE esta.`
      );
    } else {
      if (!window.confirm(`Tem certeza que deseja excluir "${targetTx.description}"?`)) return;
    }

    if (deleteGroup) {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .ilike('description', `${baseDescription}%`);

      if (!error) {
        setTransactions(prev => prev.filter(t => !t.description.startsWith(baseDescription)));
      }
    } else {
      const { error } = await supabase.from('transactions').delete().eq('id', id);

      if (!error) {
        setTransactions(prev => prev.filter(t => t.id !== id));
      }
    }
  }

  // Transações Filtradas por Mês/Ano
  const currentMonthTransactions = transactions.filter(
    t => t.date && t.date.startsWith(selectedMonthYear)
  );

  const totalIncome = currentMonthTransactions
    .filter(t => t.type === 'income' && t.status === 'paid')
    .reduce((acc, t) => acc + Number(t.amount || 0), 0);

  const totalExpensePaid = currentMonthTransactions
    .filter(t => t.type === 'expense' && t.status === 'paid')
    .reduce((acc, t) => acc + Number(t.amount || 0), 0);

  const totalPendingExpense = currentMonthTransactions
    .filter(t => t.type === 'expense' && t.status === 'pending')
    .reduce((acc, t) => acc + Number(t.amount || 0), 0);

  // Saldo Real em Conta Corrente
  const currentBalance = totalIncome - totalExpensePaid;

  const calculateScore = () => {
    if (totalIncome === 0 && totalExpensePaid === 0) return 100;
    if (totalIncome === 0) return 30;
    const ratio = totalExpensePaid / totalIncome;
    let baseScore = 100 - Math.round(ratio * 70);
    if (totalPendingExpense > 0) baseScore -= 10;
    return Math.max(10, Math.min(100, baseScore));
  };

  const healthScore = calculateScore();

  const smallExpenses = currentMonthTransactions.filter(
    t => t.type === 'expense' && Number(t.amount || 0) <= 40
  );
  const totalSmallExpenses = smallExpenses.reduce((acc, t) => acc + Number(t.amount || 0), 0);

  const subscriptions = currentMonthTransactions.filter(
    t => t.isRecurring || t.category === 'Assinaturas & Serviços Recorrentes'
  );
  const totalSubscriptionsMonthly = subscriptions.reduce((acc, t) => acc + Number(t.amount || 0), 0);

  // Rankings de Gastos
  const topExpensesRanking = [...currentMonthTransactions]
    .filter(t => t.type === 'expense')
    .sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0))
    .slice(0, 5);

  // Agrupamento por Categoria para o Ranking
  const expensesByCategory = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const cat = t.category || 'Gastos Aleatórios & Imprevistos';
      if (!acc[cat]) {
        acc[cat] = { total: 0, items: [] };
      }
      acc[cat].total += Number(t.amount || 0);
      acc[cat].items.push(t);
      return acc;
    }, {});

  const rankedCategories = Object.entries(expensesByCategory)
    .sort((a, b) => b[1].total - a[1].total);

  const calYear = calendarDate.getFullYear();
  const calMonth = calendarDate.getMonth();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayIndex = new Date(calYear, calMonth, 1).getDay();

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const calMonthYearStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}`;
  const selectedDayStr = `${calMonthYearStr}-${String(selectedDay).padStart(2, '0')}`;
  const selectedDayTransactions = transactions.filter(t => t.date === selectedDayStr);

  const handleOpenQuickModal = (data) => {
    setQuickData(data);
    setIsModalOpen(true);
  };

  const toggleCategoryExpand = (catName) => {
    setExpandedCategory(expandedCategory === catName ? null : catName);
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val) || 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24 selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Header com Seletor de Mês/Ano */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between shadow-lg shadow-black/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-extrabold text-slate-950 shadow-lg shadow-cyan-500/30">
            $
          </div>
          <h1 className="text-base font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Minhas Finanças
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="month"
            value={selectedMonthYear}
            onChange={(e) => setSelectedMonthYear(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-cyan-400 text-xs font-bold rounded-xl px-2 py-1 focus:outline-none focus:border-cyan-500"
          />

          <button
            onClick={() => {
              setQuickData(null);
              setIsModalOpen(true);
            }}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-md shadow-cyan-500/25 active:scale-95 transition"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Lançar</span>
          </button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-lg mx-auto p-4 space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 animate-pulse">
            Sincronizando dados...
          </div>
        ) : (
          <>
            {/* ABA 1: INÍCIO */}
            {activeTab === 'inicio' && (
              <div className="space-y-4">
                <Summary
                  balance={currentBalance}
                  expense={totalExpensePaid}
                  pendingExpense={totalPendingExpense}
                  income={totalIncome}
                  previousBalance={0}
                />

                <QuickShortcuts onSelectShortcut={handleOpenQuickModal} />

                <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl backdrop-blur-sm">
                  <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Extrato de {selectedMonthYear}</h3>
                    <span className="text-[10px] text-slate-400">{currentMonthTransactions.length} item(ns)</span>
                  </div>

                  <div className="divide-y divide-slate-800/60">
                    {currentMonthTransactions.length > 0 ? (
                      currentMonthTransactions.map(item => (
                        <div key={item.id} className="p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition">
                          <div className="space-y-0.5">
                            <p className="text-xs font-semibold text-slate-200">{item.description}</p>
                            <p className="text-[10px] text-slate-400">{item.category} • {item.date}</p>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-bold ${item.type === 'income' ? 'text-emerald-400' : 'text-slate-200'}`}>
                              {item.type === 'income' ? '+' : '-'} {formatCurrency(item.amount)}
                            </span>

                            <button
                              onClick={() => handleDeleteTransaction(item.id)}
                              className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition"
                              title="Excluir lançamento"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs text-slate-500">
                        Nenhum lançamento registrado para este mês.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ABA 2: CONTAS */}
            {activeTab === 'contas' && (
              <Bills
                transactions={transactions}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDeleteTransaction}
              />
            )}

            {/* ABA 3: RESERVAS */}
            {activeTab === 'caixinhas' && (
              <Vaults
                vaults={vaults}
                onCreateVault={handleCreateVault}
                onUpdateVaultAmount={handleUpdateVaultAmount}
                onDeleteVault={handleDeleteVault}
              />
            )}

            {/* ABA 4: INVESTIMENTOS */}
            {activeTab === 'investimentos' && (
              <Investments
                investments={investments}
                onCreateInvestment={handleCreateInvestment}
                onDeleteInvestment={handleDeleteInvestment}
                onAddYield={handleAddYield}
              />
            )}

            {/* ABA 5: ANÁLISE */}
            {activeTab === 'analise' && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Score de Saúde Financeira</span>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-black text-slate-100">{healthScore} <span className="text-xs font-semibold text-slate-500">/ 100</span></h2>
                      {healthScore >= 70 ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Excelente
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Atenção
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="relative w-14 h-14 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path className="text-slate-950" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className={healthScore >= 70 ? 'text-cyan-400' : 'text-amber-400'} strokeDasharray={`${healthScore}, 100`} strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <span className="absolute text-[11px] font-black text-slate-200">{healthScore}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-rose-400">
                      <Zap className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Ralos Invisíveis</span>
                    </div>
                    <p className="text-sm font-black text-slate-100">{formatCurrency(totalSmallExpenses)}</p>
                    <p className="text-[9px] text-slate-400">{smallExpenses.length} compras ≤ R$ 40</p>
                  </div>

                  <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-purple-400">
                      <RefreshCw className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Assinaturas / Mês</span>
                    </div>
                    <p className="text-sm font-black text-slate-100">{formatCurrency(totalSubscriptionsMonthly)}</p>
                    <p className="text-[9px] text-slate-400">~ {formatCurrency(totalSubscriptionsMonthly * 12)} / ano</p>
                  </div>
                </div>

                {/* RANKING FINANCEIRO (Maiores Gastos x Por Categoria) */}
                <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber-400" />
                      <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Ranking Financeiro</h3>
                    </div>

                    <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                      <button
                        onClick={() => setRankingMode('items')}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg transition ${
                          rankingMode === 'items'
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                            : 'text-slate-400'
                        }`}
                      >
                        Maiores Gastos
                      </button>
                      <button
                        onClick={() => setRankingMode('categories')}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg transition ${
                          rankingMode === 'categories'
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                            : 'text-slate-400'
                        }`}
                      >
                        Por Categoria
                      </button>
                    </div>
                  </div>

                  {rankingMode === 'items' && (
                    topExpensesRanking.length > 0 ? (
                      <div className="space-y-2 pt-1">
                        {topExpensesRanking.map((item, idx) => (
                          <div key={item.id} className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
                            <div className="flex items-center gap-2.5">
                              <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-extrabold ${
                                idx === 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                idx === 1 ? 'bg-slate-300/20 text-slate-300 border border-slate-300/30' :
                                idx === 2 ? 'bg-orange-600/20 text-orange-400 border border-orange-600/30' :
                                'bg-slate-800 text-slate-400'
                              }`}>
                                #{idx + 1}
                              </span>
                              <div>
                                <p className="text-xs font-semibold text-slate-200">{item.description}</p>
                                <p className="text-[10px] text-slate-400">{item.category}</p>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-rose-400">
                              - {formatCurrency(item.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 text-center py-4">Sem gastos no mês para o ranking.</p>
                    )
                  )}

                  {rankingMode === 'categories' && (
                    rankedCategories.length > 0 ? (
                      <div className="space-y-2 pt-1">
                        {rankedCategories.map(([catName, data], idx) => {
                          const isExpanded = expandedCategory === catName;
                          return (
                            <div key={catName} className="bg-slate-950/60 rounded-xl border border-slate-800/80 overflow-hidden transition">
                              <button
                                onClick={() => toggleCategoryExpand(catName)}
                                className="w-full flex items-center justify-between p-3 hover:bg-slate-800/30 transition text-left"
                              >
                                <div className="flex items-center gap-2.5">
                                  <span className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-xs font-extrabold text-cyan-400">
                                    #{idx + 1}
                                  </span>
                                  <div>
                                    <p className="text-xs font-bold text-slate-200">{catName}</p>
                                    <p className="text-[10px] text-slate-400">{data.items.length} lançamento(s)</p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-extrabold text-rose-400">
                                    - {formatCurrency(data.total)}
                                  </span>
                                  {isExpanded ? <ChevronUp className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                                </div>
                              </button>

                              {isExpanded && (
                                <div className="p-3 bg-slate-900/60 border-t border-slate-800/80 divide-y divide-slate-800/50 space-y-2">
                                  <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider pb-1">Lançamentos da Categoria {catName}:</p>
                                  {data.items.map(subItem => (
                                    <div key={subItem.id} className="pt-2 flex items-center justify-between">
                                      <div>
                                        <p className="text-xs font-semibold text-slate-300">{subItem.description}</p>
                                        <p className="text-[10px] text-slate-500">{subItem.paymentMethod || 'Geral'} • {subItem.date}</p>
                                      </div>
                                      <span className="text-xs font-bold text-slate-200">
                                        {formatCurrency(subItem.amount)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 text-center py-4">Sem gastos cadastrados no mês.</p>
                    )
                  )}
                </div>
              </div>
            )}

            {/* ABA 6: AGENDA */}
            {activeTab === 'agenda' && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-cyan-400" />
                      <h3 className="text-xs font-extrabold text-slate-100 uppercase tracking-wider">
                        {monthNames[calMonth]} {calYear}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCalendarDate(new Date(calYear, calMonth - 1, 1))}
                        className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-100 transition"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setCalendarDate(new Date());
                          setSelectedDay(new Date().getDate());
                        }}
                        className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-1 rounded-lg"
                      >
                        Hoje
                      </button>
                      <button
                        onClick={() => setCalendarDate(new Date(calYear, calMonth + 1, 1))}
                        className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-100 transition"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-500 uppercase">
                    <span>Dom</span><span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center">
                    {Array.from({ length: firstDayIndex }).map((_, i) => (
                      <div key={`empty-${i}`} className="h-9 rounded-xl bg-slate-950/20" />
                    ))}

                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const dayNum = i + 1;
                      const dayStr = `${calMonthYearStr}-${String(dayNum).padStart(2, '0')}`;
                      const dayTxs = transactions.filter(t => t.date === dayStr);
                      const hasPending = dayTxs.some(t => t.type === 'expense' && t.status === 'pending');
                      const hasPaidOnly = dayTxs.length > 0 && !hasPending;
                      const isSelected = selectedDay === dayNum;

                      return (
                        <button
                          key={dayNum}
                          onClick={() => setSelectedDay(dayNum)}
                          className={`relative h-9 rounded-xl flex flex-col items-center justify-center font-bold text-xs transition ${
                            isSelected
                              ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/30 ring-2 ring-cyan-400'
                              : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800/60'
                          }`}
                        >
                          <span>{dayNum}</span>
                          {hasPending && <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
                          {hasPaidOnly && <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                      Agenda de {String(selectedDay).padStart(2, '0')} de {monthNames[calMonth]}
                    </h3>
                    <span className="text-[10px] text-slate-400">{selectedDayTransactions.length} compromisso(s)</span>
                  </div>

                  <div className="divide-y divide-slate-800/60">
                    {selectedDayTransactions.length > 0 ? (
                      selectedDayTransactions.map(item => (
                        <div key={item.id} className="py-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            {item.status === 'paid' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                            )}
                            <div>
                              <p className="text-xs font-semibold text-slate-200">{item.description}</p>
                              <p className="text-[10px] text-slate-400">{item.category} • {item.paymentMethod}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-bold ${item.status === 'paid' ? 'text-slate-500 line-through' : 'text-amber-400'}`}>
                              {formatCurrency(item.amount)}
                            </span>
                            <button
                              onClick={() => handleDeleteTransaction(item.id)}
                              className="text-slate-500 hover:text-rose-400 p-1 rounded transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 text-center py-6">
                        Nenhum compromisso agendado para o dia {selectedDay}.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
        initialData={quickData}
      />

      {/* Menu Inferior Completo */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-lg border-t border-slate-800/80 z-40 shadow-2xl">
        <div className="max-w-lg mx-auto flex items-center justify-around p-1.5">
          {[
            { id: 'inicio', label: 'Início', icon: LayoutDashboard },
            { id: 'contas', label: 'Contas', icon: CreditCard },
            { id: 'caixinhas', label: 'Reservas', icon: PiggyBank },
            { id: 'investimentos', label: 'Investir', icon: TrendingUp },
            { id: 'analise', label: 'Análise', icon: BarChart2 },
            { id: 'agenda', label: 'Agenda', icon: CalendarIcon },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition ${
                  isActive
                    ? 'text-cyan-400 bg-cyan-500/10 font-bold shadow-inner'
                    : 'text-slate-500 hover:text-slate-300 font-medium'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[9px]">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

    </div>
  );
}