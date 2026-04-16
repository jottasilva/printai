'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { MachineFormData, upsertMachine } from '@/app/actions/machines';
import { useToast } from '@/components/ui/toast';
import { useState } from 'react';
import { Loader2, Save } from 'lucide-react';

const schema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Nome da máquina é obrigatório'),
  sectorId: z.string().min(1, 'Setor é obrigatório'),
  description: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  serialNumber: z.string().optional().nullable(),
  status: z.enum(['OPERATIONAL', 'DOWN', 'MAINTENANCE']).default('OPERATIONAL'),
  capacityPerHour: z.coerce.number().min(0, 'Capacidade deve ser positiva'),
});

interface MachineFormProps {
  sectorId: string;
  initialData?: Partial<MachineFormData>;
  onSuccess?: () => void;
}

export function MachineForm({ sectorId, initialData, onSuccess }: MachineFormProps) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<MachineFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      sectorId,
      status: 'OPERATIONAL',
      ...initialData
    }
  });

  const onSubmit = async (data: MachineFormData) => {
    setLoading(true);
    try {
      await upsertMachine(data);
      toast.success(
        data.id ? "Máquina atualizada" : "Máquina cadastrada",
        `O equipamento ${data.name} foi salvo com sucesso.`
      );
      if (!data.id) reset();
      onSuccess?.();
    } catch (error: any) {
      toast.error("Erro ao salvar máquina", error.message);
    } finally {
      setLoading(false);
    }
  };

  const status = watch('status');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-500">Nome do Equipamento</Label>
          <Input 
            {...register('name')} 
            placeholder="Ex: Impressora Epson F570" 
            className="rounded-xl border-slate-100 focus:ring-primary shadow-sm"
          />
          {errors.name && <p className="text-[10px] text-red-500 font-bold">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status" className="text-xs font-bold uppercase tracking-wider text-slate-500">Status Inicial</Label>
          <Select 
            value={status} 
            onChange={(e) => setValue('status', e.target.value as any)}
            options={[
              { value: 'OPERATIONAL', label: 'Operacional' },
              { value: 'DOWN', label: 'Parada (Quebrada)' },
              { value: 'MAINTENANCE', label: 'Em Manutenção' }
            ]}
            className="rounded-xl border-slate-100 shadow-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="model" className="text-xs font-bold uppercase tracking-wider text-slate-500">Modelo / Marca</Label>
          <Input 
            {...register('model')} 
            placeholder="Ex: SureColor F-Series" 
            className="rounded-xl border-slate-100 shadow-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="serialNumber" className="text-xs font-bold uppercase tracking-wider text-slate-500">Número de Série</Label>
          <Input 
            {...register('serialNumber')} 
            placeholder="SN-XXXX-XXXX" 
            className="rounded-xl border-slate-100 shadow-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="capacityPerHour" className="text-xs font-bold uppercase tracking-wider text-slate-500">Capacidade (unidade/hora)</Label>
          <Input 
            type="number" 
            {...register('capacityPerHour')} 
            placeholder="0.00" 
            className="rounded-xl border-slate-100 shadow-sm"
          />
          {errors.capacityPerHour && <p className="text-[10px] text-red-500 font-bold">{errors.capacityPerHour.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-slate-500">Orientações de Uso</Label>
        <Textarea 
          {...register('description')} 
          placeholder="Descreva particularidades, cuidados ou especificações do equipamento..." 
          className="rounded-2xl border-slate-100 shadow-sm min-h-[100px]"
        />
      </div>

      <div className="pt-4 flex justify-end">
        <Button 
          type="submit" 
          disabled={loading}
          className="rounded-xl px-8 h-12 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all font-bold group"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
          )}
          {initialData?.id ? "Salvar Alterações" : "Cadastrar Máquina"}
        </Button>
      </div>
    </form>
  );
}
