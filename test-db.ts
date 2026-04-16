import { prisma } from './src/lib/db'

async function testConnection() {
  try {
    const count = await prisma.customer.count()
    console.log('✅ Conexão OK — total de customers:', count)
    
    const sample = await prisma.customer.findFirst({
      select: { id: true, name: true, tenantId: true, deletedAt: true }
    })
    console.log('✅ Amostra:', sample)
  } catch (err: any) {
    console.error('❌ Erro de conexão:', err.message)
  } finally {
    await prisma.$disconnect()
  }
}
testConnection()
