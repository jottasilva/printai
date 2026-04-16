'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Cpu, 
  Settings, 
  Package, 
  FileText, 
  Image as ImageIcon, 
  Plus, 
  Check, 
  X,
  Zap,
  Clock,
  Printer,
  ShieldCheck,
  ChevronRight,
  Save,
  Trash2,
  FileSearch,
  Factory,
  Monitor
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { upsertMachine } from '@/app/actions/machines';

const MachineSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  sectorId: z.string().min(1, 'Setor é obrigatório'),
  manufacturer: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  serialNumber: z.string().optional().nullable(),
  year: z.string().optional().nullable(),
  capacityPerHour: z.coerce.number().min(0).default(0),
  description: z.string().optional().nullable(),
  status: z.enum(['OPERATIONAL', 'DOWN', 'MAINTENANCE']).default('OPERATIONAL'),
});

type MachineFormValues = z.infer<typeof MachineSchema>;

interface MachineNewFormProps {
  sectors: any[];
  products: any[];
}

export function MachineNewForm({ sectors, products }: MachineNewFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedInsumos, setSelectedInsumos] = useState<string[]>([]);
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<MachineFormValues>({
    resolver: zodResolver(MachineSchema),
    defaultValues: {
      status: 'OPERATIONAL',
      capacityPerHour: 0,
    }
  });

  const formValues = watch();

  const onSubmit = async (data: MachineFormValues) => {
    setIsSubmitting(true);
    try {
      await upsertMachine({
        ...data,
        metadata: { selectedInsumos }
      });
      toast.success('Sucesso', 'Equipamento cadastrado com sucesso!');
      router.push('/admin/setores');
    } catch (error) {
      toast.error('Erro', 'Falha ao salvar equipamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleInsumo = (id: string) => {
    setSelectedInsumos(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 pb-20">
      {/* Container Principal */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-2"
        >
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Novo Equipamento</h1>
          <p className="text-slate-500 font-medium max-w-lg">
            Cadastre novas unidades de impressão ou máquinas de acabamento no ecossistema PrintAI.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 w-full lg:w-auto"
        >
          <Button 
            variant="ghost" 
            type="button"
            onClick={() => router.back()}
            className="flex-1 lg:flex-none h-14 px-8 rounded-2xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
          >
            Cancelar
          </Button>
          <Button 
            disabled={isSubmitting}
            className="flex-1 lg:flex-none h-14 px-10 rounded-2xl font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all"
          >
            {isSubmitting ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5 mr-3" />
                Salvar Equipamento
              </>
            )}
          </Button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Coluna da Esquerda: Dados Principais */}
        <div className="xl:col-span-8 space-y-8">
          
          {/* Sessão: Informações Básicas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-8 border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 text-primary/5 transition-transform group-hover:scale-110 duration-500">
                <Printer size={120} />
              </div>

              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                  <Cpu className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Informações Básicas</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Nome do Equipamento</Label>
                  <Input 
                    {...register('name')}
                    placeholder="Ex: Unidade de Impressão Industrial #800"
                    className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold placeholder:font-medium placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  {errors.name && <p className="text-xs text-red-500 font-bold ml-2">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Fabricante</Label>
                  <Input 
                    {...register('manufacturer')}
                    placeholder="Ex: Heidelberg, HP, Xerox"
                    className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold placeholder:font-medium placeholder:text-slate-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Modelo</Label>
                  <Input 
                    {...register('model')}
                    placeholder="Ex: Speedmaster XL-106"
                    className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold placeholder:font-medium placeholder:text-slate-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Número de Série (S/N)</Label>
                  <Input 
                    {...register('serialNumber')}
                    placeholder="000-000-000"
                    className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold placeholder:font-medium placeholder:text-slate-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Ano de Fabricação</Label>
                  <Input 
                    {...register('year')}
                    placeholder="2024"
                    className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold placeholder:font-medium placeholder:text-slate-300"
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Sessão: Vincular Insumos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-8 border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-white">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-50 rounded-2xl text-amber-500 font-black">
                    <Package className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-black text-slate-800 tracking-tight">Vincular Insumos Críticos</h2>
                </div>
                <Badge variant="outline" className="rounded-lg border-amber-200 bg-amber-50 text-amber-700 font-black uppercase text-[10px] px-3 py-1">
                  Essencial
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.length > 0 ? products.slice(0, 5).map((prod) => (
                  <motion.div
                    key={prod.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleInsumo(prod.id)}
                    className={`
                      p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col items-center text-center gap-3
                      ${selectedInsumos.includes(prod.id) 
                        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' 
                        : 'border-slate-100 bg-slate-50 hover:bg-slate-100'}
                    `}
                  >
                    <div className={`p-3 rounded-2xl transition-colors ${selectedInsumos.includes(prod.id) ? 'bg-primary text-white' : 'bg-white text-slate-400'}`}>
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800 line-clamp-1">{prod.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{prod.sku}</p>
                    </div>
                    {selectedInsumos.includes(prod.id) && (
                      <div className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </motion.div>
                )) : (
                  <div className="col-span-full p-8 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <p className="text-sm font-bold text-slate-400">Nenhum insumo disponível para vincular.</p>
                  </div>
                )}
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-5 rounded-3xl border-2 border-dashed border-slate-200 hover:border-primary hover:bg-primary/5 group transition-all cursor-pointer flex flex-col items-center justify-center gap-3"
                >
                  <div className="p-3 bg-white rounded-2xl text-slate-300 group-hover:text-primary transition-colors">
                    <Plus className="w-5 h-5" />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 group-hover:text-primary transition-colors uppercase tracking-widest">Novo Insumo</p>
                </motion.div>
              </div>
            </Card>
          </motion.div>

        </div>

        {/* Coluna da Direita: Status e Produção */}
        <div className="xl:col-span-4 space-y-8">
          
          {/* Card: Produção & Performance */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-8 border-none shadow-2xl shadow-indigo-100/50 rounded-[2.5rem] bg-indigo-50/30 border border-white relative overflow-hidden">
               <div className="absolute top-[-20%] left-[-20%] w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />
               
               <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-200">
                    <Settings className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-black text-slate-800 tracking-tight">Produção</h2>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Setor de Alocação</Label>
                    <Select 
                      onChange={(e) => setValue('sectorId', e.target.value)}
                      placeholder="Selecione o setor..."
                      options={sectors.map(s => ({ value: s.id, label: s.name }))}
                      className="h-14 rounded-2xl bg-white border-none px-6 font-bold shadow-sm"
                    />
                    {errors.sectorId && <p className="text-xs text-red-500 font-bold ml-2">{errors.sectorId.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Capacidade Nominal</Label>
                    <div className="relative">
                      <Input 
                        {...register('capacityPerHour')}
                        type="number"
                        placeholder="18.000"
                        className="h-14 rounded-2xl bg-white border-none px-6 font-bold shadow-sm pr-16"
                      />
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase tracking-widest pointer-events-none">
                        Unid/h
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Horímetro Atual</Label>
                    <div className="relative">
                      <Input 
                        placeholder="0"
                        defaultValue="0"
                        className="h-14 rounded-2xl bg-white border-none px-6 font-bold shadow-sm pr-16"
                      />
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase tracking-widest pointer-events-none">
                        Horas
                      </span>
                    </div>
                  </div>
                </div>
               </div>
            </Card>
          </motion.div>

          {/* Card: Mídia & Documentação */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-8 border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-white">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-slate-50 rounded-2xl text-slate-400">
                  <Monitor className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Documentação & Mídia</h2>
              </div>

              <div className="space-y-6">
                <div className="group h-40 rounded-[2rem] border-2 border-dashed border-slate-100 bg-slate-50/50 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-50 hover:border-primary/50 transition-all">
                  <div className="p-3 bg-white rounded-2xl text-slate-300 group-hover:text-primary transition-colors shadow-sm">
                    <Plus className="w-5 h-5" />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 group-hover:text-primary transition-colors uppercase tracking-widest">Foto do Equipamento</p>
                </div>

                <div className="flex items-center gap-4 p-5 rounded-3xl bg-slate-50 border border-slate-100 group cursor-pointer hover:bg-white hover:border-primary/20 transition-all shadow-sm">
                  <div className="p-3 bg-white rounded-2xl text-red-500 shadow-sm transition-transform group-hover:scale-110">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-black text-slate-800">Manual Técnico</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Arraste o PDF para anexar</p>
                  </div>
                  <Check className="w-4 h-4 text-emerald-500 opacity-20" />
                </div>
              </div>
            </Card>
          </motion.div>

        </div>
      </div>

      {/* Banner de Prévia: VIP Style */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-10 border-none shadow-3xl shadow-slate-900/10 rounded-[3rem] bg-slate-900 text-white relative overflow-hidden min-h-[220px] flex flex-col md:flex-row items-center gap-10">
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,#3b82f615,transparent_50%)]" />
           <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,#6366f115,transparent_50%)]" />
           
           <div className="flex-1 space-y-4 relative z-10">
             <h3 className="text-3xl font-black tracking-tight">Prévias do Ativo</h3>
             <p className="text-slate-400 font-medium max-w-md">
               As configurações salvas definirão os alertas de manutenção preditiva e o cálculo de ROI automático deste equipamento no seu dashboard.
             </p>
             
             <div className="flex flex-wrap gap-4 pt-4">
                <div className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Capacidade</p>
                  <p className="text-xl font-bold text-primary">{formValues.capacityPerHour || 0} <span className="text-xs text-slate-400">un/h</span></p>
                </div>
                <div className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Ciclo Mensal</p>
                  <p className="text-xl font-bold text-indigo-400">Disponível <span className="text-xs text-slate-400">24/7</span></p>
                </div>
             </div>
           </div>

           <div className="w-full md:w-[350px] aspect-video rounded-3xl bg-white/5 border border-white/10 overflow-hidden relative group">
              <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                 <div className="flex flex-col items-center gap-2 text-slate-500">
                   <ImageIcon className="w-8 h-8 opacity-20 transition-transform group-hover:scale-125" />
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Aguardando Foto</p>
                 </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">
                 <p className="text-xs font-black uppercase text-white truncate">{formValues.name || 'Novo Ativo Industrial'}</p>
                 <p className="text-[10px] font-bold text-slate-400">{formValues.model || 'S/ Modelo'}</p>
              </div>
           </div>
        </Card>
      </motion.div>
    </form>
  );
}
