'use client'

import { motion } from 'framer-motion'
import { Activity, Clock, AlertTriangle, Users, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface AuditMetricsProps {
  metrics: {
    activeCount: number;
    stalledItemsCount: number;
    bottleneckSector: string;
    topOperators: { name: string; actions: number }[];
  }
}

export function AuditMetrics({ metrics }: AuditMetricsProps) {
  const cards = [
    {
      label: 'Produção Ativa',
      value: metrics.activeCount,
      icon: Activity,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100'
    },
    {
      label: 'Itens Parados (>24h)',
      value: metrics.stalledItemsCount,
      icon: AlertTriangle,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      status: metrics.stalledItemsCount > 0 ? 'warning' : 'ok'
    },
    {
      label: 'Principal Gargalo',
      value: metrics.bottleneckSector,
      icon: Clock,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-100'
    },
    {
      label: 'Top Operadores (Hoje)',
      value: metrics.topOperators[0]?.name || 'N/A',
      icon: Users,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className={cn("border shadow-sm overflow-hidden group hover:shadow-md transition-all", card.border)}>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  {card.label}
                </p>
                <h3 className={cn("text-2xl font-black", card.color)}>
                  {card.value}
                </h3>
              </div>
              <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110", card.bg, card.color)}>
                <card.icon className="w-6 h-6" />
              </div>
            </CardContent>
            {card.status === 'warning' && (
              <div className="bg-amber-500 h-1 w-full animate-pulse" />
            )}
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
