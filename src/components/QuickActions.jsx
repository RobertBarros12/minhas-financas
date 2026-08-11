import React from 'react';
import { Car, Fuel, Coffee, ShoppingCart, Utensils, Zap } from 'lucide-react';

export default function QuickActions({ onQuickSelect }) {
  // Atalhos de 1 Clique apenas para selecionar Categoria/Forma e pedir o Valor
  const quickItems = [
    { label: 'Uber', category: 'Uber / Transporte Público', paymentMethod: 'Cartão de Crédito', icon: Car, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    { label: 'Gasolina', category: 'Combustível', paymentMethod: 'Pix / Débito', icon: Fuel, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
    { label: 'Café / Lanche', category: 'Padaria & Lanches', paymentMethod: 'Pix / Débito', icon: Coffee, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
    { label: 'iFood / Almoço', category: 'Restaurantes & iFood', paymentMethod: 'Vale Refeição (VR/VA)', icon: Utensils, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Mercado', category: 'Supermercado & Feira', paymentMethod: 'Pix / Débito', icon: ShoppingCart, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  ];

  return (
    <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-2.5 shadow-xl">
      <div className="flex items-center gap-1.5 text-slate-300">
        <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />
        <h3 className="text-xs font-bold uppercase tracking-wider">Atalhos Rápidos (Digite só o valor)</h3>
      </div>

      {/* Carrossel de botões de atalho */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {quickItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => onQuickSelect(item)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${item.color}`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>+ {item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}