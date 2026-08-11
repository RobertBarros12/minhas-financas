import React, { useState } from 'react';
import { 
  BarChart3, 
  ChevronDown, 
  ChevronUp, 
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Flame,
  Calendar,
  PieChart,
  ShieldCheck,
  ShoppingBag,
  Home,
  Utensils,
  Car,
  Tv,
  HeartPulse
} from 'lucide-react';

export default function Analytics({ transactions = [] }) {
  const [expandedCategory, setExpandedCategory] = useState(null);

  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  // 1. TOTAL DE SAÍDAS DO MÊS ATIVO
  const currentExpenses = transactions.filter(t => t.type === 'expense' && t.status === 'paid');
  const totalExpenseMonth = currentExpenses.reduce((acc, t) => acc + t.amount, 0);

  // 2. MÉDIA DIÁRIA DE GASTOS
  const today = new Date();
  const currentDayCount = today.getDate() || 1;
  const dailyAverage = totalExpenseMonth / currentDayCount;

  // 3. TOP 3 "VILÕES DO MÊS" (Maiores lançamentos individuais)
  const topVillains = [...currentExpenses]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  // 4. DIAGNÓSTICO DA REGRA 50/30/20 (Saúde Orçamentária)
  // 50% Necessidades (Fixas, Moradia, Luz, Aluguel, Financiamento)
  // 30% Desejos/Lazer (iFood, Restaurantes, Uber, Compras)
  // 20% Futuro/Investimentos (Reservas, Metas)
  const needsCategories = ['Contas Fixas', 'Contas da Casa (Luz/Água/Gás)', 'Aluguel / Condomínio', 'Financiamento do Veículo', 'Supermercado & Feira'];
  const wantsCategories = ['Restaurantes & iFood', 'Padaria & Lanches', 'Lazer, Bar & Viagens', 'Uber / Transporte Público', 'Vestuário, Roupas & Eletrônicos', 'Assinaturas (Netflix, Spotify...)'];

  const needsTotal = currentExpenses
    .filter(t => needsCategories.includes(t.category))
    .reduce((acc, t) => acc + t.amount, 0);

  const wantsTotal = currentExpenses
    .filter(t => wantsCategories.includes(t.category))
    .reduce((acc, t) => acc + t.amount, 0);

  const investmentsTotal = currentExpenses
    .filter(t => t.category.includes('Investimento') || t.category.includes('Reserva'))
    .reduce((acc, t) => acc + t.amount, 0);

  const needsPercentage = totalExpenseMonth > 0 ? Math.round((needsTotal / totalExpenseMonth) * 100) : 0;
  const wantsPercentage = totalExpenseMonth > 0 ? Math.round((wantsTotal / totalExpenseMonth) * 100) : 0;
  const investmentsPercentage = totalExpenseMonth > 0 ? Math.round((investmentsTotal / totalExpenseMonth) * 100) : 0;

  // 5. AGRUPAMENTO POR CATEGORIAS PARA O GRÁFICO VISUAL
  const categoriesMap = {};
  currentExpenses.forEach(t => {
    const cat = t.category || 'Outros Gastos';
    if (!categoriesMap[cat]) {
      categoriesMap[cat] = { name: cat, totalAmount: 0, items: [] };
    }
    categoriesMap[cat].totalAmount += t.amount;
    categoriesMap[cat].items.push(t);
  });

  const categoriesList = Object.values(categoriesMap).map(c => ({
    ...c,
    percentage: totalExpenseMonth > 0 ? Math.round((c.totalAmount / totalExpenseMonth) * 100) : 0
  })).sort((a, b) => b.totalAmount - a.totalAmount);

  const toggleCategory = (name) => {
    setExpandedCategory(expandedCategory === name ? null : name);
  };

  return (
    <div className="space-y-3.5 animate-fade-in">
      
      {/* 📊 RAIO-X FINANCEIRO (TOTAL DE SAÍDAS + COMPARATIVO & MÉDIA DIÁRIA) */}
      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-xs text-slate-100 uppercase tracking-wider">Raio-X do Mês</h3>
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
            <TrendingDown className="w-3 h-3" /> -12% vs. Mês Anterior
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-0.5">
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 space-y-0.5">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total de Saídas</p>
            <p className="text-lg font-extrabold text-rose-400">{formatCurrency(totalExpenseMonth)}</p>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 space-y-0.5">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Média Diária de Gastos</p>
            <p className="text-lg font-extrabold text-cyan-400">{formatCurrency(dailyAverage)}<span className="text-[10px] font-normal text-slate-400">/dia</span></p>
          </div>
        </div>
      </div>

      {/* 🔥 TOP 3 VILÕES DO MÊS (Maiores ofensores) */}
      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-xl space-y-2.5">
        <div className="flex items-center gap-2 text-amber-400">
          <Flame className="w-4 h-4 text-amber-400 fill-amber-400/20" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-100">Top 3 Vilões do Mês</h3>
        </div>

        {topVillains.length > 0 ? (
          <div className="space-y-1.5">
            {topVillains.map((v, idx) => (
              <div 
                key={v.id || idx} 
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold flex items-center justify-center">
                    {idx + 1}º
                  </span>
                  <div>
                    <p className="font-bold text-slate-200">{v.description}</p>
                    <p className="text-[10px] text-slate-400">{v.category}</p>
                  </div>
                </div>
                <span className="font-extrabold text-rose-400">{formatCurrency(v.amount)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 text-center py-2">Nenhum gasto registrado neste mês.</p>
        )}
      </div>

      {/* 💡 DIAGNÓSTICO DA REGRA 50/30/20 (Saúde Orçamentária) */}
      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-xs text-slate-100 uppercase tracking-wider">Regra 50 / 30 / 20</h3>
          </div>
          {needsPercentage <= 50 ? (
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Orçamento Equilibrado
            </span>
          ) : (
            <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Necessidades acima de 50%
            </span>
          )}
        </div>

        <div className="space-y-2.5 pt-1">
          {/* 50% Necessidades */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-semibold">🏠 Necessidades Básicas (Meta 50%)</span>
              <span className="font-bold text-indigo-400">{needsPercentage}% ({formatCurrency(needsTotal)})</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${needsPercentage > 50 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                style={{ width: `${Math.min(100, needsPercentage)}%` }}
              ></div>
            </div>
          </div>

          {/* 30% Desejos */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-semibold">🍕 Desejos & Lazer (Meta 30%)</span>
              <span className="font-bold text-cyan-400">{wantsPercentage}% ({formatCurrency(wantsTotal)})</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div 
                className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                style={{ width: `${Math.min(100, wantsPercentage)}%` }}
              ></div>
            </div>
          </div>

          {/* 20% Futuro */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-semibold">🎯 Futuro & Metas (Meta 20%)</span>
              <span className="font-bold text-emerald-400">{investmentsPercentage}% ({formatCurrency(investmentsTotal)})</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div 
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${Math.min(100, investmentsPercentage)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* 📊 BARRAS VISUAIS POR CATEGORIA */}
      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3 shadow-xl">
        <h3 className="font-bold text-xs text-slate-100 uppercase tracking-wider">Detalhamento Visual por Categoria</h3>

        <div className="space-y-2 pt-1">
          {categoriesList.length > 0 ? (
            categoriesList.map((cat, idx) => {
              const isExpanded = expandedCategory === cat.name;

              return (
                <div key={idx} className="bg-slate-950/80 rounded-2xl border border-slate-800/80 overflow-hidden shadow-md">
                  <button
                    onClick={() => toggleCategory(cat.name)}
                    className="w-full p-3.5 space-y-2 text-left hover:bg-slate-800/40 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">{cat.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-100">{formatCurrency(cat.totalAmount)}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                      </div>
                    </div>

                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500"
                        style={{ width: `${cat.percentage}%` }}
                      ></div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="bg-slate-900/90 p-3 border-t border-slate-800/80 space-y-1.5">
                      {cat.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl bg-slate-950/50 border border-slate-800/50">
                          <span className="text-slate-300">• {item.description}</span>
                          <span className="font-bold text-slate-200">{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-xs text-slate-500 text-center py-4">Sem dados de categorias para o período selecionado.</p>
          )}
        </div>
      </div>

    </div>
  );
}