'use client';

import React, { useState, useMemo, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { createQuote } from '@/app/actions/quotes';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/ui';
import { LoadingSpinner } from '@/components/ui';

interface QuoteFormClientProps {
  categories: any[];
  products: any[];
  customers: any[];
}

interface QuoteItemDraft {
  productId: string;
  variantId: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  notes: string;
}

export function QuoteFormClient({ categories, products, customers }: QuoteFormClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Estado do formulário
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [validDays, setValidDays] = useState(15);

  const [items, setItems] = useState<QuoteItemDraft[]>([]);

  // Filtra clientes pela busca
  const filteredCustomers = useMemo(() => {
    if (!customerSearch || customerSearch.length < 2) return [];
    const search = customerSearch.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search) ||
        c.document.includes(search)
    );
  }, [customerSearch, customers]);

  // Filtra produtos pela categoria
  const filteredProducts = useMemo(() => {
    if (!selectedCategoryId) return products;
    return products.filter((p) => p.categoryId === selectedCategoryId);
  }, [selectedCategoryId, products]);

  // Produto selecionado
  const selectedProduct = useMemo(() => {
    return products.find((p) => p.id === selectedProductId);
  }, [selectedProductId, products]);

  // Calcula totais
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const totalDiscount = items.reduce((sum, item) => sum + item.discount, 0);
  const total = subtotal - totalDiscount;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Adiciona item ao orçamento
  const handleAddItem = () => {
    if (!selectedProduct) return;

    const newItem: QuoteItemDraft = {
      productId: selectedProduct.id,
      variantId: null,
      description: `${quantity} ${selectedProduct.name}`,
      quantity,
      unitPrice: Number(selectedProduct.basePrice),
      discount: 0,
      notes: '',
    };

    setItems([...items, newItem]);
    setSelectedProductId('');
    setQuantity(1);
  };

  // Remove item
  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Submete orçamento
  const handleSubmit = (asDraft: boolean = true) => {
    if (!selectedCustomer || items.length === 0) return;

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validDays);

    startTransition(async () => {
      try {
        const result = await createQuote({
          customerId: selectedCustomer.id,
          validUntil,
          notes: notes || null,
          internalNotes: null,
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            notes: item.notes || null,
          })),
        });

        toast({
          title: asDraft ? 'Orçamento salvo' : 'Pedido gerado',
          description: asDraft 
            ? 'O rascunho do orçamento foi criado com sucesso.' 
            : 'O pedido de venda foi gerado e está pronto para produção.',
          variant: 'success'
        });

        router.push('/orcamentos');
      } catch (error: any) {
        console.error('Erro ao criar orçamento:', error);
        toast({
          title: 'Erro ao salvar',
          description: error.message || 'Ocorreu um erro inesperado ao salvar os dados.',
          variant: 'destructive'
        });
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Header com breadcrumb */}
      <div className="mb-2">
        <h1 className="text-3xl font-light tracking-tight text-slate-900 dark:text-white font-headline mb-2">
          Novo Pedido / Orçamento
        </h1>
        <nav className="flex gap-2 text-xs text-slate-400 font-normal">
          <Link href="/orcamentos" className="hover:text-slate-600 transition-colors">Orçamentos</Link>
          <span>/</span>
          <span className="text-primary">Criar Novo</span>
        </nav>
      </div>

      <div className="grid grid-cols-12 gap-8 items-start">
        {/* Left Column (Form) */}
        <div className="col-span-12 lg:col-span-8 space-y-8">

          {/* ─── Seção: Identificação do Cliente ─── */}
          <section className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-normal uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">person</span>
                Identificação do Cliente
              </h3>
              <button className="text-xs font-normal text-primary flex items-center gap-1 hover:underline">
                <span className="material-symbols-outlined text-sm">person_add</span>
                Cadastrar Novo
              </button>
            </div>

            <div className="relative">
              <label className="block text-[11px] font-normal text-slate-400 mb-1 ml-1">
                Buscar Cliente (Nome, CPF/CNPJ ou Email)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={selectedCustomer ? selectedCustomer.name : customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setSelectedCustomer(null);
                    setShowCustomerDropdown(true);
                  }}
                  onFocus={() => setShowCustomerDropdown(true)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg py-3 pl-4 pr-12 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-primary/20 transition-all text-sm font-normal"
                  placeholder="Comece a digitar o nome do cliente..."
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              </div>

              {/* Dropdown de clientes */}
              {showCustomerDropdown && filteredCustomers.length > 0 && !selectedCustomer && (
                <div className="absolute z-20 w-full mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 max-h-60 overflow-y-auto">
                  {filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      type="button"
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-none"
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setShowCustomerDropdown(false);
                        setCustomerSearch('');
                      }}
                    >
                      <p className="text-sm font-normal text-slate-900 dark:text-white">{customer.name}</p>
                      <p className="text-[10px] text-slate-400 font-normal">{customer.email} • {customer.document}</p>
                    </button>
                  ))}
                </div>
              )}

              {/* Selecionado */}
              {selectedCustomer && (
                <div className="mt-3 flex items-center gap-3 bg-primary/5 rounded-lg p-3">
                  <span className="material-symbols-outlined text-primary">check_circle</span>
                  <div className="flex-1">
                    <p className="text-sm font-normal text-slate-900 dark:text-white">{selectedCustomer.name}</p>
                    <p className="text-[10px] text-slate-400 font-normal">{selectedCustomer.email} • {selectedCustomer.document}</p>
                  </div>
                  <button
                    type="button"
                    className="text-slate-400 hover:text-red-400 transition-colors"
                    onClick={() => setSelectedCustomer(null)}
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* ─── Seção: Especificações do Produto ─── */}
          <section className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="mb-6">
              <h3 className="text-sm font-normal uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">inventory_2</span>
                Especificações do Produto
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-[11px] font-normal text-slate-400 mb-1 ml-1">Categoria</label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => {
                    setSelectedCategoryId(e.target.value);
                    setSelectedProductId('');
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg py-3 px-4 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-primary/20 transition-all text-sm font-normal appearance-none"
                >
                  <option value="">Todas as categorias</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-normal text-slate-400 mb-1 ml-1">Produto Específico</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg py-3 px-4 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-primary/20 transition-all text-sm font-normal appearance-none"
                >
                  <option value="">Selecione o produto</option>
                  {filteredProducts.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {prod.name} — {formatCurrency(Number(prod.basePrice))}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Detalhes do Produto Selecionado */}
            {selectedProduct && (
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-sm font-normal text-slate-900 dark:text-white">{selectedProduct.name}</p>
                    <p className="text-[10px] text-slate-400 font-normal">SKU: {selectedProduct.sku}</p>
                  </div>
                  <p className="text-sm font-light text-primary">{formatCurrency(Number(selectedProduct.basePrice))}</p>
                </div>
                {selectedProduct.description && (
                  <p className="text-xs text-slate-500 font-normal mb-3">{selectedProduct.description}</p>
                )}
              </div>
            )}

            {/* Quantidade e Ação */}
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-[11px] font-normal text-slate-400 mb-1 ml-1">Quantidade</label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg py-3 px-4 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-primary/20 transition-all text-sm font-normal"
                />
              </div>
              <div className="col-span-2 flex items-end">
                <Button
                  type="button"
                  onClick={handleAddItem}
                  disabled={!selectedProduct}
                  className="h-12 px-6 rounded-xl bg-primary text-white font-normal shadow-md disabled:opacity-40 flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-xl leading-none shrink-0">add</span>
                  <span>Adicionar Item</span>
                </Button>
              </div>
            </div>
          </section>

          {/* ─── Seção: Itens Adicionados ─── */}
          {items.length > 0 && (
            <section className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="mb-6">
                <h3 className="text-sm font-normal uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">list_alt</span>
                  Itens do Orçamento ({items.length})
                </h3>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => {
                  const prod = products.find((p) => p.id === item.productId);
                  return (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl group">
                      <div className="flex items-center gap-4 flex-1">
                        <span className="material-symbols-outlined text-primary">inventory_2</span>
                        <div>
                          <p className="text-sm font-normal text-slate-900 dark:text-white">
                            {prod?.name || item.description}
                          </p>
                          <p className="text-[10px] text-slate-400 font-normal">
                            {item.quantity} × {formatCurrency(item.unitPrice)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-sm font-normal text-slate-900 dark:text-white">
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </p>
                        <button
                          type="button"
                          className="text-slate-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                          onClick={() => handleRemoveItem(index)}
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ─── Seção: Observações ─── */}
          <section className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="mb-6">
              <h3 className="text-sm font-normal uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">edit_note</span>
                Observações
              </h3>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Informações adicionais para o cliente..."
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg py-3 px-4 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-primary/20 transition-all text-sm font-normal resize-none"
            />
          </section>
        </div>

        {/* Right Column (Sticky Summary) */}
        <div className="col-span-12 lg:col-span-4">
          <div className="sticky top-24 space-y-6">
            {/* Resumo do Pedido */}
            <section className="bg-white dark:bg-slate-900 rounded-xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800">
              <div className="bg-primary p-6 text-white">
                <h3 className="text-sm font-normal uppercase tracking-widest opacity-80 mb-1">Resumo do Pedido</h3>
                <p className="text-2xl font-light tracking-tight">{formatCurrency(total)}</p>
              </div>

              <div className="p-6 space-y-6">
                {/* Itens */}
                {items.length > 0 ? (
                  <div className="space-y-4">
                    {items.map((item, index) => {
                      const prod = products.find((p) => p.id === item.productId);
                      return (
                        <div key={index} className="flex justify-between items-start">
                          <div className="max-w-[70%]">
                            <p className="text-sm font-normal text-slate-900 dark:text-white leading-tight">
                              {item.quantity} {prod?.name}
                            </p>
                            {prod?.category && (
                              <p className="text-[11px] text-slate-400 font-normal mt-1">{prod.category.name}</p>
                            )}
                          </div>
                          <p className="text-sm font-normal text-slate-900 dark:text-white">
                            {formatCurrency(item.quantity * item.unitPrice)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <span className="material-symbols-outlined text-3xl text-slate-200 mb-2">shopping_cart</span>
                    <p className="text-xs text-slate-400 font-normal">Adicione itens ao orçamento</p>
                  </div>
                )}

                <div className="h-[1px] bg-slate-100 dark:bg-slate-800" />

                {/* Totais */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400 font-normal">Subtotal</span>
                    <span className="font-normal text-slate-700 dark:text-slate-300">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400 font-normal">Desconto</span>
                    <span className="font-normal text-slate-400">{formatCurrency(totalDiscount)}</span>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-end mb-3">
                    <div>
                      <p className="text-[11px] font-normal uppercase tracking-wider text-slate-400">Total Estimado</p>
                      <p className="text-3xl font-light text-slate-900 dark:text-white tracking-tighter">{formatCurrency(total)}</p>
                    </div>
                  </div>

                  {/* Validade */}
                  <div className="mb-6">
                    <label className="block text-[11px] font-normal text-slate-400 mb-1">Validade (dias)</label>
                    <select
                      value={validDays}
                      onChange={(e) => setValidDays(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg py-2 px-3 text-sm font-normal appearance-none"
                    >
                      <option value={7}>7 dias</option>
                      <option value={15}>15 dias</option>
                      <option value={30}>30 dias</option>
                      <option value={60}>60 dias</option>
                    </select>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <Button
                      type="button"
                      className="w-full py-4 h-auto bg-primary text-white rounded-lg font-normal flex items-center justify-center gap-2 whitespace-nowrap hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:grayscale disabled:opacity-50"
                      disabled={isPending || !selectedCustomer || items.length === 0}
                      onClick={() => handleSubmit(false)}
                    >
                      {isPending ? (
                        <>
                          <LoadingSpinner className="w-4 h-4 text-white shrink-0" />
                          <span>Gerando...</span>
                        </>
                      ) : (
                        <>
                          <span>Gerar Pedido de Venda</span>
                          <span className="material-symbols-outlined text-xl leading-none shrink-0">arrow_forward</span>
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full py-3 h-auto bg-slate-50 dark:bg-slate-800 border-none text-primary rounded-lg font-normal flex items-center justify-center gap-2 whitespace-nowrap hover:bg-slate-100 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
                      disabled={isPending || !selectedCustomer || items.length === 0}
                      onClick={() => handleSubmit(true)}
                    >
                      {isPending ? <span>Salvando...</span> : (
                        <>
                          <span>Salvar como Orçamento</span>
                          <span className="material-symbols-outlined text-xl leading-none shrink-0">save</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            {/* Card de ajuda */}
            <div className="bg-blue-50/50 dark:bg-slate-800/30 p-6 rounded-xl border border-blue-100/50 dark:border-slate-700">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-blue-400 text-2xl">info</span>
                <div>
                  <p className="text-xs font-normal text-slate-600 dark:text-slate-300 mb-1 uppercase tracking-wider">
                    Dica
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
                    Após salvar, você pode enviar o orçamento ao cliente e convertê-lo em pedido quando for aceito.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
