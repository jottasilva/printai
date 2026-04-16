'use server'

import { prisma } from '@/lib/db'
import { getTenantId, safeAction, checkPermission } from '@/lib/server-utils'
import { revalidatePath } from 'next/cache'

// Criar nova categoria
export async function createCategory(data: { name: string; description?: string; parentId?: string }) {
  return safeAction(async () => {
    // 1. O middleware do server-utils garante que apenas auth acessem
    const { tenantId, userRole } = await getTenantId()
    
    // 2. Proteção de regras de negocio
    if (!await checkPermission(userRole)) {
      throw new Error('Acesso negado')
    }

    // 3. Validação Básica
    if (!data.name || data.name.trim().length < 2) {
      throw new Error('Nome da categoria requer pelo menos 2 caracteres')
    }

    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    // 4. Conexão direta com Prisma (aqui passa pelo pool direto pro Supabase)
    const newCategory = await prisma.category.create({
      data: {
        name: data.name,
        slug: slug,
        description: data.description,
        tenantId,
        ...(data.parentId && { parentId: data.parentId })
      }
    })

    // 5. Revalidação da interface Next.js
    revalidatePath('/produtos/categorias', 'page')

    return newCategory
  })
}

// Listar categorias
export async function getCategories() {
  return safeAction(async () => {
    const { tenantId } = await getTenantId()

    const categories = await prisma.category.findMany({
      where: {
        tenantId,
        deletedAt: null
      },
      orderBy: { name: 'asc' }
    })

    return categories
  })
}
