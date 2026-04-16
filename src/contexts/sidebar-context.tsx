'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  toggle: () => void;
  expand: () => void;
  collapse: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Carregar estado inicial do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('printai-sidebar-collapsed');
    if (saved === 'true') {
      setIsCollapsed(true);
    }
    setIsMounted(true);
  }, []);

  // Salvar estado no localStorage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('printai-sidebar-collapsed', String(isCollapsed));
    }
  }, [isCollapsed, isMounted]);

  const toggle = () => setIsCollapsed(prev => !prev);
  const expand = () => setIsCollapsed(false);
  const collapse = () => setIsCollapsed(true);

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggle, expand, collapse }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
