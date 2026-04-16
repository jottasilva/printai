'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { useTenant } from '@/contexts/tenant-context';
import { useSidebar } from '@/contexts/sidebar-context';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

// Hook personalizado para detectar mobile
function useIsMobile(breakpoint = 1024) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [breakpoint]);

  return isMobile;
}

const menuItems = [
  { name: 'Painel', icon: 'dashboard', href: '/admin', color: 'slate' },
  { name: 'Produção', icon: 'view_kanban', href: '/producao', color: 'sky' },
  { name: 'Enviadas', icon: 'local_shipping', href: '/producao/enviadas', color: 'sky' },
  { name: 'Setores', icon: 'layers', href: '/admin/setores', color: 'slate' },
  { name: 'Usuários', icon: 'group_add', href: '/admin/usuarios', color: 'slate' },
  { name: 'Pedidos', icon: 'description', href: '/pedidos', color: 'sky' },
  { name: 'Orçamentos', icon: 'receipt_long', href: '/orcamentos', color: 'sky' },
  { name: 'Produtos', icon: 'inventory_2', href: '/produtos', color: 'emerald' },
  { name: 'Estoque', icon: 'warehouse', href: '/estoque', color: 'emerald' },
  { name: 'Financeiro', icon: 'payments', href: '/financeiro', color: 'emerald' },
  { name: 'Conversas com IA', icon: 'chat', href: '/conversas', color: 'violet' },
  { name: 'Relatórios', icon: 'analytics', href: '/relatorios', color: 'violet' },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
  isMobile?: boolean;
}

export function Sidebar({ mobileOpen, onMobileOpenChange, isMobile: forcedIsMobile }: SidebarProps) {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const { profile } = useTenant();
  const { isCollapsed, toggle } = useSidebar();
  const detectedIsMobile = useIsMobile();
  const isMobile = forcedIsMobile ?? detectedIsMobile;

  const SidebarContent = () => (
    <aside className={cn(
      "flex flex-col h-full bg-[#1C1C1C] font-sans tracking-tight text-sm font-medium border-r border-white/5 transition-all duration-300",
      isCollapsed && !isMobile ? "w-20 p-4" : "w-64 p-6"
    )}>
      {/* Header com Logo e Toggle */}
      <div className={cn(
        "flex items-center justify-between mb-8",
        isCollapsed && !isMobile && "flex-col gap-4"
      )}>
        <motion.div 
          animate={{ opacity: isCollapsed && !isMobile ? 0 : 1, width: isCollapsed && !isMobile ? 0 : 'auto' }}
          className="overflow-hidden"
        >
          <div className="text-xl font-bold tracking-tighter text-white font-sans uppercase">
            Print<span className="text-primary">.ai</span>
          </div>
        </motion.div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className="h-8 w-8 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all"
        >
          <span className={cn(
            "material-symbols-outlined text-[20px] transition-transform duration-300",
            isCollapsed && !isMobile ? "rotate-180" : ""
          )}>
            menu_open
          </span>
        </Button>
      </div>

      {/* Perfil do Admin */}
      <div className={cn(
        "mb-8 px-1 transition-all duration-300",
        isCollapsed && !isMobile ? "flex flex-col items-center" : ""
      )}>
        <div className={cn(
          "flex items-center gap-3 p-2 rounded-xl border border-white/5 bg-white/[0.02]",
          isCollapsed && !isMobile && "justify-center w-12 h-12 p-0"
        )}>
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center overflow-hidden shrink-0 shadow-lg shadow-primary/20">
            <img
              src={(profile as any)?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus"}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          
          <AnimatePresence>
            {(!isCollapsed || isMobile) && (
              <motion.div 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-[13px] font-bold text-white truncate leading-none mb-1">
                  {profile?.name || 'Marcus Silva'}
                </p>
                <div className="flex items-center gap-2">
                  <Badge className="text-[8px] h-3.5 bg-primary/20 text-primary border-none px-1 py-0 font-bold tracking-widest leading-none">
                    PRO
                  </Badge>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Menu de Navegação */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-sidebar-scroll">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          
          const colorClasses: Record<string, { text: string; bg: string; active: string }> = {
            slate: { text: "text-slate-500", bg: "bg-slate-500", active: "text-slate-200" },
            sky: { text: "text-sky-500", bg: "bg-sky-500", active: "text-sky-400" },
            emerald: { text: "text-emerald-500", bg: "bg-emerald-500", active: "text-emerald-400" },
            violet: { text: "text-violet-500", bg: "bg-violet-500", active: "text-violet-400" },
          };

          const colors = colorClasses[item.color] || colorClasses.slate;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative',
                isActive
                  ? 'bg-white/5 text-white shadow-xl'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]',
                isCollapsed && !isMobile && "justify-center px-1"
              )}
              onClick={() => onMobileOpenChange?.(false)}
            >
              <span className={cn(
                "material-symbols-outlined text-[20px] transition-colors duration-200",
                isActive ? colors.active : colors.text,
                "group-hover:text-slate-300"
              )}>
                {item.icon}
              </span>
              
              <AnimatePresence>
                {(!isCollapsed || isMobile) && (
                  <motion.span 
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -5 }}
                    className="flex-1 font-semibold text-[13px] tracking-tight min-w-0"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
              
              {isActive && !isCollapsed && (
                <div className={cn("w-1 h-5 rounded-full absolute right-0 translate-x-1", colors.bg)} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={cn(
        "mt-auto pt-6 border-t border-white/5 space-y-2",
        isCollapsed && !isMobile ? "flex flex-col items-center" : ""
      )}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-slate-500 hover:text-white hover:bg-white/5 h-10 px-3 rounded-xl transition-all",
            isCollapsed && !isMobile && "justify-center p-0"
          )}
          asChild
        >
          <Link href="/settings">
            <span className="material-symbols-outlined text-[20px]">settings</span>
            {(!isCollapsed || isMobile) && <span className="ml-3 font-semibold text-xs">Configurações</span>}
          </Link>
        </Button>

        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-red-400 hover:text-red-500 hover:bg-red-500/5 h-10 px-3 rounded-xl transition-all",
            isCollapsed && !isMobile && "justify-center p-0"
          )}
          onClick={signOut}
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          {(!isCollapsed || isMobile) && <span className="ml-3 font-semibold text-xs">Desconectar</span>}
        </Button>
      </div>
    </aside>
  );

  // Mobile drawer
  if (isMobile) {
    return (
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
              onClick={() => onMobileOpenChange?.(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 h-screen w-72 z-50 shadow-2xl"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <div className={cn(
      "fixed left-0 top-0 h-screen z-50 transition-all duration-300 shadow-2xl",
      isCollapsed && !isMobile ? "w-20" : "w-64"
    )}>
      <SidebarContent />
    </div>
  );
}

export function MobileSidebarTrigger() {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-40 bg-white/80 backdrop-blur-xl shadow-lg border border-slate-200"
      >
        <span className="material-symbols-outlined">menu</span>
      </Button>
      <Sidebar mobileOpen={open} onMobileOpenChange={setOpen} isMobile={true} />
    </>
  );
}
