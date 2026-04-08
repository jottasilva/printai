import { MessageSquare } from 'lucide-react';
import { PagePlaceholder } from '@/components/page-placeholder';

export default function ConversasPage() {
  return (
    <PagePlaceholder
      title="Conversas AI"
      description="Assistente multimodal integrado ao WhatsApp. Gerencie leads e automatize o atendimento com IA."
      icon={MessageSquare}
    />
  );
}
