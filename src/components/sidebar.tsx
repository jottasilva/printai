'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Printer,
  Users,
  Package,
  FileText,
  Settings,
  Kanban,
  CreditCard,
  MessageSquare,
  BarChart3,
  LogOut,
  ChevronDown,
  Sparkles,
  Bell,
  Search,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { useTenant } from '@/contexts/tenant-context';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const menuItems = [
  {
    group: 'Principal',
    items: [
      { name: 'Dashboard', icon: BarChart3, href: '/admin' },
    ],
  },
  {
    group: 'Operacional',
    items: [
      { name: 'Produção', icon: Kanban, href: '/producao', badge: 'Novo' },
      { name: 'Pedidos', icon: Printer, href: '/pedidos' },
      { name: 'Orçamentos', icon: FileText, href: '/orcamentos' },
    ],
  },
  {
    group: 'Gestão',
    items: [
      { name: 'Clientes', icon: Users, href: '/clientes' },
      { name: 'Produtos', icon: Package, href: '/produtos' },
      { name: 'Estoque', icon: Package, href: '/estoque' },
      { name: 'Financeiro', icon: CreditCard, href: '/financeiro' },
    ],
  },
  {
    group: 'Inteligência',
    items: [
      { name: 'Conversas AI', icon: MessageSquare, href: '/conversas', badge: 'AI' },
      { name: 'Relatórios', icon: BarChart3, href: '/relatorios' },
    ],
  },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
}

export function Sidebar({ mobileOpen, onMobileOpenChange }: SidebarProps) {
  const pathname = usePathname();
  const { signOut, user } = useAuth();
  const { tenant, profile } = useTenant();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'Principal': true,
    'Operacional': true,
    'Gestão': true,
    'Inteligência': true,
  });

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  const SidebarContent = () => (
    <>
      {/* Header com Logo */}
      <div className="p-6">
        <div className="flex items-center justify-center">
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="w-full max-w-[180px] h-auto object-contain"
          />
        </div>
        <div className="mt-2 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold opacity-60">
            Operational Cockpit
          </p>
        </div>
      </div>

      {/* Search Bar - Estilo Modelo */}
      <div className="px-4 py-2">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full h-10 rounded-xl bg-white border border-border pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Menu de Navegação */}
      <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
        {menuItems.map((group) => (
          <div key={group.group} className="mb-2">
            <button
              onClick={() => toggleGroup(group.group)}
              className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              {group.group}
              <ChevronDown
                className={cn(
                  'h-3 w-3 transition-transform',
                  expandedGroups[group.group] && 'rotate-180'
                )}
              />
            </button>
            <AnimatePresence>
              {expandedGroups[group.group] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-0.5 overflow-hidden"
                >
                  {group.items.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                    return (
                      <a
                        key={item.name}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative mx-1',
                          isActive
                            ? 'bg-white text-foreground shadow-md shadow-black/5 border border-border'
                            : 'text-muted-foreground hover:bg-white/50 hover:text-foreground'
                        )}
                        onClick={() => onMobileOpenChange?.(false)}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeMenu"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary rounded-r-full"
                          />
                        )}
                        <item.icon
                          className={cn(
                            'w-4 h-4 transition-colors',
                            isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                          )}
                        />
                        <span className="flex-1">{item.name}</span>
                        {item.badge && (
                          <Badge
                            variant={item.badge === 'AI' ? 'purple' : 'info'}
                            className="text-[10px] px-1.5 py-0"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </a>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>

      {/* Footer com User - Estilo Checkout */}
      <div className="p-4 border-t border-border mt-auto">
        <div className="space-y-4">
          {/* User Info */}
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
              <img 
                src={(profile as any)?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus"} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate text-foreground">
                {profile?.name || 'Marcus Silva'}
              </p>
              <p className="text-[10px] text-muted-foreground truncate uppercase font-medium">
                {profile?.role === 'ADMIN' ? 'Production Lead' : 'Atelier Member'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-[11px] rounded-lg border-border bg-white hover:bg-slate-50"
              onClick={() => (window.location.href = '/configuracoes')}
            >
              <Settings className="w-3.5 h-3.5 mr-1.5" />
              Ajustes
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-[11px] rounded-lg border-border bg-white text-red-500 hover:bg-red-50"
              onClick={signOut}
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </>
  );

  // Versão mobile (drawer)
  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
    return (
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => onMobileOpenChange?.(false)}
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-screen w-72 bg-[#00020d] border-r border-white/5 flex flex-col z-50 lg:hidden"
            >
              <button
                onClick={() => onMobileOpenChange?.(false)}
                className="absolute right-4 top-4 p-2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Versão desktop (fixa)
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-border flex flex-col z-50">
      <SidebarContent />
    </aside>
  );
}

export function MobileSidebarTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu className="w-5 h-5" />
      </Button>
      <Sidebar mobileOpen={open} onMobileOpenChange={setOpen} />
    </>
  );
}

