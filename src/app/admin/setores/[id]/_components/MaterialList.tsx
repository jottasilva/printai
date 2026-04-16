'use client';

import { MaterialCard } from './MaterialCard';
import { Layers } from 'lucide-react';

interface MaterialListProps {
  materials: any[];
  sectorId: string;
}

export function MaterialList({ materials, sectorId }: MaterialListProps) {
  if (materials.length === 0) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center text-slate-400 space-y-4 bg-white/50 dark:bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
        <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
           <Layers className="w-8 h-8 opacity-20" />
        </div>
        <div>
           <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Nenhum insumo vinculado</p>
           <p className="text-xs text-slate-400">Vincule produtos a este setor para gerenciar o estoque crítico e o consumo local.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {materials.map((item) => (
        <MaterialCard key={item.id} item={item} sectorId={sectorId} />
      ))}
    </div>
  );
}
