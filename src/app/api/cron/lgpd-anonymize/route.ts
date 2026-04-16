import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashString } from '@/lib/crypto';

// Recomenda-se adicionar uma verificação de proteção por header/token CRON na Vercel
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // LGPD Retenção: Usuários deletados há mais de 5 anos (1825 dias)
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

    const oldCustomers = await prisma.customer.findMany({
      where: {
        deletedAt: {
          lte: fiveYearsAgo
        },
        name: { not: 'TITULAR REMOVIDO' } // Evita processar os que já foram
      },
      select: { id: true, email: true, document: true }
    });

    let anonymizedCount = 0;

    for (const customer of oldCustomers) {
      await prisma.customer.update({
        where: { id: customer.id },
        data: {
          name: 'TITULAR REMOVIDO',
          email: hashString(customer.email),
          phone: null,
          document: hashString(customer.document), // Torna irreversível para manter constraints
          tradingName: null,
          companyName: null,
          updatedAt: new Date()
        }
      });
      anonymizedCount++;
    }

    // Registra na auditoria global do sistema
    await prisma.systemLog.create({
      data: {
        level: 'INFO',
        message: `Rotina LGPD: Anonimizou ${anonymizedCount} clientes acima do SLA de 5 anos.`,
        service: 'Cron.LgpdAnonymize'
      }
    });

    return NextResponse.json({ success: true, count: anonymizedCount });
  } catch (error: any) {
    console.error('[CRON LGPD Error]', error);
    return NextResponse.json({ error: 'Falha ao executar CRON' }, { status: 500 });
  }
}
