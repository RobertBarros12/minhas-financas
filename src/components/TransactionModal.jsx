import React, { useState, useEffect } from 'react';
import { X, ArrowUpCircle, ArrowDownCircle, Check, Calendar, Sparkles, Zap, ChevronDown } from 'lucide-react';

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
        dateString: `${year}-${formattedMonth}-${formattedDay}`,
        displayString: `${formattedDay}/${formattedMonth}`
      };
    }

    currentDay++;
  }
}

export default function TransactionModal({ isOpen, onClose, onSave, initialData }) {
  const [type, setType] = useState('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Pix / Débito');
  const [category, setCategory] = useState('Supermercado & Feira');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [status, setStatus] = useState('paid');
  const [dueDate, setDueDate] = useState('');
  const [installments, setInstallments] = useState('1');
  const [isRecurring, setIsRecurring] = useState(false);
  const [fifthBusinessDayText, setFifthBusinessDayText] = useState('');
  
  const [showFullForm, setShowFullForm] = useState(false);
  const isQuickMode = Boolean(initialData) && !showFullForm;

  useEffect(() => {
    if (initialData) {
      setDescription(initialData.label || '');
      setCategory(initialData.category || 'Outros Gastos');
      setPaymentMethod(initialData.paymentMethod || 'Pix / Débito');
      setType('expense');
      setStatus('paid');
      setAmount('');
      setShowFullForm(false);
      setIsCustomCategory(false);
    } else {
      setShowFullForm(true);
    }
  }, [initialData, isOpen]);

  useEffect(() => {
    if (type === 'income' && category === 'Salário Mensal') {
      const today = new Date();
      const calc = getFifthBusinessDay(today.getFullYear(), today.getMonth());
      setDueDate(calc.dateString);
      setFifthBusinessDayText(calc.displayString);
    }
  }, [type, category]);

  if (!isOpen) return null;

  const supportsInstallments = type === 'expense' && paymentMethod === 'Cartão de Crédito';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description || !amount) return;

    const finalCategory = isCustomCategory && customCategory ? customCategory : category;

    onSave({
      id: String(Date.now()),
      description: (supportsInstallments && Number(installments) > 1) 
        ? `${description} (1/${installments}x)` 
        : description,
      amount: parseFloat(amount),
      type,
      paymentMethod,
      category: finalCategory,
      status: status,
      date: dueDate ? dueDate.split('-').reverse().slice(0, 2).join('/') : 'Hoje',
      installments: supportsInstallments ? Number(installments) : 1,
      isRecurring
    });

    setDescription('');
    setAmount('');
    setCustomCategory('');
    setIsCustomCategory(false);
    setInstallments('1');
    setIsRecurring(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            {isQuickMode && (
              <span className="bg-cyan-500/10 text-cyan-400 p-1 rounded-lg border border-cyan-500/20">
                <Zap className="w-4 h-4 fill-cyan-400" />
              </span>
            )}
            <h3 className="text-base font-bold text-slate-100">
              {isQuickMode ? `Lançamento Rápido: ${description}` : 'Novo Lançamento'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          
          {/* MODO ULTRARRÁPIDO */}
          {isQuickMode ? (
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                  Digite apenas o valor (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-cyan-500/50 rounded-2xl p-4 text-2xl font-extrabold text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition"
                  autoFocus
                  required
                />
              </div>

              <div className="flex items-center justify-between bg-slate-950/60 p-2.5 px-3.5 rounded-xl border border-slate-800/80 text-xs text-slate-400">
                <span>{category} • {paymentMethod}</span>
                <button
                  type="button"
                  onClick={() => setShowFullForm(true)}
                  className="text-cyan-400 font-bold flex items-center gap-1 hover:underline"
                >
                  <span>Alterar Detalhes</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* MODO COMPLETO DETALHADO */
            <>
              {/* Alternância Saída / Entrada */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => { 
                    setType('expense'); 
                    setPaymentMethod('Cartão de Crédito'); 
                    setCategory('Supermercado & Feira'); 
                    setStatus('pending');
                  }}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition ${
                    type === 'expense'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-sm'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <ArrowDownCircle className="w-4 h-4" />
                  <span>Saída (Gasto)</span>
                </button>

                <button
                  type="button"
                  onClick={() => { 
                    setType('income'); 
                    setPaymentMethod('Conta Corrente / Pix'); 
                    setCategory('Salário Mensal'); 
                    setStatus('pending');
                  }}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition ${
                    type === 'income'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <ArrowUpCircle className="w-4 h-4" />
                  <span>Entrada (Ganho)</span>
                </button>
              </div>

              {/* Valor */}
              <div>
                <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                  Valor {type === 'expense' ? 'do Gasto' : 'da Entrada'} (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-cyan-500/50 rounded-2xl p-3 text-xl font-bold text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition"
                  autoFocus
                  required
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  placeholder={type === 'expense' ? 'Ex: Mercado, Uber, Jogo' : 'Ex: Salário, Pix recebido, Comissão'}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                  required
                />
              </div>

              {/* Seletores Claros */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    {type === 'expense' ? 'Como vai Pagar?' : 'Onde vai Receber?'}
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    {type === 'expense' ? (
                      <>
                        <option value="Pix / Débito">Pix / Débito</option>
                        <option value="Cartão de Crédito">Cartão de Crédito</option>
                        <option value="Boleto Bancário">Boleto Bancário</option>
                        <option value="Vale Refeição (VR/VA)">Vale Refeição (VR/VA)</option>
                        <option value="Dinheiro">Dinheiro Físico</option>
                      </>
                    ) : (
                      <>
                        <option value="Conta Corrente / Pix">Conta Corrente / Pix</option>
                        <option value="Cartão VR / VA">Cartão VR / VA</option>
                        <option value="Carteira Digital">Carteira Digital</option>
                        <option value="Dinheiro">Dinheiro Físico</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Tipo do {type === 'expense' ? 'Gasto' : 'Ganho'}
                  </label>
                  {!isCustomCategory ? (
                    <select
                      value={category}
                      onChange={(e) => {
                        if (e.target.value === 'CUSTOM') {
                          setIsCustomCategory(true);
                        } else {
                          setCategory(e.target.value);
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      {type === 'expense' ? (
                        <>
                          <optgroup label="🏠 Necessidades Básicas">
                            <option value="Supermercado & Feira">Supermercado & Feira</option>
                            <option value="Contas da Casa (Luz/Água/Gás)">Contas da Casa (Luz/Água/Gás)</option>
                            <option value="Aluguel / Condomínio">Aluguel / Condomínio</option>
                            <option value="Financiamento do Veículo">Financiamento do Veículo</option>
                            <option value="Saúde & Farmácia">Saúde & Farmácia</option>
                          </optgroup>
                          <optgroup label="🍕 Desejos & Lazer">
                            <option value="Restaurantes & iFood">Restaurantes & iFood</option>
                            <option value="Lazer, Bar & Viagens">Lazer, Bar & Viagens</option>
                            <option value="Uber / Transporte Público">Uber / Transporte Público</option>
                            <option value="Vestuário, Roupas & Compras">Vestuário, Roupas & Compras</option>
                          </optgroup>
                          <optgroup label="📺 Serviços & Recorrentes">
                            <option value="Assinaturas & Streaming">Assinaturas & Streaming</option>
                          </optgroup>
                          <optgroup label="🎲 Gastos Aleatórios & Imprevistos">
                            <option value="Gastos Aleatórios & Imprevistos">Gastos Aleatórios & Imprevistos</option>
                            <option value="Presentes & Doações">Presentes & Doações</option>
                          </optgroup>
                          <optgroup label="➕ Outra Categoria">
                            <option value="CUSTOM">+ Criar Nova Categoria Customizada</option>
                          </optgroup>
                        </>
                      ) : (
                        <>
                          <optgroup label="💰 Rendas Principais">
                            <option value="Salário Mensal">Salário Mensal (5º Dia Útil)</option>
                            <option value="Comissão de Vendas">Comissão de Vendas</option>
                          </optgroup>
                          <optgroup label="📱 Entradas & Benefícios">
                            <option value="Pix Recebido">Pix Recebido</option>
                            <option value="Vale-Refeição / VA (Benefício)">Vale-Refeição / VA (Benefício)</option>
                            <option value="Freelance / Bico Extra">Freelance / Bico Extra</option>
                          </optgroup>
                          <optgroup label="➕ Outro Ganho">
                            <option value="CUSTOM">+ Criar Nova Categoria de Ganho</option>
                          </optgroup>
                        </>
                      )}
                    </select>
                  ) : (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        placeholder="Nome da Categoria..."
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        className="w-full bg-slate-950 border border-cyan-500 rounded-2xl p-2 text-xs text-slate-100 focus:outline-none"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setIsCustomCategory(false)}
                        className="text-[10px] text-slate-400 hover:text-slate-200 px-1"
                      >
                        Voltar
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Data */}
              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-cyan-400" /> 
                    {type === 'income' ? 'Data Calculada de Pagamento' : 'Vencimento / Data'}
                  </label>

                  {type === 'income' && category === 'Salário Mensal' && (
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> 5º Dia Útil ({fifthBusinessDayText})
                    </span>
                  )}
                </div>

                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Status */}
              <div className="flex items-center justify-between bg-slate-950/40 p-2.5 rounded-2xl border border-slate-800/60">
                <span className="text-xs text-slate-400 font-medium">Status do lançamento:</span>
                
                <button
                  type="button"
                  onClick={() => setStatus(status === 'paid' ? 'pending' : 'paid')}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
                    status === 'paid'
                      ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                      : 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>
                    {type === 'income' 
                      ? (status === 'paid' ? 'Já Recebido' : 'A Receber (Previsto)') 
                      : (status === 'paid' ? 'Já Pago' : 'Pendente')
                    }
                  </span>
                </button>
              </div>
            </>
          )}

          {/* Botão de Confirmação */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold py-3.5 rounded-2xl text-xs sm:text-sm transition shadow-lg shadow-cyan-500/20 active:scale-98"
          >
            Confirmar Lançamento
          </button>
        </form>

      </div>
    </div>
  );
}