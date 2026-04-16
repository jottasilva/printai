export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Sidebar } from '@/components/sidebar';
import { QuoteListClient } from './quote-list-client';

async function getQuotes(search?: string, status?: string) {
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
      { number: { contains: search, mode: 'insensitive' } },
      { customer: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }

  if (status && status !== 'ALL') {
    where.status = status;
  }

  const quotes = await prisma.quote.findMany({
    where,
    include: {
      customer: { select: { id: true, name: true, email: true, phone: true, document: true } },
      items: {
        include: {
          product: { select: { id: true, name: true, sku: true } },
        },
      },
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return quotes;
}

import { Suspense } from 'react';

export default async function OrcamentosPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string };
}) {
  return (
    <div className="flex h-screen bg-surface dark:bg-slate-950 font-body">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 lg:p-10 lg:ml-64">
        <div className="max-w-7xl mx-auto">
          <Suspense fallback={<QuoteListSkeleton />}>
            <QuoteListContent searchParams={searchParams} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

async function QuoteListContent({ searchParams }: { searchParams: { search?: string; status?: string } }) {
  try {
    const quotes = await getQuotes(searchParams.search, searchParams.status);
    return <QuoteListClient initialQuotes={JSON.parse(JSON.stringify(quotes))} />;
  } catch (error) {
    console.error('Error loading quotes:', error);
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
        <span className="material-symbols-outlined text-4xl text-slate-300 mb-4">error</span>
        <h3 className="text-lg font-headline text-slate-900 dark:text-white mb-1">Erro ao carregar orçamentos</h3>
        <p className="text-sm text-slate-500 font-normal">Tente atualizar a página ou contate o suporte.</p>
      </div>
    );
  }
}

function QuoteListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-48 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-white/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 animate-pulse rounded-2xl" />
        ))}
      </div>
      <div className="h-[500px] bg-white/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 animate-pulse rounded-2xl" />
    </div>
  );
}
