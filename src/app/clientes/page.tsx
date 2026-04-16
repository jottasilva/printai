export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Sidebar } from '@/components/sidebar';
import { CustomerListClient } from './customer-list-client';
import { Suspense } from 'react';

async function getCustomers(search?: string, type?: string, pageParam?: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { tenantId: true }
  });

  if (!profile) throw new Error('Profile not found');

  const where: any = {
    tenantId: profile.tenantId,
    deletedAt: null,
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { companyName: { contains: search, mode: 'insensitive' } },
      // Obs: Documento agora é criptografado. A busca pode rodar sobre documentHash caso chegue exatamente o hash final.
      // { documentHash: hashString(search) } - a depender de impl.
    ];
  }

  if (type && type !== 'ALL') {
    where.type = type;
  }

  const page = Math.max(1, parseInt(pageParam || '1', 10));
  const take = 10;
  const skip = (page - 1) * take;

  const totalCount = await prisma.customer.count({ where });

  const customers = await prisma.customer.findMany({
    where,
    include: {
      orders: {
        where: { deletedAt: null },
        select: { total: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: { orders: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take,
    skip,
  });

  // Processar dados para facilitar no cliente
  const data = customers.map(customer => {
    const totalSpent = customer.orders.reduce((acc, order) => acc + Number(order.total), 0);
    const lastOrder = customer.orders[0]?.createdAt || null;
    
    return {
      ...customer,
      totalSpent,
      lastOrder,
      orderCount: customer._count.orders,
    };
  });

  return {
    data,
    pagination: {
      total: totalCount,
      page,
      totalPages: Math.ceil(totalCount / take),
      take
    }
  };
}

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: { search?: string; type?: string; page?: string };
}) {
  return (
    <div className="flex h-screen bg-surface dark:bg-slate-950 font-body">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 lg:p-10 lg:ml-64">
        <div className="max-w-7xl mx-auto">
          <Suspense fallback={<CustomerListSkeleton />}>
            <CustomerListContent searchParams={searchParams} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

async function CustomerListContent({ searchParams }: { searchParams: { search?: string; type?: string; page?: string } }) {
  try {
    const { data: customers, pagination } = await getCustomers(searchParams.search, searchParams.type, searchParams.page);
    
    // Buscar também estatísticas gerais do tenant
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const profile = await prisma.user.findUnique({
      where: { id: user?.id },
      select: { tenantId: true }
    });

    const stats = {
      totalActive: await prisma.customer.count({
        where: { tenantId: profile?.tenantId, deletedAt: null }
      }),
      // Outras estatísticas podem ser adicionadas aqui
    };

    return (
      <CustomerListClient 
        initialCustomers={JSON.parse(JSON.stringify(customers))} 
        stats={stats}
        pagination={pagination}
      />
    );
  } catch (error) {
    console.error('Error loading customers:', error);
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
        <span className="material-symbols-outlined text-4xl text-slate-300 mb-4">error</span>
        <h3 className="text-lg font-headline text-slate-900 dark:text-white mb-1">Erro ao carregar clientes</h3>
        <p className="text-sm text-slate-500 font-normal">Tente atualizar a página ou contate o suporte.</p>
      </div>
    );
  }
}

function CustomerListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="h-10 w-64 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />
          <div className="h-4 w-96 bg-slate-50 dark:bg-slate-900 animate-pulse rounded-lg" />
        </div>
        <div className="h-10 w-40 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-white/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 animate-pulse rounded-xl" />
        ))}
      </div>
      
      <div className="h-[500px] bg-white/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 animate-pulse rounded-2xl" />
    </div>
  );
}
