'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Cpu, 
  MoreHorizontal, 
  Activity, 
  Settings2, 
  Trash2, 
  Edit2,
  Users,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { deleteMachine } from '@/app/actions/machines';
import { useToast } from '@/components/ui/toast';
import { useState } from 'react';
import { ViewDialog, ConfirmDialog } from '@/components/ui/dialog-system';
import { MachineForm } from '@/components/admin/MachineForm';
import { cn } from '@/lib/utils';
import { OperatorManager } from './OperatorManager';

interface MachineCardProps {
  machine: any;
  sectorId: string;
}

export function MachineCard({ machine, sectorId }: MachineCardProps) {
  const [loading, setLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isOperatorsOpen, setIsOperatorsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const toast = useToast();

  const statusColors: any = {
    OPERATIONAL: 'bg-emerald-500',
    DOWN: 'bg-red-500',
    MAINTENANCE: 'bg-amber-500'
  };

  const statusLabels: any = {
    OPERATIONAL: 'Operacional',
    DOWN: 'Inoperante',
    MAINTENANCE: 'Manutenção'
  };

  function handleDelete() {
    setIsConfirmOpen(true);
  }

  async function confirmDelete() {
    setIsConfirmOpen(false);
    setLoading(true);
    try {
      await deleteMachine(machine.id, sectorId);
      toast.success("Máquina removida", "Equipamento excluído permanentemente.");
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
              machine.status === 'OPERATIONAL' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
            )}>
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                 <div className={cn("w-2 h-2 rounded-full", statusColors[machine.status])} />
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {statusLabels[machine.status]}
                 </span>
              </div>
              <h4 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">{machine.name}</h4>
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
            
            <ViewDialog 
              open={isEditOpen} 
              onOpenChange={setIsEditOpen} 
              title="Editar Equipamento"
              size="md"
            >
              <MachineForm sectorId={sectorId} initialData={machine} />
            </ViewDialog>

            <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-slate-300 hover:text-red-500 rounded-lg"
                onClick={handleDelete}
                disabled={loading}
              >
                <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400">
               <Activity className="w-3.5 h-3.5" />
               <span className="text-[9px] font-bold uppercase tracking-widest">Capacidade</span>
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{machine.capacityPerHour} <span className="text-[10px] font-normal text-slate-500 italic">u/h</span></p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-1">
             <div className="flex items-center gap-1.5 text-slate-400">
               <Settings2 className="w-3.5 h-3.5" />
               <span className="text-[9px] font-bold uppercase tracking-widest">Tempo Total</span>
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{Math.round(machine.totalUsageMinutes / 60)} <span className="text-[10px] font-normal text-slate-500 italic">horas</span></p>
          </div>
        </div>

        {/* Operadores */}
        <div className="space-y-3 pt-2">
           <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                 <Users className="w-3.5 h-3.5" />
                 Operadores Autorizados
              </span>
              <button 
                onClick={() => setIsOperatorsOpen(true)}
                className="text-[10px] font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full hover:bg-primary/20 transition-colors"
              >
                {machine.assignedUsers?.length || 0}
              </button>
              
              <ViewDialog 
                open={isOperatorsOpen} 
                onOpenChange={setIsOperatorsOpen} 
                title={`Operadores: ${machine.name}`}
              >
                <OperatorManager machineId={machine.id} assignedUsers={machine.assignedUsers || []} />
              </ViewDialog>
           </div>
           
           <div className="flex -space-x-2 overflow-hidden">
              {machine.assignedUsers?.map((au: any) => (
                <div 
                  key={au.id}
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-600"
                  title={au.user.name}
                >
                  {au.user.name.charAt(0)}
                </div>
              ))}
              {(!machine.assignedUsers || machine.assignedUsers.length === 0) && (
                <p className="text-[10px] text-slate-400 italic">Nenhum operador vinculado</p>
              )}
           </div>
        </div>
      </div>

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onConfirm={confirmDelete}
        title="Remover Equipamento"
        description={`Deseja realmente remover a máquina ${machine.name}? Esta ação é irreversível.`}
        variant="destructive"
        confirmText="Remover"
        cancelText="Cancelar"
        loading={loading}
      />
    </Card>
  );
}
