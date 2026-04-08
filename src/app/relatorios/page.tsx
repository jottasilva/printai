import { BarChart3 } from 'lucide-react';
import { PagePlaceholder } from '@/components/page-placeholder';

export default function RelatoriosPage() {
  return (
    <PagePlaceholder
      title="Relatórios e BI"
      description="Análise profunda de produtividade, lucratividade por produto e projeções de demanda."
      icon={BarChart3}
    />
  );
}
