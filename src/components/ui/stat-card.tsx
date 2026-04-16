'use client';
import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from './card';
import { motion } from 'framer-motion';

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
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
  description,
  trend,
  color = 'default',
  loading = false,
  className,
  ...props
}: StatCardProps) {
  const colors = colorMap[color];

  // Helper to render icon if it's a string or node
  const renderIcon = () => {
    if (!icon) return null;
    if (typeof icon === 'string') {
      return <span className="material-symbols-outlined text-[24px]">{icon}</span>;
    }
    return icon;
  };

  return (
    <Card
      className={cn(
        'relative overflow-hidden border-none shadow-[0_8px_30px_rgb(0,0,0,0.02)]',
        color === 'success' ? 'bg-emerald-50/30' : 
        color === 'info' ? 'bg-sky-50/30' : 
        color === 'warning' ? 'bg-amber-50/30' : 
        color === 'danger' ? 'bg-red-50/30' : 
        'bg-white dark:bg-slate-900',
        className
      )}
      {...props}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-normal text-slate-400 uppercase tracking-[0.2em] mb-2 font-headline">
              {title.split(' ')[0]} <span className="font-light">{title.split(' ').slice(1).join(' ')}</span>
            </p>
            {loading ? (
              <div className="h-8 w-24 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-baseline gap-2"
              >
                <span className="text-2xl font-light text-slate-900 dark:text-white tracking-tighter font-headline">
                  {value}
                </span>
                {trend && (
                  <span
                    className={cn(
                      'text-[10px] font-normal px-2 py-0.5 rounded-lg flex items-center gap-1',
                      trend.positive !== false 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-red-100 text-red-700'
                    )}
                  >
                    <span className="material-symbols-outlined text-[12px]">
                      {trend.positive !== false ? 'trending_up' : 'trending_down'}
                    </span>
                    {Math.abs(trend.value)}%
                  </span>
                )}
              </motion.div>
            )}
            <p className="text-[10px] text-slate-400 mt-2 font-normal line-clamp-1">
              {description || trend?.label || 'Meta de Performance'}
            </p>
          </div>
          {icon && (
            <div
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 shadow-sm shrink-0',
                color === 'success' ? 'bg-white text-emerald-600' :
                color === 'info' ? 'bg-white text-sky-600' :
                color === 'warning' ? 'bg-white text-amber-600' :
                color === 'danger' ? 'bg-white text-red-600' :
                'bg-slate-50 dark:bg-slate-800 text-slate-400'
              )}
            >
              {renderIcon()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
