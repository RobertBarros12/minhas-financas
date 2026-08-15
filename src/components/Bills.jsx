import React, { useState } from 'react';
import { 
  CreditCard, RefreshCw, Car, ShoppingBag, CheckCircle2, 
  Clock, Trash2, Calendar, AlertCircle, Sparkles, Home,
  Tv, HeartPulse, GraduationCap, DollarSign, Package
} from 'lucide-react';

export default function Bills({ transactions, onToggleStatus, onDelete, selectedMonthYear }) {
  const [activeCategory, setActiveCategory] = useState('all');

  const formatCurrency = (val) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val) || 0);

  // Filtra apenas DESPESAS do mês selecionado
  const monthExpenses = transactions.filter(
    t => t.type === 'expense' && t.date && t.date.startsWith(selectedMonthYear)
  );

  // Categorias das sub-abas
  const categories = [
    { id: 'all', label: 'Vencimentos do Mês', icon: Calendar },
    { id: 'card', label: 'Cartão de Crédito', icon: CreditCard },
    { id: 'subscription', label: 'Assinaturas', icon: RefreshCw },
    { id: 'financing', label: 'Financiamentos', icon: Car },
    { id: 'installments', label: 'Parcelados / Carnê', icon: ShoppingBag },
  ];

  // Helper para identificar tipos específicos de contas
  const isSubscription = (item) => {
    const desc = (item.description || '').toLowerCase();
    const cat = (item.category || '').toLowerCase();
    return item.isRecurring || 
           cat.includes('assinatura') || 
           desc.includes('spotify') || 
           desc.includes('netflix') || 
           desc.includes('prime') || 
           desc.includes('youtube') || 
           desc.includes('hbo') || 
           desc.includes('disney') || 
           desc.includes('academia');
  };

  const isFinancing = (item) => {
    const desc = (item.description || '').toLowerCase();
    const cat = (item.category || '').toLowerCase();
    return cat.includes('financiamento') || 
           cat.includes('empréstimo') || 
           desc.includes('moto') || 
           desc.includes('carro') || 
           desc.includes('veículo') || 
           desc.includes('imóvel') || 
           desc.includes('casa') || 
           desc.includes('terreno');
  };

  const isCard = (item) => {
    const cat = (item.category || '').toLowerCase();
    return item.paymentMethod === 'Cartão de Crédito' || cat.includes('cartão');
  };

  const isInstallment = (item) => {
    // É parcelado MAS NÃO É financiamento
    if (isFinancing(item)) return false;
    const desc = item.description || '';
    return Number(item.installments) > 1 || /\(\d+\/\d+\)/.test(desc);
  };

  // Vencimentos do Mês: Apenas contas, boletos, faturas, assinaturas, financiamentos e parcelamentos reais
  const isRealBill = (item) => {
    const cat = (item.category || '').toLowerCase();
    const desc = (item.description || '').toLowerCase();

    // Se for assinatura, financiamento, parcelamento ou fatura de cartão -> É CONTA
    if (isSubscription(item) || isFinancing(item) || isInstallment(item) || isCard(item)) return true;

    // Categorias tradicionais de contas e consumo
    if (cat.includes('moradia') || cat.includes('consumo') || cat.includes('educação') || cat.includes('saúde')) return true;
    if (desc.includes('aluguel') || desc.includes('condomínio') || desc.includes('energia') || desc.includes('luz') || desc.includes('água') || desc.includes('internet')) return true;

    // Despesas pontuais (ex: Uber, iFood, Lilian, Lançamento Rápido, Aporte CDB) NÃO entram na aba de Contas
    return false;
  };

  // Filtragem estrita por sub-aba
  const filteredBills = monthExpenses.filter(item => {
    if (activeCategory === 'all') return isRealBill(item);
    if (activeCategory === 'card') return isCard(item);
    if (activeCategory === 'subscription') return isSubscription(item);
    if (activeCategory === 'financing') return isFinancing(item);
    if (activeCategory === 'installments') return isInstallment(item);
    return false;
  });

  const totalCategoryAmount = filteredBills.reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const pendingCategoryAmount = filteredBills
    .filter(t => t.status === 'pending')
    .reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const paidCategoryAmount = totalCategoryAmount - pendingCategoryAmount;

  const paidPercentage = totalCategoryAmount > 0 
    ? Math.round((paidCategoryAmount / totalCategoryAmount) * 100) 
    : 100;

  // Helper de Ícones Dinâmicos
  const getItemIcon = (category = '', description = '') => {
    const desc = description.toLowerCase();
    const cat = category.toLowerCase();

    if (isFinancing({ category, description })) return Car;
    if (isSubscription({ category, description })) return Tv;
    if (desc.includes('geladeira') || desc.includes('fogão') || desc.includes('aluguel') || cat.includes('moradia')) return Home;
    if (cat.includes('saúde') || desc.includes('farmácia')) return HeartPulse;
    if (cat.includes('educação')) return GraduationCap;
    if (isCard({ category, paymentMethod: '' })) return CreditCard;
    return ShoppingBag;
  };

  // Helper de Status e Urgência
  const getUrgencyBadge = (dateStr, status) => {
    if (status === 'paid') {
      return { label: '✓ Pago', bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (dateStr < todayStr) {
      return { label: '⚠️ Atrasada', bg: 'bg-rose-500/20 border-rose-500/50 text-rose-400 animate-pulse' };
    }
    if (dateStr === todayStr) {
      return { label: '🔥 Vence Hoje', bg: 'bg-amber-500/20 border-amber-500/50 text-amber-400 animate-pulse' };
    }
    return { label: '⏳ A Pagar', bg: 'bg-amber-500/10 border-amber-500/30 text-amber-300' };
  };

  return (
    <div className="space-y-4">
      
      {/* Menu de Sub-abas */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
        {categories.map(cat => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-bold whitespace-nowrap active:scale-95 transition shadow-md ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 border-cyan-400 text-slate-950 font-black shadow-cyan-500/20'
                  : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Card de Resumo da Sub-aba */}
      <div className="p-4 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl shadow-xl space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total na Aba</span>
            <p className="text-base font-black text-slate-100 mt-0.5">{formatCurrency(totalCategoryAmount)}</p>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">A Pagar (Pendente)</span>
            <p className={`text-base font-black mt-0.5 ${pendingCategoryAmount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {formatCurrency(pendingCategoryAmount)}
            </p>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-[10px] font-bold">
            <span className="text-slate-400">Progresso de Quitação:</span>
            <span className={paidPercentage === 100 ? 'text-emerald-400 font-extrabold' : 'text-cyan-400'}>
              {paidPercentage}% Pago
            </span>
          </div>

          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/60">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                paidPercentage === 100 
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-400' 
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500'
              }`}
              style={{ width: `${paidPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Lista de Contas Filtradas Corretamente */}
      <div className="bg-slate-900/80 rounded-3xl border border-slate-800 overflow-hidden shadow-xl p-3.5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
          <h3 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider">
            Lançamentos de {selectedMonthYear}
          </h3>
          <span className="text-[10px] text-slate-400 font-semibold">{filteredBills.length} compromisso(s)</span>
        </div>

        <div className="space-y-2 pt-1">
          {filteredBills.length > 0 ? (
            filteredBills.map(item => {
              const IconComponent = getItemIcon(item.category, item.description);
              const urgency = getUrgencyBadge(item.date, item.status);
              const isPaid = item.status === 'paid';

              return (
                <div 
                  key={item.id} 
                  className={`p-3.5 rounded-2xl border transition relative overflow-hidden bg-slate-950/60 ${
                    isPaid ? 'border-slate-800/80' : 'border-amber-500/30 shadow-sm shadow-amber-500/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isPaid 
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                          : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                      }`}>
                        <IconComponent className="w-4 h-4" />
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-100 leading-tight">{item.description}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[9px] text-slate-400">Vencimento: {item.date}</span>
                          <span className="text-[9px] text-slate-500">•</span>
                          <span className="text-[9px] text-cyan-400/90 font-medium">{item.paymentMethod || 'Geral'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <p className={`text-xs font-black ${isPaid ? 'text-slate-400' : 'text-slate-100'}`}>
                        {formatCurrency(item.amount)}
                      </p>

                      <button
                        onClick={() => onToggleStatus(item.id)}
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded-lg border transition active:scale-95 ${urgency.bg}`}
                        title="Clique para alterar status"
                      >
                        {urgency.label}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 mt-2 border-t border-slate-800/40">
                    <button
                      onClick={() => onDelete(item.id)}
                      className="text-slate-500 hover:text-rose-400 text-[10px] flex items-center gap-1 p-1 rounded hover:bg-rose-500/10 transition"
                      title="Excluir lançamento"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Excluir</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">
              Nenhum compromisso encontrado nesta categoria para este mês.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}