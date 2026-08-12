import React, { useState, useEffect, useRef } from 'react';
import { X, Layers, RefreshCw, Zap } from 'lucide-react';

export default function TransactionModal({ isOpen, onClose, onSave, initialData }) {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Supermercado & Feira');
  const [paymentMethod, setPaymentMethod] = useState('Cartão de Crédito');
  const [status, setStatus] = useState('paid');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [isInstallment, setIsInstallment] = useState(false);
  const [installments, setInstallments] = useState(2);
  const [isRecurring, setIsRecurring] = useState(false);

  const amountInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        if (initialData.description) setDescription(initialData.description);
        if (initialData.type) setType(initialData.type);
        if (initialData.category) setCategory(initialData.category);
        if (initialData.paymentMethod) setPaymentMethod(initialData.paymentMethod);
      } else {
        setDescription('');
      }

      setTimeout(() => {
        if (amountInputRef.current) {
          amountInputRef.current.focus();
        }
      }, 100);
    }
  }, [initialData, isOpen]);

  useEffect(() => {
    if (!initialData && type === 'income') {
      setPaymentMethod('Conta Corrente / Pix');
      setCategory('Salário / Prolabore');
    } else if (!initialData) {
      setPaymentMethod('Cartão de Crédito');
      setCategory('Supermercado & Feira');
    }
  }, [type, initialData]);

  if (!isOpen) return null;

  // Condição explícita para exibir a caixinha de parcelamento
  const showInstallmentOption = type === 'expense' && !isRecurring && (
    paymentMethod === 'Cartão de Crédito' || 
    paymentMethod === 'Crediário / Carnê' || 
    paymentMethod === 'Financiamento'
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount) return;

    const finalDescription = description.trim() || (initialData?.description || 'Lançamento Rápido');
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    const totalInstallments = showInstallmentOption && isInstallment ? parseInt(installments) : 1;
    const installmentValue = parsedAmount / totalInstallments;

    const baseDate = new Date(date + 'T00:00:00');

    for (let i = 0; i < totalInstallments; i++) {
      const currentDate = new Date(baseDate);
      currentDate.setMonth(baseDate.getMonth() + i);
      
      const formattedDate = currentDate.toISOString().split('T')[0];
      const descSuffix = totalInstallments > 1 ? ` (${i + 1}/${totalInstallments})` : '';

      const newTx = {
        id: `${Date.now()}-${i}`,
        description: `${finalDescription}${descSuffix}`,
        amount: installmentValue.toFixed(2),
        type,
        category,
        paymentMethod,
        status: i === 0 ? status : 'pending',
        date: formattedDate,
        installments: totalInstallments,
        isRecurring: isRecurring,
      };

      onSave(newTx);
    }

    setAmount('');
    setDescription('');
    setIsInstallment(false);
    setIsRecurring(false);
    setInstallments(2);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            {initialData ? (
              <span className="text-xs font-extrabold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-xl flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" /> Atalho: {initialData.description}
              </span>
            ) : (
              <h2 className="text-sm font-extrabold text-slate-100 uppercase tracking-wider">Novo Lançamento</h2>
            )}
          </div>
          <button onClick={onClose} className="p-1 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          
          {!initialData && (
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-2 rounded-xl text-xs font-bold transition ${
                  type === 'expense' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'text-slate-400'
                }`}
              >
                🔴 Saída (Gasto)
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-2 rounded-xl text-xs font-bold transition ${
                  type === 'income' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400'
                }`}
              >
                🟢 Entrada (Ganho)
              </button>
            </div>
          )}

          {/* Digite o Valor */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Digite Apenas o Valor R$</label>
            <input
              ref={amountInputRef}
              type="number"
              step="0.01"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-950 border border-cyan-500/50 rounded-2xl p-3 text-2xl font-black text-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition"
              required
              autoFocus
            />
          </div>

          {/* Descrição */}
          {!initialData && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Descrição</label>
              <input
                type="text"
                placeholder="Ex: Netflix, Mercado, Uber, Aluguel"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition"
                required
              />
            </div>
          )}

          {/* Forma de Pagamento e Categoria */}
          {!initialData && (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Forma de Pagamento</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  {type === 'income' ? (
                    <>
                      <option value="Conta Corrente / Pix">Conta Corrente / Pix</option>
                      <option value="Dinheiro em Espécie">Dinheiro em Espécie</option>
                      <option value="Vale Alimentação / Refeição">Vale Alimentação / Refeição</option>
                    </>
                  ) : (
                    <>
                      <option value="Cartão de Crédito">Cartão de Crédito</option>
                      <option value="Pix / Débito">Pix / Débito</option>
                      <option value="Dinheiro">Dinheiro</option>
                      <option value="Crediário / Carnê">Crediário / Carnê</option>
                      <option value="Financiamento">Financiamento</option>
                    </>
                  )}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Categoria</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  {type === 'expense' ? (
                    <>
                      <optgroup label="🏠 Moradia & Contas Fixas">
                        <option value="Moradia & Contas Fixas">Moradia (Aluguel, Condomínio)</option>
                        <option value="Contas de Consumo">Contas (Luz, Água, Internet, Gás)</option>
                        <option value="Impostos & Taxas">Impostos (IPTU, Taxas)</option>
                      </optgroup>

                      <optgroup label="📺 Streaming, Assinaturas & Lazer">
                        <option value="Assinaturas & Serviços Recorrentes">Streamings (Netflix, Spotify, Prime)</option>
                        <option value="Serviços Digitais & Software">Serviços Digitais & IA (ChatGPT, Cloud)</option>
                        <option value="Lazer & Entretenimento">Lazer, Cinema & Viagens</option>
                        <option value="Academia & Esportes">Academia & Esportes</option>
                      </optgroup>

                      <optgroup label="🛒 Alimentação">
                        <option value="Supermercado & Feira">Supermercado & Feira</option>
                        <option value="Restaurantes & iFood">Restaurantes, iFood & Bares</option>
                      </optgroup>

                      <optgroup label="🚗 Transporte & Veículo">
                        <option value="Uber / Transporte Público">Uber / Transporte Público</option>
                        <option value="Combustível & Manutenção">Combustível & Manutenção Carro/Moto</option>
                        <option value="IPVA, Seguro & Pedágio">IPVA, Seguro & Pedágio</option>
                      </optgroup>

                      <optgroup label="🛍️ Compras & Pessoal">
                        <option value="Vestuário, Roupas & Compras">Vestuário, Roupas & Calçados</option>
                        <option value="Cuidados Pessoais & Beleza">Barbearia, Salão & Cosméticos</option>
                        <option value="Eletrônicos & Casa">Eletrônicos & Utensílios</option>
                      </optgroup>

                      <optgroup label="💊 Saúde & Família">
                        <option value="Saúde & Farmácia">Saúde, Farmácia & Consultas</option>
                        <option value="Pets & Veterinário">Pets, Ração & Veterinário</option>
                        <option value="Educação & Cursos">Educação, Livros & Cursos</option>
                      </optgroup>

                      <optgroup label="💳 Dívidas & Imprevistos">
                        <option value="Financiamentos & Empréstimos">Financiamentos & Empréstimos</option>
                        <option value="Gastos Aleatórios & Imprevistos">Gastos Aleatórios & Imprevistos</option>
                      </optgroup>
                    </>
                  ) : (
                    <>
                      <option value="Salário / Prolabore">Salário / Prolabore</option>
                      <option value="Pix Recebido">Pix Recebido</option>
                      <option value="Vendas & Serviços">Vendas & Serviços</option>
                      <option value="Rendimentos & Outros">Rendimentos & Dividendos</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          )}

          {/* Marcar como Assinatura Mensal */}
          {type === 'expense' && (
            <div className="p-3 bg-slate-950 rounded-2xl border border-purple-500/30 flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4" /> Assinatura Recorrente (Mensal)?
              </span>
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => {
                  setIsRecurring(e.target.checked);
                  if (e.target.checked) setIsInstallment(false);
                }}
                className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
              />
            </div>
          )}

          {/* Bloco de Compra Parcelada (Exibido para Cartão, Crediário/Carnê e Financiamento) */}
          {showInstallmentOption && (
            <div className="p-3 bg-slate-950 rounded-2xl border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                  <Layers className="w-4 h-4" /> Compra Parcelada?
                </span>
                <input
                  type="checkbox"
                  checked={isInstallment}
                  onChange={(e) => setIsInstallment(e.target.checked)}
                  className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                />
              </div>

              {isInstallment && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-slate-400">Número de parcelas:</span>
                  <select
                    value={installments}
                    onChange={(e) => setInstallments(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs font-bold text-cyan-400 focus:outline-none"
                  >
                    {[2, 3, 4, 5, 6, 10, 12, 18, 24, 36, 48, 60, 72].map(n => (
                      <option key={n} value={n}>{n}x parcelas</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Data e Status */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Data</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
              <button
                type="button"
                onClick={() => setStatus(status === 'paid' ? 'pending' : 'paid')}
                className={`w-full py-2.5 rounded-2xl text-xs font-bold border transition ${
                  status === 'paid'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                }`}
              >
                {status === 'paid' ? '✓ Pago / Quitado' : '⏳ Pendente'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black py-3.5 rounded-2xl text-xs shadow-lg shadow-cyan-500/25 active:scale-95 transition tracking-wider uppercase"
          >
            Confirmar Lançamento
          </button>
        </form>
      </div>
    </div>
  );
}