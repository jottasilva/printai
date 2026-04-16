'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { User, Mail, Briefcase, Layout, Loader2, Save, X, Shield, Info } from 'lucide-react';
import { updateUser } from '@/app/actions/users';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    sectorId?: string | null;
  } | null;
  sectors: { id: string; name: string }[];
}

export function UserEditModal({ isOpen, onClose, user, sectors }: UserEditModalProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    sectorId: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email,
        role: user.role,
        sectorId: user.sectorId || '',
      });
    }
  }, [user]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await updateUser(user.id, {
        ...formData,
        sectorId: formData.sectorId || null,
      });
      toast.success("Usuário atualizado", "As alterações foram salvas com sucesso.");
      onClose();
    } catch (error: any) {
      toast.error("Erro ao atualizar", error.message);
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  const sectorOptions = sectors?.map(s => ({ value: s.id, label: s.name })) || [];
  const roleOptions = [
    { value: "ADMIN", label: "Administrador" },
    { value: "MANAGER", label: "Gerente" },
    { value: "OPERATOR", label: "Operador" },
    { value: "VIEWER", label: "Visualizador" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose} size="full">
      <DialogContent className="w-[90vw] h-[80vh] p-0 border-none bg-transparent shadow-none">
        <div className="bg-[#f7f9fb] dark:bg-slate-950 rounded-[3rem] shadow-[0_30px_90px_rgba(0,0,0,0.25)] border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-300 h-full flex flex-col overflow-hidden">
          
          {/* Header Bento Style - Fixo */}
          <div className="relative p-12 pb-6 flex-shrink-0 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
            <button 
              onClick={onClose}
              className="absolute top-10 right-10 w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all hover:rotate-90 shadow-sm border border-slate-100 dark:border-transparent z-10"
            >
              <X className="w-6 h-6" />
            </button>
            
            <header className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-1.5 px-3 bg-primary/10 rounded-lg">
                  <span className="text-[11px] font-black text-primary uppercase tracking-[0.25em]">Management Identity</span>
                </div>
              </div>
              <h1 className="text-5xl font-extrabold tracking-tighter text-[#2a3439] dark:text-white leading-none">
                Editar <span className="text-primary italic">Membro</span>
              </h1>
              <p className="text-slate-500 font-medium text-base">Controle centralizado de permissões e dados da equipe.</p>
            </header>
          </div>

          {/* Área de Formulário com Scroll Interno */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-12 space-y-16 custom-scrollbar">
              
              {/* Seção: Dados Cadastrais */}
              <section className="space-y-10">
                <div className="flex items-center gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="p-2.5 bg-primary-container/30 rounded-xl text-primary font-bold">
                    <User className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Dados Cadastrais</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-3">
                    <label className="text-[12px] uppercase font-black text-slate-400 tracking-[0.2em] px-1">Nome Completo</label>
                    <Input 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="Ex: Ricardo Oliveira" 
                      className="h-16 bg-white dark:bg-slate-900 border-none rounded-2xl px-8 focus-visible:ring-primary/10 font-bold text-xl shadow-sm"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[12px] uppercase font-black text-slate-400 tracking-[0.2em] px-1">E-mail Corporativo</label>
                    <Input 
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      type="email" 
                      required 
                      placeholder="ricardo@printai.erp" 
                      className="h-16 bg-white dark:bg-slate-900 border-none rounded-2xl px-8 focus-visible:ring-primary/10 font-bold text-xl shadow-sm"
                    />
                  </div>
                </div>
              </section>

              {/* Seção: Estrutura Profissional */}
              <section className="space-y-10">
                <div className="flex items-center gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="p-2.5 bg-secondary-container/30 rounded-xl text-secondary">
                    <Layout className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Estrutura Profissional</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                    <label className="text-[12px] uppercase font-black text-slate-400 tracking-[0.2em] px-1">Alocação de Setor</label>
                    <Select 
                      id="edit-sector"
                      value={formData.sectorId}
                      onChange={(val) => setFormData({ ...formData, sectorId: val })}
                      placeholder="Selecione o departamento"
                      options={sectorOptions}
                      className="h-16 bg-white dark:bg-slate-900 border-none rounded-2xl font-black text-lg px-6 shadow-sm"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[12px] uppercase font-black text-slate-400 tracking-[0.2em] px-1">Privilégios de Acesso</label>
                    <Select 
                      id="edit-role"
                      value={formData.role}
                      onChange={(val) => setFormData({ ...formData, role: val })}
                      placeholder="Definir papel"
                      options={roleOptions}
                      className="h-16 bg-primary/5 dark:bg-primary/20 border-2 border-primary/20 rounded-2xl font-black text-primary text-lg px-6"
                    />
                  </div>
                </div>
              </section>

              {/* Seção de Segurança Complementar */}
              <section className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm border-dashed">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-bold text-slate-800 dark:text-slate-200">Segurança & Conformidade</p>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                      As alterações em níveis de privilégio são auditadas. O colaborador receberá um log de sistema informando sobre as mudanças de permissão.
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* Footer de Ação - Fixo */}
            <div className="p-10 flex-shrink-0 bg-white/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 backdrop-blur-md">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 max-w-7xl mx-auto">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <Info className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-bold text-slate-800 dark:text-slate-200">Revisão Pendente</p>
                    <p className="text-sm text-slate-400 font-medium">As modificações serão aplicadas ao perfil global do usuário.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={onClose}
                    className="flex-1 md:flex-none h-16 px-12 rounded-2xl font-bold text-slate-500 hover:text-slate-700 transition-all text-base"
                  >
                    Descartar
                  </Button>
                  <Button 
                    disabled={loading}
                    type="submit" 
                    className="flex-1 md:flex-none h-16 px-20 rounded-2xl bg-[#565e74] text-white font-black text-sm uppercase tracking-[0.25em] shadow-2xl shadow-slate-300 dark:shadow-none hover:translate-y-[-2px] transition-all disabled:opacity-50 flex gap-4 items-center"
                  >
                    {loading ? <Loader2 className="w-7 h-7 animate-spin" /> : (
                      <>
                        <Save className="w-6 h-6" />
                        Confirmar Ajustes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
