export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  PieChart,
  LineChart,
} from 'lucide-react';
import { prisma } from '@/lib/db';
import Link from 'next/link';


async function getDashboardCockpitData() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { tenantId: true, name: true, role: true }
  });

  if (!profile) throw new Error('Profile not found');

  const tenantId = profile.tenantId;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  // Stats principais
  const [totalRevenue, monthlyRevenue, totalOrders, monthlyOrders, totalCustomers, activeProducts] = await Promise.all([
    prisma.payment.aggregate({
      where: { tenantId, status: 'PAID' },
      _sum: { amount: true }
    }),
    prisma.payment.aggregate({
      where: { tenantId, status: 'PAID', createdAt: { gte: monthStart } },
      _sum: { amount: true }
    }),
    prisma.order.count({ where: { tenantId, } }),
    prisma.order.count({ where: { tenantId, createdAt: { gte: monthStart }, } }),
    prisma.customer.count({ where: { tenantId, } }),
    prisma.product.count({ where: { tenantId, isActive: true, } }),
  ]);

  // Pedidos por status
  const ordersByStatus = await prisma.order.groupBy({
    by: ['status'],
    where: { tenantId, },
    _count: { status: true }
  });

  // Produção por status
  const productionByStatus = await prisma.orderItem.groupBy({
    by: ['status'],
    where: { tenantId, },
    _count: { status: true }
  });

  // Top produtos
  const topProducts = await prisma.orderItem.groupBy({
    by: ['productId'],
    where: { tenantId, },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 5,
  });

  const topProductDetails = await Promise.all(
    topProducts
      .filter(item => item.productId)
      .map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId! },
          select: { name: true, sku: true }
        });
        return {
          product: product?.name || 'Produto removido',
          sku: product?.sku || '-',
          quantity: Number(item._sum.quantity || 0)
        };
      })
  );

  // Pedidos recentes
  const recentOrders = await prisma.order.findMany({
    where: { tenantId, },
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      customer: { select: { name: true } },
      items: { select: { quantity: true, total: true } }
    }
  });

  // Contas a receber/pagar
  const receivables = await prisma.receivable.aggregate({
    where: { tenantId, status: 'PENDING' },
    _sum: { amount: true }
  });

  const payables = await prisma.payable.aggregate({
    where: { tenantId, status: 'PENDING' },
    _sum: { amount: true }
  });

  return {
    userName: profile.name,
    role: profile.role,
    stats: {
      totalRevenue: Number(totalRevenue._sum.amount || 0),
      monthlyRevenue: Number(monthlyRevenue._sum.amount || 0),
      totalOrders,
      monthlyOrders,
      totalCustomers,
      activeProducts,
      pendingReceivables: Number(receivables._sum.amount || 0),
      pendingPayables: Number(payables._sum.amount || 0),
    },
    ordersByStatus: ordersByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {} as Record<string, number>),
    productionByStatus: productionByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {} as Record<string, number>),
    topProducts: topProductDetails,
    recentOrders,
  };
}

import { Sidebar } from '@/components/sidebar';
import { ActivityChart } from '@/components/dashboard/activity-chart';

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
    IN_PRODUCTION: 'Em Produção',
    READY: 'Pronto',
    SHIPPED: 'Enviado',
    DELIVERED: 'Entregue',
    CANCELED: 'Cancelado',
  };

  const productionStatusLabels: Record<string, string> = {
    WAITING: 'Aguardando',
    IN_QUEUE: 'Na Fila',
    IN_PROGRESS: 'Em Progresso',
    PAUSED: 'Pausado',
    DONE: 'Concluído',
    REJECTED: 'Rejeitado',
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA] dark:bg-[#0A0A0B] admin-theme font-sans">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Header - Estilo Premium */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <span className="text-[10px] font-extrabold text-primary uppercase tracking-[0.2em] mb-2 block">
                Administrative Cockpit
              </span>
              <h1 className="text-4xl font-black text-foreground tracking-tighter">
                Operational Dashboard
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Overview of your print atelier performance and production status.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3 overflow-hidden">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="inline-block h-10 w-10 rounded-full ring-4 ring-white">
                    <img
                      className="h-full w-full rounded-full bg-slate-100"
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=User${i}`}
                      alt="Team"
                    />
                  </div>
                ))}
              </div>
              <Button className="rounded-full bg-primary hover:bg-primary/90 text-white font-bold h-11 px-6 shadow-lg shadow-primary/20">
                <Activity className="w-4 h-4 mr-2" />
                Live Control
              </Button>
            </div>
          </div>

          {/* Stats Cards - Grid do Modelo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Operational Revenue"
              value={formatCurrency(data.stats.totalRevenue)}
              icon={<DollarSign className="w-6 h-6" />}
              trend={{ value: 12.5, label: 'Growth', positive: true }}
              color="success"
            />
            <StatCard
              title="Active Orders"
              value={data.stats.totalOrders}
              icon={<ShoppingCart className="w-6 h-6" />}
              trend={{ value: 4.2, label: 'Volume', positive: true }}
              color="info"
            />
            <StatCard
              title="Production Load"
              value={`${Object.values(data.productionByStatus).reduce((a, b) => a + b, 0)} items`}
              icon={<Activity className="w-6 h-6" />}
              trend={{ value: 2.1, label: 'Efficiency', positive: false }}
              color="warning"
            />
            <StatCard
              title="Client Base"
              value={data.stats.totalCustomers}
              icon={<Users className="w-6 h-6" />}
              color="default"
            />
          </div>

          {/* Grid de Atividade e Produção */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Atividade Recente - Estilo Chart */}
            <Card className="lg:col-span-2 border-none shadow-premium overflow-hidden" hover>
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold">Atividade de Produção</CardTitle>
                    <CardDescription>Status atual dos itens em linha</CardDescription>
                  </div>
                  <Badge variant="outline" className="rounded-lg border-primary/20 text-primary font-bold bg-primary/5 px-3 py-1">
                    Full Report
                  </Badge>
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

            {/* Coluna de Alertas / Quick Stats */}
            <div className="space-y-6">
              <Card className="border-none shadow-premium bg-slate-900 text-white" hover>
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    Status Geral
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                      <span>Eficiência de Produção</span>
                      <span>88%</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-[88%] rounded-full shadow-[0_0_10px_rgba(124,58,237,0.5)]" />
                    </div>
                  </div>
                  
                  <div className="pt-4 space-y-4 border-t border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-medium tracking-tight">Financial Balance</p>
                        <p className="text-sm font-bold text-emerald-400">
                          {formatCurrency(data.stats.monthlyRevenue)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Itens Pequeno */}
              <Card className="border-none shadow-premium" hover>
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">TOP SKUS</CardTitle>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="space-y-4">
                    {data.topProducts.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-black text-slate-400">
                          0{idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">{item.product}</p>
                          <p className="text-[10px] text-muted-foreground">{item.quantity} units</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tabela de Pedidos Recentes - Estilo Clean */}
          <Card className="border-none shadow-premium overflow-hidden" hover>
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold">Recent Operations</CardTitle>
                  <CardDescription>Histórico de transações em tempo real</CardDescription>
                </div>
                <Button variant="outline" className="rounded-xl border-border bg-white hover:bg-slate-50 text-xs font-bold" asChild>
                  <Link href="/pedidos">
                    View Audit
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 border-y border-border/60">
                    <tr>
                      <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Order ID</th>
                      <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Client</th>
                      <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</th>
                      <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {data.recentOrders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5">
                          <span className="text-xs font-bold text-foreground">#{order.number}</span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-foreground">{order.customer?.name}</span>
                            <span className="text-[10px] text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "rounded-lg px-2 py-0.5 text-[10px] font-bold border-none",
                              order.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600' :
                              order.status === 'IN_PRODUCTION' ? 'bg-primary/10 text-primary' :
                              'bg-slate-100 text-slate-500'
                            )}
                          >
                            {statusLabels[order.status] || order.status}
                          </Badge>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <span className="text-xs font-black text-foreground">{formatCurrency(Number(order.total))}</span>
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
