import { Sidebar } from '@/components/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Plus, 
  Cpu, 
  Users, 
  Activity, 
  Settings2, 
  Wrench,
  AlertTriangle,
  History,
  Layers
} from 'lucide-react';
import Link from 'next/link';
import { getSectorById } from '@/app/actions/sectors';
import { serializeData } from '@/lib/utils';
import { notFound } from 'next/navigation';
import { MachineList } from './_components/MachineList';
import { AddMachineButton } from './_components/AddMachineButton';
import { MaterialList } from './_components/MaterialList';
import { AddMaterialButton } from './_components/AddMaterialButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SectorPageProps {
  params: { id: string };
}

export default async function SectorDetailsPage({ params }: SectorPageProps) {
  const rawSector = await getSectorById(params.id);
  if (!rawSector) notFound();
  
  const sector = serializeData(rawSector);

  // Estatísticas reais baseadas no setor
  const stats = [
    { label: 'Máquinas', value: sector._count.machines.toString(), icon: Cpu, color: 'text-indigo-500' },
    { label: 'Insumos', value: sector.sectorMaterials?.length.toString() || '0', icon: Layers, color: 'text-blue-500' },
    { label: 'Manutenções', value: '00', icon: Wrench, color: 'text-amber-500' },
    { label: 'Anomalias', value: '00', icon: AlertTriangle, color: 'text-red-500' },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] dark:bg-slate-950">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 lg:p-10 ml-64">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Breadcrumb & Title */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4">
              <Link 
                href="/admin/setores" 
                className="group flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Voltar para Setores
              </Link>
              <div className="flex items-center gap-4">
                <div 
                  className="w-14 h-14 rounded-[1.25rem] flex items-center justify-center shadow-lg transform rotate-3"
                  style={{ backgroundColor: `${sector.color || '#7C3AED'}`, color: '#FFF' }}
                >
                  <Cpu className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {sector.name}
                  </h1>
                  <p className="text-sm text-slate-500 max-w-xl line-clamp-1 italic">
                    {sector.description || 'Infraestrutura industrial e gestão de ativos.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <AddMachineButton sectorId={sector.id} />
              <AddMaterialButton sectorId={sector.id} />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <Card key={i} className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden group hover:shadow-md transition-all">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className={cn("p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 transition-colors group-hover:scale-110", stat.color)}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-12 space-y-6">
              
              <Tabs defaultValue="machines" className="w-full">
                <div className="flex items-center justify-between mb-6 px-2">
                  <TabsList className="bg-white/50 dark:bg-slate-900/50 p-1 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <TabsTrigger value="machines" className="rounded-xl px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-widest">
                      <Cpu className="w-3.5 h-3.5 mr-2 text-indigo-500" />
                      Maquinário
                    </TabsTrigger>
                    <TabsTrigger value="materials" className="rounded-xl px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-widest">
                      <Layers className="w-3.5 h-3.5 mr-2 text-blue-500" />
                      Insumos
                    </TabsTrigger>
                    <TabsTrigger value="logs" className="rounded-xl px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-widest">
                      <History className="w-3.5 h-3.5 mr-2 text-amber-500" />
                      Logs
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="machines" className="mt-0 border-none p-0 outline-none">
                  <MachineList initialMachines={sector.machines} sectorId={sector.id} />
                </TabsContent>

                <TabsContent value="materials" className="mt-0 border-none p-0 outline-none">
                  <MaterialList materials={sector.sectorMaterials || []} sectorId={sector.id} />
                </TabsContent>

                <TabsContent value="logs" className="mt-0 border-none p-0 outline-none">
                  <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 min-h-[400px]">
                    <div className="space-y-6">
                      <p className="text-xs text-slate-400 italic text-center py-20">
                        Nenhuma atividade industrial registrada hoje.
                      </p>
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
