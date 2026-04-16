'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Cpu, 
  CheckCircle2, 
  Play, 
  StopCircle, 
  Loader2,
  Clock
} from 'lucide-react';
import { startMachineUsage, stopMachineUsage } from '@/app/actions/machines';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

interface MachineSelectorProps {
  orderItemId: string;
  sectorMachines: any[];
  activeLog?: any; // Se já houver um uso em aberto
  onStatusChange?: () => void;
}

export function MachineSelector({ orderItemId, sectorMachines, activeLog, onStatusChange }: MachineSelectorProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [currentActiveLog, setCurrentActiveLog] = useState(activeLog);
  const toast = useToast();

  useEffect(() => {
    setCurrentActiveLog(activeLog);
  }, [activeLog]);

  const handleStart = async (machineId: string) => {
    setLoading(machineId);
    try {
      const result = await startMachineUsage(machineId, orderItemId);
      setCurrentActiveLog(result);
      toast.success("Produção iniciada", "Check-in na máquina realizado com sucesso.");
      onStatusChange?.();
    } catch (e: any) {
      toast.error("Erro no check-in", e.message);
    } finally {
      setLoading(null);
    }
  };

  const handleStop = async () => {
    if (!currentActiveLog) return;
    setLoading('stop');
    try {
      await stopMachineUsage(currentActiveLog.id);
      setCurrentActiveLog(null);
      toast.success("Produção pausada", "Check-out da máquina realizado.");
      onStatusChange?.();
    } catch (e: any) {
      toast.error("Erro no check-out", e.message);
    } finally {
      setLoading(null);
    }
  };

  if (currentActiveLog) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center animate-pulse">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">Em Operação</p>
            <h4 className="font-bold text-lg text-slate-800 dark:text-white leading-tight">
              {currentActiveLog.machine?.name || 'Equipamento'}
            </h4>
            <div className="flex items-center gap-2 mt-1">
               <Clock className="w-3.5 h-3.5 text-emerald-400" />
               <span className="text-xs text-slate-500 font-medium">Iniciado às {new Date(currentActiveLog.startTime).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        <Button 
          variant="destructive" 
          onClick={handleStop}
          disabled={loading === 'stop'}
          className="rounded-2xl h-14 px-8 font-black uppercase tracking-widest shadow-xl shadow-red-500/20 hover:scale-[1.02] transition-transform"
        >
          {loading === 'stop' ? <Loader2 className="w-5 h-5 animate-spin" /> : <StopCircle className="w-5 h-5 mr-2" />}
          Parar Produção / Check-out
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
        <Cpu className="w-4 h-4 text-primary" />
        Selecionar Equipamento para Trabalho
      </h3>
      
      {sectorMachines.length === 0 ? (
        <div className="bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl py-10 text-center">
           <p className="text-xs text-slate-400 font-bold uppercase">Nenhuma máquina operacional neste setor</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sectorMachines.map((machine) => (
            <button
              key={machine.id}
              onClick={() => handleStart(machine.id)}
              disabled={!!loading}
              className={cn(
                "group flex items-center gap-4 p-5 rounded-[1.5rem] border transition-all text-left",
                "bg-white hover:bg-slate-50 border-slate-100 hover:border-primary/20 hover:shadow-lg hover:shadow-slate-200/50",
                loading === machine.id && "ring-2 ring-primary ring-offset-2 opacity-70"
              )}
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-primary/10 text-slate-400 group-hover:text-primary flex items-center justify-center transition-colors">
                 {loading === machine.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
              </div>
              <div className="flex-1">
                <h5 className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">{machine.name}</h5>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Capacidade: {machine.capacityPerHour} u/h</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
