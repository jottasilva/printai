export const dynamic = 'force-dynamic';

import { getProductionKanbanData } from '@/app/actions/production';
import { Sidebar } from '@/components/sidebar';
import { KanbanBoard } from '@/components/production/kanban-board';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Activity,
  LayoutGrid,
  ListFilter,
  Settings2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  Package,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { prisma } from '@/lib/db';
import { getTenantId } from '@/lib/server-utils';
import { serializeData } from '@/lib/utils';

async function getProductionStats(tenantId: string) {
  const [picking, inProgress, packing, shipped, total] = await Promise.all([
    prisma.orderItem.count({ where: { tenantId, status: { in: ['PENDING', 'QUEUED', 'PICKING'] } } }),
    prisma.orderItem.count({ where: { tenantId, status: 'IN_PROGRESS' } }),
    prisma.orderItem.count({ where: { tenantId, status: 'PACKING' } }),
    prisma.orderItem.count({ where: { tenantId, status: 'DONE' } }),
    prisma.orderItem.count({ where: { tenantId } }),
  ]);

  return {
    picking,
    inProgress,
    packing,
    shipped,
    total,
  };
}

export default async function ProductionPage() {
  const { tenantId } = await getTenantId();
  const { sectors, items } = await getProductionKanbanData();
  const stats = await getProductionStats(tenantId);

  // Serializa os dados antes de passar para componentes de cliente
  const serializedItems = serializeData(items);
  const serializedSectors = serializeData(sectors);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-64 p-8">
        <div className="max-w-[1920px] mx-auto space-y-10">
          {/* Header - Premium Style */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex-1">
              <p className="text-[10px] font-normal text-primary uppercase tracking-[0.3em] mb-1">
                Fluxo Operacional
              </p>
              <h1 className="text-4xl font-light text-foreground tracking-tighter">
                Produção em Tempo Real
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" className="rounded-xl border-border bg-white text-xs font-normal h-11 px-5">
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
              <Button variant="outline" className="rounded-xl border-border bg-white text-xs font-normal h-11 px-5">
                <ListFilter className="w-4 h-4 mr-2" />
                Filtrar
              </Button>
              <Button className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold h-11 px-6 shadow-lg shadow-primary/20">
                <Settings2 className="w-4 h-4 mr-2" />
                Painel da Fábrica
              </Button>
            </div>
          </div>

          {/* Stats Cards - Novo Estilo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Em Separação</span>
                <div className="w-8 h-8 rounded-lg bg-[#B4B2A9]/10 flex items-center justify-center">
                  <Package className="w-4 h-4 text-[#B4B2A9]" />
                </div>
              </div>
              <p className="text-3xl font-light text-slate-900">{stats.picking}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Em Produção</span>
                <div className="w-8 h-8 rounded-lg bg-[#378ADD]/10 flex items-center justify-center">
                  <Play className="w-4 h-4 text-[#378ADD]" />
                </div>
              </div>
              <p className="text-3xl font-light text-slate-900">{stats.inProgress}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Conferência</span>
                <div className="w-8 h-8 rounded-lg bg-[#1D9E75]/10 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-[#1D9E75]" />
                </div>
              </div>
              <p className="text-3xl font-light text-slate-900">{stats.packing}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Expedição</span>
                <div className="w-8 h-8 rounded-lg bg-[#EF9F27]/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-[#EF9F27]" />
                </div>
              </div>
              <p className="text-3xl font-light text-slate-900">{stats.shipped}</p>
            </div>
          </div>

          {/* Kanban Board Container */}
          <Card className="border-none shadow-premium bg-slate-50/30">
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <LayoutGrid className="w-6 h-6 text-primary" />
                    Linha de Produção
                  </CardTitle>
                  <CardDescription>Arraste e solte os itens para atualizar as etapas por setor</CardDescription>
                </div>
                <Badge variant="outline" className="rounded-lg border-primary/20 text-primary font-bold bg-primary/5 px-3 py-1">
                  {items.length} Trabalhos Ativos
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <KanbanBoard initialItems={serializedItems as any} sectors={serializedSectors as any} />
            </CardContent>
          </Card>

          {/* Legenda Premium */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 py-6 px-4 bg-slate-50/50 rounded-2xl border border-slate-100">
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Atrasado</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Alta Prioridade</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_8px_rgba(124,58,237,0.4)]" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Normal</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Baixa</span>
              </div>
            </div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <RefreshCw className="w-3 h-3" />
              Sync: {new Date().toLocaleTimeString('pt-BR')}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
