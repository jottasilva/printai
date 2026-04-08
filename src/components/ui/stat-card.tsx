'use client';
import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from './card';
import { motion } from 'framer-motion';

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  color?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  loading?: boolean;
}

const colorMap = {
  default: {
    bg: 'bg-primary/5',
    text: 'text-primary',
    border: 'border-primary/10',
    iconBg: 'bg-primary/10',
  },
  success: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    border: 'border-emerald-100',
    iconBg: 'bg-emerald-100/50',
  },
  warning: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'border-amber-100',
    iconBg: 'bg-amber-100/50',
  },
  danger: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-100',
    iconBg: 'bg-red-100/50',
  },
  info: {
    bg: 'bg-sky-50',
    text: 'text-sky-600',
    border: 'border-sky-100',
    iconBg: 'bg-sky-100/50',
  },
};

export function StatCard({
  title,
  value,
  icon,
  trend,
  color = 'default',
  loading = false,
  className,
  ...props
}: StatCardProps) {
  const colors = colorMap[color];

  return (
    <Card
      hover
      className={cn('relative overflow-hidden bg-white border-border/60', className)}
      {...props}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
              {title}
            </p>
            {loading ? (
              <div className="h-8 w-24 bg-slate-100 rounded animate-pulse" />
            ) : (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-baseline gap-2"
              >
                <span className="text-2xl font-black text-foreground tracking-tight">
                  {value}
                </span>
                {trend && (
                  <span
                    className={cn(
                      'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                      trend.positive !== false 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : 'bg-red-50 text-red-600'
                    )}
                  >
                    {trend.positive !== false ? '+' : '-'}{Math.abs(trend.value)}%
                  </span>
                )}
              </motion.div>
            )}
            <p className="text-[10px] text-muted-foreground mt-1 font-medium">
              {trend?.label || 'Vs. último período'}
            </p>
          </div>
          {icon && (
            <div
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300',
                colors.iconBg,
                colors.text
              )}
            >
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
