'use client'

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, X, Plus, Minus, Package, ArrowRight } from 'lucide-react';
import { createSupplyRequest } from '@/app/actions/supply-requests';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

interface Sector {
  id: string;
  name: string;
}

export function SupplyCart({ 
  sectorId: initialSectorId, 
  availableProducts, 
  sectors = [] 
}: { 
  sectorId?: string, 
  availableProducts: any[],
  sectors?: Sector[]
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSectorId, setSelectedSectorId] = useState(initialSectorId || '');
  const [priority, setPriority] = useState('NORMAL');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredProducts = availableProducts.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: any) => {
    setItems(current => {
      const existing = current.find(i => i.id === product.id);
      if (existing) {
        return current.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...current, { id: product.id, name: product.name, quantity: 1, unit: product.unit }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems(current => current.map(i => {
      if (i.id === id) {
        const newQty = Math.max(0.1, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }).filter(i => i.quantity > 0));
  };

  const handleSubmit = async () => {
    if (!selectedSectorId) {
      toast.error('Selecione um setor de destino');
      return;
    }

    if (items.length === 0) {
      toast.error('Adicione itens ao carrinho');
      return;
    }

    setIsSubmitting(true);
    try {
      await createSupplyRequest({
        sectorId: selectedSectorId,
        priority,
        notes,
        items: items.map(i => ({ productId: i.id, quantity: i.quantity }))
      });
      toast.success('Requisição enviada!', 'O almoxarifado foi notificado.');
      setItems([]);
      setIsOpen(false);
      setNotes('');
    } catch (error) {
      toast.error('Falha na requisição local');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-2xl z-50 animate-bounce"
        size="icon"
      >
        <ShoppingCart className="h-6 w-6" />
        {items.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] h-5 w-5 rounded-full flex items-center justify-center font-bold">
            {items.length}
          </span>
        )}
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex justify-end">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Carrinho Operacional</h2>
              <p className="text-xs text-slate-500">Requisição Global de Insumos</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4 border-b">
          <Input 
            placeholder="Buscar insumos (Nome ou SKU)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-xl"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Configuração da Requisição */}
          <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800/20 rounded-[1.5rem] border border-slate-100 dark:border-slate-800">
             <div className="space-y-1.5 ">
                <p className="text-[10px] font-bold text-slate-400 uppercase ml-1">Destino da Carga</p>
                <select 
                  className="w-full h-11 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 ring-primary/20 outline-none"
                  value={selectedSectorId}
                  onChange={(e) => setSelectedSectorId(e.target.value)}
                >
                  <option value="">Selecione o Setor...</option>
                  {sectors.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
             </div>

             <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase ml-1">Urgência</p>
                  <select 
                    className="w-full h-11 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="LOW">BAIXA</option>
                    <option value="NORMAL">NORMAL</option>
                    <option value="URGENT">URGENTE</option>
                    <option value="CRITICAL">CRÍTICA (STOP)</option>
                  </select>
                </div>
                <div className="space-y-1.5 flex flex-col justify-end">
                  <p className="text-[10px] font-bold text-slate-400 uppercase ml-1">Limites</p>
                  <div className="h-11 flex items-center px-4 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-[10px] text-slate-400 font-bold uppercase">
                     Sem Restrição
                  </div>
                </div>
             </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between ml-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase ">Itens no Carrinho ({items.length})</p>
              {items.length > 0 && (
                <button onClick={() => setItems([])} className="text-[10px] font-bold text-red-500 uppercase hover:underline">Limpar</button>
              )}
            </div>
            
            {items.map(item => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:border-primary/20 transition-all">
                <div className="flex-1">
                  <p className="text-sm font-bold">{item.name}</p>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{item.unit}</p>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-1 rounded-xl border border-slate-100 dark:border-slate-800">
                  <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-white dark:hover:bg-slate-800" onClick={() => updateQuantity(item.id, -1)}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="text-sm font-bold min-w-[2rem] text-center">{item.quantity}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-white dark:hover:bg-slate-800" onClick={() => updateQuantity(item.id, 1)}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            
            {items.length === 0 && (
              <div className="h-40 flex flex-col items-center justify-center text-slate-400 opacity-50 bg-slate-50/50 dark:bg-slate-800/10 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                <Package className="h-8 w-8 mb-2 stroke-1" />
                <p className="text-xs font-bold uppercase tracking-widest">Carrinho Vazio</p>
              </div>
            )}
          </div>

          <div className="space-y-1.5 ml-1 pt-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Observações do Operador</p>
              <textarea 
                className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm min-h-[100px] outline-none focus:ring-2 ring-primary/20 transition-all"
                placeholder="Ex: Entregar com urgência na máquina 02, insumo acabando..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
          </div>
        </div>

        <div className="p-6 border-t bg-slate-50 dark:bg-slate-800/50">
          <Button 
            className="w-full h-14 rounded-2xl font-bold shadow-xl shadow-primary/20 flex items-center justify-center gap-3 transition-transform active:scale-[0.98]" 
            disabled={items.length === 0 || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Enviando...
              </span>
            ) : (
              <>
                Finalizar Requisição Industrial
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
