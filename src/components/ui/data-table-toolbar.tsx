'use client';

import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from './input';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface DataTableToolbarProps {
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function DataTableToolbar({
  searchPlaceholder = 'Buscar...',
  onSearch,
  filters,
  actions,
  className,
}: DataTableToolbarProps) {
  const [searchValue, setSearchValue] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
          {searchValue && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {filters && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'border-primary/50 bg-primary/10' : ''}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        )}
        {actions && <div className="flex items-center gap-2 ml-auto">{actions}</div>}
      </div>
      {showFilters && filters && (
        <div className="flex items-center gap-2 flex-wrap">
          {filters}
        </div>
      )}
    </div>
  );
}
