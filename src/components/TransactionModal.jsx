import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, Tag, CreditCard, Layers, Sparkles, Target } from 'lucide-react';

const CATEGORIES = [
  'Supermercado & Feira',
  'Restaurantes & iFood',
  'Uber / Transporte Público',
  'Combustível & Manutenção',
  'Moradia (Aluguel, Luz, Água, Net)',
  'Lazer, Shows & Viagens',
  'Saúde & Farmácia',
  'Cuidados Pessoais & Roupas',
  'Educação & Cursos',
  'Assinaturas & Serviços Recorrentes',
  'Financiamentos & Empréstimos',
  'Investimentos & Aplicações',
  'Reserva & Caixinhas',
  'Gastos Aleatórios & Imprevistos',
  'Salário & Remuneração',
  'Pix Recebido',
  'Rendimentos & Dividendos',
  'Outras Entradas'
];

const PAYMENT_METHODS = [
  'Conta Corrente / Pix',
  'Cartão de Crédito',
  'Cartão de Débito',
  'Dinheiro Físico',
  'Boleto Bancário'
];

export default function TransactionModal({ isOpen, onClose, onSave, initialData, vaults = [] }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [status, setStatus] = useState('paid');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [installments, setInstallments] = useState(1);
  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedVaultId, setSelectedVaultId] = useState('');

  useEffect(() => {
    if (initialData) {
      setDescription(initialData.description || '');
      setType(initialData.type || 'expense');
      setCategory(initialData.category || CATEGORIES[0]);
      setPaymentMethod(initialData.paymentMethod || PAYMENT_METHODS[0]);
      setStatus(initialData.status || 'paid');
      setDate(initialData.date || new Date().toISOString().split('T')[0]);
      setInstallments(initialData.installments || 1);
      setIsRecurring(initialData.isRecurring || false);
      setSelectedVaultId(initialData.vaultId || '');
    } else {
      setDescription('');
      setAmount('');
      setType('expense');
      setCategory(CATEGORIES[0]);
      setPaymentMethod(PAYMENT_METHODS[0]);
      setStatus('paid');
      setDate(new Date().toISOString().split('T')[0]);
      setInstallments(1);
      setIsRecurring(false);
      setSelectedVaultId('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim() || !amount) return;

    const parsedAmount = parseFloat(String(amount).replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    const numInstallments = parseInt(installments, 10) || 1;

    if (numInstallments > 1 && type === 'expense') {
      const installmentAmount = (parsedAmount / numInstallments).toFixed(2);
      const [yearStr, monthStr, dayStr] = date.split('-');
      const baseYear = parseInt(yearStr, 10);
      const baseMonthIndex = parseInt(monthStr, 10) - 1;
      const baseDay = parseInt(dayStr, 10);

      const transactionsToCreate = [];

      for (let i = 0; i < numInstallments; i++) {
        const installmentDate = new Date(baseYear, baseMonthIndex + i, baseDay);
        const y = installmentDate.getFullYear();
        const m = String(installmentDate.getMonth() + 1).padStart(2, '0');
        const d = String(installmentDate.getDate()).padStart(2, '0');

        transactionsToCreate.push({
          id: `tx-${Date.now()}-${i}`,
          description: `${description.trim()} (${i + 1}/${numInstallments})`,
          amount: parseFloat(installmentAmount),
          type,
          category,
          paymentMethod,
          status: i === 0 ? status : 'pending',
          date: `${y}-${m}-${d}`,
          installments: numInstallments,
          isRecurring: false,
          vaultId: selectedVaultId || null,
        });
      }

      onSave(transactionsToCreate, selectedVaultId ? { vaultId: selectedVaultId, description: description.trim(), amount: parsedAmount } : null);
    } else {
      const singleTx = {
        id: `tx-${Date.now()}`,
        description: description.trim(),
        amount: parsedAmount,
        type,
        category,
        paymentMethod,
        status,
        date,
        installments: 1,
        isRecurring,
        vaultId: selectedVaultId || null,
      };

      onSave(singleTx, selectedVaultId ? { vaultId: selectedVaultId, description: description.trim(), amount: parsedAmount } : null);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar">
        
        {/* Topo do Modal */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <DollarSign className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-extrabold text-slate-100 uppercase tracking-wider">Novo Lançamento</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          
          {/* Tipo: Saída ou Entrada */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 rounded-xl text-xs font-bold transition ${
                type === 'expense'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🔴 Despesa (Saída)
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 rounded-xl text-xs font-bold transition ${
                type === 'income'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🟢 Receita (Entrada)
            </button>
          </div>

          {/* Descrição */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Descrição</label>
            <input
              type="text"
              placeholder="Ex: Ingresso Lolla, Supermercado, Salário"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition"
              required
              autoFocus
            />
          </div>

          {/* Valor R$ */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Valor R$</label>
            <input
              type="number"
              step="0.01"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-950 border border-cyan-500/40 rounded-2xl p-3 text-lg font-black text-cyan-400 focus:outline-none focus:border-cyan-500 transition"
              required
            />
          </div>

          {/* Vínculo Opcional com Caixinha/Meta */}
          {type === 'expense' && vaults.length > 0 && (
            <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-2xl space-y-1.5">
              <div className="flex items-center gap-1.5 text-cyan-400">
                <Target className="w-3.5 h-3.5" />
                <label className="text-[10px] font-extrabold uppercase tracking-wider">Vincular a uma Meta / Caixinha (Opcional)</label>
              </div>
              <select
                value={selectedVaultId}
                onChange={(e) => setSelectedVaultId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="">Nenhuma meta vinculada</option>
                {vaults.map(v => (
                  <option key={v.id} value={v.id}>🎯 {v.name}</option>
                ))}
              </select>
              <p className="text-[9px] text-slate-500">
                Ao vincular, esse gasto será adicionado e computado automaticamente no progresso da meta selecionada!
              </p>
            </div>
          )}

          {/* Categoria e Forma de Pagamento */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Forma de Pagamento</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {PAYMENT_METHODS.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Data e Status */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Data</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="paid">✓ Pago / Recebido</option>
                <option value="pending">⏳ Pendente / A Vencer</option>
              </select>
            </div>
          </div>

          {/* Parcelamento e Recorrência (Apenas para despesas) */}
          {type === 'expense' && (
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Parcelamento</label>
                <select
                  value={installments}
                  onChange={(e) => setInstallments(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="1">À vista (1x)</option>
                  {[2, 3, 4, 5, 6, 10, 12, 18, 24, 36, 48].map(n => (
                    <option key={n} value={n}>{n}x Parcelas</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="recurringCheck"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="w-4 h-4 rounded accent-cyan-500 cursor-pointer"
                />
                <label htmlFor="recurringCheck" className="text-xs font-semibold text-slate-300 cursor-pointer">
                  Assinatura Fixa
                </label>
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-950 border border-slate-800 text-slate-400 py-3 rounded-2xl text-xs font-bold active:scale-95 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black py-3 rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 active:scale-95 transition"
            >
              Salvar
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}