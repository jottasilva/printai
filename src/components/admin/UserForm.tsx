'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { UserPlus, Upload, Loader2, Mail, User, Briefcase, Layout } from 'lucide-react';
import { createUser } from '@/app/actions/users';
import { useToast } from '@/components/ui/toast';

interface UserFormProps {
  sectors: { id: string; name: string }[];
}

export function UserForm({ sectors }: UserFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      role: formData.get('role') as string,
      sectorId: formData.get('sectorId') as string,
    };

    try {
      await createUser(data);
      toast.success("Usuário criado!", `${data.name} foi adicionado à equipe.`);
      (event.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast.error("Erro ao criar usuário", error.message);
    } finally {
      setLoading(false);
    }
  }

  const sectorOptions = sectors?.map(s => ({ value: s.id, label: s.name })) || [];
  const roleOptions = [
    { value: "ADMIN", label: "Administrador" },
    { value: "MANAGER", label: "Gerente" },
    { value: "OPERATOR", label: "Operador" },
    { value: "VIEWER", label: "Visualizador" },
  ];

  return (
    <Card className="border-none shadow-[0_10px_40px_rgba(0,0,0,0.04)] bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
      <CardHeader className="p-8 pb-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary mb-4">
          <UserPlus className="w-6 h-6" />
        </div>
        <CardTitle className="text-xl font-semibold text-[#2D3E50] dark:text-white">Novo Cadastro</CardTitle>
        <CardDescription>Adicione um novo membro à equipe da gráfica</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="p-8 pt-4 space-y-6">
          <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50">
            <div className="w-20 h-20 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center mb-3">
              <Upload className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-xs font-semibold text-slate-500">Upload de Foto (Opcional)</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-1">Nome Completo</label>
              <Input 
                name="name" 
                required 
                placeholder="Ex: João da Silva" 
                className="rounded-xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 h-12"
                icon={<User className="w-4 h-4" />}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-1">E-mail Corporativo</label>
              <Input 
                name="email" 
                type="email" 
                required 
                placeholder="usuario@grafica.com" 
                className="rounded-xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 h-12"
                icon={<Mail className="w-4 h-4" />}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-1">Setor</label>
                <Select 
                  name="sectorId" 
                  placeholder="Selecione"
                  options={sectorOptions}
                  icon={<Layout className="w-4 h-4" />}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-1">Papel</label>
                <Select 
                  name="role" 
                  defaultValue="OPERATOR"
                  placeholder="Selecione"
                  options={roleOptions}
                  icon={<Briefcase className="w-4 h-4" />}
                />
              </div>
            </div>
          </div>

          <Button 
            disabled={loading}
            type="submit" 
            className="w-full rounded-2xl bg-[#2D3E50] dark:bg-primary hover:bg-[#1a2530] text-white h-14 font-semibold text-sm shadow-xl shadow-slate-200 dark:shadow-none transition-all"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Criar Usuário'}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}
