import { PrismaClient, Plan, TenantStatus, UserRole, ProductType, OrderStatus, OrderPaymentStatus, ProductionStatus, OrderItemStatus } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

// Configurações do Supabase (A partir do .env)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const accessToken = process.env.SUPABASE_ACCESS_TOKEN!;
const projectId = process.env.SUPABASE_PROJECT_ID!;

async function getServiceRoleKey() {
  // Usando a chave legacy que extraímos do raw JSON
  return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6c3pjcHFpdW92YW1pd3Zuc2xrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTY2MjIxNCwiZXhwIjoyMDkxMjM4MjE0fQ.O5OsTqMSbmpKlKTvi9bOIOpfjRGFxwYRsvBuRYRN3Uk";
}

async function main() {
  console.log('🚀 Iniciando Seed...');

  // 1. Obter Service Role Key para criar usuário no Auth
  const serviceRoleKey = await getServiceRoleKey();
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // 2. Criar Tenant (Empresa)
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'printai-demo' },
    update: {},
    create: {
      name: 'PrintAI Gráfica Demo',
      slug: 'printai-demo',
      plan: Plan.PROFESSIONAL,
      status: TenantStatus.ACTIVE,
      settings: {
        theme: 'dark',
        currency: 'BRL'
      }
    }
  });

  console.log('🏢 Tenant criado:', tenant.name);

  // 3. Criar Usuário no Supabase Auth
  const adminEmail = 'admin@printai.com';
  const adminPassword = '123456';

  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: { name: 'Admin PrintAI' }
  });

  if (authError && authError.message !== 'User already registered') {
    console.error('❌ Erro ao criar usuário auth:', authError.message);
  }

  // Obter o ID do usuário (mesmo que já exista)
  const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
  const targetAuthUser = existingUsers.users.find(u => u.email === adminEmail);

  if (!targetAuthUser) throw new Error('Admin user not found in Auth after creation');

  // 4. Criar Perfil de Usuário no Prisma
  const user = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: adminEmail } },
    update: { id: targetAuthUser.id },
    create: {
      id: targetAuthUser.id,
      tenantId: tenant.id,
      email: adminEmail,
      name: 'Administrador Sistema',
      role: UserRole.OWNER,
    }
  });

  console.log('👤 Usuário Admin configurado:', user.email);

  // 5. Criar Categorias
  const catPapelaria = await prisma.category.upsert({
    where: { tenantId_slug: { tenantId: tenant.id, slug: 'papelaria' } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Papelaria',
      slug: 'papelaria',
      description: 'Produtos de papelaria corporativa'
    }
  });

  const catSign = await prisma.category.upsert({
    where: { tenantId_slug: { tenantId: tenant.id, slug: 'comunicacao-visual' } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Comunicação Visual',
      slug: 'comunicacao-visual',
      description: 'Banners, adesivos e placas'
    }
  });

  // 6. Criar Produtos
  const product1 = await prisma.product.upsert({
    where: { tenantId_sku: { tenantId: tenant.id, sku: 'CART-001' } },
    update: {},
    create: {
      tenantId: tenant.id,
      categoryId: catPapelaria.id,
      name: 'Cartão de Visita 4x4',
      sku: 'CART-001',
      basePrice: 85.00,
      costPrice: 42.00,
      type: ProductType.SIMPLE,
      unit: 'milheiro'
    }
  });

  const product2 = await prisma.product.upsert({
    where: { tenantId_sku: { tenantId: tenant.id, sku: 'BANN-001' } },
    update: {},
    create: {
      tenantId: tenant.id,
      categoryId: catSign.id,
      name: 'Banner Lona 440g',
      sku: 'BANN-001',
      basePrice: 120.00,
      costPrice: 65.00,
      type: ProductType.VARIABLE,
      unit: 'm2'
    }
  });

  // 7. Criar Cliente
  const existingCustomer = await prisma.customer.findFirst({
    where: { tenantId: tenant.id, document: '12345678901' }
  });

  let customer;
  if (existingCustomer) {
    customer = existingCustomer;
  } else {
    customer = await prisma.customer.create({
      data: {
        tenantId: tenant.id,
        name: 'Cliente Exemplo LTDA',
        email: 'cliente@exemplo.com',
        document: '12345678901',
        documentType: 'CPF',
        phone: '11999999999'
      }
    });
  }

  // 8. Criar Pedidos para o Kanban
  const order1 = await prisma.order.create({
    data: {
      tenantId: tenant.id,
      customerId: customer.id,
      userId: user.id,
      number: 'ORD-001',
      status: OrderStatus.IN_PRODUCTION,
      productionStatus: ProductionStatus.IN_PROGRESS,
      subtotal: 170.00,
      total: 170.00,
      remainingAmount: 170.00,
      items: {
        create: [
          {
            tenantId: tenant.id,
            productId: product1.id,
            description: 'Cartão de Visita 4x4 - Verniz Localizado',
            quantity: 2,
            unitPrice: 85.00,
            total: 170.00,
            status: OrderItemStatus.IN_PROGRESS
          }
        ]
      }
    }
  });

  const order2 = await prisma.order.create({
    data: {
      tenantId: tenant.id,
      customerId: customer.id,
      userId: user.id,
      number: 'ORD-002',
      status: OrderStatus.CONFIRMED,
      productionStatus: ProductionStatus.IN_QUEUE,
      subtotal: 120.00,
      total: 120.00,
      remainingAmount: 120.00,
      items: {
        create: [
          {
            tenantId: tenant.id,
            productId: product2.id,
            description: 'Banner Lona 1x1m',
            quantity: 1,
            unitPrice: 120.00,
            total: 120.00,
            status: OrderItemStatus.QUEUED
          }
        ]
      }
    }
  });

  console.log('✅ Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no Seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
