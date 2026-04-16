'use client';

import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PieChart, TrendingUp, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryProfitability {
  name: string;
  profit: number;
  margin: string | number;
}

interface ProfitabilityListProps {
  categories: CategoryProfitability[];
}

export function ProfitabilityList({ categories }: ProfitabilityListProps) {
  const maxProfit = Math.max(...categories.map(c => c.profit)) || 1;

  return (
    <Card className="border-none shadow-premium bg-white rounded-3xl overflow-hidden h-full">
      <CardHeader className="border-b border-gray-50 bg-gray-50/20 px-8 py-6">
        <CardTitle className="text-xl font-normal text-foreground flex items-center gap-2">
          <PieChart className="w-5 h-5 text-primary" />
          Rentabilidade por Categoria
        </CardTitle>
        <p className="text-xs font-light text-muted-foreground">Margem de lucro por unidade produzida.</p>
      </CardHeader>
      <CardContent className="p-8">
        <div className="space-y-8">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="space-y-3"
            >
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <h4 className="text-sm font-normal text-foreground">{cat.name}</h4>
                  <div className="flex items-center gap-2 text-[10px] font-light text-muted-foreground uppercase tracking-wider">
                    <DollarSign className="w-3 h-3" />
                    R$ {(cat.profit / 1000).toFixed(1)}k Lucro total
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5 text-emerald-600 mb-1">
                    <TrendingUp className="w-3 h-3" />
                    <span className="text-xs font-medium">{cat.margin}%</span>
                  </div>
                  <p className="text-[10px] font-light text-muted-foreground uppercase tracking-widest">Margem</p>
                </div>
              </div>

              {/* Barra de Rentabilidade */}
              <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(cat.profit / maxProfit) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 + (idx * 0.1), ease: "circOut" }}
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    idx === 0 ? "bg-primary" : "bg-primary/60"
                  )}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Lista de Relatórios Adicionais */}
        <div className="mt-12 pt-8 border-t border-slate-50">
          <h5 className="text-[10px] font-light text-muted-foreground uppercase tracking-[0.2em] mb-4">Relatórios para Download</h5>
          <div className="space-y-2">
            {[
              { title: 'Fechamento Mensal de Caixa', desc: 'Consolidado de entradas e saídas.' },
              { title: 'Comissões de Vendas', desc: 'Detalhamento por vendedor e status.' },
              { title: 'Auditoria de Estoque', desc: 'Valores de insumos e depreciação.' }
            ].map((report) => (
              <button
                key={report.title}
                className="w-full text-left p-4 rounded-2xl hover:bg-slate-50 transition-colors group flex items-center justify-between border border-transparent hover:border-slate-100"
              >
                <div>
                  <p className="text-xs font-normal text-foreground group-hover:text-primary transition-colors">{report.title}</p>
                  <p className="text-[10px] font-light text-muted-foreground mt-0.5">{report.desc}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                  →
                </div>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
