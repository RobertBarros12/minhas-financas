import React from 'react';
import { ShieldCheck, Plus } from 'lucide-react';

export default function Investments() {
  const assets = [
    { name: 'Reserva (CDB 100% CDI)', category: 'Renda Fixa', value: 'R$ 5.000,00', yield: '+0.95%' },
    { name: 'FIIs / Ações', category: 'Renda Variável', value: 'R$ 2.500,00', yield: '+1.40%' },
  ];

  return (
    <div className="bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800/80 space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-violet-400" />
          <h3 className="font-bold text-sm text-zinc-100">Carteira de Ativos</h3>
        </div>
        <button className="flex items-center gap-1 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border border-violet-500/20 px-3 py-1.5 rounded-xl text-xs font-medium transition">
          <Plus className="w-3.5 h-3.5" />
          <span>Ativo</span>
        </button>
      </div>

      <div className="divide-y divide-zinc-800/60">
        {assets.map((item, idx) => (
          <div key={idx} className="py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-200">{item.name}</p>
              <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md mt-0.5 inline-block">
                {item.category}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-zinc-100">{item.value}</p>
              <p className="text-xs text-emerald-400 font-medium">{item.yield}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}