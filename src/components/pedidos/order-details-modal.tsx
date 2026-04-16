'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  updateOrderStatus, 
  registerOrderPayment, 
  updateOrderInternalNotes, 
  updateOrderExpectedDelivery 
} from '@/app/actions/orders';
import { 
  updateOrderItemAction, 
  deleteOrderItemAction, 
  updateOrderFinancialsAction, 
  deletePaymentAction,
  updateOrderShippingAction,
  updateOrderShippingMethodAction,
  addOrderItemAction
} from '@/app/actions/order-management';
import { getProducts } from '@/app/actions/products';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/ui/dialog-system';

// Pequeno componente interno para busca de produtos
function ProductSearchForm({ onAdd }: { onAdd: (product: any, variant?: any) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const products = await getProducts(query);
        setResults(products || []);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div className="space-y-4">
      <div className="relative group">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
        <Input 
          placeholder="Digite o nome ou SKU do produto..." 
          className="pl-12 h-12 bg-slate-50 border-slate-200 rounded-xl"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {isSearching && <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-1 shadow-sm border"><div className="w-3 h-3 border-2 border-primary border-t-transparent animate-spin rounded-full"></div></div>}
      </div>

      <div className="max-h-80 overflow-y-auto rounded-xl border border-slate-100 flex flex-col no-scrollbar">
        {results.map((p) => {
          const hasVariants = p.variants && p.variants.length > 0;
          const isExpanded = expandedProductId === p.id;

          return (
            <div key={p.id} className="border-b last:border-none">
              <div 
                className={cn(
                  "p-4 flex items-center justify-between transition-colors group",
                  !hasVariants ? "hover:bg-slate-50 cursor-pointer" : "bg-white"
                )}
                onClick={() => {
                  if (hasVariants) {
                    setExpandedProductId(isExpanded ? null : p.id);
                  } else {
                    onAdd(p);
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  {hasVariants && (
                    <span className={cn("material-symbols-outlined text-slate-400 transition-transform", isExpanded && "rotate-90")}>chevron_right</span>
                  )}
                  <div>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{p.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{p.sku} • {p.unit} {hasVariants && `(${p.variants.length} variantes)`}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div className="hidden sm:block">
                    <p className="text-xs font-black text-slate-700">R$ {Number(p.basePrice).toFixed(2)}</p>
                  </div>
                  {!hasVariants ? (
                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter bg-emerald-50 px-2 py-1 rounded">Adicionar</span>
                  ) : (
                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-tighter bg-blue-50 px-2 py-1 rounded">{isExpanded ? 'Esconder' : 'Ver Opções'}</span>
                  )}
                </div>
              </div>

              {hasVariants && isExpanded && (
                <div className="bg-slate-50/50 border-t border-slate-100 p-2 space-y-1 animate-in slide-in-from-top-2 duration-300">
                  {p.variants.map((v: any) => (
                    <button 
                      key={v.id}
                      onClick={() => onAdd(p, v)}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 transition-all group/v"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        <div className="text-left">
                          <p className="text-xs font-bold text-slate-700 group-hover/v:text-primary">{v.name}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">{v.sku}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-xs font-black text-slate-600">R$ {Number(v.price || p.basePrice).toFixed(2)}</p>
                        <span className="text-[9px] font-black text-emerald-600 uppercase bg-emerald-50 px-1.5 py-0.5 rounded">Selecionar</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {query.length >= 2 && results.length === 0 && !isSearching && (
          <div className="p-8 text-center text-slate-400">
             <span className="material-symbols-outlined mb-2 text-3xl">sentiment_dissatisfied</span>
             <p className="text-xs">Nenhum produto encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface OrderDetailsModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetailsModal({ order, isOpen, onClose }: OrderDetailsModalProps) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [isPending, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState<'VISAO_GERAL' | 'ITENS' | 'FINANCEIRO' | 'TIMELINE' | 'NOTAS'>('VISAO_GERAL');
  
  // -- ESTADOS DE EDIÇÃO --
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemDraft, setItemDraft] = useState<any>(null);
  
  const [financialsDraft, setFinancialsDraft] = useState({
    discountAmount: order?.discountAmount || 0,
    taxAmount: order?.taxAmount || 0,
    shippingAmount: order?.shippingAmount || 0,
  });

  // Endereço Draft
  const [addressDraft, setAddressDraft] = useState(order?.shippingAddress || {
    street: '', number: '', district: '', city: '', state: '', zipCode: ''
  });

  // States para Pagamento
  const [isPaymentMode, setIsPaymentMode] = useState(false);
  const [payAmount, setPayAmount] = useState<string>('');
  const [payMethod, setPayMethod] = useState('PIX');
  const [payDiscount, setPayDiscount] = useState<string>('');
  const [receiptBase64, setReceiptBase64] = useState<string>('');

  // States para Frete e Método
  const [shippingMethodDraft, setShippingMethodDraft] = useState((order?.metadata as any)?.shippingMethod || '');
  const [shippingAmountDraft, setShippingAmountDraft] = useState(Number(order?.shippingAmount) || 0);

  // States para Notas e Edição
  const [internalNoteDraft, setInternalNoteDraft] = useState(order?.internalNotes || '');
  const [isEditingDeliveryDate, setIsEditingDeliveryDate] = useState(false);
  const [deliveryDateDraft, setDeliveryDateDraft] = useState(order?.expectedDeliveryAt ? new Date(order.expectedDeliveryAt).toISOString().split('T')[0] : '');

  // -- ESTADOS DE CONFIRMAÇÃO --
  const [isItemConfirmOpen, setIsItemConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isPaymentConfirmOpen, setIsPaymentConfirmOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);

  // Atualizar drafts quando o order mudar (refresh)
  useEffect(() => {
    if (order) {
      setFinancialsDraft({
        discountAmount: Number(order.discountAmount),
        taxAmount: Number(order.taxAmount),
        shippingAmount: Number(order.shippingAmount),
      });
      setInternalNoteDraft(order.internalNotes || '');
      setAddressDraft(order.shippingAddress || {
         street: '', number: '', district: '', city: '', state: '', zipCode: ''
      });
      setShippingMethodDraft((order.metadata as any)?.shippingMethod || '');
      setShippingAmountDraft(Number(order.shippingAmount) || 0);
    }
  }, [order]);

  if (!order) return null;

  const statusLabels: Record<string, string> = {
    DRAFT: 'Rascunho',
    CONFIRMED: 'Confirmado',
    IN_PRODUCTION: 'Produção',
    READY: 'Pronto',
    SHIPPED: 'Enviado',
    DELIVERED: 'Entregue',
    CANCELED: 'Cancelado',
  };

  const productionStatusLabels: Record<string, { label: string; color: string }> = {
    WAITING: { label: 'Aguardando Fila', color: 'text-slate-400' },
    IN_PRODUCTION: { label: 'Em Produção', color: 'text-blue-500' },
    READY: { label: 'Concluído/Pronto', color: 'text-emerald-500' },
  };

  const priorityLabels: Record<string, { label: string; color: string; bg: string }> = {
    LOW: { label: 'Baixa', color: 'text-slate-500', bg: 'bg-slate-100' },
    NORMAL: { label: 'Normal', color: 'text-blue-600', bg: 'bg-blue-50' },
    HIGH: { label: 'Alta', color: 'text-orange-600', bg: 'bg-orange-50' },
    URGENT: { label: 'Urgente', color: 'text-red-600', bg: 'bg-red-50' },
  };

  const paymentStatusLabels: Record<string, { label: string; color: string; bg: string }> = {
    PENDING: { label: 'Aguardando Pagamento', color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/30' },
    PARTIAL: { label: 'Parcialmente Pago', color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/30' },
    PAID: { label: 'Pago / Liquidado', color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/30' },
    OVERDUE: { label: 'Atrasado', color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/30' },
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleStatusChange = (newStatus: string) => {
    startTransition(async () => {
      try {
        await updateOrderStatus(order.id, newStatus as any);
        success(`Status alterado para ${statusLabels[newStatus]}`);
        router.refresh();
      } catch (err: any) {
        toastError('Erro ao atualizar', err.message || 'Erro desconhecido');
      }
    });
  };

  const handleNoteSave = () => {
    startTransition(async () => {
      try {
        await updateOrderInternalNotes(order.id, internalNoteDraft);
        success('Notas internas atualizadas.');
        router.refresh();
      } catch (err: any) {
        toastError('Erro ao salvar nota', err.message);
      }
    });
  };

  const handleDeliveryDateSave = () => {
    startTransition(async () => {
      try {
        await updateOrderExpectedDelivery(order.id, deliveryDateDraft ? new Date(deliveryDateDraft) : null);
        success('Data prevista atualizada.');
        setIsEditingDeliveryDate(false);
        router.refresh();
      } catch (err: any) {
        toastError('Erro ao salvar data', err.message);
      }
    });
  };

  const handlePaymentSubmit = () => {
    if (!payAmount || isNaN(Number(payAmount)) || Number(payAmount) <= 0) {
      toastError('Erro', 'Informe um valor válido a ser pago.');
      return;
    }

    startTransition(async () => {
      try {
        await registerOrderPayment({
          orderId: order.id,
          amount: Number(payAmount),
          discount: Number(payDiscount) || 0,
          method: payMethod,
          receiptBase64
        });
        success('Pagamento registrado com sucesso!');
        setIsPaymentMode(false);
        setPayAmount('');
        router.refresh();
      } catch (err: any) {
        toastError('Falha ao registrar pagamento', err.message);
      }
    });
  };

  // --- HANDLERS DE EDIÇÃO AVANÇADA ---

  const handleItemUpdate = (itemId: string) => {
    startTransition(async () => {
      const res = await updateOrderItemAction(order.id, itemDraft);
      if (res.success) {
        success('Item atualizado.');
        setEditingItemId(null);
        router.refresh();
      } else {
        toastError('Erro ao editar item', res.error);
      }
    });
  };

  const handleItemDelete = (itemId: string) => {
    setItemToDelete(itemId);
    setIsItemConfirmOpen(true);
  };

  const confirmItemDelete = () => {
    if (!itemToDelete) return;
    setIsItemConfirmOpen(false);
    startTransition(async () => {
      const res = await deleteOrderItemAction(order.id, itemToDelete);
      if (res.success) {
        success('Item removido.');
        router.refresh();
      }
      setItemToDelete(null);
    });
  };

  const handleFinancialsSave = () => {
    startTransition(async () => {
      const res = await updateOrderFinancialsAction(order.id, financialsDraft);
      if (res.success) {
        success('Valores financeiros atualizados.');
        router.refresh();
      }
    });
  };

  const handlePaymentDelete = (paymentId: string) => {
    setPaymentToDelete(paymentId);
    setIsPaymentConfirmOpen(true);
  };

  const confirmPaymentDelete = () => {
    if (!paymentToDelete) return;
    setIsPaymentConfirmOpen(false);
    startTransition(async () => {
      const res = await deletePaymentAction(order.id, paymentToDelete);
      if (res.success) {
        success('Pagamento removido.');
        router.refresh();
      }
      setPaymentToDelete(null);
    });
  };

  const handleAddressSave = () => {
    startTransition(async () => {
      const res = await updateOrderShippingAction(order.id, addressDraft);
      if (res.success) {
        success('Endereço atualizado.');
        router.refresh();
      }
    });
  };

  // Agregar todos os eventos (Pagamentos e Logs de Itens)
  const timelineEvents = [
    ...(order.payments || []).map((p: any) => ({
      type: 'PAYMENT',
      id: p.id,
      date: new Date(p.createdAt),
      title: `Recebimento via ${p.method}`,
      description: `Valor de ${formatCurrency(Number(p.amount))}`,
      user: 'Sistema de Caixa',
      icon: 'check_circle',
      iconColor: 'text-emerald-500',
      iconBg: 'bg-emerald-100'
    })),
    ...(order.items || []).flatMap((item: any) => 
      (item.logs || []).map((log: any) => ({
        type: 'PRODUCTION',
        date: new Date(log.createdAt),
        title: `Item: ${item.product?.name || 'Material'}`,
        description: log.note,
        user: log.user?.name || 'Operador',
        icon: 'settings_input_component',
        iconColor: 'text-blue-500',
        iconBg: 'bg-blue-100'
      }))
    )
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const getNextStatusOptions = (status: string) => {
    switch (status) {
      case 'DRAFT': return [{ value: 'CONFIRMED', label: 'Confirmar', color: 'bg-emerald-600 hover:bg-emerald-700 text-white' }];
      case 'CONFIRMED': return [{ value: 'IN_PRODUCTION', label: 'Para Produção', color: 'bg-blue-600 hover:bg-blue-700 text-white' }];
      case 'IN_PRODUCTION': return [{ value: 'READY', label: 'Concluir', color: 'bg-emerald-600 hover:bg-emerald-700 text-white' }];
      case 'READY': return [{ value: 'DELIVERED', label: 'Entregar (Retirada)', color: 'bg-emerald-600 hover:bg-emerald-700 text-white' }, { value: 'SHIPPED', label: 'Despachar', color: 'bg-violet-600 hover:bg-violet-700 text-white' }];
      case 'SHIPPED': return [{ value: 'DELIVERED', label: 'Entrega final', color: 'bg-emerald-600 hover:bg-emerald-700 text-white' }];
      default: return [];
    }
  };

  const currentPayBadge = paymentStatusLabels[order.paymentStatus] || paymentStatusLabels.PENDING;
  const currentProd = productionStatusLabels[order.productionStatus] || productionStatusLabels.WAITING;

  const NavItem = ({ tab, icon, label }: { tab: typeof activeTab; icon: string; label: string }) => {
    const isActive = activeTab === tab;
    return (
      <button
        onClick={() => { setActiveTab(tab); setIsPaymentMode(false); }}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group",
          isActive 
            ? "bg-white text-slate-900 shadow-sm font-bold dark:bg-slate-800 dark:text-white" 
            : "text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
        )}
      >
        <span className={cn(
          "material-symbols-outlined text-[20px]", 
          isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
        )}>
          {icon}
        </span>
        {label}
      </button>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[100]" />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 35, stiffness: 300 }}
            className="fixed inset-y-8 right-8 w-[65vw] h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 z-[101] shadow-[-20px_0_50px_rgba(0,0,0,0.1)] flex overflow-hidden border border-slate-200/50 dark:border-slate-800/50 rounded-3xl"
          >
            {/* Sidebar Left */}
            <aside className="w-72 bg-[#f0f4f7] dark:bg-slate-900/50 border-r border-slate-200/50 dark:border-slate-800 flex flex-col">
              <div className="p-8 pb-6 border-b border-slate-200/50 dark:border-slate-800">
                 <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                    <span className="material-symbols-outlined text-[18px]">assignment</span>
                 </div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pedido #{order.number}</p>
                 <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-tight break-words">{order.customer?.name}</h2>
                 <div className="mt-4 flex flex-col gap-2">
                   <div className={cn("px-3 py-1 font-bold text-[10px] rounded-full uppercase tracking-wider inline-flex w-fit items-center gap-1.5", order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700' : order.status === 'IN_PRODUCTION' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-700')}>
                     <span className={cn("w-1.5 h-1.5 rounded-full", order.status === 'DELIVERED' ? 'bg-emerald-500' : order.status === 'IN_PRODUCTION' ? 'bg-blue-500 animate-pulse' : 'bg-slate-400')} />
                     Venda: {statusLabels[order.status]}
                   </div>
                   <div className="px-3 py-1 font-bold text-[10px] rounded-full uppercase tracking-wider inline-flex w-fit items-center gap-1.5 bg-slate-100 text-slate-500">
                      <span className={cn("w-1.5 h-1.5 rounded-full bg-current", currentProd.color)} />
                      Prod: {currentProd.label}
                   </div>
                 </div>
              </div>
              
              <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto no-scrollbar">
                 <NavItem tab="VISAO_GERAL" icon="analytics" label="Visão Geral" />
                 <NavItem tab="ITENS" icon="settings_input_component" label="Especificações" />
                 <NavItem tab="FINANCEIRO" icon="payments" label="Financeiro" />
                 <NavItem tab="TIMELINE" icon="history" label="Timeline" />
                 <NavItem tab="NOTAS" icon="forum" label="Notas Internas" />
              </nav>

              {/* Toggle de Modo Edição */}
              <div className="p-4 border-t border-slate-200/50">
                 <button 
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 h-10 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                    isEditMode ? "bg-orange-100 text-orange-600 ring-2 ring-orange-500/20" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  )}
                 >
                   <span className="material-symbols-outlined text-sm">{isEditMode ? 'lock_open' : 'edit'}</span>
                   {isEditMode ? 'Modo Edição Ativo' : 'Habilitar Edição'}
                 </button>
              </div>

              <div className="p-6 border-t border-slate-200/50 dark:border-slate-800">
                 <div className="bg-white/50 dark:bg-slate-800/30 p-4 rounded-xl relative group">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Previsão de Entrega</p>
                    {isEditingDeliveryDate ? (
                      <div className="space-y-2 mt-2">
                        <Input type="date" value={deliveryDateDraft} onChange={(e) => setDeliveryDateDraft(e.target.value)} className="h-8 text-xs p-2 rounded-lg" />
                        <div className="flex gap-1">
                          <Button size="icon" onClick={handleDeliveryDateSave} className="h-6 w-6 rounded-md bg-emerald-500"><span className="material-symbols-outlined text-xs">check</span></Button>
                          <Button size="icon" variant="ghost" onClick={() => setIsEditingDeliveryDate(false)} className="h-6 w-6 rounded-md"><span className="material-symbols-outlined text-xs">close</span></Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-black text-slate-700 dark:text-white">
                          {order.expectedDeliveryAt ? new Date(order.expectedDeliveryAt).toLocaleDateString('pt-BR') : 'Não Definido'}
                        </p>
                        <button onClick={() => setIsEditingDeliveryDate(true)} className="opacity-0 group-hover:opacity-100 transition-opacity"><span className="material-symbols-outlined text-xs text-slate-400">edit</span></button>
                      </div>
                    )}
                 </div>
              </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col bg-white dark:bg-slate-950 min-w-0">
               <header className="h-20 border-b border-slate-100 dark:border-slate-800 px-8 flex items-center justify-between bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm z-10 shrink-0">
                  <div className={cn("px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider border", currentPayBadge.bg, currentPayBadge.color)}>
                    {currentPayBadge.label}
                  </div>
                  <div className="flex items-center gap-4">
                    <Button variant="outline" className="px-6 h-10 font-bold rounded-lg shadow-sm border-slate-200">Exportar OS</Button>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full bg-slate-100 hover:bg-slate-200 ml-2"><span className="material-symbols-outlined">close</span></Button>
                  </div>
               </header>

               <div className="flex-1 overflow-y-auto p-10 bg-slate-50/30 dark:bg-slate-950 no-scrollbar">
                  <AnimatePresence mode="wait">
                    
                    {activeTab === 'VISAO_GERAL' && (
                       <motion.div key="visao-geral" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-4xl space-y-8 pb-10">
                         <h3 className="text-xl font-black text-slate-900 dark:text-white">Detalhes Operacionais</h3>
                         <div className="grid grid-cols-2 gap-6">
                            <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-2xl shadow-sm space-y-6">
                              <div className="flex items-center gap-3"><span className="material-symbols-outlined text-primary">person</span><h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Informações do Cliente</h3></div>
                              <div className="space-y-4">
                                <p className="text-xl font-bold text-slate-900 dark:text-white break-words">{order.customer?.name}</p>
                                <div className="space-y-1 min-w-0">
                                  <p className="text-sm font-medium text-slate-500 break-all">{order.customer?.document || 'Sem CPF/CNPJ'}</p>
                                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300 break-words">{order.customer?.phone || 'Telefone não informado'}</p>
                                  <p className="text-[11px] text-slate-400 break-all">{order.customer?.email}</p>
                                </div>
                              </div>
                            </section>

                            <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-2xl shadow-sm space-y-6 relative group">
                               <div className="flex items-center gap-3"><span className="material-symbols-outlined text-primary">local_shipping</span><h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Logística e Entrega</h3></div>
                               {isEditMode ? (
                                   <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100">
                                         <div className="col-span-2">
                                            <label className="text-[9px] font-bold text-slate-400 uppercase mb-2 block">Preferência de Envio</label>
                                            <div className="grid grid-cols-3 gap-2">
                                               {['PAC', 'SEDEX', 'RETIRADA'].map((pref) => (
                                                 <button 
                                                   key={pref}
                                                   onClick={() => {
                                                     startTransition(async () => {
                                                        await updateOrderShippingMethodAction(order.id, { 
                                                          method: pref, 
                                                          amount: pref === 'RETIRADA' ? 0 : Number(order.shippingAmount) 
                                                        });
                                                        router.refresh();
                                                     });
                                                   }}
                                                   className={cn(
                                                     "h-8 text-[10px] font-bold rounded-lg border transition-all",
                                                     (order.metadata as any)?.shippingMethod === pref 
                                                       ? "bg-primary text-white border-primary" 
                                                       : "bg-slate-50 text-slate-500 border-slate-200 hover:border-primary/50"
                                                   )}
                                                 >
                                                   {pref}
                                                 </button>
                                               ))}
                                            </div>
                                         </div>
                                         <div className="col-span-1 mt-2">
                                           <label className="text-[9px] font-bold text-slate-400 uppercase">Personalizado</label>
                                           <Input 
                                             value={shippingMethodDraft} 
                                             onChange={e => setShippingMethodDraft(e.target.value)}
                                             onBlur={() => {
                                               startTransition(async () => {
                                                  await updateOrderShippingMethodAction(order.id, { 
                                                    method: shippingMethodDraft, 
                                                    amount: shippingAmountDraft 
                                                  });
                                                  router.refresh();
                                               });
                                             }}
                                             placeholder="Ex: Moto-obvoy" 
                                             className="h-8 text-xs" 
                                           />
                                         </div>
                                         <div className="col-span-1 mt-2">
                                           <label className="text-[9px] font-bold text-slate-400 uppercase">Valor Frete (R$)</label>
                                           <Input 
                                             type="number" 
                                             step="0.01" 
                                             value={shippingAmountDraft} 
                                             onChange={e => setShippingAmountDraft(Number(e.target.value))}
                                             onBlur={() => {
                                               startTransition(async () => {
                                                  await updateOrderShippingMethodAction(order.id, { 
                                                    method: shippingMethodDraft, 
                                                    amount: shippingAmountDraft 
                                                  });
                                                  router.refresh();
                                               });
                                             }}
                                             className="h-8 text-xs" 
                                           />
                                         </div>
                                      </div>

                                      <div className="grid grid-cols-2 gap-3">
                                         <div className="col-span-2"><label className="text-[9px] font-bold text-slate-400 uppercase">Logradouro</label><Input value={addressDraft.street} onChange={e => setAddressDraft({...addressDraft, street: e.target.value})} className="h-8 text-xs" /></div>
                                         <div><label className="text-[9px] font-bold text-slate-400 uppercase">Número</label><Input value={addressDraft.number} onChange={e => setAddressDraft({...addressDraft, number: e.target.value})} className="h-8 text-xs" /></div>
                                         <div><label className="text-[9px] font-bold text-slate-400 uppercase">CEP</label><Input value={addressDraft.zipCode} onChange={e => setAddressDraft({...addressDraft, zipCode: e.target.value})} className="h-8 text-xs" /></div>
                                         <Button onClick={handleAddressSave} className="col-span-2 h-8 bg-slate-900 text-white text-[10px] font-black uppercase">Salvar Endereço</Button>
                                      </div>
                                   </div>
                                 ) : (
                                   <>
                                     {(order.metadata as any)?.shippingMethod && (
                                       <div className="mb-3 px-3 py-2 bg-indigo-50/50 rounded-lg flex justify-between items-center border border-indigo-100">
                                          <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm text-indigo-500">box</span>
                                            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{(order.metadata as any).shippingMethod}</span>
                                          </div>
                                          <span className="text-xs font-black text-indigo-900">{Number(order.shippingAmount) === 0 ? 'GRÁTIS' : formatCurrency(Number(order.shippingAmount))}</span>
                                       </div>
                                     )}
                                     {order.shippingAddress ? (
                                       <div className="min-w-0">
                                          <p className="text-sm font-bold text-slate-700 dark:text-slate-200 break-words">{order.shippingAddress.street}, {order.shippingAddress.number}</p>
                                          <p className="text-xs text-slate-500 mt-1 break-words">{order.shippingAddress.district} - {order.shippingAddress.city}/{order.shippingAddress.state}</p>
                                          <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">CEP: {order.shippingAddress.zipCode}</p>
                                       </div>
                                     ) : (
                                       <div className="py-2 flex flex-col items-center">
                                          <p className="text-sm italic text-slate-400 text-center">Retirada em Balcão (Sem frete)</p>
                                       </div>
                                     )}
                                   </>
                                 )}
                            </section>

                            <section className="col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-2xl shadow-sm">
                               <div className="grid grid-cols-3 gap-10">
                                  <div><h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Data de Criação</h4><p className="text-sm font-bold text-slate-700 dark:text-slate-200">{new Date(order.createdAt).toLocaleString('pt-BR')}</p></div>
                                  <div><h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Canal de Venda</h4><p className="text-sm font-bold text-slate-700 dark:text-slate-200 capitalize">{order.metadata?.channel || 'Interno / Balcão'}</p></div>
                                  <div><h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Vendedor</h4><p className="text-sm font-bold text-slate-700 dark:text-slate-200">{order.user?.name || 'Administrador'}</p></div>
                               </div>
                            </section>
                         </div>
                       </motion.div>
                    )}

                    {activeTab === 'ITENS' && (
                       <motion.div key="itens" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-5xl space-y-6 pb-10">
                         <div className="flex items-center justify-between mb-4">
                           <div className="flex items-center gap-2 text-slate-500 uppercase tracking-widest text-xs font-bold text-primary">
                             <span className="material-symbols-outlined text-sm">settings_input_component</span> Itens do Pedido ({order.items?.length || 0})
                           </div>
                           {isEditMode && (
                             <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  className="h-8 text-xs font-bold border-primary text-primary hover:bg-primary/5 rounded-lg"
                                  onClick={() => setIsAddingItem(!isAddingItem)}
                                >
                                  <span className="material-symbols-outlined text-sm mr-1">{isAddingItem ? 'close' : 'add_circle'}</span> 
                                  {isAddingItem ? 'Cancelar Adição' : 'Adicionar Produto'}
                                </Button>
                             </div>
                           )}
                         </div>

                         {/* Seção de Adicionar Produto */}
                         {isAddingItem && (
                           <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-900 p-8 rounded-2xl border-2 border-primary/30 shadow-xl space-y-6">
                              <div className="flex items-center gap-3 border-b pb-4 mb-2">
                                 <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><span className="material-symbols-outlined">search</span></div>
                                 <div className="flex-1">
                                    <h4 className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white">Novo Item no Pedido</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Pesquise no catálogo ou adicione manualmente</p>
                                 </div>
                              </div>
                              
                              <ProductSearchForm onAdd={(product, variant) => {
                                startTransition(async () => {
                                   const res = await addOrderItemAction(order.id, {
                                      productId: product.id,
                                      variantId: variant?.id,
                                      description: variant ? `${product.name} (${variant.name})` : product.name,
                                      quantity: 1,
                                      unitPrice: Number(variant?.price || product.basePrice),
                                      discount: 0
                                   });
                                   if (res.success) {
                                      success("Item adicionado.");
                                      setIsAddingItem(false);
                                      router.refresh();
                                   }
                                });
                              }} />
                           </motion.div>
                         )}
                         
                         <div className="space-y-4">
                           {order.items?.map((item: any) => {
                             const isEditing = editingItemId === item.id;
                             
                             return (
                               <div key={item.id} className={cn("bg-white dark:bg-slate-900 p-6 rounded-2xl border transition-all duration-300", isEditing ? "ring-2 ring-primary border-primary shadow-xl" : "border-slate-100/50 dark:border-slate-800/50 shadow-sm")}>
                                 {isEditing ? (
                                   <div className="space-y-6">
                                      <div className="flex items-center justify-between pb-4 border-b">
                                        <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Editando Item: {item.product?.name || 'Manual'}</h4>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={() => setEditingItemId(null)}><span className="material-symbols-outlined">close</span></Button>
                                      </div>
                                      <div className="grid grid-cols-4 gap-6">
                                         <div className="col-span-2 space-y-2"><label className="text-[10px] font-bold uppercase text-slate-400">Descrição / Tópicos</label><Input value={itemDraft.description} onChange={e => setItemDraft({...itemDraft, description: e.target.value})} className="h-10 bg-slate-50" /></div>
                                         <div className="space-y-2"><label className="text-[10px] font-bold uppercase text-slate-400">Qtd</label><Input type="number" value={itemDraft.quantity} onChange={e => setItemDraft({...itemDraft, quantity: Number(e.target.value)})} className="h-10 bg-slate-50" /></div>
                                         <div className="space-y-2"><label className="text-[10px] font-bold uppercase text-slate-400">Preço Unit (R$)</label><Input type="number" step="0.01" value={itemDraft.unitPrice} onChange={e => setItemDraft({...itemDraft, unitPrice: Number(e.target.value)})} className="h-10 bg-slate-50" /></div>
                                      </div>
                                      <div className="flex justify-end gap-3 pt-4">
                                         <Button variant="ghost" onClick={() => setEditingItemId(null)} className="font-bold text-slate-500">Cancelar</Button>
                                         <Button onClick={() => handleItemUpdate(item.id)} className="bg-primary text-white font-black px-8">Salvar Alterações</Button>
                                      </div>
                                   </div>
                                 ) : (
                                   <div className="flex items-start gap-6 relative group">
                                     <div className="flex flex-col items-center shrink-0">
                                        <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex flex-col items-center justify-center mb-2 overflow-hidden border border-primary/20">
                                          <span className="text-lg font-black">{item.quantity}</span>
                                          <span className="text-[8px] font-black uppercase tracking-widest opacity-60">UN</span>
                                        </div>
                                        {isEditMode && (
                                          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                                             <button 
                                               onClick={() => {
                                                 const newQty = Math.max(item.quantity - 1, 1);
                                                 startTransition(async () => {
                                                   await updateOrderItemAction(order.id, { ...item, quantity: newQty });
                                                   router.refresh();
                                                 });
                                               }}
                                               className="w-6 h-6 rounded flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 text-slate-500 hover:text-red-500 transition-colors"
                                             >
                                               <span className="material-symbols-outlined text-sm">remove</span>
                                             </button>
                                             <button 
                                               onClick={() => {
                                                 const newQty = item.quantity + 1;
                                                 startTransition(async () => {
                                                   await updateOrderItemAction(order.id, { ...item, quantity: newQty });
                                                   router.refresh();
                                                 });
                                               }}
                                               className="w-6 h-6 rounded flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 text-slate-500 hover:text-emerald-500 transition-colors"
                                             >
                                               <span className="material-symbols-outlined text-sm">add</span>
                                             </button>
                                          </div>
                                        )}
                                      </div>
                                     <div className="flex-1 min-w-0 pt-1">
                                       <div className="flex items-center justify-between gap-4 mb-2">
                                          <h4 className="text-lg font-bold text-slate-900 dark:text-white truncate">{item.product?.name || item.description}</h4>
                                          <div className="flex items-center gap-2">
                                            {item.priority && <span className={cn("px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider", priorityLabels[item.priority].bg, priorityLabels[item.priority].color)}>{priorityLabels[item.priority].label}</span>}
                                            {isEditMode && (
                                              <div className="opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1">
                                                <Button size="icon" variant="ghost" className="h-7 w-7 rounded-md hover:bg-blue-50 hover:text-blue-600" onClick={() => { setEditingItemId(item.id); setItemDraft(item); }}><span className="material-symbols-outlined text-sm">edit</span></Button>
                                                <Button size="icon" variant="ghost" className="h-7 w-7 rounded-md hover:bg-red-50 hover:text-red-600" onClick={() => handleItemDelete(item.id)}><span className="material-symbols-outlined text-sm">delete</span></Button>
                                              </div>
                                            )}
                                          </div>
                                       </div>
                                       <div className="mt-4 grid grid-cols-3 gap-6">
                                         <div><span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Responsável</span><p className="text-xs font-bold text-slate-600 dark:text-slate-300">{item.assignedUser?.name || 'Não Atribuído'}</p></div>
                                         <div><span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Prazo Item</span><p className="text-xs font-bold text-slate-600 dark:text-slate-300">{item.dueDate ? new Date(item.dueDate).toLocaleDateString('pt-BR') : 'Geral'}</p></div>
                                         <div><span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Vlr Unitário</span><p className="text-xs font-bold text-slate-600 dark:text-slate-300">{formatCurrency(Number(item.unitPrice))}</p></div>
                                         <div className="col-span-3 mt-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                                            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{item.description}</p>
                                         </div>
                                       </div>
                                     </div>
                                     <div className="text-right bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl shrink-0 min-w-[120px]">
                                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Valor do Item</p>
                                       <p className="text-xl font-black text-emerald-600">{formatCurrency(Number(item.total))}</p>
                                     </div>
                                   </div>
                                 )}
                               </div>
                             );
                           })}
                         </div>
                       </motion.div>
                    )}

                    {activeTab === 'FINANCEIRO' && (
                       <motion.div key="financeiro" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-4xl space-y-8 pb-10">
                         {!isPaymentMode ? (
                           <>
                             <div className="bg-zinc-950 text-white p-10 rounded-[26px] shadow-2xl relative overflow-hidden ring-1 ring-white/10">
                               <div className="absolute -right-10 -top-10 opacity-[0.03] scale-[3.5]"><span className="material-symbols-outlined text-[200px]">account_balance_wallet</span></div>
                               <div className="relative z-10">
                                 <div className="flex justify-between items-center text-white/50 text-[10px] font-bold uppercase tracking-[0.2em] pb-6 border-b border-white/10 mb-8"><span>Painel Financeiro (BRL)</span><span>{new Date().toLocaleDateString('pt-BR')}</span></div>
                                 <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                   <div className="space-y-2"><p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Bruto Total</p><p className="text-xl font-medium tracking-tight">{formatCurrency(Number(order.subtotal))}</p></div>
                                   <div className="space-y-2">
                                      <p className="text-[10px] text-amber-500/80 uppercase tracking-widest font-bold">Descontos (-) </p>
                                      {isEditMode ? (
                                        <Input type="number" 
                                          value={financialsDraft.discountAmount} 
                                          onChange={e => setFinancialsDraft({...financialsDraft, discountAmount: Number(e.target.value)})} 
                                          className="h-8 max-w-[120px] bg-white/10 border-none text-white font-bold"
                                        />
                                      ) : (
                                        <p className="text-xl font-medium text-amber-400">- {formatCurrency(Number(order.discountAmount))}</p>
                                      )}
                                   </div>
                                   <div className="space-y-2"><p className="text-[10px] text-emerald-500/80 uppercase tracking-widest font-bold">Total Recebido</p><p className="text-xl font-bold text-emerald-400">{formatCurrency(Number(order.paidAmount))}</p></div>
                                   <div className="space-y-2"><p className="text-[10px] text-red-400/80 uppercase tracking-widest font-bold">Restante Crítico</p><p className="text-2xl font-black text-red-400">{formatCurrency(Number(order.remainingAmount))}</p></div>
                                 </div>
                                 {isEditMode && (
                                   <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                                      <div className="space-y-2"><p className="text-[10px] text-blue-400/80 uppercase tracking-widest font-bold">Impostos (+)</p><Input type="number" value={financialsDraft.taxAmount} onChange={e => setFinancialsDraft({...financialsDraft, taxAmount: Number(e.target.value)})} className="h-8 bg-white/10 border-none text-white font-bold" /></div>
                                      <div className="space-y-2"><p className="text-[10px] text-blue-400/80 uppercase tracking-widest font-bold">Frete (+)</p><Input type="number" value={financialsDraft.shippingAmount} onChange={e => setFinancialsDraft({...financialsDraft, shippingAmount: Number(e.target.value)})} className="h-8 bg-white/10 border-none text-white font-bold" /></div>
                                      <div className="col-span-2 pt-5"><Button onClick={handleFinancialsSave} className="w-full h-10 bg-white text-slate-900 font-black uppercase text-[10px]">Guardar Ajustes Financeiros</Button></div>
                                   </div>
                                 )}
                               </div>
                             </div>
                             {Number(order.remainingAmount) > 0 && <Button onClick={() => { setPayAmount(String(Number(order.remainingAmount))); setIsPaymentMode(true); }} className="h-14 px-10 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 font-black shadow-xl shadow-indigo-600/20 active:scale-[0.98] transition-all w-full text-lg">Registrar Novo Recebimento <span className="material-symbols-outlined ml-2">payments</span></Button>}
                           </>
                         ) : (
                            <motion.section initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[22px] p-10 shadow-xl">
                              <div className="flex items-center gap-4 mb-8"><Button variant="ghost" size="icon" onClick={() => setIsPaymentMode(false)} className="rounded-full bg-slate-100 hover:bg-slate-200"><span className="material-symbols-outlined">arrow_back</span></Button><div><h3 className="text-2xl font-black text-slate-900 dark:text-white">Lançamento de Caixa</h3><p className="text-sm font-medium text-slate-500 mt-1">Saldo a Liquidar: {formatCurrency(Number(order.remainingAmount))}</p></div></div>
                              <div className="space-y-8">
                                 <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-3"><label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Valor Recebido (R$)</label><Input type="number" step="0.01" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className="h-14 bg-slate-50 rounded-xl border-none px-6 text-xl font-black" /></div>
                                    <div className="space-y-3"><label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Modalidade</label><select value={payMethod} onChange={(e) => setPayMethod(e.target.value)} className="h-14 w-full px-6 rounded-xl bg-slate-50 dark:bg-slate-950 border-none text-lg font-bold outline-none focus:ring-2 focus:ring-primary shadow-inner"><option value="PIX">Pix</option><option value="CREDIT_CARD">Cartão de Crédito</option><option value="DEBIT_CARD">Cartão de Débito</option><option value="CASH">Dinheiro / Espécie</option><option value="BANK_TRANSFER">Transferência</option></select></div>
                                 </div>
                                 <Button onClick={handlePaymentSubmit} disabled={isPending || !payAmount} className="w-full h-14 rounded-xl font-black bg-emerald-600 hover:bg-emerald-500 text-white text-lg mt-4 shadow-xl shadow-emerald-600/30 active:scale-[0.98] transition-all">{isPending ? 'Sincronizando...' : 'Processar e Liquidar Valor'}</Button>
                              </div>
                            </motion.section>
                         )}
                       </motion.div>
                    )}

                    {activeTab === 'TIMELINE' && (
                       <motion.div key="timeline" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-3xl space-y-6 pb-10">
                         <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8">Auditoria Integrada</h3>
                         <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                           {timelineEvents.length > 0 ? (
                             <div className="space-y-8 relative before:absolute before:left-[15px] before:top-2 before:bottom-0 before:w-px before:bg-slate-200 dark:before:bg-slate-800">
                               {timelineEvents.map((ev, i) => (
                                 <div key={i} className="relative pl-10 group">
                                    <div className={cn("absolute left-0 top-0.5 w-7 h-7 rounded-full flex items-center justify-center z-10 ring-8 ring-white dark:ring-slate-900", ev.iconBg)}>
                                      <span className={cn("material-symbols-outlined text-[14px]", ev.iconColor)}>{ev.icon}</span>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800/20 p-5 rounded-xl border border-slate-100/50 dark:border-slate-800/50 hover:border-primary/20 transition-all">
                                      <div className="flex justify-between items-start mb-1">
                                         <h4 className="text-sm font-bold text-slate-900 dark:text-white">{ev.title}</h4>
                                         <div className="flex items-center gap-4">
                                           <span className="text-[10px] font-bold text-slate-400 uppercase">{ev.date.toLocaleString('pt-BR')}</span>
                                           {isEditMode && ev.type === 'PAYMENT' && (
                                              <button onClick={() => handlePaymentDelete(ev.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all">
                                                 <span className="material-symbols-outlined text-sm">delete</span>
                                              </button>
                                           )}
                                         </div>
                                      </div>
                                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{ev.description}</p>
                                      <div className="mt-2 text-[9px] font-black uppercase text-slate-400 flex items-center gap-1.5"><span className="material-symbols-outlined text-[10px]">person</span> por {ev.user}</div>
                                    </div>
                                 </div>
                               ))}
                             </div>
                           ) : (
                             <div className="py-20 text-center"><span className="material-symbols-outlined text-4xl text-slate-200 mb-2">history</span><p className="text-slate-500 italic text-sm">Nenhum evento registrado.</p></div>
                           )}
                         </div>
                       </motion.div>
                    )}

                    {activeTab === 'NOTAS' && (
                       <motion.div key="notas" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-3xl space-y-6 pb-10">
                         <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-slate-100 dark:border-slate-800"><h3 className="text-lg font-bold text-slate-900 dark:text-white">Observações Internas</h3><p className="text-sm text-slate-500 mt-1">Visíveis apenas para a equipe de produção e gestão.</p></div>
                            <div className="p-8 space-y-6">
                               <div className="space-y-3">
                                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Bloco de Notas</label>
                                  <textarea 
                                    value={internalNoteDraft} onChange={(e) => setInternalNoteDraft(e.target.value)}
                                    className="w-full min-h-[200px] p-6 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-primary text-sm shadow-inner resize-none text-slate-700 dark:text-slate-300"
                                    placeholder="Escreva anotações críticas, instruções de acabamento ou avisos..."
                                  />
                                  <Button onClick={handleNoteSave} disabled={isPending} className="rounded-xl h-12 px-8 font-bold bg-primary text-white shadow-lg active:scale-95 transition-transform">{isPending ? 'Salvando...' : 'Salvar Histórico'}</Button>
                               </div>
                            </div>
                         </div>
                       </motion.div>
                    )}

                  </AnimatePresence>
               </div>

               <footer className="bg-white dark:bg-slate-900 px-8 py-5 border-t border-slate-100 dark:border-slate-800 flex gap-4 shrink-0 z-20">
                  {getNextStatusOptions(order.status).map(opt => (
                    <Button key={opt.value} disabled={isPending} onClick={() => handleStatusChange(opt.value)} className={cn("flex-1 rounded-xl h-14 font-black shadow-lg shadow-black/5 active:scale-[0.98] text-sm uppercase tracking-wider", opt.color)}>{isPending ? 'Processando...' : opt.label}</Button>
                  ))}
                  {['CANCELED', 'DELIVERED'].indexOf(order.status) === -1 && (
                    <Button disabled={isPending} onClick={() => handleStatusChange('CANCELED')} variant="outline" className="flex-none rounded-xl h-14 font-bold px-8 border-red-200 text-red-600 hover:bg-red-50">Cancelar Pedido</Button>
                  )}
               </footer>
            </main>
          </motion.div>

          <ConfirmDialog
            open={isItemConfirmOpen}
            onOpenChange={setIsItemConfirmOpen}
            onConfirm={confirmItemDelete}
            title="Remover Item do Pedido"
            description="Deseja realmente remover este item? O valor total do pedido será recalculado automaticamente."
            variant="destructive"
            confirmText="Remover Item"
            cancelText="Cancelar"
            loading={isPending}
          />

          <ConfirmDialog
            open={isPaymentConfirmOpen}
            onOpenChange={setIsPaymentConfirmOpen}
            onConfirm={confirmPaymentDelete}
            title="Remover Registro de Pagamento"
            description="Tem certeza que deseja remover este pagamento? O saldo devedor será atualizado."
            variant="destructive"
            confirmText="Remover Pagamento"
            cancelText="Cancelar"
            loading={isPending}
          />
        </>
      )}
    </AnimatePresence>
  );
}
