'use client';

import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Filter, ArrowDownRight, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FunnelStep {
  label: string;
  value: number;
  description?: string;
  percentage?: string | number;
}

interface SalesFunnelProps {
  data: FunnelStep[];
}

export function SalesFunnel({ data }: SalesFunnelProps) {
  return (
    <Card className="border-none shadow-premium bg-white rounded-3xl overflow-hidden h-full">
      <CardHeader className="border-b border-gray-50 bg-gray-50/20 px-8 py-6">
        <CardTitle className="text-xl font-normal text-foreground flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary" />
          Funil de Conversão Operacional
        </CardTitle>
        <p className="text-xs font-light text-muted-foreground">Conversão de leads em entregas concluídas.</p>
      </CardHeader>
      <CardContent className="p-8">
        <div className="space-y-4">
          {data.map((step, idx) => (
            <div key={step.label} className="relative">
              {/* Conector Visual */}
              {idx < data.length - 1 && (
                <div className="absolute left-[40px] top-[48px] bottom-[-20px] w-px bg-slate-100 flex flex-col items-center justify-center">
                   <ArrowDownRight className="w-3 h-3 text-slate-300 -ml-[5px]" />
                </div>
              )}

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="flex items-center gap-6 group"
              >
                {/* Indicador de Valor */}
                <div className="w-20 h-20 rounded-2xl bg-slate-50 flex flex-col items-center justify-center border border-slate-100 group-hover:border-primary/30 group-hover:bg-primary/5 transition-colors">
                  <span className="text-lg font-normal text-foreground">{step.value}</span>
                  <span className="text-[9px] font-light text-muted-foreground uppercase tracking-widest">Qtd</span>
                </div>

                {/* Detalhes do Passo */}
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-sm font-normal text-foreground">{step.label}</h4>
                    {step.percentage && (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 rounded-full">
                        <TrendingUp className="w-3 h-3 text-primary" />
                        <span className="text-[10px] font-normal text-primary">{step.percentage}%</span>
                      </div>
                    )}
                  </div>

                  {/* Barra de Progresso do Funil */}
                  <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(step.value / (data[0].value || 1)) * 100}%` }}
                      transition={{ duration: 1, delay: 0.5 + (idx * 0.1) }}
                      className={cn(
                        "h-full rounded-full",
                        idx === 0 ? "bg-slate-300" :
                        idx === 1 ? "bg-primary/40" :
                        idx === 2 ? "bg-primary/70" :
                        "bg-primary"
                      )}
                    />
                  </div>
                  {step.description && (
                    <p className="text-[10px] font-light text-muted-foreground mt-2 uppercase tracking-wider italic">
                      {step.description}
                    </p>
                  )}
                </div>
              </motion.div>
            </div>
          ))}
        </div>

        {/* Resumo Rodapé */}
        <div className="mt-12 pt-8 border-t border-slate-50 flex justify-between items-center px-4">
          <div className="text-center">
            <p className="text-[10px] font-light text-muted-foreground uppercase tracking-widest mb-1">Taxa Conversão</p>
            <p className="text-lg font-normal text-foreground">
              {data[0].value > 0 ? (data[1].value / data[0].value * 100).toFixed(1) : 0}%
            </p>
          </div>
          <div className="w-px h-8 bg-slate-100" />
          <div className="text-center">
            <p className="text-[10px] font-light text-muted-foreground uppercase tracking-widest mb-1">Eficiência</p>
            <p className="text-lg font-normal text-foreground">
              {data[2].value > 0 ? (data[3].value / data[2].value * 100).toFixed(1) : 0}%
            </p>
          </div>
          <div className="w-px h-8 bg-slate-100" />
          <div className="text-center">
            <p className="text-[10px] font-light text-muted-foreground uppercase tracking-widest mb-1">Prazo Médio</p>
            <p className="text-lg font-normal text-foreground">98% OK</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
