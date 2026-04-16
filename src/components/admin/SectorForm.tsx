'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  LayoutGrid, 
  Loader2, 
  Scissors, 
  Printer, 
  Package, 
  Truck, 
  Settings, 
  PenTool, 
  Hash, 
  HardDrive,
  MousePointer2,
  Layers,
  Palette
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import { createSector, updateSector } from '@/app/actions/sectors';
import { useToast } from '@/components/ui/toast';

interface SectorFormProps {
  initialData?: {
    id: string;
    name: string;
    description: string | null;
    kanbanOrder: number;
    color?: string | null;
    icon?: string | null;
  };
  onSuccess?: () => void;
}

const AVAILABLE_ICONS = [
  { name: 'LayoutGrid', icon: LayoutGrid },
  { name: 'Printer', icon: Printer },
  { name: 'Scissors', icon: Scissors },
  { name: 'PenTool', icon: PenTool },
  { name: 'Layers', icon: Layers },
  { name: 'Package', icon: Package },
  { name: 'Truck', icon: Truck },
  { name: 'Settings', icon: Settings },
  { name: 'Palette', icon: Palette },
  { name: 'HardDrive', icon: HardDrive },
];

export function SectorForm({ initialData, onSuccess }: SectorFormProps) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const [selectedIcon, setSelectedIcon] = useState<string>(initialData?.icon || 'LayoutGrid');
  const [selectedColor, setSelectedColor] = useState<string>(initialData?.color || '#7C3AED');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      kanbanOrder: parseInt(formData.get('kanbanOrder') as string) || 0,
      color: selectedColor,
      icon: selectedIcon,
    };

    try {
      if (initialData?.id) {
        await updateSector(initialData.id, data);
        toast.success("Setor atualizado!", `O setor ${data.name} foi modificado com sucesso.`);
      } else {
        await createSector(data);
        toast.success("Setor criado!", `O setor ${data.name} foi adicionado com sucesso.`);
        (event.target as HTMLFormElement).reset();
        setSelectedIcon('LayoutGrid');
        setSelectedColor('#7C3AED');
      }
      onSuccess?.();
    } catch (error: any) {
      toast.error("Erro na operação", error.message);
    } finally {
      setLoading(false);
    }
  }

  const SelectedIconComponent = (LucideIcons as any)[selectedIcon] || LayoutGrid;

  return (
    <Card className="border-none shadow-[0_10px_40px_rgba(0,0,0,0.04)] bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
      <CardHeader className="p-8 pb-4">
        <div 
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300"
          style={{ backgroundColor: `${selectedColor}15`, color: selectedColor }}
        >
          <SelectedIconComponent className="w-6 h-6" />
        </div>
        <CardTitle className="text-xl font-semibold text-[#2D3E50] dark:text-white">
          {initialData?.id ? 'Editar Departamento' : 'Industrializar Unidade'}
        </CardTitle>
        <CardDescription>
          {initialData?.id 
            ? 'Ajuste as configurações do departamento de produção' 
            : 'Configure um novo departamento de produção no fluxo da gráfica'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="p-8 pt-4 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-1">Identificação do Setor</label>
              <Input 
                name="name" 
                required 
                defaultValue={initialData?.name}
                placeholder="Ex: Impressão Offset" 
                className="rounded-xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 h-12" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-1">Sinalização (Cor)</label>
                  <div className="flex items-center gap-3 h-12 px-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                    <input 
                      type="color" 
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className="w-6 h-6 rounded-full border-none cursor-pointer bg-transparent"
                    />
                    <span className="text-[10px] font-mono text-slate-400 uppercase">{selectedColor}</span>
                  </div>
              </div>
              <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-1">Ordem Kanban</label>
                  <Input 
                    name="kanbanOrder" 
                    type="number" 
                    defaultValue={initialData?.kanbanOrder ?? "0"} 
                    className="rounded-xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 h-12" 
                  />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-1">Identidade Visual (Ícone)</label>
              <div className="grid grid-cols-5 gap-2 p-2 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                {AVAILABLE_ICONS.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setSelectedIcon(item.name)}
                    className={cn(
                      "flex items-center justify-center h-10 w-full rounded-xl transition-all",
                      selectedIcon === item.name 
                        ? "bg-white dark:bg-slate-800 shadow-sm text-primary scale-110" 
                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-1">Diretrizes Operacionais</label>
              <Textarea 
                name="description" 
                defaultValue={initialData?.description || ''}
                placeholder="Descreva as responsabilidades deste setor..." 
                className="rounded-xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 min-h-[100px]" 
              />
            </div>
          </div>

          <Button 
            disabled={loading}
            type="submit"
            className="w-full rounded-2xl bg-[#2D3E50] dark:bg-primary hover:bg-[#1a2530] text-white h-14 font-semibold text-sm shadow-xl shadow-slate-200 dark:shadow-none transition-all"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : initialData?.id ? 'Salvar Alterações Industriais' : 'Registrar Setor Industrial'}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}
