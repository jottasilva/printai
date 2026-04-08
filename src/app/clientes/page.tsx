import { Users } from 'lucide-react';
import { PagePlaceholder } from '@/components/page-placeholder';

export default function ClientesPage() {
  return (
    <PagePlaceholder
      title="Gestão de Clientes"
      description="CRM completo com histórico de pedidos, tickets de suporte e análise de comportamento de compra."
      icon={Users}
    />
  );
}
