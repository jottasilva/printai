'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, CheckCircle2, Info, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, ButtonProps } from './button';

// ============================================================================
// Dialog Base
// ============================================================================

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlay?: boolean;
  showCloseButton?: boolean;
}

export function Dialog({
  open,
  onOpenChange,
  children,
  title,
  description,
  size = 'md',
  closeOnOverlay = true,
  showCloseButton = true,
}: DialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (closeOnOverlay && e.target === overlayRef.current) {
        onOpenChange(false);
      }
    },
    [onOpenChange, closeOnOverlay]
  );

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onOpenChange]);

  if (!open && typeof window === 'undefined') return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] max-h-[95vh]',
  };

  const renderContent = () => (
    <AnimatePresence>
      <div
        ref={overlayRef}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={handleOverlayClick}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={cn(
            'w-full bg-white rounded-2xl border border-border shadow-2xl overflow-hidden',
            sizeClasses[size]
          )}
        >
          {(title || description || showCloseButton) && (
            <div className="flex items-start justify-between p-6 border-b border-border">
              <div className="flex-1 mr-4">
                {title && (
                  <h2 className="text-lg font-normal text-foreground tracking-tight">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="text-sm text-muted-foreground mt-1">{description}</p>
                )}
              </div>
              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                  className="h-8 w-8 shrink-0 rounded-lg hover:bg-slate-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
          <div className={cn('p-6', !title && !description && !showCloseButton && 'pt-0')}>
            {children}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  if (!open) return null;

  return typeof window !== 'undefined' ? createPortal(renderContent(), document.body) : null;
}

// ============================================================================
// Dialog Content & Footer
// ============================================================================

export function DialogContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('space-y-4', className)}>{children}</div>;
}

export function DialogFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-end gap-2 pt-4 border-t border-gray-100 dark:border-white/10', className)}>
      {children}
    </div>
  );
}

// ============================================================================
// Confirmation Dialog
// ============================================================================

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  variant?: 'default' | 'destructive' | 'success';
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  variant = 'default',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  loading = false,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  const icons = {
    default: <Info className="h-5 w-5 text-blue-500" />,
    destructive: <AlertTriangle className="h-5 w-5 text-red-500" />,
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
  };

  const variantClasses = {
    default: 'bg-blue-50',
    destructive: 'bg-red-50',
    success: 'bg-emerald-50',
  };

  const buttonVariants: Record<string, ButtonProps> = {
    default: { variant: 'default' },
    destructive: { variant: 'destructive' },
    success: { variant: 'success' },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} size="sm">
      <div className="flex items-start gap-4">
        <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', variantClasses[variant])}>
          {icons[variant]}
        </div>
        <div className="flex-1">
          <h3 className="text-base font-normal text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{description}</p>
        </div>
      </div>
      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={loading}
          className="rounded-lg"
        >
          {cancelText}
        </Button>
        <Button
          {...buttonVariants[variant]}
          onClick={handleConfirm}
          disabled={loading}
          className="rounded-lg"
        >
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {confirmText}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

// ============================================================================
// View/Detail Dialog
// ============================================================================

interface ViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  size?: 'md' | 'lg' | 'xl';
}

export function ViewDialog({ open, onOpenChange, title, children, size = 'lg' }: ViewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={title} size={size} showCloseButton>
      <div className="max-h-[70vh] overflow-y-auto pr-2">
        {children}
      </div>
    </Dialog>
  );
}

// ============================================================================
// Form/Edit Dialog
// ============================================================================

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  loading?: boolean;
  submitText?: string;
  cancelText?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  onCancel,
  loading = false,
  submitText = 'Salvar',
  cancelText = 'Cancelar',
  size = 'md',
  disabled = false,
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={title} description={description} size={size}>
      <form onSubmit={onSubmit} className="space-y-4">
        {children}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg"
          >
            {cancelText}
          </Button>
          <Button
            type="submit"
            disabled={loading || disabled}
            className="rounded-lg"
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {submitText}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

// ============================================================================
// Loading/Progress Dialog
// ============================================================================

interface LoadingDialogProps {
  open: boolean;
  title?: string;
  description?: string;
}

export function LoadingDialog({ open, title = 'Processando...', description }: LoadingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={() => { }} size="sm" closeOnOverlay={false} showCloseButton={false}>
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <h3 className="text-base font-normal text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-2">{description}</p>
        )}
      </div>
    </Dialog>
  );
}

// ============================================================================
// Alert/Notification Dialog
// ============================================================================

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
  actionText?: string;
  onAction?: () => void;
}

export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  variant = 'info',
  actionText = 'Entendi',
  onAction,
}: AlertDialogProps) {
  const icons = {
    info: <Info className="h-6 w-6 text-blue-500" />,
    success: <CheckCircle2 className="h-6 w-6 text-emerald-500" />,
    warning: <AlertCircle className="h-6 w-6 text-amber-500" />,
    error: <AlertTriangle className="h-6 w-6 text-red-500" />,
  };

  const handleAction = () => {
    if (onAction) onAction();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} size="sm" showCloseButton={false}>
      <div className="flex flex-col items-center text-center">
        <div className="mb-4">{icons[variant]}</div>
        <h3 className="text-lg font-normal text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{description}</p>
        <Button
          onClick={handleAction}
          className="mt-6 w-full rounded-lg"
        >
          {actionText}
        </Button>
      </div>
    </Dialog>
  );
}
// ============================================================================
// Drawer (Side Panel)
// ============================================================================

interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  size?: string; // e.g. "60%"
  side?: 'left' | 'right';
  closeOnOverlay?: boolean;
}

export function Drawer({
  open,
  onOpenChange,
  children,
  title,
  description,
  size = '400px',
  side = 'right',
  closeOnOverlay = true,
}: DrawerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (closeOnOverlay && e.target === overlayRef.current) {
        onOpenChange(false);
      }
    },
    [onOpenChange, closeOnOverlay]
  );

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onOpenChange]);

  const renderContent = () => (
    <AnimatePresence>
      <div
        ref={overlayRef}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex justify-end"
        onClick={handleOverlayClick}
      >
        <motion.div
          initial={{ x: side === 'right' ? '100%' : '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: side === 'right' ? '100%' : '-100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          style={{ width: size }}
          className={cn(
            "h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800",
            side === 'left' && "border-r border-l-0"
          )}
        >
          <div className="flex items-start justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div>
              {title && <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h2>}
              {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-10 w-10 shrink-0 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {children}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  if (!open) return null;

  return typeof window !== 'undefined' ? createPortal(renderContent(), document.body) : null;
}
