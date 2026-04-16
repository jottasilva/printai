'use client';

import { useTransition } from 'react';
import { resolveAnomaly } from '@/app/actions/sectors-pro';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ResolveAlertButtonProps {
  sectorId: string;
  alertId: string;
}

export function ResolveAlertButton({ sectorId, alertId }: ResolveAlertButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleResolve() {
    startTransition(async () => {
      try {
        await resolveAnomaly(sectorId, alertId);
        toast.success('Alerta resolvido com sucesso');
      } catch (error) {
        toast.error('Erro ao resolver alerta');
      }
    });
  }

  return (
    <Button
      variant="outline"
      className="rounded-xl border-rose-200 text-rose-700 hover:bg-rose-100 h-10 px-6 font-bold text-xs uppercase tracking-widest transition-all active:scale-95"
      onClick={handleResolve}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <CheckCircle className="w-4 h-4 mr-2" />
      )}
      Resolver Agora
    </Button>
  );
}
