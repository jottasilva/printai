export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Sidebar } from '@/components/sidebar';
import { OrderListClient } from './order-list-client';

async function getOrders(search?: string, status?: string) {
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

  const orders = await prisma.order.findMany({
    where,
    include: {
      customer: { select: { id: true, name: true, email: true, phone: true, document: true } },
      items: {
        include: {
          product: { select: { id: true, name: true } },
          assignedUser: { select: { id: true, name: true, avatarUrl: true } },
          logs: {
            include: { user: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
          }
        }
      },
      payments: {
        orderBy: { createdAt: 'desc' }
      },
      shippingAddress: true,
      billingAddress: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return orders;
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string };
}) {
  const orders = await getOrders(searchParams.search, searchParams.status);

  return (
    <div className="flex h-screen bg-surface dark:bg-slate-950 font-body">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 lg:p-10 lg:ml-64">
        <div className="max-w-7xl mx-auto">
          <OrderListClient initialOrders={JSON.parse(JSON.stringify(orders))} />
        </div>
      </main>
    </div>
  );
}
