import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- DIAGNOSTIC START ---');
  try {
    const user = await prisma.user.findFirst();
    console.log('User found (first):', user ? { id: user.id, email: user.email } : 'None');
    
    if (user) {
      console.log('Testing findUnique with id:', user.id);
      const unique = await prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true, tenantId: true, role: true, email: true }
      });
      console.log('Unique found:', unique ? 'Yes' : 'No');
    } else {
      console.log('No user found to test findUnique.');
    }
  } catch (e: any) {
    console.error('FULL PRISMA ERROR:');
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
