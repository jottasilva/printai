'use server'

import { prisma } from '@/lib/db'
import { withTenant, getTenantId } from '@/lib/server-utils'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const MachineSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Nome da máquina é obrigatório'),
  sectorId: z.string().min(1, 'Setor é obrigatório'),
  description: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  serialNumber: z.string().optional().nullable(),
  status: z.enum(['OPERATIONAL', 'DOWN', 'MAINTENANCE']).default('OPERATIONAL'),
  capacityPerHour: z.coerce.number().default(0),
  manufacturer: z.string().optional().nullable(),
  year: z.string().optional().nullable(),
  metadata: z.record(z.any()).optional(),
})

export type MachineFormData = z.infer<typeof MachineSchema>

async function logAudit(action: string, entityId: string, before?: any, after?: any) {
  try {
    const { tenantId, userId, userEmail } = await getTenantId()
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        userEmail,
        action,
        entity: 'Machine',
        entityId,
        before: before ? JSON.parse(JSON.stringify(before)) : undefined,
        after: after ? JSON.parse(JSON.stringify(after)) : undefined,
      }
    })
  } catch (e) {
    console.error('[AUDIT_LOG_FAILED]', e)
  }
}

export const getMachinesBySector = withTenant(async (sectorId: string) => {
  return await prisma.machine.findMany({
    where: { sectorId },
    include: {
      assignedUsers: {
        include: { user: { select: { name: true, email: true } } }
      }
    },
    orderBy: { name: 'asc' }
  })
})

export const upsertMachine = withTenant(async (data: MachineFormData) => {
  const validated = MachineSchema.parse(data)
  const { tenantId } = await getTenantId()

  const { manufacturer, year, metadata: extraMetadata, ...rest } = validated;
  
  const finalMetadata = {
    ...(extraMetadata || {}),
    manufacturer,
    year
  };

  if (validated.id) {
    const before = await prisma.machine.findUnique({ where: { id: validated.id, tenantId } })
    const machine = await prisma.machine.update({
      where: { id: validated.id, tenantId },
      data: {
        ...rest,
        metadata: finalMetadata
      }
    })
    await logAudit('UPDATE_MACHINE', machine.id, before, machine)
    revalidatePath(`/admin/setores/${validated.sectorId}`)
    return machine
  } else {
    const machine = await prisma.machine.create({
      data: {
        ...rest,
        tenantId,
        metadata: finalMetadata
      }
    })
    await logAudit('CREATE_MACHINE', machine.id, null, machine)
    revalidatePath(`/admin/setores/${validated.sectorId}`)
    return machine
  }
})

export const deleteMachine = withTenant(async (id: string, sectorId: string) => {
  const { tenantId } = await getTenantId()
  const before = await prisma.machine.findUnique({ where: { id, tenantId } })
  
  await prisma.machine.delete({
    where: { id, tenantId }
  })
  
  await logAudit('DELETE_MACHINE', id, before, null)
  revalidatePath(`/admin/setores/${sectorId}`)
})

export const assignUserToMachine = withTenant(async (machineId: string, userId: string) => {
  const { tenantId } = await getTenantId()
  
  const userMachine = await prisma.userMachine.create({
    data: {
      tenantId,
      machineId,
      userId
    }
  })

  await logAudit('ASSIGN_USER_MACHINE', machineId, null, { userId })
  revalidatePath('/admin/setores')
  return userMachine
})

export const unassignUserFromMachine = withTenant(async (id: string) => {
  const { tenantId } = await getTenantId()
  const before = await prisma.userMachine.findUnique({ where: { id, tenantId } })
  
  await prisma.userMachine.delete({
    where: { id, tenantId }
  })

  await logAudit('UNASSIGN_USER_MACHINE', before?.machineId || 'UNKNOWN', before, null)
  revalidatePath('/admin/setores')
})

/**
 * Registra o início de uso de uma máquina (Check-in)
 */
export const startMachineUsage = withTenant(async (machineId: string, orderItemId?: string) => {
  const { tenantId, userId } = await getTenantId()
  
  // Encerrar logs abertos para este usuário nesta máquina (segurança)
  await prisma.machineUsageLog.updateMany({
    where: { machineId, userId, endTime: null, tenantId },
    data: { endTime: new Date() }
  })

  const log = await prisma.machineUsageLog.create({
    data: {
      tenantId,
      machineId,
      userId,
      orderItemId,
      startTime: new Date()
    }
  })

  await logAudit('START_MACHINE_USAGE', machineId, null, { logId: log.id, orderItemId })
  revalidatePath('/producao')
  return log
})

/**
 * Registra o fim de uso (Check-out) e calcula a duração
 */
export const stopMachineUsage = withTenant(async (logId: string) => {
  const { tenantId } = await getTenantId()
  
  const log = await prisma.machineUsageLog.findUnique({ where: { id: logId, tenantId } })
  if (!log) throw new Error('Log não encontrado')

  const endTime = new Date()
  const duration = Math.round((endTime.getTime() - log.startTime.getTime()) / 60000)

  const updatedLog = await prisma.machineUsageLog.update({
    where: { id: logId, tenantId },
    data: {
      endTime,
      duration
    }
  })

  // Incrementar o totalUsageMinutes da máquina
  await prisma.machine.update({
    where: { id: log.machineId, tenantId },
    data: {
      totalUsageMinutes: { increment: duration }
    }
  })

  await logAudit('STOP_MACHINE_USAGE', log.machineId, log, updatedLog)
  revalidatePath('/producao')
  return updatedLog
})
