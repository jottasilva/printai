'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import { getProducts } from '@/app/actions/products';
import { addSectorMaterial } from '@/app/actions/sector-materials';
import { Search, Package, Plus } from 'lucide-react';

interface AddMaterialFormProps {
  sectorId: string;
  onSuccess: () => void;
}

export function AddMaterialForm({ sectorId, onSuccess }: AddMaterialFormProps) {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [minQuantity, setMinQuantity] = useState(0);
  const toast = useToast();

  useEffect(() => {
    async function loadProducts() {
      if (search.length > 2) {
        const results = await getProducts(search);
        setProducts(results);
      } else if (search.length === 0) {
        const results = await getProducts();
        setProducts(results.slice(0, 5));
      }
    }
    loadProducts();
  }, [search]);

  async function handleSubmit() {
    if (!selectedProductId) {
      toast.error("Seleção obrigatória", "Selecione um produto para vincular.");
      return;
    }

    setLoading(true);
    try {
      await addSectorMaterial({
        sectorId,
        productId: selectedProductId,
        minQuantity: Number(minQuantity)
      });
      toast.success("Insumo vinculado", "Material adicionado ao monitoramento do setor.");
      onSuccess();
    } catch (e: any) {
      toast.error("Erro ao vincular", "Este produto já pode estar vinculado a este setor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Buscar Produto / Insumo</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Digite o nome ou SKU..."
              className="pl-10 bg-slate-50 dark:bg-slate-800 border-none rounded-xl h-11"
            />
          </div>
        </div>

        <div className="space-y-3 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
          {products.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProductId(p.id)}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left",
                selectedProductId === p.id 
                  ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10" 
                  : "border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm">
                  <Package className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{p.name}</p>
                  <p className="text-[10px] text-slate-400 uppercase">SKU: {p.sku}</p>
                </div>
              </div>
              {selectedProductId === p.id && <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />}
            </button>
          ))}
          {products.length === 0 && search.length > 2 && (
            <p className="text-center py-4 text-xs text-slate-400 italic">Nenhum produto encontrado.</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Estoque Mínimo de Alerta</Label>
          <Input 
            type="number"
            value={minQuantity}
            onChange={(e) => setMinQuantity(Number(e.target.value))}
            placeholder="Ex: 50"
            className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl h-11"
          />
        </div>
      </div>

      <Button 
        className="w-full h-12 rounded-xl font-bold bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-500/20 gap-2"
        onClick={handleSubmit}
        disabled={loading || !selectedProductId}
      >
        <Plus className="w-4 h-4" />
        {loading ? 'Processando...' : 'Vincular Insumo ao Setor'}
      </Button>
    </div>
  );
}

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
