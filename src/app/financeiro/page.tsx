import { CreditCard } from 'lucide-react';
import { PagePlaceholder } from '@/components/page-placeholder';

export default function FinanceiroPage() {
  return (
    <PagePlaceholder
      title="Gestão Financeira"
      description="Fluxo de caixa, contas a pagar/receber e integração com gateways de pagamento em tempo real."
      icon={CreditCard}
    />
  );
}
