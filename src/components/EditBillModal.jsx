import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Trash2, AlertTriangle } from 'lucide-react';

export default function EditBillModal({ isOpen, onClose, bill, onSave, onDelete }) {
  const [actualAmount, setActualAmount] = useState('');
  const [deleteOption, setDeleteOption] = useState(false);

  useEffect(() => {
    if (bill) {
      setActualAmount(bill.amount || '');
      setDeleteOption(false);
    }
  }, [bill, isOpen]);

  if (!isOpen || !bill) return null;

  const handleConfirmPay = (e) => {
    e.preventDefault();
    onSave({
      ...bill,
      amount: parseFloat(actualAmount),
      status: 'paid'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Confirmar / Ajustar Pagamento</span>
          </h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!deleteOption ? (
          <form onSubmit={handleConfirmPay} className="space-y-4">
            <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 space-y-1">
              <p className="text-xs font-bold text-slate-200">{bill.title}</p>
              <p className="text-[10px] text-slate-400">Vencimento original: {bill.dueDate}</p>
            </div>

            {/* Campo do Valor Real Pago (Adiantamento com desconto ou Juros) */}
            <div>
              <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                Valor Efetuado / Pago (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={actualAmount}
                onChange={(e) => setActualAmount(e.target.value)}
                className="w-full bg-slate-950 border border-cyan-500/50 rounded-2xl p-3 text-xl font-bold text-slate-100 focus:outline-none focus:border-cyan-400"
                placeholder="0,00"
                required
              />
              <p className="text-[10px] text-slate-500 mt-1">
                * Se houve desconto na antecipação ou juros no atraso, altere o valor acima.
              </p>
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteOption(true)}
                className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold hover:bg-rose-500/20 transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir</span>
              </button>

              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold py-3 rounded-2xl text-xs sm:text-sm transition shadow-lg shadow-emerald-500/20"
              >
                Confirmar Pagamento
              </button>
            </div>
          </form>
        ) : (
          /* Tela de Opção de Exclusão de Parcelas */
          <div className="space-y-4 animate-fade-in">
            <div className="bg-rose-500/10 p-4 rounded-2xl border border-rose-500/20 space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>Como deseja excluir este lançamento?</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Identificamos que este item pode fazer parte de um parcelamento. Escolha qual ação deseja realizar:
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => { onDelete(bill.id, 'single'); onClose(); }}
                className="w-full p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-2xl text-left text-xs font-bold text-slate-200 transition"
              >
                <span>1. Excluir Apenas Esta Parcela</span>
                <span className="block text-[10px] font-normal text-slate-400 mt-0.5">Mantém as demais parcelas registradas nos outros meses.</span>
              </button>

              <button
                onClick={() => { onDelete(bill.id, 'all'); onClose(); }}
                className="w-full p-3 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 rounded-2xl text-left text-xs font-bold text-rose-300 transition"
              >
                <span>2. Excluir TODO o Parcelamento</span>
                <span className="block text-[10px] font-normal text-rose-300/70 mt-0.5">Remove todas as parcelas associadas a este lançamento.</span>
              </button>
            </div>

            <button
              onClick={() => setDeleteOption(false)}
              className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
            >
              Voltar
            </button>
          </div>
        )}

      </div>
    </div>
  );
}