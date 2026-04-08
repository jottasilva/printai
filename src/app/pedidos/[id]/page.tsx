import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft,
  ShoppingCart,
  User,
  MapPin,
  Calendar,
  DollarSign,
  Printer,
  Package,
  CreditCard,
  FileText,
  Edit,
  Download,
  MoreVertical,
} from 'lucide-react';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Sidebar } from '@/components/sidebar';
import { cn } from '@/lib/utils';

async function getOrder(id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { tenantId: true }
  });

  if (!profile) throw new Error('Profile not found');

  const order = await prisma.order.findFirst({
    where: {
      id,
      tenantId: profile.tenantId,
    },
    include: {
      customer: {
        include: {
          addresses: true,
        }
      },
      items: {
        include: {
          product: true,
          variant: true,
        }
      },
      payments: {
        orderBy: { createdAt: 'desc' }
      },
      receivables: {
        orderBy: { dueDate: 'asc' }
      }
    }
  });

  return order;
}

const statusLabels: Record<string, string> = {
  DRAFT: 'Rascunho',
  CONFIRMED: 'Confirmado',
  IN_PRODUCTION: 'Em Produção',
  READY: 'Pronto',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregue',
  CANCELED: 'Cancelado',
  REFUNDED: 'Reembolsado',
};

const paymentStatusLabels: Record<string, string> = {
  PENDING: 'Pendente',
  PARTIAL: 'Parcial',
  PAID: 'Pago',
  OVERDUE: 'Atrasado',
  REFUNDED: 'Reembolsado',
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

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const order = await getOrder(params.id);

  if (!order) {
    notFound();
  }

  const shippingAddress = order.customer?.addresses?.find(a => a.type === 'SHIPPING' || a.type === 'BOTH');
  const billingAddress = order.customer?.addresses?.find(a => a.type === 'BILLING' || a.type === 'BOTH');

  return (
    <div className="flex h-screen bg-[#F8F9FA] dark:bg-[#0A0A0B] admin-theme">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-premium border border-gray-100">
            <div className="flex items-center gap-5">
              <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-gray-100 transition-colors">
                <Link href="/pedidos">
                  <ArrowLeft className="w-5 h-5 text-gray-500" />
                </Link>
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pedido {order.number}</h1>
                  <Badge variant="outline" className={cn(
                    "px-3 py-1 rounded-full text-xs font-semibold border-2 capitalize",
                    order.status === 'DELIVERED' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                    order.status === 'CANCELED' ? "bg-red-50 text-red-700 border-red-100" :
                    order.status === 'IN_PRODUCTION' ? "bg-blue-50 text-blue-700 border-blue-100" :
                    "bg-gray-50 text-gray-700 border-gray-100"
                  )}>
                    {statusLabels[order.status] || order.status}
                  </Badge>
                </div>
                <p className="text-gray-500 mt-1 flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4" />
                  Criado em {new Date(order.createdAt).toLocaleDateString('pt-BR')} às {new Date(order.createdAt).toLocaleTimeString('pt-BR')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="rounded-xl border-gray-200 hover:bg-gray-50 text-gray-700">
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button className="rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-lg shadow-purple-200">
                <Edit className="w-4 h-4 mr-2" />
                Editar Pedido
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Coluna Principal: Itens e Recebíveis */}
            <div className="lg:col-span-2 space-y-8">
              {/* Itens do Pedido */}
              <Card className="border-none shadow-premium bg-white rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-gray-50 bg-gray-50/30">
                  <CardTitle className="flex items-center gap-3 text-lg font-bold text-gray-900">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Package className="w-5 h-5 text-[#7C3AED]" />
                    </div>
                    Itens do Pedido
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {order.items.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50/50 hover:bg-transparent border-b border-gray-100">
                            <TableHead className="py-4 px-6 text-gray-600 font-semibold uppercase text-[10px] tracking-wider">Produto / Serviço</TableHead>
                            <TableHead className="py-4 px-4 text-gray-600 font-semibold uppercase text-[10px] tracking-wider">Qtd</TableHead>
                            <TableHead className="py-4 px-4 text-gray-600 font-semibold uppercase text-[10px] tracking-wider text-right">Unitário</TableHead>
                            <TableHead className="py-4 px-4 text-gray-600 font-semibold uppercase text-[10px] tracking-wider text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {order.items.map((item) => (
                            <TableRow key={item.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0">
                              <TableCell className="py-5 px-6">
                                <div className="flex items-center gap-4">
                                  <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                                    <ShoppingCart className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-gray-900">{item.product?.name || 'Produto removido'}</p>
                                    {item.variant && (
                                      <p className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded mt-1 inline-block">
                                        {item.variant.name}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-5 px-4 font-bold text-gray-700">{Number(item.quantity)}</TableCell>
                              <TableCell className="py-5 px-4 text-right text-gray-600 font-medium">{formatCurrency(Number(item.unitPrice))}</TableCell>
                              <TableCell className="py-5 px-4 text-right">
                                <span className="font-extrabold text-[#7C3AED]">{formatCurrency(Number(item.total))}</span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="py-20 flex flex-col items-center">
                      <Package className="w-12 h-12 text-gray-200 mb-4" />
                      <p className="text-gray-400 font-medium">Nenhum item encontrado</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Financeiro / Recebíveis */}
              {order.receivables.length > 0 && (
                <Card className="border-none shadow-premium bg-white rounded-2xl overflow-hidden">
                  <CardHeader className="border-b border-gray-50">
                    <CardTitle className="flex items-center gap-3 text-lg font-bold text-gray-900">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <FileText className="w-5 h-5 text-emerald-600" />
                      </div>
                      Contas a Receber
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50/50 border-b border-gray-100">
                          <TableHead className="py-4 px-6 text-gray-600 font-semibold uppercase text-[10px] tracking-wider">Descrição</TableHead>
                          <TableHead className="py-4 px-4 text-gray-600 font-semibold uppercase text-[10px] tracking-wider">Valor</TableHead>
                          <TableHead className="py-4 px-4 text-gray-600 font-semibold uppercase text-[10px] tracking-wider">Vencimento</TableHead>
                          <TableHead className="py-4 px-6 text-gray-600 font-semibold uppercase text-[10px] tracking-wider text-right">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {order.receivables.map((receivable) => (
                          <TableRow key={receivable.id} className="hover:bg-gray-50/50 border-b border-gray-50 last:border-0 text-sm">
                            <TableCell className="py-4 px-6 font-medium text-gray-900">{receivable.description || '-'}</TableCell>
                            <TableCell className="py-4 px-4 font-bold text-gray-900">
                              {formatCurrency(Number(receivable.amount))}
                            </TableCell>
                            <TableCell className="py-4 px-4 text-gray-600">
                              {new Date(receivable.dueDate).toLocaleDateString('pt-BR')}
                            </TableCell>
                            <TableCell className="py-4 px-6 text-right">
                              <Badge variant="outline" className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize",
                                receivable.status === 'PAID' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                receivable.status === 'OVERDUE' ? "bg-red-50 text-red-700 border-red-100" :
                                "bg-gray-50 text-gray-700 border-gray-100"
                              )}>
                                {receivable.status === 'PAID' ? 'Pago' : receivable.status === 'OVERDUE' ? 'Atrasado' : 'Pendente'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar Lateral: Cliente, Resumo, Produção */}
            <div className="space-y-8">
              {/* Cliente Info */}
              <Card className="border-none shadow-premium bg-white rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-gray-500">
                    Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 font-bold text-lg border-2 border-purple-100">
                      {order.customer?.name?.[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-base font-bold text-gray-900">{order.customer?.name}</p>
                      <p className="text-sm text-gray-500 italic">{order.customer?.document || 'Documento não informado'}</p>
                    </div>
                  </div>
                  <div className="space-y-3 pt-2 border-t border-gray-50">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="p-1.5 bg-gray-50 rounded-md"><User className="w-4 h-4" /></div>
                      <span>{order.customer?.email}</span>
                    </div>
                    {order.customer?.phone && (
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="p-1.5 bg-gray-50 rounded-md"><Printer className="w-4 h-4" /></div>
                        <span>{order.customer.phone}</span>
                      </div>
                    )}
                    {shippingAddress && (
                      <div className="flex items-start gap-3 text-sm text-gray-600">
                        <div className="p-1.5 bg-gray-50 rounded-md mt-0.5"><MapPin className="w-4 h-4" /></div>
                        <div>
                          <p className="font-semibold text-gray-900">{shippingAddress.street}, {shippingAddress.number}</p>
                          <p className="text-xs text-gray-500">{shippingAddress.city} - {shippingAddress.state}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Resumo de Valores */}
              <Card className="border-none shadow-premium bg-[#111827] text-white rounded-2xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-gray-400">
                    Resumo Financeiro
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm opacity-80 font-medium">
                      <span>Subtotal</span>
                      <span>{formatCurrency(Number(order.subtotal))}</span>
                    </div>
                    <div className="flex justify-between text-sm text-emerald-400 font-medium">
                      <span>Descontos</span>
                      <span>-{formatCurrency(Number(order.discountAmount))}</span>
                    </div>
                    <div className="flex justify-between text-sm opacity-80 font-medium">
                      <span>Frete / Taxas</span>
                      <span>{formatCurrency(Number(order.shippingAmount) + Number(order.taxAmount))}</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-bold uppercase text-gray-400 mb-1">Total Geral</span>
                      <span className="text-3xl font-extrabold text-white">
                        {formatCurrency(Number(order.total))}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                      <p className="text-[10px] uppercase font-bold text-emerald-400">Pago</p>
                      <p className="font-bold text-emerald-300">{formatCurrency(Number(order.paidAmount))}</p>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
                      <p className="text-[10px] uppercase font-bold text-amber-400">Restante</p>
                      <p className="font-bold text-amber-300">{formatCurrency(Number(order.remainingAmount))}</p>
                    </div>
                  </div>

                  <Badge className={cn(
                    "w-full justify-center py-3 rounded-xl text-xs font-extrabold uppercase tracking-[0.1em]",
                    order.paymentStatus === 'PAID' ? "bg-emerald-500 hover:bg-emerald-600 text-white" :
                    order.paymentStatus === 'OVERDUE' ? "bg-red-500 hover:bg-red-600 text-white" :
                    "bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
                  )}>
                    {paymentStatusLabels[order.paymentStatus] || order.paymentStatus}
                  </Badge>
                </CardContent>
              </Card>

              {/* Status de Produção */}
              <Card className="border-none shadow-premium bg-white rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center justify-between">
                    Produção
                    <Printer className="w-4 h-4 text-[#7C3AED]" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Status Atual:</span>
                      <Badge variant="outline" className={cn(
                        "rounded-full px-3 font-bold border-2",
                        order.productionStatus === 'DONE' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                        order.productionStatus === 'IN_PROGRESS' ? "bg-blue-50 text-blue-700 border-blue-100" :
                        "bg-gray-50 text-gray-700 border-gray-100"
                      )}>
                        {productionStatusLabels[order.productionStatus] || order.productionStatus}
                      </Badge>
                    </div>
                  </div>
                  {order.expectedDeliveryAt && (
                    <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                      <div className="flex items-center gap-3 text-purple-600 mb-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Entrega Prevista</span>
                      </div>
                      <p className="text-lg font-bold text-purple-900">
                        {new Date(order.expectedDeliveryAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
