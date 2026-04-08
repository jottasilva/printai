import { Package } from 'lucide-react';
import { PagePlaceholder } from '@/components/page-placeholder';

export default function EstoquePage() {
  return (
    <PagePlaceholder
      title="Controle de Estoque"
      description="Monitoramento de insumos, alertas de reposição e integração direta com o fluxo de produção."
      icon={Package}
    />
  );
}
