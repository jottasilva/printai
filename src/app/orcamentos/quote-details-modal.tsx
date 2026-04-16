'use client';

import React, { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { updateQuoteStatus, convertQuoteToOrder } from '@/app/actions/quotes';
import { useRouter } from 'next/navigation';

interface QuoteDetailsModalProps {
  quote: any;
  isOpen: boolean;
  onClose: () => void;
}

export function QuoteDetailsModal({ quote, isOpen, onClose }: QuoteDetailsModalProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (!isOpen || !quote) return null;

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
    DRAFT: 'bg-slate-100 text-slate-600',
    SENT: 'bg-blue-50 text-blue-600',
    VIEWED: 'bg-amber-50 text-amber-600',
    ACCEPTED: 'bg-emerald-50 text-emerald-600',
    REJECTED: 'bg-red-50 text-red-600',
    EXPIRED: 'bg-slate-100 text-slate-500',
    CONVERTED: 'bg-primary/10 text-primary',
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

  const handleStatusChange = (status: string) => {
    startTransition(async () => {
      try {
        await updateQuoteStatus(quote.id, status);
        router.refresh();
        onClose();
      } catch (error) {
        console.error('Erro ao atualizar status:', error);
      }
    });
  };

  const handleConvert = () => {
    startTransition(async () => {
      try {
        await convertQuoteToOrder(quote.id);
        router.refresh();
        onClose();
      } catch (error) {
        console.error('Erro ao converter:', error);
      }
    });
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-slate-900 shadow-2xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-6 z-10">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" className="rounded-xl" onClick={onClose}>
              <span className="material-symbols-outlined">close</span>
            </Button>
            <Badge className={cn('rounded-lg text-[10px] font-normal px-3 py-1', statusColors[quote.status])}>
              {statusLabels[quote.status] || quote.status}
            </Badge>
          </div>
          <h2 className="text-2xl font-light text-slate-900 dark:text-white tracking-tighter">
            {quote.number}
          </h2>
          <p className="text-xs text-slate-400 font-normal mt-1">
            Criado em {formatDate(quote.createdAt)} • Válido até {formatDate(quote.validUntil)}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Cliente */}
          <section>
            <p className="text-[10px] font-normal uppercase tracking-widest text-slate-400 mb-3">
              Cliente
            </p>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
              <p className="text-sm font-normal text-slate-900 dark:text-white">{quote.customer?.name}</p>
              <p className="text-xs text-slate-400 font-normal mt-1">{quote.customer?.email}</p>
              {quote.customer?.phone && (
                <p className="text-xs text-slate-400 font-normal">{quote.customer?.phone}</p>
              )}
              <p className="text-[10px] text-slate-400 font-normal mt-1">{quote.customer?.document}</p>
            </div>
          </section>

          {/* Itens */}
          <section>
            <p className="text-[10px] font-normal uppercase tracking-widest text-slate-400 mb-3">
              Itens do Orçamento
            </p>
            <div className="space-y-3">
              {quote.items?.map((item: any) => (
                <div key={item.id} className="flex justify-between items-start p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <div className="flex-1">
                    <p className="text-sm font-normal text-slate-900 dark:text-white">{item.description}</p>
                    <p className="text-[10px] text-slate-400 font-normal mt-1">
                      {Number(item.quantity)} × {formatCurrency(Number(item.unitPrice))}
                      {item.product && ` • ${item.product.name}`}
                    </p>
                  </div>
                  <p className="text-sm font-normal text-slate-900 dark:text-white">
                    {formatCurrency(Number(item.total))}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Totais */}
          <section className="border-t border-slate-100 dark:border-slate-800 pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-normal">Subtotal</span>
                <span className="font-normal text-slate-700">{formatCurrency(Number(quote.subtotal))}</span>
              </div>
              {Number(quote.discountAmount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-normal">Desconto</span>
                  <span className="font-normal text-emerald-500">-{formatCurrency(Number(quote.discountAmount))}</span>
                </div>
              )}
              <div className="flex justify-between text-lg pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-normal">Total</span>
                <span className="font-light text-slate-900 dark:text-white tracking-tight">
                  {formatCurrency(Number(quote.total))}
                </span>
              </div>
            </div>
          </section>

          {/* Observações */}
          {quote.notes && (
            <section>
              <p className="text-[10px] font-normal uppercase tracking-widest text-slate-400 mb-2">
                Observações
              </p>
              <p className="text-sm text-slate-600 font-normal bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                {quote.notes}
              </p>
            </section>
          )}

          {/* Responsável */}
          {quote.user && (
            <section>
              <p className="text-[10px] font-normal uppercase tracking-widest text-slate-400 mb-2">
                Responsável
              </p>
              <p className="text-sm font-normal text-slate-700">{quote.user.name || quote.user.email}</p>
            </section>
          )}
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-6 space-y-3">
          {quote.status === 'DRAFT' && (
            <Button
              className="w-full h-12 rounded-2xl bg-primary text-white font-normal shadow-lg shadow-primary/20"
              onClick={() => handleStatusChange('SENT')}
              disabled={isPending}
            >
              {isPending ? 'Enviando...' : 'Enviar ao Cliente'}
              <span className="material-symbols-outlined ml-2">send</span>
            </Button>
          )}
          {quote.status === 'ACCEPTED' && (
            <Button
              className="w-full h-12 rounded-2xl bg-emerald-600 text-white font-normal shadow-lg shadow-emerald-200"
              onClick={handleConvert}
              disabled={isPending}
            >
              {isPending ? 'Convertendo...' : 'Converter em Pedido'}
              <span className="material-symbols-outlined ml-2">shopping_cart</span>
            </Button>
          )}
          {(quote.status === 'SENT' || quote.status === 'VIEWED') && (
            <div className="grid grid-cols-2 gap-3">
              <Button
                className="h-12 rounded-2xl bg-emerald-600 text-white font-normal"
                onClick={() => handleStatusChange('ACCEPTED')}
                disabled={isPending}
              >
                Aceitar
              </Button>
              <Button
                variant="outline"
                className="h-12 rounded-2xl border-red-200 text-red-500 font-normal hover:bg-red-50"
                onClick={() => handleStatusChange('REJECTED')}
                disabled={isPending}
              >
                Rejeitar
              </Button>
            </div>
          )}
          <Button
            variant="outline"
            className="w-full h-10 rounded-2xl border-slate-200 text-slate-500 font-normal hover:bg-slate-50"
            onClick={onClose}
          >
            Fechar
          </Button>
        </div>
      </div>
    </>
  );
}
