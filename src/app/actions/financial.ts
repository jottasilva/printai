'use server'

import { prisma } from '@/lib/db'
import { withTenant } from '@/lib/server-utils'
import { LedgerService } from '@/lib/services/ledger-service'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const getFinancialData = withTenant(async () => {
  const [
    caixaGeral,
    bancos,
    contasAReceber,
    contasAPagar,
  ] = await Promise.all([
    LedgerService.getBalance('1.1.01'),
    LedgerService.getBalance('1.1.02'),
    LedgerService.getBalance('1.2.01'),
    LedgerService.getBalance('2.1.01'),
  ])

  // Transações recentes (Livro Razão)
  const recentEntries = await prisma.ledgerEntry.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' },
    include: {
      debitAccount: true,
      creditAccount: true,
    }
  })

  // Formatando transações para a UI
  const transactions = recentEntries.map(entry => {
    // Verificamos se a conta de débito é um Ativo de Disponibilidade (Caixa/Banco)
    const isIncome = entry.debitAccount.code.startsWith('1.1') 
    
    // Acesso seguro ao metadata
    const metadata = entry.metadata as Record<string, any> | null
    const category = metadata?.category || 'Geral'
    
    return {
      id: entry.id,
      date: format(entry.createdAt, "dd MMM yyyy", { locale: ptBR }),
      time: format(entry.createdAt, "HH:mm"),
      description: entry.description,
      customer: metadata?.customerName || metadata?.supplierName || '-',
      category: category,
      amount: Number(entry.amount),
      isIncome: isIncome,
      status: 'Pago', 
    }
  })

  // Mock dados para o gráfico (Fluxo de Caixa Mensal)
  // Em uma impl real, faríamos um groupBy por semana/dia no LedgerEntry
  const chartData = [
    { label: 'Sem 1', entries: 60, outputs: 40 },
    { label: 'Sem 2', entries: 85, outputs: 30 },
    { label: 'Sem 3', entries: 70, outputs: 55 },
    { label: 'Sem 4', entries: 95, outputs: 20 },
  ]

  return {
    kpis: {
      balance: Number(caixaGeral) + Number(bancos),
      receivables: Number(contasAReceber),
      payables: Number(contasAPagar),
      forecast: Number(caixaGeral) + Number(bancos) + Number(contasAReceber) - Number(contasAPagar),
    },
    transactions,
    chartData
  }
})
