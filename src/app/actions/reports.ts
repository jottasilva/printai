'use server'

import { prisma } from '@/lib/db'
import { withTenant } from '@/lib/server-utils'
import { LedgerService } from '@/lib/services/ledger-service'
import { LedgerAccountType } from '@prisma/client'

/**
 * Obtém o Demonstrativo de Resultados (DRE) Simplificado
 */
export const getProfitAndLoss = withTenant(async (startDate?: Date, endDate?: Date) => {
  // Busca todas as contas de Receita e Despesa
  const accounts = await prisma.ledgerAccount.findMany({
    where: {
      type: { in: [LedgerAccountType.REVENUE, LedgerAccountType.EXPENSE] }
    }
  })

  let totalRevenue = 0
  let totalExpense = 0

  const report = accounts.map(acc => {
    const balance = Number(acc.balance)
    
    if (acc.type === LedgerAccountType.REVENUE) {
      // Receita é credora (negativa no DB por convenção de alguns sistemas, 
      // mas aqui estamos guardando saldo real onde Crédito diminui e Débito aumenta).
      // No nosso LedgerService: Debit (Increments), Credit (Decrements).
      // Logo, Receita (que recebe créditos) terá saldo negativo.
      const val = Math.abs(balance)
      totalRevenue += val
      return { name: acc.name, code: acc.code, value: val, type: 'REVENUE' }
    } else {
      // Despesa é devedora (positiva)
      totalExpense += balance
      return { name: acc.name, code: acc.code, value: balance, type: 'EXPENSE' }
    }
  })

  return {
    revenue: totalRevenue,
    expenses: totalExpense,
    netProfit: totalRevenue - totalExpense,
    details: report
  }
});

/**
 * Obtém o Fluxo de Caixa (Saldos das Contas Disponíveis)
 */
export const getCashFlow = withTenant(async () => {
  const [cash, banks] = await Promise.all([
    LedgerService.getBalance('1.1.01'),
    LedgerService.getBalance('1.1.02')
  ])

  return {
    total: Number(cash) + Number(banks),
    cash: Number(cash),
    banks: Number(banks)
  }
});

/**
 * Agregado para a página de Relatórios & BI
 */
export const getReportData = withTenant(async () => {
  // Simulando dados complexos que serão conectados ao banco real em fases futuras
  // Mas mantendo-os dinâmicos o suficiente para o design VIP
  return {
    overview: {
      totalRevenue: 128500.00,
      revenueChange: 12.5,
      totalOrders: 432,
      ordersChange: 8.2,
      avgTicket: 297.45,
      ticketChange: -2.1,
      customerSatisfaction: 4.8,
      satisfactionChange: 0.5
    },
    revenueStats: [
      { month: 'Jan', revenue: 95000 },
      { month: 'Fev', revenue: 105000 },
      { month: 'Mar', revenue: 128500 },
      { month: 'Abr', revenue: 110000 },
      { month: 'Mai', revenue: 115000 },
      { month: 'Jun', revenue: 130000 }
    ],
    funnel: [
      { name: 'Orçamentos', value: 850, fill: 'var(--primary)' },
      { name: 'Aprovados', value: 520, fill: '#818cf8' },
      { name: 'Em Produção', value: 432, fill: '#a78bfa' },
      { name: 'Concluídos', value: 395, fill: '#c084fc' }
    ],
    categoryStats: [
      { category: 'Banners & Lonas', revenue: 45000, margin: 65 },
      { category: 'Adesivos', revenue: 32000, margin: 58 },
      { category: 'Cartões & Panfletos', revenue: 28000, margin: 42 },
      { category: 'Brindes', revenue: 23500, margin: 55 }
    ]
  }
});
