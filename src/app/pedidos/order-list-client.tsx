'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { OrderDetailsModal } from '@/components/pedidos/order-details-modal';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

interface OrderListClientProps {
  initialOrders: any[];
}

export function OrderListClient({ initialOrders }: OrderListClientProps) {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get('search') as string;
    const status = formData.get('status') as string;
    
    const params = new URLSearchParams(searchParams.toString());
    if (search) params.set('search', search); else params.delete('search');
    if (status && status !== 'ALL') params.set('status', status); else params.delete('status');
    
    router.push(`/pedidos?${params.toString()}`);
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-normal text-primary uppercase tracking-[0.3em] mb-1">
            Registro & Arquivo
          </p>
          <h1 className="text-4xl font-light text-slate-900 dark:text-white font-headline tracking-tighter">
            Gestão de Pedidos
          </h1>
          <p className="text-sm text-slate-500 font-normal">
            Gerenciamento centralizado de fluxo operacional
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-2xl border-slate-200 h-12 px-6 font-normal text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2 whitespace-nowrap">
            <span className="material-symbols-outlined text-xl leading-none shrink-0">download</span>
            <span>Exportar Arquivo</span>
          </Button>
          <Button asChild className="rounded-2xl bg-slate-900 border-none h-12 px-8 font-normal text-white shadow-lg shadow-slate-200">
            <Link href="/pedidos?new=true" className="flex items-center justify-center gap-2 whitespace-nowrap">
              <span className="material-symbols-outlined text-xl leading-none shrink-0">add</span>
              <span>Novo Pedido</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-none shadow-sm bg-white dark:bg-slate-900 p-2 rounded-3xl">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2">
          <div className="relative flex-1 group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
            <Input
              name="search"
              placeholder="Buscar por número, cliente ou especificação..."
              defaultValue={searchParams.get('search') || ''}
              className="pl-12 h-12 border-none bg-transparent font-normal text-sm focus:ring-0"
            />
          </div>
          <div className="flex gap-2">
            <select
              name="status"
              defaultValue={searchParams.get('status') || 'ALL'}
              className="h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-xs font-normal text-slate-500 focus:ring-2 focus:ring-primary/20 appearance-none min-w-[140px]"
            >
              <option value="ALL">Todos Status</option>
              {Object.entries(statusLabels).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            <Button type="submit" className="h-12 w-12 rounded-2xl bg-primary text-white shadow-md">
              <span className="material-symbols-outlined">filter_list</span>
            </Button>
          </div>
        </form>
      </Card>

      {/* List */}
      <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-14 px-8 text-[10px] font-normal uppercase tracking-widest text-slate-400">Identificação</TableHead>
                <TableHead className="h-14 text-[10px] font-normal uppercase tracking-widest text-slate-400">Cliente / Contato</TableHead>
                <TableHead className="h-14 text-[10px] font-normal uppercase tracking-widest text-slate-400 text-center">Itens</TableHead>
                <TableHead className="h-14 text-[10px] font-normal uppercase tracking-widest text-slate-400">Progresso</TableHead>
                <TableHead className="h-14 text-[10px] font-normal uppercase tracking-widest text-slate-400">Financeiro</TableHead>
                <TableHead className="h-14 px-8 text-right text-[10px] font-normal uppercase tracking-widest text-slate-400">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="font-label italic-not-really">
              {initialOrders.map((order) => (
                <TableRow 
                  key={order.id} 
                  className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 border-slate-100 dark:border-slate-800 transition-colors cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  <TableCell className="px-8 py-5">
                    <span className="text-xs font-normal text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                      #{order.number}
                    </span>
                  </TableCell>
                  <TableCell className="py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{order.customer?.name}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{order.customer?.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-5 text-center">
                    <Badge variant="outline" className="rounded-lg border-slate-200 text-[10px] font-normal text-slate-400">
                      {order.items?.length || 0}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-5">
                    <div className="flex items-center gap-2">
                       <div className={cn(
                         "w-1.5 h-1.5 rounded-full",
                         order.status === 'DELIVERED' ? 'bg-emerald-500' :
                         order.status === 'IN_PRODUCTION' ? 'bg-primary animate-pulse' :
                         'bg-slate-300'
                       )} />
                       <span className="text-[10px] font-normal text-slate-500 uppercase tracking-tighter">
                         {statusLabels[order.status] || order.status}
                       </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-5">
                    <span className="text-sm font-light text-slate-900 dark:text-white">
                      {formatCurrency(Number(order.total))}
                    </span>
                  </TableCell>
                  <TableCell className="px-8 py-5 text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-xl hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrder(order);
                      }}
                    >
                      <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {initialOrders.length === 0 && (
            <div className="py-32 flex flex-col items-center text-center">
              <span className="material-symbols-outlined text-[64px] text-slate-100 mb-4">inventory_2</span>
              <h3 className="text-xl font-normal text-slate-900">Arquivo Vazio</h3>
              <p className="text-sm text-slate-500 max-w-xs">Não encontramos registros nos critérios selecionados.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <OrderDetailsModal 
        order={selectedOrder} 
        isOpen={!!selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
      />
    </div>
  );
}
