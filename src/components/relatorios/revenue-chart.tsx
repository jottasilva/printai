'use client';

import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart3, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RevenueChartProps {
  stats: Array<{
    month: string;
    total: number;
    goal: number;
  }>;
}

export function RevenueChart({ stats }: RevenueChartProps) {
  const maxVal = Math.max(...stats.flatMap(s => [s.total, s.goal])) || 1;

  return (
    <Card className="border-none shadow-premium bg-white rounded-3xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 bg-gray-50/20 px-8 py-6">
        <div className="space-y-1">
          <CardTitle className="text-xl font-normal text-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Faturamento Mensal vs Meta
          </CardTitle>
          <p className="text-xs font-light text-muted-foreground">Performance financeira consolidada do último ano.</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-[10px] font-light uppercase tracking-widest text-muted-foreground">Realizado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-200" />
            <span className="text-[10px] font-light uppercase tracking-widest text-muted-foreground">Meta</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-8 py-10">
        <div className="h-[320px] w-full flex items-end justify-between gap-4">
          {stats.map((item, idx) => (
            <div key={item.month} className="flex-1 flex flex-col items-center group relative h-full justify-end">
              {/* Tooltip simplificado */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 scale-95 group-hover:scale-100 pointer-events-none">
                <div className="bg-slate-900 text-white text-[10px] px-3 py-2 rounded-xl shadow-xl flex flex-col gap-1 min-w-[120px]">
                  <div className="flex justify-between items-center gap-4">
                    <span className="opacity-60">Realizado:</span>
                    <span className="font-medium">R$ {(item.total / 1000).toFixed(1)}k</span>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="opacity-60">Meta:</span>
                    <span className="font-medium">R$ {(item.goal / 1000).toFixed(1)}k</span>
                  </div>
                </div>
              </div>

              {/* Colunas */}
              <div className="w-full flex items-end justify-center gap-1 group-hover:scale-x-110 transition-transform duration-300">
                {/* Meta (Fundo) */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(item.goal / maxVal) * 260}px` }}
                  className="w-3 bg-slate-100 rounded-t-lg relative"
                />
                {/* Real (Frente) */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(item.total / maxVal) * 260}px` }}
                  transition={{ duration: 1, delay: idx * 0.05, ease: "circOut" }}
                  className={cn(
                    "w-5 rounded-t-xl relative overflow-hidden",
                    item.total >= item.goal ? "bg-primary shadow-lg shadow-primary/20" : "bg-primary/60"
                  )}
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-white/20" />
                  {item.total >= item.goal && (
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[8px] text-white/40">
                      <Target className="w-3 h-3" />
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Label do Mês */}
              <span className="text-[10px] font-light text-muted-foreground uppercase tracking-wider mt-6 h-4 rotate-[-45deg] origin-top opacity-60 group-hover:opacity-100 group-hover:text-primary transition-all">
                {item.month}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
