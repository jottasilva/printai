'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { updateProfile } from '@/app/actions/users';
import { 
  Camera, User, Shield, BadgeCheck, History, 
  Info, Check, Mail, Smartphone, Monitor, Globe,
  Briefcase, Save, ChevronRight, CheckCircle2,
  Lock, Layout, Bell, LogIn, Laptop, Settings2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const profileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  phone: z.string().optional().nullable(),
  avatarUrl: z.string().url('URL de avatar inválida').optional().or(z.literal('')).nullable(),
  personalEmail: z.string().email('E-mail pessoal inválido').optional().or(z.literal('')).nullable(),
  commercialPhone: z.string().optional().nullable(),
  theme: z.string().default('light'),
  language: z.string().default('pt-BR'),
  timezone: z.string().default('America/Sao_Paulo'),
  notificationsConfig: z.object({
    email: z.boolean().default(true),
    whatsapp: z.boolean().default(false),
    desktop: z.boolean().default(true),
  }).optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  initialData: {
    name: string | null;
    email: string;
    phone: string | null;
    avatarUrl: string | null;
    role: string;
    personalEmail?: string | null;
    commercialPhone?: string | null;
    theme?: string;
    language?: string;
    timezone?: string;
    notificationsConfig?: any;
  };
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: initialData.name || '',
      phone: initialData.phone || '',
      avatarUrl: initialData.avatarUrl || '',
      personalEmail: initialData.personalEmail || '',
      commercialPhone: initialData.commercialPhone || '',
      theme: initialData.theme || 'light',
      language: initialData.language || 'pt-BR',
      timezone: initialData.timezone || 'America/Sao_Paulo',
      notificationsConfig: initialData.notificationsConfig || {
        email: true,
        whatsapp: false,
        desktop: true,
      },
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    setIsUpdating(true);
    try {
      await updateProfile(data);
      toast.success('Perfil atualizado com sucesso!');
      router.refresh();
    } catch (error: any) {
      toast.error('Erro ao atualizar perfil: ' + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 max-w-7xl mx-auto">
      
      {/* Header Editorial - High Fidelity Stitch Completo */}
      <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tighter text-[#2a3439] dark:text-white leading-none">
            Perfil de Usuário
          </h1>
          <p className="text-[#566166] dark:text-slate-400 font-medium text-base">Informações detalhadas da conta, segurança e histórico de atividades.</p>
        </div>
        <div className="flex gap-4">
          <button 
            type="button" 
            onClick={() => router.back()}
            className="px-6 py-2.5 text-[#565e74] dark:text-slate-300 font-semibold hover:bg-[#e8eff3] dark:hover:bg-slate-800 transition-colors rounded-lg text-sm"
          >
            Descartar
          </button>
          <Button 
            disabled={isUpdating}
            className="px-8 py-2.5 bg-gradient-to-br from-[#565e74] to-[#4a5268] text-white font-bold shadow-sm hover:opacity-90 transition-opacity rounded-lg h-11 flex gap-2 text-sm"
          >
            {isUpdating ? <Check className="w-4 h-4 animate-bounce" /> : <Save className="w-4 h-4" />}
            Salvar Alterações
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Coluna 1: Core Profile & Contacts (Left - 8/12) */}
        <section className="lg:col-span-8 space-y-8">
          
          {/* Section: Identificação e Contato */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-[0_4px_20px_rgba(42,52,57,0.04)] border border-slate-50 dark:border-slate-800">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-2 bg-[#dae2fd] rounded-lg text-[#565e74]">
                <User className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-[#2a3439] dark:text-white">Identificação e Contato</h2>
            </div>

            <div className="flex flex-col md:flex-row gap-10">
              {/* Avatar Slot */}
              <div className="flex-shrink-0 flex flex-col items-center gap-3">
                <div className="relative">
                  <div className="w-40 h-40 rounded-2xl overflow-hidden bg-[#e8eff3] dark:bg-slate-800 border-2 border-dashed border-[#a9b4b9] dark:border-slate-800 p-0.5">
                    <img 
                      src={form.watch('avatarUrl') || initialData.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${initialData.email}`} 
                      className="w-full h-full object-cover rounded-[0.9rem]" 
                      alt="Avatar"
                    />
                  </div>
                  <button type="button" className="absolute -bottom-2 -right-2 bg-[#565e74] text-white p-2.5 rounded-lg shadow-lg hover:scale-105 transition-transform">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[10px] text-center text-[#566166] font-bold uppercase tracking-wider mt-3">Mudar Foto</p>
              </div>

              {/* Personal & Contact Fields */}
              <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <div className="md:col-span-2 space-y-1.5">
                  <Label className="block text-xs font-bold text-[#566166] dark:text-slate-400 uppercase tracking-wider">Nome Completo</Label>
                  <Input 
                    {...form.register('name')}
                    placeholder="Ricardo Oliveira" 
                    className="w-full bg-[#f0f4f7] dark:bg-slate-800/50 border-none focus:ring-2 focus:ring-[#565e74]/20 rounded-lg py-3 px-4 h-12 text-[#2a3439] dark:text-white font-medium transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="block text-xs font-bold text-[#566166] dark:text-slate-400 uppercase tracking-wider">E-mail Profissional</Label>
                  <Input 
                    disabled 
                    value={initialData.email}
                    className="w-full bg-[#f0f4f7] dark:bg-slate-800/50 border-none rounded-lg py-3 px-4 h-12 text-[#2a3439] dark:text-white font-medium opacity-60"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="block text-xs font-bold text-[#566166] dark:text-slate-400 uppercase tracking-wider">E-mail Pessoal</Label>
                  <Input 
                    {...form.register('personalEmail')}
                    placeholder="oliveira.ricardo@gmail.com"
                    className="w-full bg-[#f0f4f7] dark:bg-slate-800/50 border-none rounded-lg py-3 px-4 h-12 text-[#2a3439] dark:text-white font-medium transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="block text-xs font-bold text-[#566166] dark:text-slate-400 uppercase tracking-wider">Telefone Comercial</Label>
                  <Input 
                    {...form.register('commercialPhone')}
                    placeholder="+55 (11) 4002-8922"
                    className="w-full bg-[#f0f4f7] dark:bg-slate-800/50 border-none rounded-lg py-3 px-4 h-12 text-[#2a3439] dark:text-white font-medium transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="block text-xs font-bold text-[#566166] dark:text-slate-400 uppercase tracking-wider">Celular / WhatsApp</Label>
                  <Input 
                    {...form.register('phone')}
                    placeholder="+55 (11) 98765-4321" 
                    className="w-full bg-[#f0f4f7] dark:bg-slate-800/50 border-none rounded-lg py-3 px-4 h-12 text-[#2a3439] dark:text-white font-medium transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Dados Profissionais */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-[0_4px_20px_rgba(42,52,57,0.04)] border border-slate-50 dark:border-slate-800">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-2 bg-[#d3e4fe] rounded-lg text-[#506076]">
                <BadgeCheck className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-[#2a3439] dark:text-white leading-none">Dados Profissionais</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="block text-xs font-bold text-[#566166] uppercase tracking-wider">ID do Funcionário</Label>
                <div className="w-full bg-[#f0f4f7] dark:bg-slate-800/50 rounded-lg py-3 px-4 h-12 text-[#2a3439] dark:text-slate-100 font-bold flex items-center">
                  #PA-2021-084
                </div>
              </div>
              <div className="space-y-2">
                <Label className="block text-xs font-bold text-[#566166] uppercase tracking-wider">Setor / Departamento</Label>
                <Input 
                  disabled
                  value="Ateliê de Impressão"
                  className="w-full bg-[#f0f4f7] dark:bg-slate-800/50 border-none rounded-lg h-12 text-[#2a3439] dark:text-slate-300 font-medium" 
                />
              </div>
              <div className="space-y-2">
                <Label className="block text-xs font-bold text-[#566166] uppercase tracking-wider">Cargo Atual</Label>
                <Input 
                  disabled
                  value="Gerente de Produção"
                  className="w-full bg-[#f0f4f7] dark:bg-slate-800/50 border-none rounded-lg h-12 text-[#2a3439] dark:text-slate-300 font-medium" 
                />
              </div>
              <div className="space-y-2">
                <Label className="block text-xs font-bold text-[#566166] uppercase tracking-wider">Data de Admissão</Label>
                <div className="w-full bg-[#f0f4f7] dark:bg-slate-800/50 rounded-lg py-3 px-4 h-12 text-[#2a3439] dark:text-slate-300 font-medium flex items-center">
                  15 de Março, 2021
                </div>
              </div>
              <div className="space-y-2">
                <Label className="block text-xs font-bold text-[#566166] uppercase tracking-wider">Gestor Direto</Label>
                <div className="flex items-center gap-2 bg-[#f0f4f7] dark:bg-slate-800/50 rounded-lg py-2 px-3 h-12">
                  <div className="w-7 h-7 rounded-full bg-[#a9b4b9]/30 flex items-center justify-center text-[10px] font-bold text-[#565e74]">SM</div>
                  <span className="text-sm font-medium text-[#2a3439] dark:text-slate-300">Sofia Martins</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="block text-xs font-bold text-[#566166] uppercase tracking-wider">Status da Conta</Label>
                <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-lg py-2.5 px-4 h-12 text-sm font-bold flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Ativo
                </div>
              </div>
            </div>
          </div>

          {/* Section: Registro de Atividades (Table Edition) */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-[0_4px_20px_rgba(42,52,57,0.04)] border border-slate-50 dark:border-slate-800">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-[#dae2fd]/20 rounded-lg text-[#565e74]">
                  <History className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-[#2a3439] dark:text-white leading-none">Registro de Atividades</h2>
              </div>
              <button type="button" className="text-xs font-bold text-[#565e74] hover:underline px-2 py-1">Ver tudo</button>
            </div>
            
            <div className="overflow-hidden border border-[#a9b4b9]/10 dark:border-slate-800 rounded-xl bg-[#f7f9fb] dark:bg-slate-900/50">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#f0f4f7] dark:bg-slate-800/80 border-b border-[#a9b4b9]/10 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-[#566166] dark:text-slate-400 uppercase tracking-wider">Ação</th>
                    <th className="px-6 py-4 text-xs font-bold text-[#566166] dark:text-slate-400 uppercase tracking-wider">Objeto</th>
                    <th className="px-6 py-4 text-xs font-bold text-[#566166] dark:text-slate-400 uppercase tracking-wider">Data / Hora</th>
                    <th className="px-6 py-4 text-xs font-bold text-[#566166] dark:text-slate-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#a9b4b9]/10 dark:divide-slate-800 text-sm">
                  <tr className="hover:bg-white dark:hover:bg-slate-800 transition-colors">
                    <td className="px-6 py-4 font-bold text-[#2a3439] dark:text-white">Pedido Aprovado</td>
                    <td className="px-6 py-4 text-[#566166] dark:text-slate-400">Job #8821 - Cartazes A3</td>
                    <td className="px-6 py-4 text-slate-500">Hoje, 09:15</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded text-[10px] font-bold uppercase">Sucesso</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-white dark:hover:bg-slate-800 transition-colors">
                    <td className="px-6 py-4 font-bold text-[#2a3439] dark:text-white">Cliente Editado</td>
                    <td className="px-6 py-4 text-[#566166] dark:text-slate-400">Gráfica Central Ltda.</td>
                    <td className="px-6 py-4 text-slate-500">Ontem, 16:40</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded text-[10px] font-bold uppercase">Editado</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Coluna 2: Security & Preferences (Right - 4/12) */}
        <section className="lg:col-span-4 space-y-8">
          
          {/* Section: Acesso e Segurança */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-[0_4px_20px_rgba(42,52,57,0.04)] border border-slate-50 dark:border-slate-800">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-2 bg-[#fe8983]/20 rounded-lg text-[#9f403d]">
                <Shield className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-[#2a3439] dark:text-white leading-none">Acesso e Segurança</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="block text-xs font-bold text-[#566166] dark:text-slate-400 uppercase tracking-wider px-1">Permissões de Perfil</Label>
                <div className="w-full bg-[#565e74]/5 dark:bg-slate-800/50 rounded-lg py-3 px-4 border border-[#565e74]/20 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#565e74]" />
                  <span className="text-[#2a3439] dark:text-slate-100 font-bold text-sm">Administrador do Sistema</span>
                </div>
              </div>

              <div className="pt-6 border-t border-[#a9b4b9]/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-[#2a3439] dark:text-white leading-none">Autenticação 2FA</h3>
                    <p className="text-[11px] text-[#566166] dark:text-slate-400 leading-tight">SMS e App de Autenticação ativos.</p>
                  </div>
                  <div className="w-11 h-6 bg-[#565e74] rounded-full p-1 relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1" />
                  </div>
                </div>
                <button type="button" className="w-full py-2.5 text-xs font-bold text-[#565e74] border border-[#565e74]/20 rounded-lg hover:bg-[#565e74]/5 transition-all">
                  Alterar Senha de Acesso
                </button>
              </div>

              {/* Login Info Block */}
              <div className="p-4 bg-[#f0f4f7] dark:bg-slate-800/30 rounded-xl space-y-3">
                <div className="flex items-center gap-3">
                  <LogIn className="w-4 h-4 text-[#566166]" />
                  <div>
                    <p className="text-[10px] font-bold text-[#566166] dark:text-slate-400 uppercase tracking-wider leading-none">Último Login</p>
                    <p className="text-xs font-medium text-[#2a3439] dark:text-slate-100">Hoje às 14:32</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-[#566166]" />
                  <div>
                    <p className="text-[10px] font-bold text-[#566166] dark:text-slate-400 uppercase tracking-wider leading-none">Endereço IP</p>
                    <p className="text-xs font-medium text-[#2a3439] dark:text-slate-100">189.122.45.210</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Monitor className="w-4 h-4 text-[#566166]" />
                  <div>
                    <p className="text-[10px] font-bold text-[#566166] dark:text-slate-400 uppercase tracking-wider leading-none">Dispositivo</p>
                    <p className="text-xs font-medium text-[#2a3439] dark:text-slate-100">Chrome on Windows 11</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Preferências de Interface (Interface Preferences) */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-[0_4px_20px_rgba(42,52,57,0.04)] border border-slate-50 dark:border-slate-800">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-2 bg-[#d3e4fe] rounded-lg text-[#506076]">
                <Settings2 className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-[#2a3439] dark:text-white leading-none">Preferências</h2>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="block text-xs font-bold text-[#566166] dark:text-slate-400 uppercase tracking-wider px-1">Tema Visual</Label>
                <div className="grid grid-cols-2 gap-2 bg-[#f0f4f7] dark:bg-slate-800 p-1 rounded-lg">
                  <button 
                    type="button" 
                    onClick={() => form.setValue('theme', 'light')}
                    className={cn(
                      "rounded-md py-2 flex items-center justify-center gap-2 transition-all",
                      form.watch('theme') === 'light' 
                        ? "bg-white dark:bg-slate-700 text-[#565e74] dark:text-white shadow-sm" 
                        : "text-[#566166] hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                    )}
                  >
                    <div className="w-3 h-3 rounded-full bg-slate-100 border border-slate-200" />
                    <span className="text-[10px] font-bold">Claro</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => form.setValue('theme', 'dark')}
                    className={cn(
                      "rounded-md py-2 flex items-center justify-center gap-2 transition-all",
                      form.watch('theme') === 'dark' 
                        ? "bg-slate-900 text-white shadow-sm" 
                        : "text-[#566166] hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                    )}
                  >
                    <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-700" />
                    <span className="text-[10px] font-bold">Escuro</span>
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="block text-xs font-bold text-[#566166] dark:text-slate-400 uppercase tracking-wider px-1">Idioma do Sistema</Label>
                <div className="relative">
                  <div className="w-full bg-[#f0f4f7] dark:bg-slate-800 rounded-lg py-3 px-4 h-11 text-[#2a3439] dark:text-slate-100 font-medium text-xs flex items-center justify-between">
                    Português (Brasil)
                    <ChevronRight className="w-3 h-3 rotate-90" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="block text-xs font-bold text-[#566166] dark:text-slate-400 uppercase tracking-wider px-1">Fuso Horário</Label>
                <div className="relative">
                  <div className="w-full bg-[#f0f4f7] dark:bg-slate-800 rounded-lg py-3 px-4 h-11 text-[#2a3439] dark:text-slate-100 font-medium text-[10px] flex items-center justify-between">
                    (GMT-03:00) São Paulo / Brasil
                    <ChevronRight className="w-3 h-3 rotate-90" />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[#a9b4b9]/10">
                <h3 className="text-xs font-bold text-[#566166] dark:text-slate-400 uppercase tracking-wider mb-4">Notificações</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-sm font-medium text-[#2a3439] dark:text-slate-300">Alertas por E-mail</span>
                    <button 
                      type="button"
                      onClick={() => form.setValue('notificationsConfig.email', !form.watch('notificationsConfig.email'))}
                      className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                        form.watch('notificationsConfig.email')
                          ? "border-[#565e74] bg-[#565e74] text-white"
                          : "border-[#a9b4b9] dark:border-slate-700 bg-transparent"
                      )}
                    >
                      {form.watch('notificationsConfig.email') && <Check className="w-3 h-3" />}
                    </button>
                  </label>
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-sm font-medium text-[#2a3439] dark:text-slate-300">WhatsApp Push</span>
                    <button 
                      type="button"
                      onClick={() => form.setValue('notificationsConfig.whatsapp', !form.watch('notificationsConfig.whatsapp'))}
                      className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                        form.watch('notificationsConfig.whatsapp')
                          ? "border-[#565e74] bg-[#565e74] text-white"
                          : "border-[#a9b4b9] dark:border-slate-700 bg-transparent"
                      )}
                    >
                      {form.watch('notificationsConfig.whatsapp') && <Check className="w-3 h-3" />}
                    </button>
                  </label>
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-sm font-medium text-[#2a3439] dark:text-slate-300">Notificações Desktop</span>
                    <button 
                      type="button"
                      onClick={() => form.setValue('notificationsConfig.desktop', !form.watch('notificationsConfig.desktop'))}
                      className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                        form.watch('notificationsConfig.desktop')
                          ? "border-[#565e74] bg-[#565e74] text-white"
                          : "border-[#a9b4b9] dark:border-slate-700 bg-transparent"
                      )}
                    >
                      {form.watch('notificationsConfig.desktop') && <Check className="w-3 h-3" />}
                    </button>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </form>
  );
}
