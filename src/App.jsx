import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Summary from './components/Summary';
import TransactionModal from './components/TransactionModal';
import Bills from './components/Bills';
import QuickShortcuts from './components/QuickShortcuts';
import { 
  Plus, LayoutDashboard, CreditCard, BarChart2, Calendar, 
  CheckCircle2, Clock, Trophy, Flame, Trash2, ChevronDown, 
  ChevronUp, ShieldCheck, AlertTriangle, RefreshCw, Zap, TrendingUp, TrendingDown 
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('inicio');
  const [transactions, setTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quickData, setQuickData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Controle de alternância do Ranking e gavetas sanfona
  const [rankingMode, setRankingMode] = useState('items'); // 'items' ou 'methods'
  const [expandedMethod, setExpandedMethod] = useState(null);

  const categoryColors = {
    'Moradia & Contas Fixas': 'from-blue-600 to-indigo-600',
    'Contas de Consumo': 'from-sky-500 to-blue-500',
    'Supermercado & Feira': 'from-emerald-500 to-teal-500',
    'Restaurantes & iFood': 'from-orange-500 to-rose-500',
    'Uber / Transporte Público': 'from-purple-500 to-indigo-500',
    'Combustível & Manutenção': 'from-violet-500 to-purple-600',
    'Vestuário, Roupas & Compras': 'from-cyan-500 to-blue-500',
    'Saúde & Farmácia': 'from-red-500 to-rose-500',
    'Educação & Cursos': 'from-amber-500 to-yellow-500',
    'Lazer & Entretenimento': 'from-pink-500 to-rose-500',
    'Financiamentos & Empréstimos': 'from-rose-600 to-red-700',
    'Gastos Aleatórios & Imprevistos': 'from-slate-400 to-slate-600',
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Erro ao buscar do Supabase:', error);
    } else if (data) {
      setTransactions(data);
    }
    setLoading(false);
  }

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

    if (error) {
      console.error('Erro ao atualizar:', error);
    } else {
      setTransactions(prev =>
        prev.map(t => (t.id === id ? { ...t, status: newStatus } : t))
      );
    }
  }

  async function handleDeleteTransaction(id) {
    if (!window.confirm('Tem certeza que deseja excluir este lançamento?')) return;

    const { error } = await supabase.from('transactions').delete().eq('id', id);

    if (error) {
      console.error('Erro ao deletar:', error);
      alert('Erro ao excluir lançamento.');
    } else {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  }

  // Datas e Filtros de Período
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthNum = now.getMonth() + 1;
  const currentMonthYear = `${currentYear}-${String(currentMonthNum).padStart(2, '0')}`;

  // Mês Anterior para o Comparativo
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthYear = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

  // Transações do Mês Atual e do Mês Anterior
  const currentMonthTransactions = transactions.filter(t => t.date && t.date.startsWith(currentMonthYear));
  const prevMonthTransactions = transactions.filter(t => t.date && t.date.startsWith(prevMonthYear));

  // Totais Atuais
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

  // Total do Mês Anterior para Comparativo
  const prevTotalExpensePaid = prevMonthTransactions
    .filter(t => t.type === 'expense' && t.status === 'paid')
    .reduce((acc, t) => acc + Number(t.amount || 0), 0);

  const expenseDiffPercent = prevTotalExpensePaid > 0 
    ? Math.round(((totalExpensePaid - prevTotalExpensePaid) / prevTotalExpensePaid) * 100) 
    : 0;

  // 1. CÁLCULO DO SCORE DE SAÚDE FINANCEIRA (0 a 100)
  const calculateScore = () => {
    if (totalIncome === 0 && totalExpensePaid === 0) return 100;
    if (totalIncome === 0) return 30;
    
    const ratio = totalExpensePaid / totalIncome;
    let baseScore = 100 - Math.round(ratio * 70);

    if (totalPendingExpense > 0) baseScore -= 10;
    return Math.max(10, Math.min(100, baseScore));
  };

  const healthScore = calculateScore();

  // 2. DETECÇÃO DE RALOS INVISÍVEIS (Pequenos gastos repetidos < R$ 40)
  const smallExpenses = currentMonthTransactions.filter(
    t => t.type === 'expense' && Number(t.amount || 0) <= 40
  );
  const totalSmallExpenses = smallExpenses.reduce((acc, t) => acc + Number(t.amount || 0), 0);

  // 3. RASTREADOR DE ASSINATURAS E SERVIÇOS RECORRENTES
  const subscriptions = currentMonthTransactions.filter(
    t => t.isRecurring || t.category === 'Contas de Consumo' || t.description.toLowerCase().includes('netflix') || t.description.toLowerCase().includes('spotify')
  );
  const totalSubscriptionsMonthly = subscriptions.reduce((acc, t) => acc + Number(t.amount || 0), 0);

  // Rankings
  const topExpensesRanking = [...currentMonthTransactions]
    .filter(t => t.type === 'expense')
    .sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0))
    .slice(0, 5);

  const expensesByMethod = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const method = t.paymentMethod || 'Outros';
      if (!acc[method]) {
        acc[method] = { total: 0, items: [] };
      }
      acc[method].total += Number(t.amount || 0);
      acc[method].items.push(t);
      return acc;
    }, {});

  const rankedMethods = Object.entries(expensesByMethod)
    .sort((a, b) => b[1].total - a[1].total);

  // Regra 50/30/20
  const needsExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense' && (t.category?.includes('Mercado') || t.category?.includes('Contas') || t.category?.includes('Moradia')))
    .reduce((acc, t) => acc + Number(t.amount || 0), 0);

  const wantsExpenses = totalExpensePaid - needsExpenses;

  const needsRatio = totalIncome > 0 ? Math.round((needsExpenses / totalIncome) * 100) : 0;
  const wantsRatio = totalIncome > 0 ? Math.round((wantsExpenses / totalIncome) * 100) : 0;

  const handleOpenQuickModal = (data) => {
    setQuickData(data);
    setIsModalOpen(true);
  };

  const toggleMethodExpand = (methodName) => {
    setExpandedMethod(expandedMethod === methodName ? null : methodName);
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val) || 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24 selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Header Neon */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between shadow-lg shadow-black/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-extrabold text-slate-950 shadow-lg shadow-cyan-500/30">
            $
          </div>
          <h1 className="text-base font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Minhas Finanças
          </h1>
        </div>

        <button
          onClick={() => {
            setQuickData(null);
            setIsModalOpen(true);
          }}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-md shadow-cyan-500/25 active:scale-95 transition"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Lançar</span>
        </button>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-lg mx-auto p-4 space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 animate-pulse">
            Sincronizando com a nuvem...
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

                {/* Extrato do Mês */}
                <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl backdrop-blur-sm">
                  <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Lançamentos do Mês</h3>
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
                        Nenhum lançamento registrado neste mês.
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

            {/* ABA 3: ANÁLISE ULTRA-TECNOLÓGICA */}
            {activeTab === 'analise' && (
              <div className="space-y-4">
                
                {/* 1. SCORE DE SAÚDE FINANCEIRA */}
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

                  {/* Anel de Progresso Circular */}
                  <div className="relative w-14 h-14 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-950"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={healthScore >= 70 ? 'text-cyan-400' : 'text-amber-400'}
                        strokeDasharray={`${healthScore}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-[11px] font-black text-slate-200">{healthScore}%</span>
                  </div>
                </div>

                {/* 2. CARD DE RALOS INVISÍVEIS & ASSINATURAS */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Pequenos Gastos */}
                  <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-rose-400">
                      <Zap className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Ralos Invisíveis</span>
                    </div>
                    <p className="text-sm font-black text-slate-100">{formatCurrency(totalSmallExpenses)}</p>
                    <p className="text-[9px] text-slate-400">{smallExpenses.length} compras ≤ R$ 40</p>
                  </div>

                  {/* Assinaturas & Recorrentes */}
                  <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-purple-400">
                      <RefreshCw className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Assinaturas / Mês</span>
                    </div>
                    <p className="text-sm font-black text-slate-100">{formatCurrency(totalSubscriptionsMonthly)}</p>
                    <p className="text-[9px] text-slate-400">~ {formatCurrency(totalSubscriptionsMonthly * 12)} / ano</p>
                  </div>
                </div>

                {/* 3. RANKING FINANCEIRO INTERATIVO */}
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
                        onClick={() => setRankingMode('methods')}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg transition ${
                          rankingMode === 'methods'
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                            : 'text-slate-400'
                        }`}
                      >
                        Por Modalidade
                      </button>
                    </div>
                  </div>

                  {/* Modo 1: Maiores Gastos */}
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

                  {/* Modo 2: Por Modalidade */}
                  {rankingMode === 'methods' && (
                    rankedMethods.length > 0 ? (
                      <div className="space-y-2 pt-1">
                        {rankedMethods.map(([methodName, data], idx) => {
                          const isExpanded = expandedMethod === methodName;
                          return (
                            <div key={methodName} className="bg-slate-950/60 rounded-xl border border-slate-800/80 overflow-hidden transition">
                              <button
                                onClick={() => toggleMethodExpand(methodName)}
                                className="w-full flex items-center justify-between p-3 hover:bg-slate-800/30 transition text-left"
                              >
                                <div className="flex items-center gap-2.5">
                                  <span className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-xs font-extrabold text-cyan-400">
                                    #{idx + 1}
                                  </span>
                                  <div>
                                    <p className="text-xs font-bold text-slate-200">{methodName}</p>
                                    <p className="text-[10px] text-slate-400">{data.items.length} lançamento(s) • Clique para ver</p>
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
                                  <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider pb-1">Itens pagos via {methodName}:</p>
                                  {data.items.map(subItem => (
                                    <div key={subItem.id} className="pt-2 flex items-center justify-between">
                                      <div>
                                        <p className="text-xs font-semibold text-slate-300">{subItem.description}</p>
                                        <p className="text-[10px] text-slate-500">{subItem.category} • {subItem.date}</p>
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

                {/* 4. COMPARATIVO COM O MÊS ANTERIOR */}
                <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Comparativo de Gastos</span>
                    <p className="text-xs font-semibold text-slate-200">Vs. Mês Anterior ({formatCurrency(prevTotalExpensePaid)})</p>
                  </div>
                  <div className={`px-3 py-1 rounded-xl border flex items-center gap-1 font-extrabold text-xs ${
                    expenseDiffPercent <= 0
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {expenseDiffPercent <= 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                    <span>{expenseDiffPercent > 0 ? `+${expenseDiffPercent}%` : `${expenseDiffPercent}%`}</span>
                  </div>
                </div>

                {/* EQUILÍBRIO 50/30/20 */}
                <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                    <Flame className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Equilíbrio Financeiro (50/30/20)</h3>
                  </div>

                  <div className="space-y-2">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-300">Necessidades Básicas (Ideal: 50%)</span>
                        <span className="text-cyan-400 font-bold">{needsRatio}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: `${Math.min(needsRatio, 100)}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-300">Desejos & Lazer (Ideal: 30%)</span>
                        <span className="text-pink-400 font-bold">{wantsRatio}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full" style={{ width: `${Math.min(wantsRatio, 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ABA 4: AGENDA */}
            {activeTab === 'agenda' && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-cyan-400" />
                      <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Cronograma do Mês</h3>
                    </div>
                    <span className="text-[10px] text-slate-400">{currentMonthTransactions.length} compromissos</span>
                  </div>

                  <div className="divide-y divide-slate-800/60">
                    {currentMonthTransactions.length > 0 ? (
                      currentMonthTransactions.map(item => (
                        <div key={item.id} className="py-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            {item.status === 'paid' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                            )}
                            <div>
                              <p className="text-xs font-semibold text-slate-200">{item.description}</p>
                              <p className="text-[10px] text-slate-400">Vencimento: {item.date}</p>
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
                      <p className="text-xs text-slate-500 text-center py-4">Nenhum compromisso neste mês.</p>
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

      <nav className="fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-lg border-t border-slate-800/80 z-40 shadow-2xl">
        <div className="max-w-lg mx-auto flex items-center justify-around p-2">
          {[
            { id: 'inicio', label: 'Início', icon: LayoutDashboard },
            { id: 'contas', label: 'Contas', icon: CreditCard },
            { id: 'analise', label: 'Análise', icon: BarChart2 },
            { id: 'agenda', label: 'Agenda', icon: Calendar },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-2xl w-16 transition ${
                  isActive
                    ? 'text-cyan-400 bg-cyan-500/10 font-bold shadow-inner'
                    : 'text-slate-500 hover:text-slate-300 font-medium'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px]">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

    </div>
  );
}