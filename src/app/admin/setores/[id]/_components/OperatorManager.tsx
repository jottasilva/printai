'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  UserPlus, 
  X, 
  Loader2,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { assignUserToMachine, unassignUserFromMachine } from '@/app/actions/machines';
import { getUsers } from '@/app/actions/users';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

interface OperatorManagerProps {
  machineId: string;
  assignedUsers: any[];
}

export function OperatorManager({ machineId, assignedUsers: initialAssigned }: OperatorManagerProps) {
  const [assigned, setAssigned] = useState(initialAssigned);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const toast = useToast();

  useEffect(() => {
    async function load() {
      try {
        const u = await getUsers();
        setAllUsers(u);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingUsers(false);
      }
    }
    load();
  }, []);

  const handleAssign = async (userId: string) => {
    setLoading(userId);
    try {
      const result = await assignUserToMachine(machineId, userId);
      // Recarregar da forma mais simples para esta demonstração (idealmente retornaria o objeto populado)
      const user = allUsers.find(u => u.id === userId);
      setAssigned([...assigned, { id: result.id, user }]);
      toast.success("Operador autorizado", `${user.name} agora pode operar esta máquina.`);
    } catch (e: any) {
      toast.error("Erro ao autorizar", e.message);
    } finally {
      setLoading(null);
    }
  };

  const handleUnassign = async (assignmentId: string, userName: string) => {
    setLoading(assignmentId);
    try {
      await unassignUserFromMachine(assignmentId);
      setAssigned(prev => prev.filter(a => a.id !== assignmentId));
      toast.success("Autorização removida", `${userName} não tem mais acesso a esta máquina.`);
    } catch (e: any) {
      toast.error("Erro ao remover", e.message);
    } finally {
      setLoading(null);
    }
  };

  const availableUsers = allUsers.filter(u => !assigned.some(a => a.userId === u.id));

  return (
    <div className="space-y-8 p-1">
      {/* Operadores Atuais */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
           <Users className="w-4 h-4 text-primary" />
           Operadores Autorizados ({assigned.length})
        </h4>

        {assigned.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4">Nenhum operador vinculado a esta máquina.</p>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {assigned.map((a) => (
              <div 
                key={a.id}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl group border border-transparent hover:border-slate-100 transition-all"
              >
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black">
                      {a.user.name.charAt(0)}
                   </div>
                   <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white leading-none">{a.user.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{a.user.email}</p>
                   </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-xl h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50"
                  onClick={() => handleUnassign(a.id, a.user.name)}
                  disabled={!!loading}
                >
                   {loading === a.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="h-px bg-slate-100 dark:bg-slate-800" />

      {/* Adicionar Operadores */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
           <UserPlus className="w-4 h-4 text-primary" />
           Vincular Novo Operador
        </h4>

        {loadingUsers ? (
           <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary/20" />
           </div>
        ) : availableUsers.length === 0 ? (
           <p className="text-xs text-slate-400 italic py-2">Todos os usuários do tenant já estão autorizados.</p>
        ) : (
          <div className="max-h-[250px] overflow-y-auto pr-2 custom-scrollbar grid grid-cols-1 gap-2">
            {availableUsers.map((u) => (
              <button
                key={u.id}
                onClick={() => handleAssign(u.id)}
                disabled={!!loading}
                className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:border-primary/30 hover:bg-primary/5 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-primary/20 text-slate-400 group-hover:text-primary flex items-center justify-center text-[10px] font-bold transition-colors">
                      {u.name.charAt(0)}
                   </div>
                   <p className="text-sm font-bold text-slate-700 group-hover:text-primary transition-colors">{u.name}</p>
                </div>
                {loading === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4 text-slate-300 group-hover:text-primary" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
