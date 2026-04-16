'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ViewDialog } from '@/components/ui/dialog-system';
import { MachineForm } from '@/components/admin/MachineForm';

interface AddMachineButtonProps {
  sectorId: string;
}

export function AddMachineButton({ sectorId }: AddMachineButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        className="rounded-2xl h-12 px-6 shadow-xl shadow-primary/20 font-bold group"
      >
        <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
        Novo Equipamento
      </Button>

      <ViewDialog 
        open={open} 
        onOpenChange={setOpen} 
        title="Cadastrar Equipamento Industrial"
      >
        <MachineForm sectorId={sectorId} />
      </ViewDialog>
    </>
  );
}
