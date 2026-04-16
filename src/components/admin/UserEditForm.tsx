'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Save, ArrowLeft, Shield, Info, User, Briefcase, BadgeCheck, Loader2 } from 'lucide-react';
import { updateUser } from '@/app/actions/users';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface UserEditFormProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    sectorId?: string | null;
    personalEmail?: string | null;
    commercialPhone?: string | null;
    employeeId?: string | null;
    jobTitle?: string | null;
    admissionDate?: string | Date | null;
    managerId?: string | null;
  };
  sectors: { id: string; name: string }[];
  users: { id: string; name: string | null; email: string }[];
}

export function UserEditForm({ user, sectors, users }: UserEditFormProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email,
    role: user.role,
    sectorId: user.sectorId || '',
    personalEmail: user.personalEmail || '',
    commercialPhone: user.commercialPhone || '',
    employeeId: user.employeeId || '',
    jobTitle: user.jobTitle || '',
    admissionDate: user.admissionDate ? new Date(user.admissionDate).toISOString().split('T')[0] : '',
    managerId: user.managerId || '',
  });

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsUpdating(true);
    try {
      await updateUser(user.id, {
        ...formData,
        sectorId: formData.sectorId || null,
        admissionDate: formData.admissionDate ? new Date(formData.admissionDate) : null,
        managerId: formData.managerId || null,
        personalEmail: formData.personalEmail || null,
        commercialPhone: formData.commercialPhone || null,
        employeeId: formData.employeeId || null,
        jobTitle: formData.jobTitle || null,
      });
      toast.success("Membro atualizado com sucesso!");
      router.push('/admin/usuarios');
      router.refresh();
    } catch (error: any) {
      toast.error("Erro ao atualizar: " + error.message);
    } finally {
      setIsUpdating(false);
    }
  }

  const roleLabels: Record<string, string> = {
    "ADMIN": "Administrador",
    "MANAGER": "Gerente",
    "OPERATOR": "Operador",
    "VIEWER": "Visualizador",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10 max-w-7xl mx-auto w-full">
      
      {/* Header Editorial - Sincronizado com Stitch */}
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <button 
              type="button"
              onClick={() => router.push('/admin/usuarios')}
              className="p-2 hover:bg-[#e8eff3] dark:hover:bg-slate-800 rounded-lg transition-colors text-[#565e74] dark:text-slate-400"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-[10px] font-bold text-[#566166] dark:text-slate-500 uppercase tracking-widest">Gestão de Identidade</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-[#2a3439] dark:text-white leading-none">
            Editar Membro
          </h1>
          <p className="text-[#566166] dark:text-slate-400 font-medium text-base">Gerencie permissões, alocação e dados corporativos do colaborador.</p>
        </div>
        <div className="flex gap-4">
          <button 
            type="button" 
            onClick={() => router.push('/admin/usuarios')}
            className="px-6 py-2.5 text-[#565e74] dark:text-slate-300 font-semibold hover:bg-[#e8eff3] dark:hover:bg-slate-800 transition-colors rounded-lg text-sm"
          >
            Descartar
          </button>
          <Button 
            disabled={isUpdating}
            className="px-8 py-2.5 bg-gradient-to-br from-[#565e74] to-[#4a5268] text-white font-bold shadow-sm hover:opacity-90 transition-opacity rounded-lg h-11 flex gap-2 text-sm"
          >
            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar Alterações
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Coluna 1: Dados & Hierarquia (Left - 8/12) */}
        <section className="lg:col-span-8 space-y-8">
          
          {/* Section: Dados de Identificação */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-[0_4px_20px_rgba(42,52,57,0.04)] border border-slate-50 dark:border-slate-800">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-2 bg-[#dae2fd] rounded-lg text-[#565e74]">
                <User className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-[#2a3439] dark:text-white leading-none">Identificação Corporativa</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-1.5">
                <Label className="block text-xs font-bold text-[#566166] dark:text-slate-400 uppercase tracking-wider">Nome Completo</Label>
                <Input 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome do colaborador" 
                  className="w-full bg-[#f0f4f7] dark:bg-slate-800/50 border-none focus:ring-2 focus:ring-[#565e74]/20 rounded-lg py-3 px-4 h-12 text-[#2a3439] dark:text-white font-medium transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="block text-xs font-bold text-[#566166] dark:text-slate-400 uppercase tracking-wider">E-mail de Trabalho</Label>
                <Input 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  type="email" 
                  className="w-full bg-[#f0f4f7] dark:bg-slate-800/50 border-none rounded-lg py-3 px-4 h-12 text-[#2a3439] dark:text-white font-medium transition-all opacity-60 cursor-not-allowed"
                  disabled
                />
              </div>
              <div className="space-y-1.5">
                <Label className="block text-xs font-bold text-[#566166] dark:text-slate-400 uppercase tracking-wider">E-mail Pessoal (Backup)</Label>
                <Input 
                  value={formData.personalEmail}
                  onChange={(e) => setFormData({ ...formData, personalEmail: e.target.value })}
                  type="email" 
                  placeholder="exemplo@gmail.com"
                  className="w-full bg-[#f0f4f7] dark:bg-slate-800/50 border-none rounded-lg py-3 px-4 h-12 text-[#2a3439] dark:text-white font-medium transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="block text-xs font-bold text-[#566166] dark:text-slate-400 uppercase tracking-wider">Telefone Comercial</Label>
                <Input 
                  value={formData.commercialPhone}
                  onChange={(e) => setFormData({ ...formData, commercialPhone: e.target.value })}
                  placeholder="+55 (11) 4002-8922"
                  className="w-full bg-[#f0f4f7] dark:bg-slate-800/50 border-none rounded-lg py-3 px-4 h-12 text-[#2a3439] dark:text-white font-medium transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="block text-xs font-bold text-[#566166] dark:text-slate-400 uppercase tracking-wider">Matrícula (Employee ID)</Label>
                <Input 
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  placeholder="Ex: #PA-2021-084"
                  className="w-full bg-[#f0f4f7] dark:bg-slate-800/50 border-none rounded-lg py-3 px-4 h-12 text-[#2a3439] dark:text-white font-medium transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section: Hierarquia & Alocação */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-[0_4px_20px_rgba(42,52,57,0.04)] border border-slate-50 dark:border-slate-800">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-2 bg-[#d3e4fe] rounded-lg text-[#506076]">
                <Briefcase className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-[#2a3439] dark:text-white leading-none">Dados Profissionais & Hierarquia</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="block text-xs font-bold text-[#566166] dark:text-slate-400 uppercase tracking-wider px-1">Cargo / Título</Label>
                <Input 
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  placeholder="Ex: Gerente de Produção"
                  className="w-full bg-[#f0f4f7] dark:bg-slate-800/50 border-none rounded-lg py-3 px-4 h-12 text-[#2a3439] dark:text-white font-medium transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label className="block text-xs font-bold text-[#566166] dark:text-slate-400 uppercase tracking-wider px-1">Data de Admissão</Label>
                <Input 
                  value={formData.admissionDate}
                  onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                  type="date"
                  className="w-full bg-[#f0f4f7] dark:bg-slate-800/50 border-none rounded-lg py-3 px-4 h-12 text-[#2a3439] dark:text-white font-medium transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label className="block text-xs font-bold text-[#566166] dark:text-slate-400 uppercase tracking-wider px-1">Departamento / Setor</Label>
                <select 
                  value={formData.sectorId}
                  onChange={(e) => setFormData({ ...formData, sectorId: e.target.value })}
                  className="w-full bg-[#f0f4f7] dark:bg-slate-800/50 border-none rounded-lg h-12 px-4 text-[#2a3439] dark:text-slate-100 font-medium text-sm focus:ring-2 focus:ring-[#565e74]/20 outline-none appearance-none cursor-pointer"
                >
                  <option value="">Selecione o setor</option>
                  {sectors.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="block text-xs font-bold text-[#566166] dark:text-slate-400 uppercase tracking-wider px-1">Gestor Direto</Label>
                <select 
                  value={formData.managerId}
                  onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                  className="w-full bg-[#f7f9fb] dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg h-12 px-4 text-[#2a3439] dark:text-slate-100 font-medium text-sm focus:ring-2 focus:ring-[#565e74]/20 outline-none appearance-none cursor-pointer"
                >
                  <option value="">Selecione o gestor</option>
                  {users.filter(u => u.id !== user.id).map(u => (
                    <option key={u.id} value={u.id}>{u.name || u.email}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label className="block text-xs font-bold text-[#566166] dark:text-slate-400 uppercase tracking-wider px-1">Nível de Permissão (Sistema)</Label>
                <select 
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-[#565e74]/5 dark:bg-slate-800/50 border-2 border-[#565e74]/20 rounded-lg h-12 px-4 text-[#565e74] dark:text-slate-300 font-bold text-sm focus:ring-2 focus:ring-[#565e74]/20 outline-none appearance-none cursor-pointer"
                >
                  <option value="ADMIN">Administrador</option>
                  <option value="MANAGER">Gerente</option>
                  <option value="OPERATOR">Operador</option>
                  <option value="VIEWER">Visualizador</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Coluna 2: Segurança & Status (Right - 4/12) */}
        <section className="lg:col-span-4 space-y-8">
          
          {/* Section: Status e Segurança */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-[0_4px_20px_rgba(42,52,57,0.04)] border border-slate-50 dark:border-slate-800">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-2 bg-[#fe8983]/20 rounded-lg text-[#9f403d]">
                <Shield className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-[#2a3439] dark:text-white leading-none">Segurança</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="block text-xs font-bold text-[#566166] dark:text-slate-400 uppercase tracking-wider px-1">Status da Conta</Label>
                <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-lg py-2.5 px-4 h-12 text-sm font-bold flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Privilégio Ativo
                </div>
              </div>

              {/* Security Protocol Info */}
              <div className="p-6 bg-[#f0f4f7] dark:bg-slate-800/30 rounded-xl space-y-4 border border-dashed border-[#a9b4b9]/30">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-orange-500/10 rounded-lg text-orange-500">
                    <Shield className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-[#2a3439] dark:text-white">Protocolo de Auditoria</h3>
                </div>
                <p className="text-[11px] text-[#566166] dark:text-slate-400 font-medium leading-relaxed">
                  Alterações em e-mails corporativos ou níveis de hierarquia são registradas irreversivelmente na trilha de auditoria do sistema.
                </p>
              </div>

              <div className="pt-6 border-t border-[#a9b4b9]/10">
                <div className="flex items-start gap-3 p-4 bg-[#dae2fd]/20 rounded-xl">
                  <Info className="w-4 h-4 text-[#565e74] shrink-0 mt-0.5" />
                  <p className="text-[10px] text-[#566166] dark:text-slate-400 font-bold uppercase tracking-wider leading-relaxed">
                    Este membro será notificado sobre qualquer alteração em seu nível de acesso.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </form>
  );
}
