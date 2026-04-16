'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, GrialIcon as DragHandle, Cpu, Users } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface SectorCardProps {
  sector: any;
  onEdit: (sector: any) => void;
  onDelete: (id: string, name: string) => void;
  isDeleting: boolean;
}

export function SectorCard({ sector, onEdit, onDelete, isDeleting }: SectorCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: sector.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const IconComponent = (LucideIcons as any)[sector.icon || 'Layers'] || LucideIcons.Layers;

  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging && "z-50 opacity-50")}>
      <Card 
        className={cn(
          "border-none shadow-[0_8px_30px_rgba(0,0,0,0.02)] bg-white dark:bg-slate-900 rounded-[2rem] group hover:shadow-xl transition-all overflow-hidden border border-transparent hover:border-primary/10",
          isDeleting && "opacity-50 pointer-events-none"
        )}
      >
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
               {/* Drag Handle */}
              <div 
                {...attributes} 
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 text-slate-300 hover:text-slate-500 transition-colors"
              >
                <LucideIcons.GripVertical className="w-4 h-4" />
              </div>

              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm"
                style={{ backgroundColor: `${sector.color || '#7C3AED'}15`, color: sector.color || '#7C3AED' }}
              >
                <IconComponent className="w-6 h-6" />
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-lg text-slate-300 hover:text-primary transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(sector);
                }}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-lg text-slate-300 hover:text-red-500 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(sector.id, sector.name);
                }}
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Link href={`/admin/setores/${sector.id}`} className="block group/link">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border-none px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                Ordem: {sector.kanbanOrder}
              </Badge>
              <Badge className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-none px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                ATIVO
              </Badge>
            </div>
            
            <h4 className="font-bold text-lg text-slate-900 dark:text-white leading-tight group-hover/link:text-primary transition-colors flex items-center gap-2">
              {sector.name}
              <LucideIcons.ArrowUpRight className="w-4 h-4 opacity-0 -translate-y-1 translate-x-1 group-hover/link:opacity-100 group-hover/link:translate-y-0 group-hover/link:translate-x-0 transition-all" />
            </h4>
            
            <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
              {sector.description || 'Nenhuma diretriz operacional configurada.'}
            </p>

            <div className="flex items-center gap-4 mt-6 pt-4 border-t border-slate-50 dark:border-slate-800">
               <div className="flex items-center gap-1.5 text-slate-400">
                  <Cpu className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{sector._count?.machines || 0} Máquinas</span>
               </div>
               <div className="flex items-center gap-1.5 text-slate-400">
                  <Users className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{sector._count?.users || 0} Operadores</span>
               </div>
            </div>
          </Link>
        </div>
      </Card>
    </div>
  );
}
