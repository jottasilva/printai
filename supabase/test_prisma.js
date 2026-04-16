const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    // Teste 1: Busca por ID (como no server-utils)
    const userId = 'aeb5f5cd-5d99-4a99-a1bc-c4a55fb3bab3';
    const userById = await prisma.user.findUnique({
      where: { id: userId }
    });
    console.log('User found by ID:', userById ? 'YES' : 'NO');
    if (userById) {
      console.log('ID Data:', JSON.stringify(userById, null, 2));
    }

    // Teste 2: Busca por Email
    const userByEmail = await prisma.user.findFirst({
      where: { email: 'admin@printai.com' }
    });
    console.log('User found by Email:', userByEmail ? 'YES' : 'NO');
  } catch (err) {
    console.error('Prisma Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
