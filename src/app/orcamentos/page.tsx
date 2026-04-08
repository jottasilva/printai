import { FileText } from 'lucide-react';
import { PagePlaceholder } from '@/components/page-placeholder';

export default function OrcamentosPage() {
  return (
    <PagePlaceholder
      title="Orçamentos"
      description="Gerencie solicitações, gere orçamentos em PDF com IA e converta-os em pedidos com um clique."
      icon={FileText}
    />
  );
}
