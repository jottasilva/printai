import { Sidebar } from '@/components/sidebar';
import { getTenantId } from '@/lib/server-utils';
import { prisma } from '@/lib/db';
import { ProfileForm } from './profile-form';
import { Settings } from 'lucide-react';
import { serializeData } from '@/lib/utils';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const { tenantId, userId } = await getTenantId();

  // Buscar dados completos do usuário
  const user = await prisma.user.findUnique({
    where: { id: userId, tenantId },
  });

  if (!user) {
    redirect('/login');
  }

  const serialUser = serializeData(user);

  return (
    <div className="min-h-screen bg-[#f7f9fb] dark:bg-slate-950 selection:bg-primary/20">
      <Sidebar />
      
      <main className="lg:ml-64 px-8 py-10 transition-all">
        <div className="max-w-7xl mx-auto">
          <ProfileForm 
            initialData={{
              name: serialUser.name,
              email: serialUser.email,
              phone: serialUser.phone,
              avatarUrl: serialUser.avatarUrl,
              role: serialUser.role,
            }} 
          />
        </div>
      </main>
    </div>
  );
}
