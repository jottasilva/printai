'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Factory } from 'lucide-react';
import { SectorForm } from './SectorForm';

interface SectorDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Quando fornecido, abre em modo de edição */
  editData?: {
    id: string;
    name: string;
    description: string | null;
    kanbanOrder: number;
    color?: string | null;
    icon?: string | null;
  } | null;
}

export function SectorDrawer({ open, onOpenChange, editData }: SectorDrawerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Fechar com ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onOpenChange]);

  // Bloquear scroll do body
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (typeof window === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay com blur */}
          <motion.div
            ref={overlayRef}
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Painel lateral */}
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-[480px] bg-white dark:bg-slate-900 shadow-2xl flex flex-col"
          >
            {/* Header do Drawer */}
            <div className="relative flex items-center justify-between px-8 py-7 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
              {/* Detalhe decorativo */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary/60 to-transparent" />

              <div className="flex items-center gap-4">
                <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Factory className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Planta Industrial
                  </p>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">
                    {editData?.id ? 'Editar Setor' : 'Novo Setor'}
                  </h2>
                </div>
              </div>

              <button
                onClick={() => onOpenChange(false)}
                className="h-9 w-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                aria-label="Fechar drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conteúdo Scrollável */}
            <div className="flex-1 overflow-y-auto px-8 py-8">
              {/* Remove o Card wrapper do SectorForm — exibe o form direto */}
              <SectorForm
                initialData={editData ?? undefined}
                onSuccess={() => onOpenChange(false)}
              />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
