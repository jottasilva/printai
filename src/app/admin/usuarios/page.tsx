import { Sidebar } from '@/components/sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Users, UserPlus, Building2, Shield, 
  Mail, Clock, Settings, ArrowRight,
  TrendingUp, Activity, CheckCircle2,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getUsers } from '@/app/actions/users';
import { getSectors } from '@/app/actions/sectors';
import { serializeData } from '@/lib/utils';
import { UserForm } from '@/components/admin/UserForm';
import { UserList } from '@/components/admin/UserList';
import { prisma } from '@/lib/db';
import { getTenantId } from '@/lib/server-utils';
import { Badge } from '@/components/ui/badge';
import { getCustomersAction } from '@/app/clientes/actions';
import { CustomerListClient } from '@/app/clientes/customer-list-client';

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: { search?: string; type?: string; page?: string };
}) {
  const { tenantId } = await getTenantId();
  
  const [rawUsers, rawSectors, tenant, invites, customersData] = await Promise.all([
    getUsers(),
    getSectors(),
    prisma.tenant.findUnique({ where: { id: tenantId } }),
    prisma.invite.findMany({ where: { tenantId, status: 'PENDING' } }),
    getCustomersAction(searchParams.search, searchParams.type, searchParams.page)
  ]);
  
  const users = serializeData(rawUsers);
  const sectors = serializeData(rawSectors);

  return (
    <div className="flex min-h-screen bg-[#F0F2F5] dark:bg-slate-950">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-12 ml-64">
        <div className="max-w-[1400px] mx-auto space-y-10">
          
          {/* Page Header */}
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold px-2 uppercase">Administração</Badge>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Painel de Controle v4.0</span>
              </div>
              <h1 className="text-4xl font-light text-[#1A2B3B] dark:text-white tracking-tight leading-tight">
                Gestão de <span className="font-bold text-primary">Equipe & Empresa</span>
              </h1>
              <p className="text-sm text-slate-500 max-w-xl">
                Gerencie permissões, convites, clientes e configurações corporativas em um único lugar.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button className="h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xl shadow-indigo-500/20 group transition-all">
                <UserPlus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                NOVA AÇÃO
              </Button>
              
              <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 h-14">
                 <div className="px-4 border-r dark:border-slate-800">
                   <p className="text-[10px] font-bold text-slate-400 uppercase">Equipe</p>
                   <p className="text-sm font-bold text-primary">{users.length}</p>
                 </div>
                 <div className="px-4 pr-6">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Clientes</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-white">{customersData.stats.totalActive}</p>
                 </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="members" className="space-y-8">
            <TabsList className="bg-transparent h-auto p-0 gap-8 border-b dark:border-slate-800 w-full justify-start rounded-none">
              <TabsTrigger 
                value="members" 
                className="relative pb-4 px-0 rounded-none bg-transparent text-slate-400 font-bold text-[11px] tracking-widest transition-all border-b-2 border-transparent data-[state=active]:text-primary data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                MEMBROS DA EQUIPE
              </TabsTrigger>
              <TabsTrigger 
                value="customers" 
                className="relative pb-4 px-0 rounded-none bg-transparent text-slate-400 font-bold text-[11px] tracking-widest transition-all border-b-2 border-transparent data-[state=active]:text-primary data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                CONTAS DE CLIENTES
              </TabsTrigger>
              <TabsTrigger 
                value="invites" 
                className="relative pb-4 px-0 rounded-none bg-transparent text-slate-400 font-bold text-[11px] tracking-widest transition-all border-b-2 border-transparent data-[state=active]:text-primary data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-nowrap"
              >
                CONVITES PENDENTES
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="relative pb-4 px-0 rounded-none bg-transparent text-slate-400 font-bold text-[11px] tracking-widest transition-all border-b-2 border-transparent data-[state=active]:text-primary data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                CONFIGURAÇÕES DA EMPRESA
              </TabsTrigger>
            </TabsList>

            {/* TAB: MEMBROS */}
            <TabsContent value="members" className="space-y-10 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-4 space-y-6">
                  <UserForm sectors={sectors} />
                  
                  {/* Decorative Card */}
                  <Card className="border-none shadow-sm bg-gradient-to-br from-[#1A2B3B] to-[#2D3E50] text-white rounded-[2.5rem] p-8 overflow-hidden relative">
                    <Shield className="absolute bottom-[-20px] right-[-20px] w-40 h-40 opacity-5" />
                    <div className="relative z-10 space-y-4">
                      <div className="p-3 bg-white/10 rounded-2xl w-fit">
                        <Shield className="w-6 h-6" />
                      </div>
                      <h4 className="text-lg font-bold">Segurança de Acesso</h4>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        Configure níveis de permissão granulares para garantir que cada colaborador acesse apenas o necessário.
                      </p>
                    </div>
                  </Card>
                </div>

                <div className="lg:col-span-8 space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Equipe Ativa</h3>
                  </div>
                  <UserList users={users} sectors={sectors} />
                </div>
              </div>
            </TabsContent>

            {/* TAB: CLIENTES */}
            <TabsContent value="customers" className="animate-in slide-in-from-bottom-4 duration-500">
              <CustomerListClient 
                initialCustomers={customersData.data} 
                stats={customersData.stats} 
                pagination={customersData.pagination} 
              />
            </TabsContent>

            {/* TAB: CONVITES */}
            <TabsContent value="invites" className="animate-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {invites.map((invite: any) => (
                  <Card key={invite.id} className="border-none shadow-sm rounded-3xl bg-white dark:bg-slate-900 group">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                          <Mail className="h-5 w-5" />
                        </div>
                        <Badge variant="outline" className="text-[10px] font-bold border-slate-100 dark:border-slate-800">
                          {invite.role}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{invite.email}</p>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Enviado em {new Date(invite.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="ghost" className="w-full rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 h-10 font-bold text-xs">
                        CANCELAR CONVITE
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                
                {invites.length === 0 && (
                  <div className="col-span-full py-20 text-center bg-white/50 dark:bg-slate-900/50 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800">
                    <Mail className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Nenhum convite pendente</h3>
                    <p className="text-sm text-slate-500">Sua equipe está completa por enquanto.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* TAB: CONFIGURAÇÕES */}
            <TabsContent value="settings" className="animate-in slide-in-from-bottom-4 duration-500">
               <div className="max-w-4xl space-y-6">
                <Card className="border-none shadow-sm rounded-[2.5rem] bg-white dark:bg-slate-900 overflow-hidden">
                  <CardHeader className="p-10 border-b dark:border-slate-800">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold">Informações da Organização</CardTitle>
                        <CardDescription>Dados públicos e fiscais da sua empresa</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-10 space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Nome da Empresa</label>
                        <input className="w-full h-12 bg-slate-50 dark:bg-slate-800 px-4 rounded-xl font-bold text-sm border-none focus:ring-2 ring-primary" defaultValue={tenant?.name} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Slug do Workspace (Identificador)</label>
                        <input className="w-full h-12 bg-slate-100 dark:bg-slate-800 opacity-60 px-4 rounded-xl font-bold text-sm border-none cursor-not-allowed" defaultValue={tenant?.slug} disabled />
                      </div>
                    </div>
                    <Button className="h-12 px-10 rounded-xl font-bold">Salvar Alterações</Button>
                  </CardContent>
                </Card>
               </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
