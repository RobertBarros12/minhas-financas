import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Zap } from 'lucide-react';

export default function QuickShortcuts({ onSelectShortcut }) {
  const defaultShortcuts = [
    { id: '1', label: 'Uber', category: 'Uber / Transporte Público', paymentMethod: 'Cartão de Crédito', type: 'expense' },
    { id: '2', label: 'iFood', category: 'Restaurantes & iFood', paymentMethod: 'Cartão de Crédito', type: 'expense' },
    { id: '3', label: 'Mercado', category: 'Supermercado & Feira', paymentMethod: 'Pix / Débito', type: 'expense' },
    { id: '4', label: 'Pix Recebido', category: 'Pix Recebido', paymentMethod: 'Conta Corrente / Pix', type: 'income' },
  ];

  const [shortcuts, setShortcuts] = useState(() => {
    const saved = localStorage.getItem('user_shortcuts');
    return saved ? JSON.parse(saved) : defaultShortcuts;
  });

  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newCategory, setNewCategory] = useState('Outros');
  const [newType, setNewType] = useState('expense');

  useEffect(() => {
    localStorage.setItem('user_shortcuts', JSON.stringify(shortcuts));
  }, [shortcuts]);

  const handleAddShortcut = (e) => {
    e.preventDefault();
    if (!newLabel.trim()) return;

    const newShortcut = {
      id: Date.now().toString(),
      label: newLabel,
      category: newCategory,
      paymentMethod: newType === 'income' ? 'Conta Corrente / Pix' : 'Pix / Débito',
      type: newType,
    };

    setShortcuts([...shortcuts, newShortcut]);
    setNewLabel('');
    setIsAdding(false);
  };

  const handleDeleteShortcut = (id, e) => {
    e.stopPropagation();
    setShortcuts(shortcuts.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Atalhos Rápidos Personalizados</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-lg transition"
        >
          <Plus className="w-3 h-3" /> Novo Atalho
        </button>
      </div>

      {/* Formulário para Novo Atalho */}
      {isAdding && (
        <form onSubmit={handleAddShortcut} className="bg-slate-900 border border-cyan-500/30 p-3 rounded-2xl space-y-2 animate-fade-in">
          <input
            type="text"
            placeholder="Nome do Atalho (Ex: VR Almoço, Comissão)"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            required
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200"
            >
              <option value="expense">Saída (Gasto)</option>
              <option value="income">Entrada (Ganho)</option>
            </select>
            <input
              type="text"
              placeholder="Categoria"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs text-slate-400 px-3 py-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-3 py-1 rounded-xl text-xs"
            >
              Salvar Atalho
            </button>
          </div>
        </form>
      )}

      {/* Lista de Atalhos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {shortcuts.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectShortcut(item)}
            className="group relative bg-slate-900/80 hover:bg-slate-800 border border-slate-800 p-2.5 rounded-2xl text-center text-xs font-bold text-slate-200 transition active:scale-95 shadow-sm cursor-pointer flex items-center justify-between"
          >
            <span className="truncate">{item.type === 'income' ? '🟢' : '🔴'} + {item.label}</span>
            <button
              onClick={(e) => handleDeleteShortcut(item.id, e)}
              className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition p-1"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}