import React, { useState } from 'react';
import Header from './components/Header';
import Summary from './components/Summary';
import QuickActions from './components/QuickActions';
import TransactionList from './components/TransactionList';
import Bills from './components/Bills';
import Analytics from './components/Analytics';
import CalendarView from './components/CalendarView';
import Goals from './components/Goals';
import BottomNav from './components/BottomNav';
import TransactionModal from './components/TransactionModal';
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

function getFifthBusinessDay(year, month) {
  let businessDaysCount = 0;
  let currentDay = 1;

  while (businessDaysCount < 5) {
    const date = new Date(year, month, currentDay);
    const dayOfWeek = date.getDay();

    if (dayOfWeek !== 0) {
      businessDaysCount++;
    }

    if (businessDaysCount === 5) {
      const formattedDay = String(currentDay).padStart(2, '0');
      const formattedMonth = String(month + 1).padStart(2, '0');
      return {
        dayNum: currentDay,
        dateString: `${year}-${formattedMonth}-${formattedDay}`,
        displayString: `${formattedDay}/${formattedMonth}`
      };
    }

    currentDay++;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuickData, setSelectedQuickData] = useState(null);

  const [currentMonth, setCurrentMonth] = useState(7); // Agosto/2026
  const [currentYear, setCurrentYear] = useState(2026);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const [transactions, setTransactions] = useState([
    { id: '10', description: 'Salário Julho', amount: 4800.00, type: 'income', paymentMethod: 'Conta Corrente / Pix', category: 'Salário Mensal', status: 'paid', month: 6, year: 2026, date: '06/07' },
    { id: '11', description: 'Mercado Julho', amount: 1100.00, type: 'expense', paymentMethod: 'Pix / Débito', category: 'Supermercado & Feira', status: 'paid', month: 6, year: 2026, date: '12/07' },
    { id: '12', description: 'Fatura Julho', amount: 2200.00, type: 'expense', paymentMethod: 'Cartão de Crédito', category: 'Lazer & Compras', status: 'paid', month: 6, year: 2026, date: '20/07' },

    { id: '1', description: 'Salário Mensal', amount: 5000.00, type: 'income', paymentMethod: 'Conta Corrente / Pix', category: 'Salário Mensal', status: 'paid', isRecurring: true, month: 7, year: 2026, date: '06/08' },
    { id: '2', description: 'Fatura Cartão Nubank', amount: 1240.50, type: 'expense', paymentMethod: 'Cartão de Crédito', category: 'Lazer & Compras', status: 'paid', month: 7, year: 2026, date: '10/08' },
    { id: '3', description: 'Financiamento Veículo', amount: 620.00, type: 'expense', paymentMethod: 'Boleto Bancário', category: 'Financiamento do Veículo', status: 'pending', month: 7, year: 2026, date: '15/08' },
    { id: '4', description: 'Conta de Energia (Energisa)', amount: 180.00, type: 'expense', category: 'Contas da Casa (Luz/Água/Gás)', paymentMethod: 'Boleto Bancário', status: 'pending', month: 7, year: 2026, date: '22/08' },
  ]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const previousMonthTransactions = transactions.filter(t => {
    if (currentMonth === 0) {
      return t.month === 11 && t.year === currentYear - 1;
    }
    return t.month < currentMonth && t.year === currentYear;
  });

  const previousBalance = previousMonthTransactions.reduce((acc, t) => {
    if (t.status !== 'paid') return acc;
    return t.type === 'income' ? acc + t.amount : acc - t.amount;
  }, 0);

  let currentMonthTransactions = transactions.filter(
    t => t.month === currentMonth && t.year === currentYear
  );

  const hasSalaryInCurrentMonth = currentMonthTransactions.some(t => t.category === 'Salário Mensal');
  const masterSalary = transactions.find(t => t.category === 'Salário Mensal' && t.isRecurring);

  if (!hasSalaryInCurrentMonth && masterSalary) {
    const calc = getFifthBusinessDay(currentYear, currentMonth);
    const projectedSalary = {
      id: `projected-salary-${currentYear}-${currentMonth}`,
      description: 'Salário Mensal (Previsto)',
      amount: masterSalary.amount,
      type: 'income',
      paymentMethod: masterSalary.paymentMethod || 'Conta Corrente / Pix',
      category: 'Salário Mensal',
      status: 'pending',
      month: currentMonth,
      year: currentYear,
      date: calc.displayString,
      isRecurring: true
    };
    currentMonthTransactions = [projectedSalary, ...currentMonthTransactions];
  }

  const monthIncomes = currentMonthTransactions
    .filter(t => t.type === 'income' && t.status === 'paid')
    .reduce((acc, t) => acc + t.amount, 0);

  const monthExpensesPaid = currentMonthTransactions
    .filter(t => t.type === 'expense' && t.status === 'paid')
    .reduce((acc, t) => acc + t.amount, 0);

  // CÁLCULO EXATO DAS DESPESAS PENDENTES DO MÊS
  const monthExpensesPending = currentMonthTransactions
    .filter(t => t.type === 'expense' && t.status === 'pending')
    .reduce((acc, t) => acc + t.amount, 0);

  const currentBalance = previousBalance + monthIncomes - monthExpensesPaid;

  const handleSaveTransaction = (newTransaction) => {
    setTransactions(prev => [{ ...newTransaction, month: currentMonth, year: currentYear }, ...prev]);
  };

  const handleToggleStatus = (id) => {
    if (id.startsWith('projected-salary-')) {
      const masterSalary = transactions.find(t => t.category === 'Salário Mensal' && t.isRecurring);
      const calc = getFifthBusinessDay(currentYear, currentMonth);
      const newRealSalary = {
        id: String(Date.now()),
        description: 'Salário Mensal',
        amount: masterSalary ? masterSalary.amount : 5000,
        type: 'income',
        paymentMethod: 'Conta Corrente / Pix',
        category: 'Salário Mensal',
        status: 'paid',
        month: currentMonth,
        year: currentYear,
        date: calc.displayString,
        isRecurring: true
      };
      setTransactions(prev => [newRealSalary, ...prev]);
      return;
    }

    setTransactions(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, status: item.status === 'paid' ? 'pending' : 'paid' };
      }
      return item;
    }));
  };

  const handleDeleteTransaction = (id) => {
    setTransactions(prev => prev.filter(item => item.id !== id));
  };

  const handleQuickSelect = (quickItem) => {
    setSelectedQuickData(quickItem);
    setIsModalOpen(true);
  };

  const handleOpenModal = () => {
    setSelectedQuickData(null);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      <Header onOpenModal={handleOpenModal} />

      <main className="p-3 sm:p-6 max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-5xl mx-auto space-y-3.5">
        
        <div className="flex items-center justify-between bg-slate-900/90 p-2.5 px-4 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <CalendarIcon className="w-4 h-4 text-cyan-400" />
            <span>Período Selecionado:</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-200 font-bold bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <button onClick={handlePrevMonth} className="hover:text-cyan-400 transition">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="min-w-[90px] text-center">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button onClick={handleNextMonth} className="hover:text-cyan-400 transition">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <>
            <Summary 
              balance={currentBalance} 
              expense={monthExpensesPaid}
              previousBalance={previousBalance}
              pendingExpense={monthExpensesPending}
            />
            
            <QuickActions onQuickSelect={handleQuickSelect} />
            
            <TransactionList 
              transactions={currentMonthTransactions} 
              onToggleStatus={handleToggleStatus}
              onDelete={handleDeleteTransaction}
            />
          </>
        )}

        {activeTab === 'calendar' && (
          <CalendarView 
            transactions={currentMonthTransactions} 
            currentMonth={currentMonth}
            currentYear={currentYear}
          />
        )}

        {activeTab === 'goals' && <Goals onAddExpense={handleSaveTransaction} />}

        {activeTab === 'bills' && (
          <Bills 
            transactions={currentMonthTransactions}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDeleteTransaction}
          />
        )}

        {activeTab === 'analytics' && <Analytics transactions={currentMonthTransactions} />}

      </main>

      <button
        onClick={handleOpenModal}
        className="fixed bottom-20 right-4 z-40 bg-gradient-to-r from-cyan-500 to-blue-600 active:scale-90 text-slate-950 p-3.5 rounded-full shadow-2xl shadow-cyan-500/40 border border-cyan-400/30 transition-all sm:hidden"
        aria-label="Novo Lançamento"
      >
        <Plus className="w-6 h-6 stroke-[3]" />
      </button>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
        initialData={selectedQuickData}
      />

    </div>
  );
}