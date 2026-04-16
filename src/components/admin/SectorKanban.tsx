'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { SectorCard } from './SectorCard';
import { reorderSectors } from '@/app/actions/sectors';
import { useToast } from '@/components/ui/toast';

interface SectorKanbanProps {
  initialSectors: any[];
  onEdit: (sector: any) => void;
  onDelete: (id: string, name: string) => void;
  deletingId: string | null;
}

export function SectorKanban({ initialSectors, onEdit, onDelete, deletingId }: SectorKanbanProps) {
  const [sectors, setSectors] = useState(initialSectors);
  const toast = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSectors((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Chamar action para persistir ordem
        const ids = newItems.map(item => item.id);
        reorderSectors(ids).catch(err => {
          toast.error("Erro na reordenação", "Não foi possível salvar a nova ordem dos setores.");
          setSectors(items); // Reverter em caso de erro
        });

        return newItems;
      });
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={sectors} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {sectors.map((sector) => (
            <SectorCard
              key={sector.id}
              sector={sector}
              onEdit={onEdit}
              onDelete={onDelete}
              isDeleting={deletingId === sector.id}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
