'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ActivityChartProps {
  data: Record<string, number>;
  totalOrders: number;
  statusLabels: Record<string, string>;
}

export function ActivityChart({ data, totalOrders, statusLabels }: ActivityChartProps) {
  return (
    <div className="h-[280px] w-full flex items-end justify-between gap-3 pt-6">
      {Object.entries(data).map(([status, count], idx) => (
        <div key={status} className="flex-1 flex flex-col items-center group cursor-help">
          <div className="w-full relative">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(count / (totalOrders || 1)) * 200 + 20}px` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.1 }}
              className={cn(
                "w-full rounded-t-xl transition-all duration-300 relative overflow-hidden",
                idx % 2 === 0 ? "bg-primary/10" : "bg-primary/20"
              )}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-primary/40" />
            </motion.div>
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-foreground text-white text-[10px] px-2 py-1 rounded shadow-lg font-normal">
              {count} Pedidos
            </div>
          </div>
          <span className="text-[10px] font-light text-muted-foreground uppercase tracking-widest mt-4 text-center h-4 flex items-center">
            {statusLabels[status]?.substring(0, 3) || status.substring(0, 3)}
          </span>
        </div>
      ))}
    </div>
  );
}
