import { prisma } from '../db';
import { LedgerAccountType, Prisma } from '@prisma/client';
import { useTenantId } from '../tenant-context';

/**
 * Serviço de Ledger (Livro Razão) Contábil
 * Implementa lógica de partida dobrada para o Print.AI
 */

const DEFAULT_ACCOUNTS = [
  // ATIVOS (1.x)
  { code: '1.1.01', name: 'Caixa Geral', type: 'ASSET' as LedgerAccountType },
  { code: '1.1.02', name: 'Bancos - Conta Corrente', type: 'ASSET' as LedgerAccountType },
  { code: '1.2.01', name: 'Contas a Receber', type: 'ASSET' as LedgerAccountType },
  
  // PASSIVOS (2.x)
  { code: '2.1.01', name: 'Contas a Pagar - Fornecedores', type: 'LIABILITY' as LedgerAccountType },
  { code: '2.1.02', name: 'Impostos a Recolher', type: 'LIABILITY' as LedgerAccountType },
  
  // RECEITAS (3.x)
  { code: '3.1.01', name: 'Receita de Vendas - Produtos', type: 'REVENUE' as LedgerAccountType },
  { code: '3.1.02', name: 'Receita de Vendas - Serviços', type: 'REVENUE' as LedgerAccountType },
  
  // DESPESAS (4.x)
  { code: '4.1.01', name: 'Custo de Mercadorias Vendidas (CMV)', type: 'EXPENSE' as LedgerAccountType },
  { code: '4.1.02', name: 'Despesas Administrativas', type: 'EXPENSE' as LedgerAccountType },
  { code: '4.1.03', name: 'Taxas de Gateway/Cartão', type: 'EXPENSE' as LedgerAccountType },
];

export class LedgerService {
  /**
   * Inicializa o plano de contas padrão para um novo tenant
   */
  static async initTenantLedger(tenantId: string) {
    console.log(`[LedgerService] Inicializando plano de contas para tenant: ${tenantId}`);
    
    const accounts = DEFAULT_ACCOUNTS.map(acc => ({
      ...acc,
      tenantId,
    }));

    await prisma.ledgerAccount.createMany({
      data: accounts,
      skipDuplicates: true,
    });
  }

  /**
   * Registra uma entrada contábil (Double-Entry)
   */
  static async postEntry(params: {
    tenantId?: string;
    debitAccountCode: string;
    creditAccountCode: string;
    amount: Prisma.Decimal | number;
    description: string;
    referenceEntity?: string;
    referenceId?: string;
    metadata?: any;
  }) {
    const tenantId = params.tenantId || useTenantId();
    const { debitAccountCode, creditAccountCode, amount, description, referenceEntity, referenceId, metadata } = params;

    return await prisma.$transaction(async (tx) => {
      const [debitAcc, creditAcc] = await Promise.all([
        tx.ledgerAccount.findUnique({ where: { tenantId_code: { tenantId, code: debitAccountCode } } }),
        tx.ledgerAccount.findUnique({ where: { tenantId_code: { tenantId, code: creditAccountCode } } }),
      ]);

      if (!debitAcc || !creditAcc) {
        throw new Error(`Contas contábeis não encontradas: ${debitAccountCode} ou ${creditAccountCode}`);
      }

      const entry = await tx.ledgerEntry.create({
        data: {
          tenantId,
          debitAccountId: debitAcc.id,
          creditAccountId: creditAcc.id,
          amount,
          description,
          referenceEntity,
          referenceId,
          metadata,
        },
      });

      await Promise.all([
        tx.ledgerAccount.update({
          where: { id: debitAcc.id },
          data: { balance: { increment: amount } },
        }),
        tx.ledgerAccount.update({
          where: { id: creditAcc.id },
          data: { balance: { decrement: amount } },
        }),
      ]);

      return entry;
    });
  }

  /**
   * Obtém o saldo atual de uma conta pelo código
   */
  static async getBalance(code: string, tenantId?: string) {
    const id = tenantId || useTenantId();
    const account = await prisma.ledgerAccount.findUnique({
      where: { tenantId_code: { tenantId: id, code } },
      select: { balance: true }
    });
    return account?.balance || 0;
  }
}
