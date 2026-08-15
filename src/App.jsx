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
  ChevronLeft, ChevronRight, PiggyBank, TrendingUp,
  ShoppingBag, Utensils, Film, Sparkles, Home, Droplets,
  Car, Scissors, HeartPulse, Dog, GraduationCap, DollarSign, ArrowDownLeft,
  Search, X
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

  // Estados de Filtro e Busca do Extrato (Início)
  const [extratoFilter, setExtratoFilter] = useState('all'); // 'all', 'expense', 'income'
  const [extratoSearch, setExtratoSearch] = useState('');

  // Estados do Calendário
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  // Ranking
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

  // Busca Caixinhas / Reservas da Nuvem
  async function fetchVaults() {
    const { data, error } = await supabase.from('vaults').select('*');
    if (error) {
      console.error('Erro ao buscar caixinhas:', error);
    } else if (data) {
      const formatted = data.map(v => ({
        id: String(v.id),
        name: v.name,
        targetAmount: Number(v.target_amount),
        currentAmount: Number(v.current_amount),
      }));
      setVaults(formatted);
    }
  }

  // Busca Investimentos da Nuvem
  async function fetchInvestments() {
    const { data, error } = await supabase.from('investments').select('*').order('date', { ascending: false });
    if (error) {
      console.error('Erro ao buscar investimentos:', error);
    } else if (data) {
      const formatted = data.map(i => ({
        id: String(i.id),
        name: i.name,
        category: i.category,
        amount: Number(i.amount),
        yieldTotal: Number(i.yield_total),
        date: i.date,
      }));
      setInvestments(formatted);
    }
  }

  // Gestão de Caixinhas no Supabase
  async function handleCreateVault(newVault) {
    const payload = {
      id: String(newVault.id),
      name: newVault.name,
      target_amount: newVault.targetAmount,
      current_amount: newVault.currentAmount || 0,
    };
    const { error } = await supabase.from('vaults').insert([payload]);
    if (error) {
      console.error('Erro ao salvar caixinha no Supabase:', error);
      alert('Erro ao salvar Caixinha na nuvem.');
    } else {
      setVaults(prev => [...prev, newVault]);
    }
  }

  async function handleUpdateVaultAmount(vaultId, delta, vaultName) {
    const targetVault = vaults.find(v => String(v.id) === String(vaultId));
    if (!targetVault) return;

    const nextAmount = Math.max(0, Number(targetVault.currentAmount || 0) + delta);

    const { error } = await supabase
      .from('vaults')
      .update({ current_amount: nextAmount })
      .eq('id', String(vaultId));

    if (error) {
      console.error('Erro ao atualizar saldo da caixinha:', error);
    } else {
      setVaults(prev => prev.map(v => String(v.id) === String(vaultId) ? { ...v, currentAmount: nextAmount } : v));

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
    }
  }

  async function handleDeleteVault(vaultId) {
    if (!window.confirm('Tem certeza que deseja excluir esta Caixinha?')) return;
    const { error } = await supabase.from('vaults').delete().eq('id', String(vaultId));
    if (!error) {
      setVaults(prev => prev.filter(v => String(v.id) !== String(vaultId)));
    }
  }

  // Gestão de Investimentos no Supabase
  async function handleCreateInvestment(newInvest) {
    const payload = {
      id: String(newInvest.id),
      name: newInvest.name,
      category: newInvest.category,
      amount: newInvest.amount,
      yield_total: newInvest.yieldTotal || 0,
      date: newInvest.date,
    };

    const { error } = await supabase.from('investments').insert([payload]);
    if (error) {
      console.error('Erro ao salvar investimento no Supabase:', error);
      alert('Erro ao salvar Investimento na nuvem.');
    } else {
      setInvestments(prev => [newInvest, ...prev]);

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
    }
  }

  async function handleDeleteInvestment(id) {
    if (!window.confirm('Tem certeza que deseja excluir este investimento?')) return;
    const { error } = await supabase.from('investments').delete().eq('id', String(id));
    if (!error) {
      setInvestments(prev => prev.filter(i => String(i.id) !== String(id)));
    }
  }

  async function handleAddYield(investId, val) {
    const targetInvest = investments.find(i => String(i.id) === String(investId));
    if (!targetInvest) return;

    const { error } = await supabase
      .from('investments')
      .update({ yield_total: val })
      .eq('id', String(investId));

    if (error) {
      console.error('Erro ao atualizar rendimento no Supabase:', error);
    } else {
      setInvestments(prev => prev.map(i => String(i.id) === String(investId) ? { ...i, yieldTotal: val } : i));
    }
  }

  // Transações no Supabase
  async function handleSaveTransaction(newTx) {
    const txList = Array.isArray(newTx) ? newTx : [newTx];

    const payload = txList.map(item => ({
      id: String(item.id),
      description: item.description,
      amount: item.amount,
      type: item.type,
      category: item.category,
      payment_method: item.paymentMethod,
      status: item.status,
      date: item.date,
      installments: item.installments || 1,
      is_recurring: item.isRecurring || false,
    }));

    const { error } = await supabase.from('transactions').insert(payload);

    if (error) {
      console.error('Erro ao salvar no Supabase:', error);
      alert('Erro ao salvar no banco de dados.');
    } else {
      setTransactions(prev => [...txList, ...prev]);
    }
  }

  async function handleToggleStatus(id) {
    const tx = transactions.find(t => String(t.id) === String(id));
    if (!tx) return;

    const newStatus = tx.status === 'paid' ? 'pending' : 'paid';

    const { error } = await supabase
      .from('transactions')
      .update({ status: newStatus })
      .eq('id', String(id));

    if (!error) {
      setTransactions(prev =>
        prev.map(t => (String(t.id) === String(id) ? { ...t, status: newStatus } : t))
      );
    }
  }

  async function handleDeleteTransaction(id) {
    const targetTx = transactions.find(t => String(t.id) === String(id));
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
      const { error } = await supabase.from('transactions').delete().eq('id', String(id));

      if (!error) {
        setTransactions(prev => prev.filter(t => String(t.id) !== String(id)));
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

  // Filtragem e Busca do Extrato na Aba Início
  const filteredExtratoTransactions = currentMonthTransactions.filter(item => {
    if (extratoFilter === 'expense' && item.type !== 'expense') return false;
    if (extratoFilter === 'income' && item.type !== 'income') return false;
    if (extratoSearch.trim()) {
      const term = extratoSearch.toLowerCase();
      const matchDesc = item.description?.toLowerCase().includes(term);
      const matchCat = item.category?.toLowerCase().includes(term);
      const matchPayment = item.paymentMethod?.toLowerCase().includes(term);
      if (!matchDesc && !matchCat && !matchPayment) return false;
    }
    return true;
  });

  // Ranking
  const topExpensesRanking = [...currentMonthTransactions]
    .filter(t => t.type === 'expense')
    .sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0))
    .slice(0, 5);

  const highestSingleExpense = topExpensesRanking.length > 0 ? Number(topExpensesRanking[0].amount) : 1;

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

  const highestCategoryExpense = rankedCategories.length > 0 ? rankedCategories[0][1].total : 1;

  // Helper de Ícones Temáticos
  const getCategoryIcon = (categoryName = '', description = '') => {
    const desc = description.toLowerCase();
    const cat = categoryName.toLowerCase();

    if (desc.includes('moto') || desc.includes('carro') || cat.includes('transporte') || cat.includes('veículo') || desc.includes('uber')) return Car;
    if (desc.includes('show') || desc.includes('cinema') || desc.includes('voo') || desc.includes('viagem') || cat.includes('lazer')) return Film;
    if (desc.includes('mercado') || cat.includes('supermercado')) return ShoppingBag;
    if (desc.includes('ifood') || desc.includes('restaurante') || cat.includes('alimentação') || desc.includes('lanche')) return Utensils;
    if (desc.includes('corte') || desc.includes('cabelo') || cat.includes('beleza') || cat.includes('pessoal')) return Scissors;
    if (cat.includes('moradia') || cat.includes('aluguel')) return Home;
    if (cat.includes('consumo') || desc.includes('luz') || desc.includes('água') || desc.includes('gas') || desc.includes('gás') || desc.includes('gasolina') || desc.includes('posto')) return Droplets;
    if (cat.includes('saúde') || desc.includes('farmácia') || desc.includes('sabonete')) return HeartPulse;
    if (cat.includes('pet')) return Dog;
    if (cat.includes('educação')) return GraduationCap;
    if (cat.includes('financiamento')) return DollarSign;
    return Sparkles;
  };

  // Cálculos do Calendário da Agenda
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

  const selectedDayPaidTotal = selectedDayTransactions
    .filter(t => t.type === 'expense' && t.status === 'paid')
    .reduce((acc, t) => acc + Number(t.amount || 0), 0);

  const selectedDayPendingTotal = selectedDayTransactions
    .filter(t => t.type === 'expense' && t.status === 'pending')
    .reduce((acc, t) => acc + Number(t.amount || 0), 0);

  const handleOpenQuickModal = (data) => {
    setQuickData(data);
    setIsModalOpen(true);
  };

  const handleScheduleForSelectedDay = () => {
    setQuickData({
      date: selectedDayStr,
      description: '',
      type: 'expense'
    });
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

      {/* Conteúdo Principal Otimizado para Mobile */}
      <main className="max-w-lg mx-auto p-4 space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 animate-pulse">
            Sincronizando dados...
          </div>
        ) : (
          <>
            {/* ABA 1: INÍCIO COM EXTRATO FILTRÁVEL */}
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

                {/* Extrato do Mês com Filtros e Busca Rápida */}
                <div className="bg-slate-900/80 rounded-3xl border border-slate-800 overflow-hidden shadow-xl backdrop-blur-sm p-3.5 space-y-3">
                  
                  {/* Cabeçalho do Extrato */}
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                    <div>
                      <h3 className="text-xs font-extrabold text-slate-100 uppercase tracking-wider">
                        Extrato de {selectedMonthYear}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        {filteredExtratoTransactions.length} de {currentMonthTransactions.length} lançamento(s)
                      </p>
                    </div>
                  </div>

                  {/* Barra de Busca Rápida */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Buscar por nome, categoria ou forma..."
                      value={extratoSearch}
                      onChange={(e) => setExtratoSearch(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl pl-9 pr-8 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/80 transition"
                    />
                    {extratoSearch && (
                      <button
                        onClick={() => setExtratoSearch('')}
                        className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Pílulas de Filtro (Todos / Saídas / Entradas) */}
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800/80">
                    <button
                      onClick={() => setExtratoFilter('all')}
                      className={`py-1.5 rounded-xl text-[11px] font-bold transition ${
                        extratoFilter === 'all'
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Todos
                    </button>
                    <button
                      onClick={() => setExtratoFilter('expense')}
                      className={`py-1.5 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 ${
                        extratoFilter === 'expense'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      Saídas
                    </button>
                    <button
                      onClick={() => setExtratoFilter('income')}
                      className={`py-1.5 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 ${
                        extratoFilter === 'income'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Entradas
                    </button>
                  </div>

                  {/* Lista de Cards do Extrato Filtrado */}
                  <div className="space-y-2 pt-1 max-h-[480px] overflow-y-auto pr-0.5 no-scrollbar">
                    {filteredExtratoTransactions.length > 0 ? (
                      filteredExtratoTransactions.map(item => {
                        const IconComponent = getCategoryIcon(item.category, item.description);
                        const isIncome = item.type === 'income';

                        return (
                          <div 
                            key={item.id} 
                            className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80 flex items-center justify-between hover:bg-slate-800/30 transition"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                isIncome 
                                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                                  : 'bg-slate-800/60 border border-slate-700/50 text-cyan-400'
                              }`}>
                                {isIncome ? <ArrowDownLeft className="w-4 h-4" /> : <IconComponent className="w-4 h-4" />}
                              </div>

                              <div>
                                <p className="text-xs font-semibold text-slate-200 leading-tight">{item.description}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[9px] text-slate-400">{item.date}</span>
                                  <span className="text-[9px] text-slate-500">•</span>
                                  <span className="text-[9px] text-cyan-400/90 font-medium">{item.paymentMethod || 'Geral'}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2.5">
                              <span className={`text-xs font-black ${isIncome ? 'text-emerald-400' : 'text-slate-200'}`}>
                                {isIncome ? '+' : '-'} {formatCurrency(item.amount)}
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
                        );
                      })
                    ) : (
                      <div className="p-6 text-center text-xs text-slate-500 space-y-1">
                        <p>Nenhum lançamento encontrado para os filtros selecionados.</p>
                        {extratoSearch && (
                          <button
                            onClick={() => setExtratoSearch('')}
                            className="text-[10px] font-bold text-cyan-400 underline pt-1"
                          >
                            Limpar busca
                          </button>
                        )}
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
                selectedMonthYear={selectedMonthYear}
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

                {/* RANKING FINANCEIRO */}
                <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber-400" />
                      <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Ranking de Impacto</h3>
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
                      <div className="space-y-2.5 pt-1">
                        {topExpensesRanking.map((item, idx) => {
                          const IconComponent = getCategoryIcon(item.category, item.description);
                          const percentageImpact = ((Number(item.amount) / highestSingleExpense) * 100).toFixed(0);
                          const isTop1 = idx === 0;

                          return (
                            <div 
                              key={item.id} 
                              className={`p-3 bg-slate-950/60 rounded-2xl border transition relative overflow-hidden ${
                                isTop1 ? 'border-amber-500/40 shadow-lg shadow-amber-500/5' : 'border-slate-800/80'
                              }`}
                            >
                              <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-3">
                                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                                    isTop1 
                                      ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-sm shadow-amber-500/20' 
                                      : 'bg-slate-800/60 border border-slate-700/50 text-cyan-400'
                                  }`}>
                                    <IconComponent className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <p className="text-xs font-bold text-slate-100">{item.description}</p>
                                      {isTop1 && (
                                        <span className="text-[8px] font-black uppercase tracking-wider bg-amber-500/20 border border-amber-500/40 text-amber-400 px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                                          <Flame className="w-2.5 h-2.5" /> Maior Gasto
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-0.5">{item.category}</p>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <span className="text-xs font-black text-rose-400">
                                    - {formatCurrency(item.amount)}
                                  </span>
                                </div>
                              </div>

                              <div className="w-full bg-slate-900 h-1.5 rounded-full mt-2.5 overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    isTop1 ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                                  }`}
                                  style={{ width: `${percentageImpact}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 text-center py-4">Sem gastos no mês para o ranking.</p>
                    )
                  )}

                  {rankingMode === 'categories' && (
                    rankedCategories.length > 0 ? (
                      <div className="space-y-2.5 pt-1">
                        {rankedCategories.map(([catName, data], idx) => {
                          const isExpanded = expandedCategory === catName;
                          const IconComponent = getCategoryIcon(catName);
                          const percentageImpact = ((data.total / highestCategoryExpense) * 100).toFixed(0);
                          const isTop1 = idx === 0;

                          return (
                            <div key={catName} className={`bg-slate-950/60 rounded-2xl border overflow-hidden transition ${
                              isTop1 ? 'border-amber-500/40' : 'border-slate-800/80'
                            }`}>
                              <button
                                onClick={() => toggleCategoryExpand(catName)}
                                className="w-full p-3 hover:bg-slate-800/30 transition text-left space-y-2.5"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                                      isTop1 
                                        ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' 
                                        : 'bg-slate-800/60 border border-slate-700/50 text-cyan-400'
                                    }`}>
                                      <IconComponent className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-slate-200">{catName}</p>
                                      <p className="text-[10px] text-slate-400">{data.items.length} lançamento(s)</p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-black text-rose-400">
                                      - {formatCurrency(data.total)}
                                    </span>
                                    {isExpanded ? <ChevronUp className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                                  </div>
                                </div>

                                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      isTop1 ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                                    }`}
                                    style={{ width: `${percentageImpact}%` }}
                                  />
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

                  <div className="grid grid-cols-7 gap-1.5 text-center">
                    {Array.from({ length: firstDayIndex }).map((_, i) => (
                      <div key={`empty-${i}`} className="h-10 rounded-xl bg-slate-950/20" />
                    ))}

                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const dayNum = i + 1;
                      const dayStr = `${calMonthYearStr}-${String(dayNum).padStart(2, '0')}`;
                      const dayTxs = transactions.filter(t => t.date === dayStr);
                      
                      const hasPending = dayTxs.some(t => t.type === 'expense' && t.status === 'pending');
                      const hasPaidExpense = dayTxs.some(t => t.type === 'expense' && t.status === 'paid');
                      const hasIncome = dayTxs.some(t => t.type === 'income');
                      const isSelected = selectedDay === dayNum;

                      const isToday = 
                        new Date().getDate() === dayNum && 
                        new Date().getMonth() === calMonth && 
                        new Date().getFullYear() === calYear;

                      return (
                        <button
                          key={dayNum}
                          onClick={() => setSelectedDay(dayNum)}
                          className={`relative h-10 rounded-xl flex flex-col items-center justify-center font-bold text-xs transition ${
                            isSelected
                              ? 'bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-500/25 ring-2 ring-cyan-400 scale-[1.03]'
                              : isToday
                              ? 'bg-slate-900 border border-cyan-400/80 text-cyan-300 font-black'
                              : 'bg-slate-950/70 text-slate-300 hover:bg-slate-800/60 border border-slate-800/50'
                          }`}
                        >
                          <span>{dayNum}</span>
                          
                          <div className="flex items-center gap-0.5 mt-0.5">
                            {hasPending && (
                              <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-slate-950' : 'bg-rose-500 animate-pulse'}`} />
                            )}
                            {hasPaidExpense && !hasPending && (
                              <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-slate-950' : 'bg-emerald-400'}`} />
                            )}
                            {hasIncome && (
                              <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-slate-950' : 'bg-blue-400'}`} />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3.5 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div>
                      <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                        {String(selectedDay).padStart(2, '0')} de {monthNames[calMonth]}
                      </h3>
                      <p className="text-[10px] text-slate-400">{selectedDayTransactions.length} lançamento(s)</p>
                    </div>

                    <button
                      onClick={handleScheduleForSelectedDay}
                      className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 transition"
                    >
                      <Plus className="w-3 h-3 stroke-[3]" />
                      <span>+ Agendar</span>
                    </button>
                  </div>

                  {selectedDayTransactions.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Pago no Dia</span>
                        <p className="text-xs font-black text-slate-100 mt-0.5">{formatCurrency(selectedDayPaidTotal)}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">A Pagar (Pendente)</span>
                        <p className="text-xs font-black text-amber-400 mt-0.5">{formatCurrency(selectedDayPendingTotal)}</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {selectedDayTransactions.length > 0 ? (
                      selectedDayTransactions.map(item => {
                        const IconComponent = getCategoryIcon(item.category, item.description);
                        const isIncome = item.type === 'income';

                        return (
                          <div 
                            key={item.id} 
                            className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80 flex items-center justify-between hover:bg-slate-800/30 transition"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                                isIncome 
                                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                                  : item.status === 'pending'
                                  ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                                  : 'bg-slate-800/60 border border-slate-700/50 text-cyan-400'
                              }`}>
                                <IconComponent className="w-4 h-4" />
                              </div>

                              <div>
                                <div className="flex items-center gap-1.5">
                                  <p className="text-xs font-semibold text-slate-200">{item.description}</p>
                                  {!isIncome && (
                                    <button
                                      onClick={() => handleToggleStatus(item.id)}
                                      className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded-md border flex items-center gap-0.5 transition ${
                                        item.status === 'paid'
                                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                          : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                      }`}
                                    >
                                      {item.status === 'paid' ? '✓ Pago' : '⏳ Pendente'}
                                    </button>
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-400 mt-0.5">{item.category} • {item.paymentMethod || 'Geral'}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2.5">
                              <span className={`text-xs font-black ${
                                isIncome ? 'text-emerald-400' : item.status === 'paid' ? 'text-slate-300' : 'text-amber-400'
                              }`}>
                                {isIncome ? '+' : '-'} {formatCurrency(item.amount)}
                              </span>

                              <button
                                onClick={() => handleDeleteTransaction(item.id)}
                                className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-rose-500/10 transition"
                                title="Excluir lançamento"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-6 space-y-2">
                        <p className="text-xs text-slate-500">Nenhum compromisso para este dia.</p>
                        <button
                          onClick={handleScheduleForSelectedDay}
                          className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-xl hover:bg-cyan-500/20 transition"
                        >
                          + Agendar Lançamento
                        </button>
                      </div>
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