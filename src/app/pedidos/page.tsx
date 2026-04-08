export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  ShoppingCart,
  Download,
} from 'lucide-react';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Sidebar } from '@/components/sidebar';

async function getOrders(search?: string, status?: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { tenantId: true }
  });

  if (!profile) throw new Error('Profile not found');

  const where: any = {
    tenantId: profile.tenantId,
  };

  if (search) {
    where.OR = [
      { number: { contains: search, mode: 'insensitive' } },
      { customer: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }

  if (status && status !== 'ALL') {
    where.status = status;
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      customer: { select: { name: true, email: true } },
      items: { select: { id: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return orders;
}

const statusLabels: Record<string, string> = {
  DRAFT: 'Draft',
  CONFIRMED: 'Confirmed',
  IN_PRODUCTION: 'Production',
  READY: 'Ready',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELED: 'Canceled',
  REFUNDED: 'Refunded',
};

const paymentStatusLabels: Record<string, string> = {
  PENDING: 'Pending',
  PARTIAL: 'Partial',
  PAID: 'Paid',
  OVERDUE: 'Overdue',
  REFUNDED: 'Refunded',
  CANCELED: 'Canceled',
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string };
}) {
  const orders = await getOrders(searchParams.search, searchParams.status);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-64 p-8">
        <div className="max-w-[1920px] mx-auto space-y-10">
          {/* Header - Premium Style */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <span className="text-[10px] font-extrabold text-primary uppercase tracking-[0.2em] mb-2 block">
                Operation Management
              </span>
              <h1 className="text-4xl font-black text-foreground tracking-tighter">
                Orders Registry
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Total of <span className="text-foreground font-black">{orders.length}</span> records identified.
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="rounded-xl border-border bg-white text-xs font-bold h-11 px-5 shadow-sm">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button asChild className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold h-11 px-6 shadow-lg shadow-primary/20">
                <Link href="/pedidos?new=true">
                  <Plus className="w-4 h-4 mr-2" />
                  New Order
                </Link>
              </Button>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-col sm:flex-row gap-4 p-2">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search by order number, client or product..."
                defaultValue={searchParams.search}
                className="pl-11 h-12 bg-white border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm"
                name="search"
              />
            </div>
            <div className="flex gap-2">
              <div className="w-48">
                <Select
                  options={[
                    { value: 'ALL', label: 'All Status' },
                    { value: 'CONFIRMED', label: 'Confirmed' },
                    { value: 'IN_PRODUCTION', label: 'In Production' },
                    { value: 'READY', label: 'Ready' },
                    { value: 'DELIVERED', label: 'Delivered' },
                  ]}
                  defaultValue={searchParams.status || 'ALL'}
                  placeholder="Status"
                  name="status"
                  className="h-12 rounded-2xl border-slate-200"
                />
              </div>
              <Button type="submit" className="h-12 w-12 rounded-2xl bg-white border border-slate-200 p-0 text-slate-500 hover:text-primary hover:border-primary transition-all shadow-sm">
                <Filter className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Orders Table Container */}
          <Card className="border-none shadow-premium overflow-hidden bg-white rounded-[2.5rem]">
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6 text-primary" />
                  Recent Orders
                </CardTitle>
                <div className="flex gap-2">
                   <div className="px-3 py-1 bg-primary/5 border border-primary/10 rounded-lg text-[10px] font-black text-primary uppercase tracking-widest">
                     Live Feed
                   </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {orders.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow className="border-slate-100 hover:bg-transparent">
                        <TableHead className="py-5 px-8 text-[11px] font-black uppercase tracking-widest text-slate-400">Number</TableHead>
                        <TableHead className="py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Client / Customer</TableHead>
                        <TableHead className="py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-center">Date</TableHead>
                        <TableHead className="py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-center">Items</TableHead>
                        <TableHead className="py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Value</TableHead>
                        <TableHead className="py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Production</TableHead>
                        <TableHead className="py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Payment</TableHead>
                        <TableHead className="py-5 px-8 text-right text-[11px] font-black uppercase tracking-widest text-slate-400">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id} className="border-slate-50 hover:bg-slate-50/30 transition-colors group">
                          <TableCell className="py-5 px-8">
                            <span className="font-mono font-black text-slate-800 bg-slate-100 px-2 py-1 rounded text-xs">
                              {order.number}
                            </span>
                          </TableCell>
                          <TableCell className="py-5">
                            <div className="flex flex-col">
                              <p className="font-black text-[13px] text-slate-800">{order.customer?.name || '-'}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{order.customer?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="py-5 text-center">
                            <span className="text-xs font-bold text-slate-500">
                               {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                          </TableCell>
                          <TableCell className="py-5 text-center">
                            <Badge variant="outline" className="rounded-lg border-slate-200 text-[10px] font-black text-slate-600 bg-white">
                              {order.items.length}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-5">
                            <span className="text-sm font-black text-slate-900">
                              {formatCurrency(Number(order.total))}
                            </span>
                          </TableCell>
                          <TableCell className="py-5">
                            <Badge className={cn(
                              "rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest border-none transition-all",
                              order.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600 shadow-sm' :
                              order.status === 'CANCELED' ? 'bg-red-50 text-red-600 shadow-sm' :
                              order.status === 'IN_PRODUCTION' ? 'bg-primary/10 text-primary shadow-sm' :
                              order.status === 'READY' ? 'bg-amber-50 text-amber-600 shadow-sm shadow-amber-200/50 animate-pulse' :
                              'bg-slate-100 text-slate-600 shadow-sm'
                            )}>
                              {statusLabels[order.status] || order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-5">
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "w-2 h-2 rounded-full",
                                order.paymentStatus === 'PAID' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' :
                                order.paymentStatus === 'OVERDUE' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' :
                                'bg-slate-300'
                              )} />
                              <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">
                                {paymentStatusLabels[order.paymentStatus] || order.paymentStatus}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-5 px-8 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-4">
                              <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-400 hover:text-primary transition-all shadow-sm" asChild>
                                <Link href={`/pedidos/${order.id}`}>
                                  <Eye className="w-4 h-4" />
                                </Link>
                              </Button>
                              <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-400 hover:text-primary transition-all shadow-sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all shadow-sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-center px-6">
                  <div className="w-20 h-20 rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center mb-6">
                    <ShoppingCart className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 mb-2">No orders identified</h3>
                  <p className="text-slate-500 max-w-sm text-sm mb-8">
                    {searchParams.search 
                      ? "The criteria used did not match any record in our database." 
                      : "Start your operations by creating the first system order."}
                  </p>
                  <Button asChild className="rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold h-12 px-8">
                    <Link href="/pedidos?new=true">
                      Create Your First Order
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
