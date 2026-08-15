import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Car, Utensils, ShoppingBag, ArrowDownLeft, Zap, Sparkles } from 'lucide-react';

const DEFAULT_SHORTCUTS = [
  { id: '1', description: 'Uber', type: 'expense', category: 'Uber / Transporte Público', paymentMethod: 'Cartão de Crédito', icon: 'car' },
  { id: '2', description: 'iFood', type: 'expense', category: 'Restaurantes & iFood', paymentMethod: 'Cartão de Crédito', icon: 'food' },
  { id: '3', description: 'Mercado', type: 'expense', category: 'Supermercado & Feira', paymentMethod: 'Cartão de Crédito', icon: 'market' },
  { id: '4', description: 'Pix Recebido', type: 'income', category: 'Pix Recebido', paymentMethod: 'Conta Corrente / Pix', icon: 'income' },
];

export default function QuickShortcuts({ onSelectShortcut }) {
  const [shortcuts, setShortcuts] = useState(() => {
    const saved = localStorage.getItem('minhas_financas_shortcuts');
    return saved ? JSON.parse(saved) : DEFAULT_SHORTCUTS;
  });

  const [isAdding, setIsAdding] = useState(false);
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState('expense');
  const [newCategory, setNewCategory] = useState('Supermercado & Feira');

  useEffect(() => {
    localStorage.setItem('minhas_financas_shortcuts', JSON.stringify(shortcuts));
  }, [shortcuts]);

  const handleAddShortcut = (e) => {
    e.preventDefault();
    if (!newDesc.trim()) return;

    const newShortcut = {
      id: Date.now().toString(),
      description: newDesc.trim(),
      type: newType,
      category: newCategory,
      paymentMethod: newType === 'income' ? 'Conta Corrente / Pix' : 'Cartão de Crédito',
      icon: 'custom',
    };

    setShortcuts([...shortcuts, newShortcut]);
    setNewDesc('');
    setIsAdding(false);
  };

  const handleDeleteShortcut = (id, e) => {
    e.stopPropagation();
    setShortcuts(shortcuts.filter(s => s.id !== id));
  };

  const renderIcon = (type, desc = '') => {
    const d = desc.toLowerCase();
    if (d.includes('uber') || d.includes('transporte')) return <Car className="w-3.5 h-3.5" />;
    if (d.includes('ifood') || d.includes('comida') || d.includes('lanche')) return <Utensils className="w-3.5 h-3.5" />;
    if (d.includes('mercado') || d.includes('compra')) return <ShoppingBag className="w-3.5 h-3.5" />;
    if (type === 'income') return <ArrowDownLeft className="w-3.5 h-3.5" />;
    return <Zap className="w-3.5 h-3.5" />;
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300">
            Atalhos Rápidos de 1 Toque
          </h3>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-lg active:scale-95 transition"
        >
          <Plus className="w-3 h-3 stroke-[3]" />
          <span>{isAdding ? 'Fechar' : 'Novo'}</span>
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddShortcut} className="p-3 bg-slate-900 border border-slate-800 rounded-2xl space-y-2.5 shadow-xl animate-fade-in">
          <input
            type="text"
            placeholder="Nome do Atalho (Ex: Farmácia, Padaria)"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            required
            autoFocus
          />

          <div className="grid grid-cols-2 gap-2">
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="expense">🔴 Gasto (Saída)</option>
              <option value="income">🟢 Ganho (Entrada)</option>
            </select>

            <button
              type="submit"
              className="bg-cyan-500 text-slate-950 text-xs font-black rounded-xl p-2 uppercase tracking-wider active:scale-95 transition"
            >
              Salvar Atalho
            </button>
          </div>
        </form>
      )}

      {/* Carrossel de Atalhos com Toque Otimizado para Celular */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
        {shortcuts.map(s => {
          const isIncome = s.type === 'income';
          return (
            <button
              key={s.id}
              onClick={() => onSelectShortcut(s)}
              className={`group flex items-center gap-2 px-3 py-2 rounded-2xl border shadow-md whitespace-nowrap active:scale-95 transition ${
                isIncome
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                  : 'bg-slate-900/90 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                isIncome ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-cyan-400'
              }`}>
                {renderIcon(s.type, s.description)}
              </div>

              <span className="text-xs font-bold">{s.description}</span>

              {shortcuts.length > 2 && (
                <span
                  onClick={(e) => handleDeleteShortcut(s.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-500 hover:text-rose-400 transition"
                  title="Excluir atalho"
                >
                  <Trash2 className="w-3 h-3" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}