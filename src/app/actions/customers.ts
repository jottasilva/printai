'use server'

import { prisma } from '@/lib/db'
import { getTenantId } from '@/lib/server-utils'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { encrypt, hashString } from '@/lib/crypto'

const CustomerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Nome obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional().nullable(),
  document: z.string().min(1, 'Documento obrigatório'),
  documentType: z.enum(['CPF', 'CNPJ']),
  type: z.string().default('PERSON'),
  companyName: z.string().optional().nullable(),
})

export type CustomerFormData = z.infer<typeof CustomerSchema>

export type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Registra um log de auditoria seguro sem expor dados reais
 */
async function logAuditError(tenantId: string, userId: string, userEmail: string, action: string, errorMsg: string) {
  try {
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        userEmail,
        action,
        entity: 'Customer',
        entityId: 'SYSTEM',
        after: { error: errorMsg },
      }
    });
  } catch (e) {
    console.error('[AUDIT_LOG_FAILED]', e);
  }
}

/**
 * Cria ou atualiza um cliente com Criptografia LGPD
 */
export async function saveCustomer(formData: CustomerFormData): Promise<Result<any>> {
  let session;
  try {
    session = await getTenantId()
  } catch (e) {
    return { success: false, error: 'Sessão inválida ou expirada. Faça login novamente.' }
  }

  const { tenantId, userId, userEmail } = session;

  try {
    const validated = CustomerSchema.parse(formData)
    
    // LGPD: Criptografia irreversível (hash) para buscas e reversível para visualização
    const encDocument = encrypt(validated.document);
    const docHash = hashString(validated.document);

    if (validated.id) {
      // Atualização
      const customer = await prisma.customer.update({
        where: { 
          id: validated.id,
          tenantId 
        },
        data: {
          name: validated.name,
          email: validated.email,
          phone: validated.phone,
          document: encDocument,
          documentHash: docHash,
          documentType: validated.documentType,
          type: validated.type,
          companyName: validated.companyName,
        }
      })
      revalidatePath('/clientes')
      return { success: true, data: customer }
    } else {
      // Criação
      const customer = await prisma.customer.create({
        data: {
          tenantId,
          name: validated.name,
          email: validated.email,
          phone: validated.phone,
          document: encDocument,
          documentHash: docHash,
          documentType: validated.documentType,
          type: validated.type,
          companyName: validated.companyName,
        }
      })
      revalidatePath('/clientes')
      return { success: true, data: customer }
    }
  } catch (error: any) {
    const publicMessage = error instanceof z.ZodError 
      ? 'Dados inválidos fornecidos no formulário.' 
      : 'Ocorreu um erro interno ao processar o cliente.';
      
    await logAuditError(tenantId, userId, userEmail, 'SAVE_CUSTOMER_ERROR', error.message || 'Unknown');
    return { success: false, error: publicMessage }
  }
}

/**
 * Soft delete de cliente
 */
export async function deleteCustomer(id: string): Promise<Result<null>> {
  let session;
  try {
    session = await getTenantId()
  } catch (e) {
    return { success: false, error: 'Sessão expirada.' }
  }

  const { tenantId, userId, userEmail } = session;

  try {
    await prisma.customer.update({
      where: { 
        id,
        tenantId 
      },
      data: { deletedAt: new Date() },
    })

    revalidatePath('/clientes')
    return { success: true, data: null }
  } catch (error: any) {
    await logAuditError(tenantId, userId, userEmail, 'DELETE_CUSTOMER_ERROR', error.message || 'Unknown');
    return { success: false, error: 'Falha ao remover cliente.' }
  }
}
