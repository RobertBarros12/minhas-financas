import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Summary from './components/Summary';
import TransactionModal from './components/TransactionModal';
import Bills from './components/Bills';
import QuickShortcuts from './components/QuickShortcuts';
import { Plus, LayoutDashboard, CreditCard, BarChart2, Calendar, CheckCircle2, Clock, ShieldCheck, AlertTriangle, TrendingUp, Trophy, Flame } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('inicio');
  const [transactions, setTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quickData, setQuickData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Paleta de cores moderna por categoria
  const categoryColors = {
    'Alimentação / Mercado': 'from-amber-500 to-orange-500',
    'Restaurantes & iFood': 'from-orange-500 to-rose-500',
    'Supermercado & Feira': 'from-emerald-500 to-teal-500',
    'Uber / Transporte Público': 'from-purple-500 to-indigo-500',
    'Vestuário, Roupas & Compras': 'from-cyan-500 to-blue-500',
    'Lazer & Entretenimento': 'from-pink-500 to-rose-500',
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
      .order('created_at', { ascending: false });

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
      alert('Erro ao salvar no banco de dados. Tente novamente.');
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
    const { error } = await supabase.from('transactions').delete().eq('id', id);

    if (error) {
      console.error('Erro ao deletar:', error);
    } else {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  }

  // Métricas Consolidadas
  const totalIncome = transactions
    .filter(t => t.type === 'income' && t.status === 'paid')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalExpensePaid = transactions
    .filter(t => t.type === 'expense' && t.status === 'paid')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalPendingExpense = transactions
    .filter(t => t.type === 'expense' && t.status === 'pending')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const currentBalance = totalIncome - totalExpensePaid;

  // Agrupamento por Categoria
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const cat = t.category || 'Outros';
      acc[cat] = (acc[cat] || 0) + Number(t.amount);
      return acc;
    }, {});

  const totalExpenseOverall = Object.values(expensesByCategory).reduce((a, b) => a + b, 0);

  // Ranking dos Maiores Gastos Individuais
  const topExpensesRanking = [...transactions]
    .filter(t => t.type === 'expense')
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .slice(0, 5);

  // Saúde Financeira (Porcentagem comprometida da renda)
  const commitmentRatio = totalIncome > 0 ? Math.round((totalExpensePaid / totalIncome) * 100) : 0;

  // Projeção Simples para Fim do Mês (baseado em ~30 dias)
  const currentDay = new Date().getDate() || 1;
  const projectedExpense = Math.round((totalExpensePaid / currentDay) * 30);

  // Regra 50/30/20 (Estimativa por Categorias)
  const needsExpenses = transactions
    .filter(t => t.type === 'expense' && (t.category?.includes('Mercado') || t.category?.includes('Contas') || t.category?.includes('Saúde')))
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const wantsExpenses = totalExpensePaid - needsExpenses;

  const needsRatio = totalIncome > 0 ? Math.round((needsExpenses / totalIncome) * 100) : 0;
  const wantsRatio = totalIncome > 0 ? Math.round((wantsExpenses / totalIncome) * 100) : 0;

  const handleOpenQuickModal = (data) => {
    setQuickData(data);
    setIsModalOpen(true);
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

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

                {/* Extrato Recente */}
                <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl backdrop-blur-sm">
                  <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Lançamentos Recentes</h3>
                    <span className="text-[10px] text-slate-400">{transactions.length} item(ns)</span>
                  </div>

                  <div className="divide-y divide-slate-800/60">
                    {transactions.length > 0 ? (
                      transactions.slice(0, 5).map(item => (
                        <div key={item.id} className="p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition">
                          <div className="space-y-0.5">
                            <p className="text-xs font-semibold text-slate-200">{item.description}</p>
                            <p className="text-[10px] text-slate-400">{item.category} • {item.date}</p>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs font-bold ${item.type === 'income' ? 'text-emerald-400' : 'text-slate-200'}`}>
                              {item.type === 'income' ? '+' : '-'} {formatCurrency(item.amount)}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs text-slate-500">
                        Nenhum lançamento registrado. Clique em "+ Lançar"!
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

            {/* ABA 3: ANÁLISE ULTRA-MODERNA + RANKING */}
            {activeTab === 'analise' && (
              <div className="space-y-4">
                
                {/* 1. RANKING DOS MAIORES GASTOS */}
                <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber-400" />
                      <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Ranking dos Maiores Gastos</h3>
                    </div>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                      Top 5
                    </span>
                  </div>

                  {topExpensesRanking.length > 0 ? (
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
                    <p className="text-xs text-slate-500 text-center py-4">Sem gastos cadastrados para o ranking.</p>
                  )}
                </div>

                {/* 2. REGRA 50/30/20 */}
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

                {/* 3. CARD DE PROJEÇÃO DE GASTOS */}
                <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-bold text-slate-300">Projeção para o Fim do Mês</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Com base no seu ritmo atual de saídas</p>
                  </div>
                  <span className="text-sm font-extrabold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-xl border border-purple-500/20">
                    ~ {formatCurrency(projectedExpense)}
                  </span>
                </div>

                {/* 4. DETALHAMENTO POR CATEGORIA COM CORES */}
                <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3 shadow-xl">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                    <BarChart2 className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Detalhamento por Categoria</h3>
                  </div>

                  {Object.keys(expensesByCategory).length > 0 ? (
                    <div className="space-y-3 pt-1">
                      {Object.entries(expensesByCategory).map(([cat, val]) => {
                        const percent = totalExpenseOverall > 0 ? Math.round((val / totalExpenseOverall) * 100) : 0;
                        const gradient = categoryColors[cat] || 'from-cyan-500 to-blue-600';

                        return (
                          <div key={cat} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-slate-200">{cat}</span>
                              <span className="text-cyan-400 font-bold">{formatCurrency(val)} <span className="text-slate-500 text-[10px]">({percent}%)</span></span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
                              <div
                                className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-500`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-4">Nenhum gasto registrado para análise.</p>
                  )}
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
                      <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Cronograma de Contas</h3>
                    </div>
                    <span className="text-[10px] text-slate-400">{transactions.length} compromissos</span>
                  </div>

                  <div className="divide-y divide-slate-800/60">
                    {transactions.length > 0 ? (
                      transactions.map(item => (
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
                          <span className={`text-xs font-bold ${item.status === 'paid' ? 'text-slate-500 line-through' : 'text-amber-400'}`}>
                            {formatCurrency(item.amount)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 text-center py-4">Nenhuma conta no cronograma.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal de Cadastro */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
        initialData={quickData}
      />

      {/* Navegação Inferior Modernizada */}
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