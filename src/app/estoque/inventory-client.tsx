'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { useRouter, useSearchParams } from 'next/navigation';
import { StatCard } from '@/components/ui/stat-card';
import { motion } from 'framer-motion';

interface InventoryClientProps {
  initialInventories: any[];
  stats: {
    totalItems: number;
    requireRestock: number;
    totalCost: number;
  };
  recentMovements: any[];
}

export function InventoryClient({ initialInventories, stats, recentMovements }: InventoryClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const search = formData.get('search') as string;

    const params = new URLSearchParams(searchParams.toString());
    if (search) params.set('search', search); else params.delete('search');

    router.push(`/estoque?${params.toString()}`);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit'
    }).format(new Date(date));
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'IN': return 'download';
      case 'OUT': return 'upload';
      case 'ADJUSTMENT': return 'sync_alt';
      default: return 'swap_horiz';
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'IN': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10';
      case 'OUT': return 'text-amber-500 bg-amber-50 dark:bg-amber-500/10';
      case 'ADJUSTMENT': return 'text-blue-500 bg-blue-50 dark:bg-blue-500/10';
      default: return 'text-slate-500 bg-slate-50 dark:bg-slate-500/10';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-[10px] font-medium text-primary uppercase tracking-[0.3em] mb-2">
            Gestão de Materiais
          </p>
          <h1 className="text-4xl font-light text-slate-900 dark:text-white font-headline tracking-tight mb-2">
            Estoque
          </h1>
          <p className="text-sm text-slate-500 font-normal">
            Monitoramento em tempo real de substratos e insumos
          </p>
        </motion.div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-2xl border-slate-200 h-12 px-6 font-medium text-slate-600 hover:bg-slate-50">
            <span className="material-symbols-outlined mr-2 text-[20px]">inventory_2</span>
            Auditoria
          </Button>
          <Button className="rounded-2xl bg-slate-900 hover:bg-slate-800 border-none h-12 px-8 font-medium text-white shadow-lg shadow-slate-200/50">
            <span className="material-symbols-outlined mr-2 text-[20px]">add</span>
            Nova Movimentação
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Itens"
          value={stats.totalItems.toString()}
          icon="inventory_2"
          trend={{ value: 12, label: 'este mês', positive: true }}
        />
        <StatCard
          title="Requer Reposição"
          value={stats.requireRestock.toString().padStart(2, '0')}
          icon="warning"
          description="Itens abaixo do limite de segurança"
          variant={stats.requireRestock > 0 ? "warning" : "default"}
        />
        <StatCard
          title="Custo em Estoque"
          value={formatCurrency(stats.totalCost)}
          icon="account_balance_wallet"
          description="Custo médio de aquisição total"
        />
        <StatCard
          title="Previsão de Giro"
          value="14 Dias"
          icon="update"
          description="Tempo estimado para consumo médio"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Inventory List */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 p-2 rounded-3xl">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1 group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                <Input
                  name="search"
                  placeholder="Buscar material por nome ou código..."
                  defaultValue={searchParams.get('search') || ''}
                  className="pl-12 h-12 border-none bg-slate-50/50 dark:bg-slate-800/50 focus-visible:bg-slate-50 dark:focus-visible:bg-slate-800 rounded-2xl font-normal text-sm"
                />
              </div>
              <Button type="submit" className="h-12 w-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300">
                <span className="material-symbols-outlined">filter_list</span>
              </Button>
            </form>
          </Card>

          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="h-14 px-8 text-[10px] font-medium uppercase tracking-widest text-slate-400">Material</TableHead>
                    <TableHead className="h-14 text-[10px] font-medium uppercase tracking-widest text-slate-400">Quantidade</TableHead>
                    <TableHead className="h-14 text-[10px] font-medium uppercase tracking-widest text-slate-400">Status</TableHead>
                    <TableHead className="h-14 px-8 text-right text-[10px] font-medium uppercase tracking-widest text-slate-400">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {initialInventories.map((item, index) => {
                    const isLowStock = item.availableQuantity <= item.minQuantity;
                    return (
                      <TableRow
                        key={item.id}
                        className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 border-slate-100 dark:border-slate-800 transition-colors cursor-pointer"
                      >
                        <TableCell className="px-8 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                              {item.product?.name}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">
                              Código: {item.product?.sku} {item.variant ? `| ${item.variant.name}` : ''}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-baseline gap-1">
                            <span className="text-base font-semibold text-slate-900 dark:text-white">
                              {item.availableQuantity}
                            </span>
                            <span className="text-xs text-slate-500 font-medium lowercase">
                              {item.product?.unit || 'un'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          {isLowStock ? (
                            <Badge variant="destructive" className="bg-red-50 text-red-600 hover:bg-red-50 border-none font-medium px-2 py-0.5 rounded-md">
                              Falta / Baixo
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-none font-medium px-2 py-0.5 rounded-md">
                              Regular
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="px-8 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm"
                          >
                            <span className="material-symbols-outlined text-slate-400 text-lg">edit</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {initialInventories.length === 0 && (
                <div className="py-24 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-[32px] text-slate-300">inventory_2</span>
                  </div>
                  <h3 className="text-base font-medium text-slate-900 mb-1">Nenhum item encontrado</h3>
                  <p className="text-sm text-slate-500 max-w-[250px]">Cadastre produtos no catálogo para gerenciar o estoque.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Logs & Insights */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm rounded-3xl bg-white dark:bg-slate-900 overflow-hidden relative">
            <CardHeader className="bg-gradient-to-b from-primary/5 to-transparent pb-4 border-b border-slate-100/50 dark:border-slate-800/50">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-xl text-primary">history</span>
                Log de Movimentação Recente
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {recentMovements.length > 0 ? recentMovements.map((movement, idx) => (
                  <div key={movement.id} className="relative flex gap-4">
                    {/* Linha vertical conectora */}
                    {idx < recentMovements.length - 1 && (
                      <div className="absolute left-[19px] top-10 bottom-[-24px] w-px bg-slate-100 dark:bg-slate-800" />
                    )}

                    <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 z-10", getMovementColor(movement.type))}>
                      <span className="material-symbols-outlined text-[18px]">
                        {getMovementIcon(movement.type)}
                      </span>
                    </div>

                    <div className="flex-1 pt-1">
                      <div className="flex justify-between items-start mb-0.5">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {movement.type === 'IN' ? 'Entrada' : movement.type === 'OUT' ? 'Saída' : 'Ajuste'}
                        </p>
                        <span className="text-[10px] font-medium text-slate-400">
                          {formatDate(movement.createdAt).split(' ')[1]} {/* Just Time */}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1 mb-1">
                        {movement.inventory?.product?.name || 'Item Removido'}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-400">{movement.reason || 'Sem motivo'}</span>
                        <span className={cn(
                          "text-xs font-bold",
                          movement.type === 'IN' ? "text-emerald-500" : "text-amber-500"
                        )}>
                          {movement.type === 'IN' ? '+' : '-'}{movement.quantity} {movement.inventory?.product?.unit || 'un'}
                        </span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="py-8 text-center">
                    <span className="text-sm text-slate-400">Sem movimentações recentes.</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 dark:bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-indigo-900 dark:text-indigo-200">
                <span className="material-symbols-outlined text-[20px] text-indigo-500">lightbulb</span>
                Eficiência de Reposição
              </CardTitle>
            </CardHeader>
            <CardContent>
              <h4 className="text-base font-bold text-indigo-950 dark:text-indigo-100 mb-1">Taxa de Otimização</h4>
              <p className="text-sm text-indigo-700/80 dark:text-indigo-300/80 leading-relaxed font-medium">
                O tempo médio entre o alerta de baixo estoque e a reposição caiu 14% este mês. Padrão de consumo eficiente.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
