import React from 'react';
import { Wallet, Plus } from 'lucide-react';

export default function Header({ onOpenModal }) {
  return (
    <header className="flex items-center justify-between px-3 py-2.5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40">
      {/* Título minimalista para economizar espaço vertical */}
      <div className="flex items-center gap-2">
        <div className="bg-cyan-500/10 p-1.5 rounded-lg border border-cyan-500/20 text-cyan-400">
          <Wallet className="w-4 h-4" />
        </div>
        <h1 className="text-sm font-bold text-slate-200 tracking-tight">Minhas Finanças</h1>
      </div>
      
      {/* Botão de ação compacto */}
      <button 
        onClick={onOpenModal}
        className="flex items-center gap-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-slate-950 font-extrabold px-3 py-1.5 rounded-xl text-xs transition shadow-md shadow-cyan-500/20"
      >
        <Plus className="w-3.5 h-3.5 stroke-[3]" />
        <span>Lançar</span>
      </button>
    </header>
  );
}