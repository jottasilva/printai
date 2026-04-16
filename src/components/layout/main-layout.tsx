import React from 'react';
import { Sidebar } from '@/components/sidebar';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/contexts/sidebar-context';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
  showSidebar?: boolean;
}

export default function MainLayout({ children, className, showSidebar = true }: MainLayoutProps) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      {showSidebar && <Sidebar />}
      <main
        className={cn(
          'transition-all duration-300',
          showSidebar && (isCollapsed ? 'lg:ml-20' : 'lg:ml-64'),
          className
        )}
      >
        {children}
      </main>
    </div>
  );
}
