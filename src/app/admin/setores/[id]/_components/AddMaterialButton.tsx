'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Layers } from 'lucide-react';
import { ViewDialog } from '@/components/ui/dialog-system';
import { AddMaterialForm } from './AddMaterialForm';

interface AddMaterialButtonProps {
  sectorId: string;
}

export function AddMaterialButton({ sectorId }: AddMaterialButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        className="h-11 px-6 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-none shadow-sm hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-bold gap-2 text-xs uppercase tracking-widest"
      >
        <Layers className="w-4 h-4 text-indigo-500" />
        Vincular Insumo
      </Button>

      <ViewDialog 
        open={open} 
        onOpenChange={setOpen} 
        title="Vincular Novo Insumo"
        size="md"
      >
        <AddMaterialForm sectorId={sectorId} onSuccess={() => setOpen(false)} />
      </ViewDialog>
    </>
  );
}
