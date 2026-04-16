export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Sidebar } from '@/components/sidebar';
import { QuoteFormClient } from './quote-form-client';

async function getFormData() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { tenantId: true }
  });

  if (!profile) throw new Error('Profile not found');

  const [categories, products, customers] = await Promise.all([
    prisma.category.findMany({
      where: { tenantId: profile.tenantId, deletedAt: null },
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' },
    }),
    prisma.product.findMany({
      where: {
        tenantId: profile.tenantId,
        deletedAt: null,
        isActive: true,
        isSellable: true,
      },
      include: {
        category: { select: { id: true, name: true } },
        variants: { where: { isActive: true, deletedAt: null } },
      },
      orderBy: { name: 'asc' },
      take: 100,
    }),
    prisma.customer.findMany({
      where: { tenantId: profile.tenantId, deletedAt: null },
      select: { id: true, name: true, email: true, phone: true, document: true, documentType: true },
      orderBy: { name: 'asc' },
      take: 100,
    }),
  ]);

  return {
    categories: JSON.parse(JSON.stringify(categories)),
    products: JSON.parse(JSON.stringify(products)),
    customers: JSON.parse(JSON.stringify(customers)),
  };
}

export default async function NovoOrcamentoPage() {
  const formData = await getFormData();

  return (
    <div className="flex h-screen bg-surface dark:bg-slate-950 font-body">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 lg:p-10 lg:ml-64">
        <div className="max-w-7xl mx-auto">
          <QuoteFormClient
            categories={formData.categories}
            products={formData.products}
            customers={formData.customers}
          />
        </div>
      </main>
    </div>
  );
}
