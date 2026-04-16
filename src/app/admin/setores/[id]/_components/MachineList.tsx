'use client';

import { MachineCard } from './MachineCard';

interface MachineListProps {
  initialMachines: any[];
  sectorId: string;
}

export function MachineList({ initialMachines, sectorId }: MachineListProps) {
  if (initialMachines.length === 0) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center text-slate-400 space-y-4 bg-white/50 dark:bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
        <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
           <span className="material-symbols-outlined text-3xl opacity-20">precision_manufacturing</span>
        </div>
        <div>
           <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Nenhum equipamento cadastrado</p>
           <p className="text-xs text-slate-400">Adicione máquinas para começar a monitorar a produtividade deste setor.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {initialMachines.map((machine) => (
        <MachineCard key={machine.id} machine={machine} sectorId={sectorId} />
      ))}
    </div>
  );
}
