export const dynamic = 'force-dynamic';

import { getProductionItems } from '@/app/actions/production';
import { Sidebar } from '@/components/sidebar';
import { KanbanBoard } from '@/components/production/kanban-board';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
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
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { prisma } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

async function getProductionStats() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { tenantId: true }
  });

  if (!profile) throw new Error('Profile not found');

  const tenantId = profile.tenantId;

  const [waiting, inQueue, inProgress, paused, done, rejected] = await Promise.all([
    prisma.orderItem.count({ where: { tenantId, status: 'PENDING' } }),
    prisma.orderItem.count({ where: { tenantId, status: 'QUEUED' } }),
    prisma.orderItem.count({ where: { tenantId, status: 'IN_PROGRESS' } }),
    prisma.orderItem.count({ where: { tenantId, status: 'PAUSED' } }),
    prisma.orderItem.count({ where: { tenantId, status: 'DONE' } }),
    prisma.orderItem.count({ where: { tenantId, status: 'REJECTED' } }),
  ]);

  return {
    waiting,
    inQueue,
    inProgress,
    paused,
    done,
    rejected,
    total: waiting + inQueue + inProgress + paused + done + rejected,
  };
}

export default async function ProductionPage() {
  const items = await getProductionItems();
  const stats = await getProductionStats();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-64 p-8">
        <div className="max-w-[1920px] mx-auto space-y-10">
          {/* Header - Premium Style */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <span className="text-[10px] font-extrabold text-primary uppercase tracking-[0.2em] mb-2 block">
                Production Control Center
              </span>
              <h1 className="text-4xl font-black text-foreground tracking-tighter">
                Workflow Kanban
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Real-time tracking of service orders and manufacturing deadlines.
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="rounded-xl border-border bg-white text-xs font-bold h-11 px-5">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" className="rounded-xl border-border bg-white text-xs font-bold h-11 px-5">
                <ListFilter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold h-11 px-6 shadow-lg shadow-primary/20">
                <Settings2 className="w-4 h-4 mr-2" />
                Factory Board
              </Button>
            </div>
          </div>

          {/* Stats Cards - Novo Estilo */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <StatCard
              title="Waiting"
              value={stats.waiting}
              icon={<Clock className="w-5 h-5" />}
              color="default"
            />
            <StatCard
              title="In Queue"
              value={stats.inQueue}
              icon={<Calendar className="w-5 h-5" />}
              color="info"
            />
            <StatCard
              title="Active"
              value={stats.inProgress}
              icon={<Play className="w-5 h-5" />}
              color="warning"
            />
            <StatCard
              title="Paused"
              value={stats.paused}
              icon={<Pause className="w-5 h-5" />}
              color="danger"
            />
            <StatCard
              title="Done"
              value={stats.done}
              icon={<CheckCircle2 className="w-5 h-5" />}
              color="success"
            />
            <StatCard
              title="Rejected"
              value={stats.rejected}
              icon={<AlertCircle className="w-5 h-5" />}
              color="danger"
            />
          </div>

          {/* Kanban Board Container */}
          <Card className="border-none shadow-premium bg-slate-50/30">
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <LayoutGrid className="w-6 h-6 text-primary" />
                    Production Line Board
                  </CardTitle>
                  <CardDescription>Drag and drop items to update staging</CardDescription>
                </div>
                <Badge variant="outline" className="rounded-lg border-primary/20 text-primary font-bold bg-primary/5 px-3 py-1">
                  {items.length} Active Jobs
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <KanbanBoard initialItems={items} />
            </CardContent>
          </Card>

          {/* Legenda Premium */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 py-6 px-4 bg-slate-50/50 rounded-2xl border border-slate-100">
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Delayed</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">High Priority</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_8px_rgba(124,58,237,0.4)]" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Normal</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Low</span>
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
