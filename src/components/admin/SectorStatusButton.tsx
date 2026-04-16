'use client';

import { useState, useTransition } from 'react';
import { toggleSectorStatus } from '@/app/actions/sectors-pro';
import { Button } from '@/components/ui/button';
import { Power, PowerOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface SectorStatusButtonProps {
  sectorId: string;
  currentStatus: string;
}

export function SectorStatusButton({ sectorId, currentStatus }: SectorStatusButtonProps) {
  const [isPending, startTransition] = useTransition();
  const isPaused = currentStatus === 'PAUSED';

  function handleToggle() {
    startTransition(async () => {
      try {
        const newStatus = await toggleSectorStatus(sectorId);
        toast.success(newStatus === 'PAUSED' ? 'Setor pausado com sucesso' : 'Setor retomado com sucesso');
      } catch (error) {
        toast.error('Erro ao alterar status do setor');
      }
    });
  }

  return (
    <Button
      variant={isPaused ? "default" : "destructive"}
      className={`rounded-xl h-11 px-6 font-bold shadow-sm transition-all active:scale-95 ${
        isPaused 
          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200' 
          : 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200'
      }`}
      onClick={handleToggle}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : isPaused ? (
        <Power className="w-4 h-4 mr-2" />
      ) : (
        <PowerOff className="w-4 h-4 mr-2" />
      )}
      {isPaused ? 'Retomar Produção' : 'Parar Setor'}
    </Button>
  );
}
