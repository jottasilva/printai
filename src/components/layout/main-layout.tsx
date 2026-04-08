import React from 'react';
import { Sidebar } from '@/components/sidebar';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
  showSidebar?: boolean;
}

export default function MainLayout({ children, className, showSidebar = true }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      {showSidebar && <Sidebar />}
      <main
        className={cn(
          'transition-all duration-300',
          showSidebar && 'lg:ml-64',
          className
        )}
      >
        {children}
      </main>
    </div>
  );
}
