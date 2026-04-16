import { prisma } from './src/lib/db';
import { serializeData } from './src/lib/server-utils';

async function run() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log("No users found");
      return;
    }
    const tenantId = user.tenantId;
    console.log("Using Tenant:", tenantId);
    
    const items = await prisma.orderItem.findMany({
      where: {
        tenantId,
        status: {
          notIn: ['CANCELED', 'REJECTED']
        }
      },
      include: {
        product: {
          include: {
            category: { select: { name: true } },
          },
        },
        variant: true,
        order: {
          select: {
            id: true,
            number: true,
            status: true,
            paymentStatus: true,
            expectedDeliveryAt: true,
            notes: true,
            customer: {
              select: {
                id: true,
                name: true,
                phone: true,
                email: true,
              },
            },
          },
        },
        assignedUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' }
      ],
      take: 200,
    });
    
    console.log("Items found:", items.length);
    if (items.length > 0) {
      const serialized = serializeData(items);
      console.log("First item serialized without error.");
    }

    const [picking, inProgress, packing, shipped, total] = await Promise.all([
      prisma.orderItem.count({ where: { tenantId, status: { in: ['PENDING', 'QUEUED', 'PICKING'] } } }),
      prisma.orderItem.count({ where: { tenantId, status: 'IN_PROGRESS' } }),
      prisma.orderItem.count({ where: { tenantId, status: 'PACKING' } }),
      prisma.orderItem.count({ where: { tenantId, status: 'DONE' } }), // Mapeado para Shipped no Kanban anterior
      prisma.orderItem.count({ where: { tenantId } }),
    ]);
    
    console.log("Stats computed: ", {picking, inProgress, packing, shipped, total});

  } catch (err) {
    console.error("Error executing query:", err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
