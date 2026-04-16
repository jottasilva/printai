'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { QuoteDetailsModal } from './quote-details-modal';

interface QuoteListClientProps {
  initialQuotes: any[];
}

export function QuoteListClient({ initialQuotes }: QuoteListClientProps) {
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
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

    router.push(`/orcamentos?${params.toString()}`);
  };

  const statusLabels: Record<string, string> = {
    DRAFT: 'Rascunho',
    SENT: 'Enviado',
    VIEWED: 'Visualizado',
    ACCEPTED: 'Aceito',
    REJECTED: 'Rejeitado',
    EXPIRED: 'Expirado',
    CONVERTED: 'Convertido',
  };

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-slate-300',
    SENT: 'bg-blue-400',
    VIEWED: 'bg-amber-400',
    ACCEPTED: 'bg-emerald-500',
    REJECTED: 'bg-red-400',
    EXPIRED: 'bg-slate-400',
    CONVERTED: 'bg-primary animate-pulse',
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  };

  // Cálculo de estatísticas
  const stats = {
    total: initialQuotes.length,
    draft: initialQuotes.filter(q => q.status === 'DRAFT').length,
    sent: initialQuotes.filter(q => q.status === 'SENT' || q.status === 'VIEWED').length,
    accepted: initialQuotes.filter(q => q.status === 'ACCEPTED').length,
    converted: initialQuotes.filter(q => q.status === 'CONVERTED').length,
    totalValue: initialQuotes.reduce((sum, q) => sum + Number(q.total), 0),
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-normal text-primary uppercase tracking-[0.3em] mb-1">
            Propostas Comerciais
          </p>
          <h1 className="text-4xl font-light text-slate-900 dark:text-white font-headline tracking-tighter">
            Gestão de Orçamentos
          </h1>
          <p className="text-sm text-slate-500 font-normal">
            Crie, envie e converta orçamentos em pedidos
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-2xl border-slate-200 h-12 px-6 font-normal text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2 whitespace-nowrap">
            <span className="material-symbols-outlined text-xl leading-none shrink-0">download</span>
            <span>Exportar</span>
          </Button>
          <Button asChild className="rounded-2xl bg-slate-900 border-none h-12 px-8 font-normal text-white shadow-lg shadow-slate-200">
            <Link href="/orcamentos/novo" className="flex items-center justify-center gap-2 whitespace-nowrap">
              <span className="material-symbols-outlined text-xl leading-none shrink-0">add</span>
              <span>Novo Orçamento</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: 'description', color: 'text-slate-600' },
          { label: 'Rascunhos', value: stats.draft, icon: 'edit_note', color: 'text-slate-400' },
          { label: 'Enviados', value: stats.sent, icon: 'send', color: 'text-blue-500' },
          { label: 'Aceitos', value: stats.accepted, icon: 'check_circle', color: 'text-emerald-500' },
          { label: 'Valor Total', value: formatCurrency(stats.totalValue), icon: 'payments', color: 'text-primary' },
        ].map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <span className={cn('material-symbols-outlined text-xl', stat.color)}>{stat.icon}</span>
              <div>
                <p className="text-[10px] font-normal uppercase tracking-widest text-slate-400">{stat.label}</p>
                <p className="text-lg font-light text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
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
                <TableHead className="h-14 px-8 text-[10px] font-normal uppercase tracking-widest text-slate-400">Número</TableHead>
                <TableHead className="h-14 text-[10px] font-normal uppercase tracking-widest text-slate-400">Cliente</TableHead>
                <TableHead className="h-14 text-[10px] font-normal uppercase tracking-widest text-slate-400 text-center">Itens</TableHead>
                <TableHead className="h-14 text-[10px] font-normal uppercase tracking-widest text-slate-400">Status</TableHead>
                <TableHead className="h-14 text-[10px] font-normal uppercase tracking-widest text-slate-400">Validade</TableHead>
                <TableHead className="h-14 text-[10px] font-normal uppercase tracking-widest text-slate-400">Valor</TableHead>
                <TableHead className="h-14 px-8 text-right text-[10px] font-normal uppercase tracking-widest text-slate-400">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialQuotes.map((quote) => (
                <TableRow
                  key={quote.id}
                  className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 border-slate-100 dark:border-slate-800 transition-colors cursor-pointer"
                  onClick={() => setSelectedQuote(quote)}
                >
                  <TableCell className="px-8 py-5">
                    <span className="text-xs font-normal text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                      {quote.number}
                    </span>
                  </TableCell>
                  <TableCell className="py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-normal text-slate-800 dark:text-slate-200">{quote.customer?.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{quote.customer?.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-5 text-center">
                    <Badge variant="outline" className="rounded-lg border-slate-200 text-[10px] font-normal text-slate-400">
                      {quote.items?.length || 0}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-5">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        statusColors[quote.status] || 'bg-slate-300'
                      )} />
                      <span className="text-[10px] font-normal text-slate-500 uppercase tracking-tighter">
                        {statusLabels[quote.status] || quote.status}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-5">
                    <span className="text-xs font-normal text-slate-500">
                      {formatDate(quote.validUntil)}
                    </span>
                  </TableCell>
                  <TableCell className="py-5">
                    <span className="text-sm font-light text-slate-900 dark:text-white">
                      {formatCurrency(Number(quote.total))}
                    </span>
                  </TableCell>
                  <TableCell className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {quote.status === 'ACCEPTED' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-xl hover:bg-emerald-50 hover:shadow-sm"
                          title="Converter em Pedido"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Conversão será tratada no modal
                            setSelectedQuote(quote);
                          }}
                        >
                          <span className="material-symbols-outlined text-emerald-500">shopping_cart</span>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-xl hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedQuote(quote);
                        }}
                      >
                        <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {initialQuotes.length === 0 && (
            <div className="py-32 flex flex-col items-center text-center">
              <span className="material-symbols-outlined text-[64px] text-slate-100 mb-4">description</span>
              <h3 className="text-xl font-normal text-slate-900">Nenhum Orçamento</h3>
              <p className="text-sm text-slate-500 max-w-xs font-normal">
                Crie seu primeiro orçamento para começar a registrar propostas comerciais.
              </p>
              <Button asChild className="mt-6 rounded-2xl bg-slate-900 text-white h-12 px-8 font-normal">
                <Link href="/orcamentos/novo" className="flex items-center justify-center gap-2 whitespace-nowrap">
                  <span className="material-symbols-outlined text-xl leading-none shrink-0">add</span>
                  <span>Novo Orçamento</span>
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <QuoteDetailsModal
        quote={selectedQuote}
        isOpen={!!selectedQuote}
        onClose={() => setSelectedQuote(null)}
      />
    </div>
  );
}
