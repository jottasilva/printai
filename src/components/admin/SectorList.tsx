'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Edit2, Layers, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { deleteSector } from '@/app/actions/sectors';
import { useToast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/ui/dialog-system';
import { SectorDrawer } from './SectorDrawer';
import { SectorKanban } from './SectorKanban';

interface Sector {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  kanbanOrder: number;
}

interface SectorListProps {
  sectors: Sector[];
}

export function SectorList({ sectors }: SectorListProps) {
  const toast = useToast();
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sectorToDelete, setSectorToDelete] = useState<{ id: string; name: string } | null>(null);

  function handleDelete(id: string, name: string) {
    setSectorToDelete({ id, name });
    setIsDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    if (!sectorToDelete) return;
    setIsDeleteDialogOpen(false);
    setDeletingId(sectorToDelete.id);
    try {
      await deleteSector(sectorToDelete.id);
      toast.success('Setor removido', `O setor ${sectorToDelete.name} foi excluído com sucesso.`);
      router.refresh();
    } catch (error: any) {
      toast.error('Erro ao remover setor', error.message);
    } finally {
      setDeletingId(null);
      setSectorToDelete(null);
    }
  }

  return (
    <div className="space-y-6">
      <SectorKanban
        initialSectors={sectors}
        onEdit={setEditingSector}
        onDelete={handleDelete}
        deletingId={deletingId}
      />

      {sectors.length === 0 && (
        <div className="col-span-full py-20 text-center flex flex-col items-center justify-center text-slate-400 space-y-3 bg-slate-50/50 dark:bg-slate-900/50 rounded-[2.5rem]">
          <span className="material-symbols-outlined text-4xl opacity-20">domain_disabled</span>
          <p className="text-sm italic">Nenhum setor industrial configurado.</p>
        </div>
      )}

      {/* Drawer de Edição — substitui o ViewDialog anterior */}
      <SectorDrawer
        open={!!editingSector}
        onOpenChange={(open) => {
          if (!open) setEditingSector(null);
        }}
        editData={editingSector}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Excluir Setor Industrial"
        description={`Deseja realmente excluir o setor ${sectorToDelete?.name}? Essa ação pode afetar usuários e máquinas vinculados a este setor.`}
        variant="destructive"
        confirmText="Excluir Setor"
        cancelText="Manter Setor"
        loading={!!deletingId}
      />
    </div>
  );
}
