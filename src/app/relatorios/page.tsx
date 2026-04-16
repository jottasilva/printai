'use client';

import { Suspense, useEffect, useState } from 'react';
import { BarChart3, RotateCw } from 'lucide-react';
import { ReportMetrics } from '@/components/relatorios/report-metrics';
import { RevenueChart } from '@/components/relatorios/revenue-chart';
import { SalesFunnel } from '@/components/relatorios/sales-funnel';
import { ProfitabilityList } from '@/components/relatorios/profitability-list';
import { getReportData } from '@/app/actions/reports';
import { motion } from 'framer-motion';

export default function RelatoriosPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const reportData = await getReportData();
        setData(reportData);
      } catch (error) {
        console.error('Falha ao carregar dados de relatórios:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-primary"
        >
          <RotateCw className="w-8 h-8" />
        </motion.div>
        <p className="text-sm font-light text-muted-foreground uppercase tracking-[0.2em] animate-pulse">
          Sincronizando BI...
        </p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-10 pb-20">
      {/* Header com Design Stitch */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div>
          <div className="flex items-center gap-3 text-primary mb-2">
            <BarChart3 className="w-6 h-6" />
            <h1 className="text-2xl font-normal tracking-tight">Relatórios & BI</h1>
          </div>
          <p className="text-sm font-light text-muted-foreground max-w-md">
            Gestão inteligente e dados de performance operacional da sua gráfica digital.
          </p>
        </div>
        <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100/50 flex items-center gap-2 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-normal uppercase tracking-widest">Sincronizado em tempo real</span>
        </div>
      </motion.div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Lado Esquerdo - Faturamento e Métricas */}
        <div className="lg:col-span-8 space-y-8">
          <ReportMetrics overview={data.overview} />
          <RevenueChart stats={data.revenueStats} />
        </div>

        {/* Lado Direito - Funil e Detalhes */}
        <div className="lg:col-span-4 space-y-8">
          <SalesFunnel data={data.funnel} />
        </div>

        {/* Rodapé do Grid - Rentabilidade e Relatórios */}
        <div className="lg:col-span-12">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
             <ProfitabilityList categories={data.categoryStats} />
             
             {/* Card placeholder para Insights de IA (Bônus para o cliente) */}
             <div className="p-8 rounded-3xl bg-slate-900 text-white relative overflow-hidden group">
                <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-primary/20 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 space-y-6">
                  <div className="px-3 py-1 bg-primary/20 rounded-full w-fit border border-primary/30">
                    <p className="text-[10px] font-normal uppercase tracking-[0.2em] text-primary-foreground">AI Insight Powered</p>
                  </div>
                  <h3 className="text-2xl font-light">Otimize sua produção em até <span className="text-primary font-normal">18%</span> este mês.</h3>
                  <p className="text-sm font-light text-slate-300 leading-relaxed">
                    Com base nos dados de conversão de Banners e Lonas, recomendamos priorizar a fila de produção entre 10h e 14h para maximizar a eficiência das máquinas de grande formato.
                  </p>
                  <button className="px-6 py-3 bg-white text-slate-900 rounded-2xl text-xs font-normal hover:bg-primary hover:text-white transition-all">
                    Ver recomendações detalhadas
                  </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
