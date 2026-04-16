import { getSectors } from '@/app/actions/sectors';
import { getProducts } from '@/app/actions/products';
import { MachineNewForm } from '@/components/admin/MachineNewForm';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Novo Equipamento | PrintAI',
  description: 'Cadastre novas unidades de impressão no ecossistema PrintAI.',
};

export default async function NewMachinePage() {
  const [sectors, products] = await Promise.all([
    getSectors(),
    getProducts()
  ]);

  return (
    <div className="min-h-screen bg-[#FDFDFF] p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Breadcrumb / Back */}
        <div className="flex items-center gap-4">
          <Link 
            href="/admin"
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
          </Link>
          <div className="h-4 w-[1px] bg-slate-200" />
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">
            Gestão de Ativos / Novo Equipamento
          </p>
        </div>

        <MachineNewForm 
          sectors={sectors} 
          products={products} 
        />
      </div>
    </div>
  );
}
