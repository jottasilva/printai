'use client';

import { ShieldCheck, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface ReportMetricsProps {
  overview: {
    safetyMargin: number;
    retentionRate: number | string;
  };
}

export function ReportMetrics({ overview }: ReportMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-6 border-none shadow-premium bg-white rounded-3xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <ShieldCheck className="w-24 h-24 text-primary" />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-100/50 rounded-2xl text-emerald-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-light text-muted-foreground uppercase tracking-widest">Margem de Segurança</p>
              <h3 className="text-2xl font-normal text-foreground mt-1">{overview.safetyMargin}%</h3>
            </div>
          </div>
          <p className="text-xs font-light text-muted-foreground leading-relaxed">
            Dentro da margem de segurança operacional estabelecida de 15% para o período.
          </p>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="p-6 border-none shadow-premium bg-white rounded-3xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users className="w-24 h-24 text-primary" />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-100/50 rounded-2xl text-blue-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-light text-muted-foreground uppercase tracking-widest">Retenção de Clientes</p>
              <h3 className="text-2xl font-normal text-foreground mt-1">{overview.retentionRate} meses</h3>
            </div>
          </div>
          <p className="text-xs font-light text-muted-foreground leading-relaxed">
            Média de retenção calculada com base na frequência de pedidos recorrentes.
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
