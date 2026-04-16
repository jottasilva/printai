'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Layers, 
  Trash2, 
  Edit2,
  AlertTriangle,
  Package,
  ArrowDownIcon
} from 'lucide-react';
import { removeSectorMaterial, updateSectorMaterial } from '@/app/actions/sector-materials';
import { useToast } from '@/components/ui/toast';
import { useState } from 'react';
import { ViewDialog, ConfirmDialog } from '@/components/ui/dialog-system';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface MaterialCardProps {
  item: any;
  sectorId: string;
}

export function MaterialCard({ item, sectorId }: MaterialCardProps) {
  const [loading, setLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [minQuantity, setMinQuantity] = useState(Number(item.minQuantity));
  const toast = useToast();

  const currentInventory = item.product.inventory?.reduce((acc: number, inv: any) => acc + Number(inv.availableQuantity), 0) || 0;
  const isCritical = currentInventory <= Number(item.minQuantity);

  async function handleUpdate() {
    setLoading(true);
    try {
      await updateSectorMaterial(item.id, sectorId, { minQuantity });
      setIsEditOpen(false);
      toast.success("Insumo atualizado", "Quantidade mínima atualizada com sucesso.");
    } catch (e: any) {
      toast.error("Erro ao atualizar", e.message);
    } finally {
      setLoading(false);
    }
  }

  async function confirmDelete() {
    setIsConfirmOpen(false);
    setLoading(true);
    try {
      await removeSectorMaterial(item.id, sectorId);
      toast.success("Insumo removido", "Vínculo de material removido deste setor.");
    } catch (e: any) {
      toast.error("Erro ao remover", e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-none shadow-[0_8px_30px_rgba(0,0,0,0.02)] bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden group hover:shadow-xl transition-all">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex gap-4">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg",
              isCritical ? "bg-amber-500/10 text-amber-500" : "bg-indigo-500/10 text-indigo-500"
            )}>
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                 <div className={cn("w-2 h-2 rounded-full", isCritical ? "bg-amber-500 animate-pulse" : "bg-indigo-500")} />
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {isCritical ? 'Estoque Crítico' : 'Estoque Regular'}
                 </span>
              </div>
              <h4 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">{item.product.name}</h4>
              <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase">SKU: {item.product.sku}</p>
            </div>
          </div>

          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-slate-300 hover:text-primary rounded-lg"
              onClick={() => setIsEditOpen(true)}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            
            <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-slate-300 hover:text-red-500 rounded-lg"
                onClick={() => setIsConfirmOpen(true)}
                disabled={loading}
              >
                <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Inventory Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-1 border border-transparent group-hover:border-slate-100 dark:group-hover:border-slate-800 transition-colors">
            <div className="flex items-center gap-1.5 text-slate-400">
               <Layers className="w-3.5 h-3.5" />
               <span className="text-[9px] font-bold uppercase tracking-widest">Disponível</span>
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white">
              {currentInventory} 
              <span className="text-[10px] font-normal text-slate-500 italic ml-1">{item.product.unit}</span>
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-1 border border-transparent group-hover:border-slate-100 dark:group-hover:border-slate-800 transition-colors">
             <div className="flex items-center gap-1.5 text-slate-400">
               <ArrowDownIcon className="w-3.5 h-3.5" />
               <span className="text-[9px] font-bold uppercase tracking-widest">Estoque Mínimo</span>
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white">
              {item.minQuantity}
              <span className="text-[10px] font-normal text-slate-500 italic ml-1">{item.product.unit}</span>
            </p>
          </div>
        </div>

        {isCritical && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-900/30">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <p className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-tight">Necessário solicitar reposição imediata</p>
          </div>
        )}
      </div>

      <ViewDialog 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen} 
        title="Editar Quantidade Mínima"
        size="sm"
      >
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="minQty" className="text-xs font-bold uppercase tracking-widest text-slate-400">Quantidade Mínima de Segurança</Label>
            <Input 
              id="minQty"
              type="number"
              value={minQuantity}
              onChange={(e) => setMinQuantity(Number(e.target.value))}
              placeholder="Ex: 10"
              className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl h-12 text-lg font-bold"
            />
            <p className="text-[10px] text-slate-400 leading-relaxed italic">
              Quando o estoque total cair abaixo deste valor, um alerta de anomalia será gerado para este setor.
            </p>
          </div>
          <Button 
            className="w-full h-12 rounded-xl font-bold bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-500/20"
            onClick={handleUpdate}
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Atualizar Insumo'}
          </Button>
        </div>
      </ViewDialog>

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onConfirm={confirmDelete}
        title="Remover Insumo do Setor"
        description={`Deseja realmente remover o vínculo de ${item.product.name} com o setor? O estoque não será alterado, apenas o monitoramento local será interrompido.`}
        variant="destructive"
        confirmText="Remover Vínculo"
        cancelText="Manter"
        loading={loading}
      />
    </Card>
  );
}
