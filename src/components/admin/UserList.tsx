'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreVertical, Shield, Mail, Smartphone, Trash2, Edit2 } from 'lucide-react';
import { deleteUser } from '@/app/actions/users';
import { useToast } from '@/components/ui/toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConfirmDialog } from '@/components/ui/dialog-system';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  sectorId?: string | null;
  sector?: { name: string } | null;
}

interface UserListProps {
  users: User[];
  sectors: { id: string; name: string }[];
}

export function UserList({ users, sectors }: UserListProps) {
  const { success, error } = useToast();
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);

  function handleDelete(id: string, name: string) {
    setUserToDelete({ id, name });
    setIsConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!userToDelete) return;
    
    setIsConfirmOpen(false);
    setDeletingId(userToDelete.id);
    try {
      await deleteUser(userToDelete.id);
      success("Usuário removido", "O acesso do usuário foi revogado com sucesso.");
    } catch (err: any) {
      error("Erro ao remover", err.message);
    } finally {
      setDeletingId(null);
      setUserToDelete(null);
    }
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <div 
          key={user.id} 
          className={`flex items-center justify-between p-5 rounded-3xl bg-white dark:bg-slate-900 border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-all ${deletingId === user.id ? 'opacity-50 grayscale' : ''}`}
        >
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12 rounded-2xl border-2 border-slate-50 dark:border-slate-800">
              <AvatarImage src={`https://avatar.vercel.sh/${user.id}`} />
              <AvatarFallback className="bg-primary/5 text-primary font-bold">{user.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-[#2D3E50] dark:text-white">{user.name}</h4>
                <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-[9px] font-bold px-1.5 py-0 h-4 border-none">
                  {user.role}
                </Badge>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center text-[10px] text-slate-400 font-medium italic">
                   {user.sector?.name || 'Sem Setor'}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-200" />
                <span className="text-[10px] text-slate-400 font-medium">{user.email}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5 mr-4">
              <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <Smartphone className="w-3.5 h-3.5" />
              </div>
              <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <Shield className="w-3.5 h-3.5" />
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-300 hover:text-slate-600">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem 
                  onClick={() => router.push(`/admin/usuarios/${user.id}`)}
                  className="flex gap-3 text-slate-700 dark:text-slate-200"
                >
                  <Edit2 className="w-4 h-4 opacity-70" />
                  <span className="text-sm">Editar Detalhes</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleDelete(user.id, user.name || user.email)}
                  disabled={deletingId === user.id}
                  className="flex gap-3 text-red-500 focus:bg-red-50 dark:focus:bg-red-950/30"
                >
                  <Trash2 className="w-4 h-4 opacity-70" />
                  <span className="text-sm">Excluir Membro</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
      
      {users.length === 0 && (
        <div className="py-20 text-center flex flex-col items-center justify-center text-slate-400 space-y-3 bg-slate-50/50 dark:bg-slate-900/50 rounded-[2.5rem]">
           <span className="material-symbols-outlined text-4xl opacity-20">group_off</span>
           <p className="text-sm italic">Nenhum membro encontrado na equipe.</p>
        </div>
      )}

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onConfirm={confirmDelete}
        title="Excluir Membro da Equipe"
        description={`Tem certeza que deseja excluir ${userToDelete?.name}? Esta ação revogará permanentemente o acesso ao sistema.`}
        variant="destructive"
        confirmText="Excluir Membro"
        cancelText="Manter Acesso"
        loading={!!deletingId}
      />
    </div>
  );
}
