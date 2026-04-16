import { Sidebar } from '@/components/sidebar';
import { getSectors } from '@/app/actions/sectors';
import { getUserById, getUsers } from '@/app/actions/users';
import { serializeData } from '@/lib/utils';
import { UserEditForm } from '@/components/admin/UserEditForm';
import { notFound } from 'next/navigation';

interface UserPageProps {
  params: {
    id: string;
  };
}

export default async function UserEditPage({ params }: UserPageProps) {
  const [rawUser, rawSectors, rawUsers] = await Promise.all([
    getUserById(params.id),
    getSectors(),
    getUsers()
  ]);

  if (!rawUser) {
    notFound();
  }

  const user = serializeData(rawUser);
  const sectors = serializeData(rawSectors);
  const usersList = serializeData(rawUsers);

  return (
    <div className="flex min-h-screen bg-[#f7f9fb] dark:bg-slate-950">
      <Sidebar />
      <main className="flex-1 px-8 py-10 transition-all ml-64">
        <div className="max-w-7xl mx-auto">
          <UserEditForm user={user} sectors={sectors} users={usersList} />
        </div>
      </main>
    </div>
  );
}
