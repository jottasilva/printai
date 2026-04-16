'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { SectorDrawer } from './SectorDrawer';

export function NewSectorButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="rounded-2xl h-12 px-6 font-bold shadow-xl shadow-primary/20 gap-2"
      >
        <Plus className="w-4 h-4" />
        Novo Setor
      </Button>

      <SectorDrawer open={open} onOpenChange={setOpen} />
    </>
  );
}
