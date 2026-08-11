import React from 'react';
import { LayoutDashboard, Calendar, Target, ReceiptText, BarChart3 } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'calendar', label: 'Agenda', icon: Calendar },
    { id: 'goals', label: 'Metas', icon: Target },
    { id: 'bills', label: 'Contas', icon: ReceiptText },
    { id: 'analytics', label: 'Análise', icon: BarChart3 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/80 px-1 py-2 z-50 max-w-md mx-auto sm:max-w-xl md:max-w-2xl lg:max-w-5xl shadow-2xl">
      <div className="flex justify-around items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 py-1.5 px-2.5 rounded-2xl transition-all duration-200 ${
                isActive 
                  ? 'text-cyan-400 font-bold scale-105 bg-cyan-500/10' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
              <span className="text-[9px] tracking-wide">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}