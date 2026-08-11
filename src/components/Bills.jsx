import React, { useState } from 'react';
import { 
  CreditCard, 
  Receipt, 
  CalendarClock, 
  TrendingUp,
  Tv,
  Car,
  CheckCircle2, 
  Clock,
  AlertCircle
} from 'lucide-react';
import EditBillModal from './EditBillModal';

export default function Bills({ transactions = [], onToggleStatus, onDelete }) {
  const [activeSubTab, setActiveSubTab] = useState('vencimentos');
  const [selectedBill, setSelectedBill] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const subTabs = [
    { id: 'vencimentos', label: 'Vencimentos Geral', icon: CalendarClock },
    { id: 'cartao', label: 'Cartão de Crédito', icon: CreditCard },
    { id: 'financiamento', label: 'Financiamentos & Parcelas', icon: Car },
    { id: 'assinaturas', label: 'Assinaturas', icon: Tv },
    { id: 'fixas', label: 'Contas Fixas', icon: Receipt },
    { id: 'projecao', label: 'Projeção Futura', icon: TrendingUp },
  ];

  const closingDay = 25;
  const todayDay = new Date().getDate();
  const isAfterClosing = todayDay >= closingDay;

  // Lançamentos filtrados por perfil de compromisso
  const allBills = transactions.filter(t => t.type === 'expense');

  // Financiamentos e compras parceladas de longo prazo
  const longTermBills = allBills.filter(t => 
    t.category === 'Financiamento do Veículo' || 
    (t.installments && t.installments > 1)
  );

  // Faturas e compras no Cartão de Crédito
  const creditCardBills = allBills.filter(t => t.paymentMethod === 'Cartão de Crédito');

  // Assinaturas e Streaming
  const subscriptionBills = allBills.filter(t => t.category === 'Assinaturas & Streaming');

  // Contas Fixas da Casa
  const houseBills = allBills.filter(t => t.category === 'Contas da Casa (Luz/Água/Gás)' || t.category === 'Aluguel / Condomínio');

  const projectionData = [
    { month: 'Agosto/26', committed: 2360.50, limitPercentage: 47 },
    { month: 'Setembro/26', committed: 1800.00, limitPercentage: 36 },
    { month: 'Outubro/26', committed: 1420.00, limitPercentage: 28 },
    { month: 'Novembro/26', committed: 1000.00, limitPercentage: 20 },
  ];

  const handleOpenEdit = (bill) => {
    setSelectedBill(bill);
    setIsModalOpen(true);
  };

  const handleSaveBill = (updatedBill) => {
    if (onToggleStatus) onToggleStatus(updatedBill.id);
  };

  const handleDeleteBill = (id) => {
    if (onDelete) onDelete(id);
  };

  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-3 animate-fade-in">
      
      {/* Carrossel de Pílulas de Navegação por Sub-Abas Separadas */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 💳 SUB-ABA EXCLUSIVA: CARTÃO DE CRÉDITO */}
      {activeSubTab === 'cartao' && (
        <div className="space-y-3">
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-3 shadow-xl">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200">
              <span className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-cyan-400" /> Fatura Cartão Nubank
              </span>
              <span className="text-slate-400">Fechamento: Dia {closingDay}</span>
            </div>
            
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs space-y-1">
              {isAfterClosing ? (
                <p className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Fatura Fechada! Novos gastos vão para o MÊS SEGUINTE.
                </p>
              ) : (
                <p className="text-amber-400 font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Fatura Aberta! Fecha em {closingDay - todayDay} dia(s).
                </p>
              )}
            </div>
          </div>

          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Gastos no Cartão de Crédito</h3>
              <span className="text-[10px] text-slate-400">{creditCardBills.length} item(ns)</span>
            </div>

            <div className="divide-y divide-slate-800/60">
              {creditCardBills.length > 0 ? (
                creditCardBills.map((item) => (
                  <div key={item.id} className="p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition">
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-slate-200">{item.description}</p>
                      <p className="text-[10px] text-slate-400">Vencimento: {item.date}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-200">{formatCurrency(item.amount)}</p>
                      <button onClick={() => handleOpenEdit(item)} className="mt-0.5 inline-flex">
                        {item.status === 'paid' ? (
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Pago
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Pagar
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="p-6 text-center text-xs text-slate-500">Nenhum gasto registrado no cartão de crédito neste mês.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🚗 SUB-ABA EXCLUSIVA: FINANCIAMENTOS & PARCELAS LONGAS */}
      {activeSubTab === 'financiamento' && (
        <div className="space-y-3">
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-2 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-100 uppercase tracking-wider">
                <Car className="w-4 h-4 text-cyan-400" /> Financiamentos & Compromissos Longos
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Acompanhamento detalhado das parcelas de veículos, bens e financiamentos de longo prazo.
            </p>
          </div>

          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Parcelas do Mês</h3>
              <span className="text-[10px] text-slate-400">{longTermBills.length} item(ns)</span>
            </div>

            <div className="divide-y divide-slate-800/60">
              {longTermBills.length > 0 ? (
                longTermBills.map((item) => (
                  <div key={item.id} className="p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-200">{item.description}</p>
                      <p className="text-[10px] text-slate-400">Vencimento: {item.date} • {item.paymentMethod}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-200">{formatCurrency(item.amount)}</p>
                      <button onClick={() => handleOpenEdit(item)} className="mt-0.5 inline-flex">
                        {item.status === 'paid' ? (
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Quitado
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Pagar Parcela
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="p-6 text-center text-xs text-slate-500">Nenhum financiamento cadastrado neste mês.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 📺 SUB-ABA: ASSINATURAS */}
      {activeSubTab === 'assinaturas' && (
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Assinaturas e Streaming</h3>
          </div>
          <div className="divide-y divide-slate-800/60">
            {subscriptionBills.length > 0 ? (
              subscriptionBills.map((sub) => (
                <div key={sub.id} className="p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-200">{sub.description}</p>
                    <p className="text-[10px] text-slate-400">{sub.date} • {sub.paymentMethod}</p>
                  </div>
                  <span className="text-xs font-bold text-slate-100">{formatCurrency(sub.amount)}</span>
                </div>
              ))
            ) : (
              <p className="p-6 text-center text-xs text-slate-500">Nenhuma assinatura cadastrada.</p>
            )}
          </div>
        </div>
      )}

      {/* 🏠 SUB-ABA: CONTAS FIXAS */}
      {activeSubTab === 'fixas' && (
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Contas Fixas da Casa</h3>
          </div>
          <div className="divide-y divide-slate-800/60">
            {houseBills.length > 0 ? (
              houseBills.map((item) => (
                <div key={item.id} className="p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-200">{item.description}</p>
                    <p className="text-[10px] text-slate-400">Vencimento: {item.date}</p>
                  </div>
                  <span className="text-xs font-bold text-slate-100">{formatCurrency(item.amount)}</span>
                </div>
              ))
            ) : (
              <p className="p-6 text-center text-xs text-slate-500">Nenhuma conta fixa cadastrada neste mês.</p>
            )}
          </div>
        </div>
      )}

      {/* 📈 SUB-ABA: PROJEÇÃO FUTURA */}
      {activeSubTab === 'projecao' && (
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Comprometimento de Renda Futura</h3>
          </div>
          <p className="text-[11px] text-slate-400">
            Previsão do total de parcelas fixas e faturas comprometidas nos próximos meses:
          </p>

          <div className="space-y-3 pt-1">
            {projectionData.map((p, idx) => (
              <div key={idx} className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-200">{p.month}</span>
                  <span className="text-cyan-400">{formatCurrency(p.committed)}</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600" 
                    style={{ width: `${p.limitPercentage}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-slate-500 text-right">{p.limitPercentage}% da sua renda estimada</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 📋 VISÃO GERAL DE VENCIMENTOS (Sub-aba inicial) */}
      {activeSubTab === 'vencimentos' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 shadow-xl">
            <div className="space-y-0.5">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total em Contas/Boletos</p>
              <p className="text-base font-bold text-slate-100">{formatCurrency(allBills.reduce((acc, i) => acc + i.amount, 0))}</p>
            </div>
            <div className="space-y-0.5 text-right">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">A Pagar (Pendente)</p>
              <p className="text-base font-bold text-amber-400">{formatCurrency(allBills.filter(i => i.status === 'pending').reduce((acc, i) => acc + i.amount, 0))}</p>
            </div>
          </div>

          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Vencimentos do Mês</h3>
              <span className="text-[10px] text-slate-400">{allBills.length} item(ns)</span>
            </div>

            <div className="divide-y divide-slate-800/60">
              {allBills.length > 0 ? (
                allBills.map((item) => (
                  <div key={item.id} className="p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition">
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                        <span>{item.description}</span>
                        {item.status === 'pending' && (
                          <span className="text-[9px] bg-rose-500/20 text-rose-400 px-1.5 py-0.2 rounded font-bold border border-rose-500/30">
                            Pendente
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] text-slate-400">Vencimento: {item.date}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-200">{formatCurrency(item.amount)}</p>
                        <button onClick={() => handleOpenEdit(item)} className="mt-0.5 inline-flex">
                          {item.status === 'paid' ? (
                            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Pago
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Pagar
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="p-8 text-center text-xs text-slate-500">Nenhum compromisso pendente neste período.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <EditBillModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        bill={selectedBill}
        onSave={handleSaveBill}
        onDelete={handleDeleteBill}
      />

    </div>
  );
}