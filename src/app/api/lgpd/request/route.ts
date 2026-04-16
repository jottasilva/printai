import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { getTenantId } from '@/lib/server-utils';

const RequestSchema = z.object({
  customerId: z.string(),
  type: z.enum(['acesso', 'correcao', 'eliminacao', 'portabilidade']),
});

export async function POST(req: Request) {
  try {
    const session = await getTenantId();
    if (!session || !session.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = RequestSchema.parse(body);

    // Valida se o cliente de fato existe e pertence a este tenant
    const customer = await prisma.customer.findFirst({
      where: { id: validated.customerId, tenantId: session.tenantId }
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Calcula Prazo Restrito de SLA: 15 dias corridos (poderiam ser úteis com lib complementar)
    const slaDeadline = new Date();
    slaDeadline.setDate(slaDeadline.getDate() + 15);

    const requestLog = await prisma.dataSubjectRequest.create({
      data: {
        tenantId: session.tenantId,
        customerId: validated.customerId,
        type: validated.type,
        status: 'PENDING',
        slaDeadline,
        metadata: { source: 'api_endpoint' }
      }
    });

    // TODO: Disparo de e-mail integrado para notificar DPO e Titular
    // mockEmailService.send(customer.email, 'Sua solicitação LGPD foi protocolada', requestLog.id);

    return NextResponse.json({ 
      success: true, 
      message: 'Solicitação registrada com sucesso',
      ticket: requestLog.id,
      deadline: slaDeadline 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
