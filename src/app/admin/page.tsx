export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { getTenantId } from '@/lib/server-utils';
import { Sidebar } from '@/components/sidebar';
import { ActivityChart } from '@/components/dashboard/activity-chart';
import { BarChart3, Rocket, AlertTriangle, ChevronRight } from 'lucide-react';
import { getDashboardData } from '@/app/actions/dashboard';

async function getDashboardCockpitData() {
  let authData;
  try {
    authData = await getTenantId();
  } catch (error: any) {
    if (error.message.includes('not authenticated')) {
      redirect('/login');
    }
    redirect(`/login?error=profile_missing&details=${encodeURIComponent(error.message)}`);
  }

  const { userName, userRole } = {
    userName: (authData as any).userName || authData.userEmail.split('@')[0],
    userRole: authData.userRole
  } as any;

  // Busca dados unificados e protegidos via Server Action
  const dashboardData = await getDashboardData();

  return {
    userName,
    role: userRole,
    stats: {
      totalRevenue: dashboardData.stats.totalRevenue,
      availableCash: dashboardData.stats.availableCash,
      totalOrders: dashboardData.stats.pendingOrders + dashboardData.stats.ordersThisMonth, // Soma ilustrativa
      monthlyOrders: dashboardData.stats.ordersThisMonth,
      totalCustomers: dashboardData.stats.totalCustomers,
    },
    ordersByStatus: dashboardData.ordersByStatus,
    productionByStatus: dashboardData.productionByStatus,
    recentOrders: dashboardData.recentOrders,
  };
}

export default async function DashboardCockpitPage() {
  const data = await getDashboardCockpitData();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const statusLabels: Record<string, string> = {
    DRAFT: 'Rascunho',
    CONFIRMED: 'Confirmado',
    IN_PRODUCTION: 'Produção',
    READY: 'Pronto',
    SHIPPED: 'Enviado',
    DELIVERED: 'Entregue',
    CANCELED: 'Cancelado',
  };

  return (
    <div className="flex bg-[#F8F9FA] dark:bg-slate-950 min-h-screen">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-4 lg:p-10 ml-64">
        <div className="max-w-7xl mx-auto space-y-10">
          
          {/* Top Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                Sistema de Gestão Visual
              </p>
              <h1 className="text-3xl font-normal text-[#2D3E50] dark:text-white tracking-tight">
                Painel <span className="font-semibold text-primary">Operacional</span>
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" className="rounded-xl border-slate-200 bg-white shadow-sm h-11 text-xs">
                <BarChart3 className="w-4 h-4 mr-2" />
                Auditoria em Tempo Real
              </Button>
            </div>
          </div>

          {/* Core Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Receita Mensal"
              value={formatCurrency(data.stats.monthlyRevenue)}
              icon={<span className="material-symbols-outlined">payments</span>}
              trend={{ value: 12.5, label: 'Crescimento', positive: true }}
              color="success"
              className="border-none shadow-md rounded-[2rem] bg-white"
            />
            <StatCard
              title="Carga de Produção"
              value={`${Object.values(data.productionByStatus).reduce((a, b) => a + b, 0)} Itens`}
              icon={<span className="material-symbols-outlined">view_kanban</span>}
              trend={{ value: 4, label: 'Urgente', positive: false }}
              className="border-none shadow-md rounded-[2rem] bg-white"
            />
            <StatCard
              title="Pedidos Ativos"
              value={data.stats.totalOrders}
              icon={<span className="material-symbols-outlined">description</span>}
              color="info"
              className="border-none shadow-md rounded-[2rem] bg-white"
            />
            <StatCard
              title="Base de Clientes"
              value={data.stats.totalCustomers}
              icon={<span className="material-symbols-outlined">group</span>}
              className="border-none shadow-md rounded-[2rem] bg-white"
            />
          </div>

          {/* Bento Grid Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main Production Chart Card */}
            <Card className="lg:col-span-2 border-none shadow-[0_10px_40px_rgba(0,0,0,0.03)] bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between p-8 pb-0">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-semibold text-[#2D3E50] dark:text-white">Atividade Operacional</CardTitle>
                  <CardDescription>Distribuição de carga por status de produção</CardDescription>
                </div>
                <div className="flex gap-1 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-xl">
                  <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold rounded-lg bg-white dark:bg-slate-700 shadow-sm">SEMANAL</Button>
                  <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold rounded-lg text-slate-400">MENSAL</Button>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <ActivityChart
                  data={data.ordersByStatus}
                  totalOrders={data.stats.totalOrders}
                  statusLabels={statusLabels}
                />
              </CardContent>
            </Card>

            {/* Side Action/Status Cards */}
            <div className="space-y-6">
              <Card className="border-none shadow-xl bg-[#2D3E50] text-white rounded-[2.5rem] p-8 relative overflow-hidden group">
                <div className="absolute top-[-10%] right-[-10%] p-8 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                  <Rocket className="w-40 h-40" />
                </div>
                <div className="relative z-10 space-y-6">
                  <div className="space-y-2">
                    <Badge className="bg-white/10 text-white border-none mb-2 font-bold text-[10px] tracking-widest">PRODUÇÃO</Badge>
                    <h3 className="text-2xl font-bold tracking-tight">Saúde do Fluxo</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 flex-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-[92%] rounded-full shadow-[0_0_15px_rgba(124,58,237,0.5)]" />
                    </div>
                    <span className="text-sm font-bold">92%</span>
                  </div>
                  <Button className="w-full bg-white text-[#2D3E50] hover:bg-slate-50 font-bold rounded-2xl h-12 shadow-lg transition-all">
                    Otimizar Processos
                  </Button>
                </div>
              </Card>

              {/* Critical Inventory Alert */}
              <Card className="border-none shadow-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-8">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Suprimentos</h4>
                  <AlertTriangle className="w-5 h-5 text-amber-500 animate-pulse" />
                </div>
                <div className="space-y-4">
                  {[
                    { item: 'Papel Couché 250g', level: '12%', status: 'crítico' },
                    { item: 'Tinta Magenta XL', level: '08%', status: 'crítico' }
                  ].map((inv, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:border-primary/20 transition-all">
                      <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{inv.item}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-medium">{inv.status}</p>
                      </div>
                      <span className="text-[11px] font-bold bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-white/5 text-slate-900 dark:text-white px-2 py-1 rounded-lg">
                        {inv.level}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* Detailed Operations Table */}
          <Card className="border-none shadow-[0_10px_40px_rgba(0,0,0,0.03)] bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-10 pb-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-semibold text-[#2D3E50] dark:text-white">Fila de Produção Recente</CardTitle>
                  <CardDescription>Monitoramento de pedidos em processamento</CardDescription>
                </div>
                <Button variant="ghost" className="text-xs font-bold text-primary hover:bg-primary/5 rounded-xl h-10 group" asChild>
                  <Link href="/pedidos">
                    Visualizar Todos <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-800/20 border-y border-slate-100 dark:border-slate-800">
                      <th className="px-10 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cod. Pedido</th>
                      <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cliente</th>
                      <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status Atual</th>
                      <th className="px-10 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Faturamento</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {data.recentOrders.map((order) => (
                      <tr key={order.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                        <td className="px-10 py-6">
                          <span className="text-xs font-bold text-[#2D3E50] dark:text-white">#{order.number}</span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{order.customer?.name}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                             <div className={cn(
                              "w-2 h-2 rounded-full",
                              order.status === 'DELIVERED' ? 'bg-emerald-500' :
                                order.status === 'IN_PRODUCTION' ? 'bg-primary animate-pulse shadow-[0_0_8px_rgba(124,58,237,0.4)]' :
                                  'bg-slate-300'
                            )} />
                            <Badge variant="outline" className="text-[10px] font-bold border-slate-100 dark:border-slate-800 text-slate-500 uppercase py-0 px-2 h-5">
                              {statusLabels[order.status] || order.status}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <span className="text-xs font-bold text-[#2D3E50] dark:text-white">{formatCurrency(Number(order.total))}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
