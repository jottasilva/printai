import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card } from './card';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className={cn('p-12 text-center', className)}>
        <div className="flex flex-col items-center justify-center space-y-4">
          {icon && (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-muted-foreground">
              {icon}
            </div>
          )}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">{description}</p>
            )}
          </div>
          {action && <div className="pt-2">{action}</div>}
        </div>
      </Card>
    </motion.div>
  );
}
