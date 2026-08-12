import React, { useState, useEffect } from 'react';
import { X, Layers } from 'lucide-react';

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

  // Atualiza os valores padrão ao alternar entre Saída (Gasto) e Entrada (Ganho)
  useEffect(() => {
    if (type === 'income') {
      setPaymentMethod('Conta Corrente / Pix');
      setCategory('Salário / Prolabore');
    } else {
      setPaymentMethod('Cartão de Crédito');
      setCategory('Supermercado & Feira');
    }
  }, [type]);

  useEffect(() => {
    if (initialData) {
      if (initialData.type) setType(initialData.type);
      if (initialData.category) setCategory(initialData.category);
      if (initialData.paymentMethod) setPaymentMethod(initialData.paymentMethod);
    }
  }, [initialData]);

  if (!isOpen) return null;

  const showInstallmentOption = type === 'expense' && (
    paymentMethod === 'Cartão de Crédito' || 
    paymentMethod === 'Crediário / Carnê' || 
    paymentMethod === 'Financiamento'
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !description) return;

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
        description: `${description}${descSuffix}`,
        amount: installmentValue.toFixed(2),
        type,
        category,
        paymentMethod,
        status: i === 0 ? status : 'pending',
        date: formattedDate,
        installments: totalInstallments,
        isRecurring: false,
      };

      onSave(newTx);
    }

    setAmount('');
    setDescription('');
    setIsInstallment(false);
    setInstallments(2);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-5 shadow-2xl space-y-4">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-extrabold text-slate-100 uppercase tracking-wider">Novo Lançamento</h2>
          <button onClick={onClose} className="p-1 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Alternador Saída / Entrada */}
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

          {/* Valor R$ */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Valor R$</label>
            <input
              type="number"
              step="0.01"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-lg font-extrabold text-slate-100 focus:outline-none focus:border-cyan-500 transition"
              required
            />
          </div>

          {/* Descrição */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Descrição</label>
            <input
              type="text"
              placeholder="Ex: Mercado, Aluguel, Parcela do Carro"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition"
              required
            />
          </div>

          {/* Forma de Recebimento/Pagamento + Categoria */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {type === 'income' ? 'Como Recebeu?' : 'Forma de Pagamento'}
              </label>
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
                    <option value="Conta Poupança / Investimentos">Conta Poupança / Investimentos</option>
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
                    </optgroup>
                    <optgroup label="🛒 Alimentação">
                      <option value="Supermercado & Feira">Supermercado & Feira</option>
                      <option value="Restaurantes & iFood">Restaurantes & iFood</option>
                    </optgroup>
                    <optgroup label="🚗 Transporte & Veículo">
                      <option value="Uber / Transporte Público">Uber / Transporte Público</option>
                      <option value="Combustível & Manutenção">Combustível & Manutenção Carro/Moto</option>
                    </optgroup>
                    <optgroup label="🛍️ Compras & Pessoal">
                      <option value="Vestuário, Roupas & Compras">Vestuário, Roupas & Compras</option>
                      <option value="Saúde & Farmácia">Saúde & Farmácia</option>
                      <option value="Educação & Cursos">Educação & Cursos</option>
                    </optgroup>
                    <optgroup label="🎉 Lazer & Dívidas">
                      <option value="Lazer & Entretenimento">Lazer & Entretenimento</option>
                      <option value="Financiamentos & Empréstimos">Financiamentos & Empréstimos</option>
                      <option value="Gastos Aleatórios & Imprevistos">Gastos Aleatórios & Imprevistos</option>
                    </optgroup>
                  </>
                ) : (
                  <>
                    <option value="Salário / Prolabore">Salário / Prolabore</option>
                    <option value="Pix Recebido">Pix Recebido</option>
                    <option value="Vendas & Serviços">Vendas & Serviços</option>
                    <option value="Rendimentos & Outros">Rendimentos & Outros</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Opção de Parcelamento (Apenas para Gastos) */}
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
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Data / Vencimento</label>
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
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold py-3 rounded-2xl text-xs shadow-lg shadow-cyan-500/25 active:scale-95 transition"
          >
            Confirmar Lançamento
          </button>
        </form>
      </div>
    </div>
  );
}