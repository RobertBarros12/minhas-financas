import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Summary from './components/Summary';
import TransactionModal from './components/TransactionModal';
import Bills from './components/Bills';
import { Plus, LayoutDashboard, Calendar, Target, CreditCard, BarChart2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('inicio');
  const [transactions, setTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quickData, setQuickData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Carregar transações do Supabase ao abrir o app
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
      console.error('Erro ao buscar transações:', error);
    } else if (data) {
      setTransactions(data);
    }
    setLoading(false);
  }

  // 2. Salvar nova transação no Supabase
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
      alert('Erro ao salvar lançamento. Verifique sua conexão.');
    } else {
      setTransactions(prev => [newTx, ...prev]);
    }
  }

  // 3. Alternar Status (Pago / Pendente)
  async function handleToggleStatus(id) {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    const newStatus = tx.status === 'paid' ? 'pending' : 'paid';

    const { error } = await supabase
      .from('transactions')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar status:', error);
    } else {
      setTransactions(prev =>
        prev.map(t => (t.id === id ? { ...t, status: newStatus } : t))
      );
    }
  }

  // 4. Deletar Transação
  async function handleDeleteTransaction(id) {
    const { error } = await supabase.from('transactions').delete().eq('id', id);

    if (error) {
      console.error('Erro ao deletar:', error);
    } else {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  }

  // Cálculos consolidados para a Home
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

  const handleOpenQuickModal = (data) => {
    setQuickData(data);
    setIsModalOpen(true);
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24 selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Top Bar / Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-extrabold text-slate-950 shadow-lg shadow-cyan-500/20">
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
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-md shadow-cyan-500/20 active:scale-95 transition"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Lançar</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="max-w-lg mx-auto p-4 space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 animate-pulse">
            Carregando seus dados da nuvem...
          </div>
        ) : (
          <>
            {activeTab === 'inicio' && (
              <div className="space-y-4">
                <Summary
                  balance={currentBalance}
                  expense={totalExpensePaid}
                  pendingExpense={totalPendingExpense}
                  income={totalIncome}
                  previousBalance={0}
                />

                {/* Atalhos Rápidos */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Atalhos Rápidos</p>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: 'Uber', category: 'Uber / Transporte Público', paymentMethod: 'Cartão de Crédito' },
                      { label: 'iFood', category: 'Restaurantes & iFood', paymentMethod: 'Cartão de Crédito' },
                      { label: 'Mercado', category: 'Supermercado & Feira', paymentMethod: 'Pix / Débito' },
                      { label: 'Pix', category: 'Pix Recebido', paymentMethod: 'Conta Corrente / Pix' },
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleOpenQuickModal(item)}
                        className="bg-slate-900/80 hover:bg-slate-800 border border-slate-800 p-2.5 rounded-2xl text-center text-xs font-bold text-slate-200 transition active:scale-95 shadow-sm"
                      >
                        + {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Extrato Recente */}
                <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
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
                        Nenhum lançamento registrado ainda.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'contas' && (
              <Bills
                transactions={transactions}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDeleteTransaction}
              />
            )}
          </>
        )}
      </main>

      {/* Modal de Lançamentos */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
        initialData={quickData}
      />

      {/* Navegação Inferior (Barra de Abas) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-lg border-t border-slate-800/80 z-40">
        <div className="max-w-lg mx-auto flex items-center justify-around p-2">
          {[
            { id: 'inicio', label: 'Início', icon: LayoutDashboard },
            { id: 'contas', label: 'Contas', icon: CreditCard },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-2xl w-20 transition ${
                  isActive
                    ? 'text-cyan-400 bg-cyan-500/10 font-bold'
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