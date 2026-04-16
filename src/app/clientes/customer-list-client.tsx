'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { 
  Users, 
  Search, 
  UserPlus, 
  TrendingUp, 
  MoreVertical, 
  ChevronLeft, 
  ChevronRight,
  ShoppingCart,
  ArrowRight
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatCard } from '@/components/ui/stat-card';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CustomerDetailsModal } from './customer-details-modal';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  companyName?: string | null;
  type: string;
  totalSpent: number;
  lastOrder?: string | null;
  orderCount: number;
  createdAt: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  totalPages: number;
  take: number;
}

interface CustomerListClientProps {
  initialCustomers: Customer[];
  stats: {
    totalActive: number;
  };
  pagination: PaginationInfo;
}

export function CustomerListClient({ initialCustomers, stats, pagination }: CustomerListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [type, setType] = useState(searchParams.get('type') || 'ALL');
  
  // Estado para o Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (search) params.set('search', search);
    else params.delete('search');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleTypeChange = (newType: string) => {
    setType(newType);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page'); // reseta paginação no filtro
    if (newType !== 'ALL') params.set('type', newType);
    else params.delete('type');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header & Action Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-headline tracking-tighter text-slate-900 dark:text-white font-normal">
            CRM de <span className="font-light text-slate-400">Clientes</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-normal text-sm max-w-xl">
            Gerencie sua carteira de clientes, acompanhe volumes de pedidos e identifique oportunidades de retenção.
          </p>
        </div>
        <Button 
          onClick={() => {
            setSelectedCustomer(null);
            setModalOpen(true);
          }}
          className="h-11 px-6 rounded-xl bg-primary hover:bg-primary-dim text-white shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <UserPlus size={18} className="shrink-0" />
          <span>Novo Cliente</span>
        </Button>
      </div>

      {/* Filter Bento */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Tipo de Cliente */}
        <div className="md:col-span-1 bg-white/50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3 backdrop-blur-sm">
          <label className="block text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">
            Tipo de Cliente
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'ALL', label: 'Todos' },
              { id: 'COMPANY', label: 'Empresarial' },
              { id: 'PERSON', label: 'Varejo' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => handleTypeChange(t.id)}
                className={cn(
                  "px-3 py-1.5 text-[11px] font-medium rounded-lg transition-all",
                  type === t.id 
                    ? "bg-primary text-white shadow-md shadow-primary/20" 
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Busca e Range Mock */}
        <div className="md:col-span-2 bg-white/50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3 backdrop-blur-sm">
          <label className="block text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">
            Busca Rápida
          </label>
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, empresa ou documento..." 
              className="pl-10 h-10 bg-slate-100/50 dark:bg-slate-800/50 border-none rounded-xl text-sm focus:ring-primary/20"
            />
          </form>
        </div>

        {/* Total Ativos - StatCard Adaptado */}
        <div className="md:col-span-1">
          <StatCard 
            title="Total Ativos" 
            value={stats.totalActive} 
            icon={<TrendingUp size={24} />}
            color="info"
            trend={{ value: 12, label: 'vs mês passado', positive: true }}
            className="h-full"
          />
        </div>
      </div>

      {/* Table View */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.04)]"
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 dark:bg-slate-950/50 hover:bg-transparent border-b border-slate-100 dark:border-slate-800">
                <TableHead className="px-6 py-4 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">Nome</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">Empresa</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">Contato</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">Último Pedido</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400 text-right">Gasto Total</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">Status</TableHead>
                <TableHead className="px-6 py-4 w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialCustomers.map((customer) => (
                <TableRow key={customer.id} className="group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-50 dark:border-slate-800/50">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs border border-primary/5">
                        {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-slate-900 dark:text-white uppercase tracking-tight">
                        {customer.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className="text-xs text-slate-500 font-normal">
                      {customer.companyName || '—'}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-900 dark:text-slate-300 font-normal">{customer.email}</span>
                      <span className="text-[10px] text-slate-400 font-normal tracking-wide">{customer.phone || 'Sem telefone'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className="text-xs text-slate-500 font-normal">
                      {customer.lastOrder ? new Date(customer.lastOrder).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Nunca'}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <span className="text-sm font-bold text-slate-900 dark:text-white font-headline tracking-tighter">
                      R$ {customer.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge variant={customer.orderCount > 0 ? "default" : "secondary"} className={cn(
                      "text-[9px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-md",
                      customer.orderCount > 0 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-none" : "bg-slate-100 text-slate-400 border-transparent shadow-none"
                    )}>
                      {customer.orderCount > 0 ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <button 
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setModalOpen(true);
                      }}
                      className="p-2 text-slate-400 hover:text-primary transition-colors rounded-lg hover:bg-primary/5"
                    >
                      <MoreVertical size={18} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
              {initialCustomers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-40 text-center text-slate-400 italic font-normal text-sm">
                    Nenhum cliente encontrado com os filtros selecionados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination Shell */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50/30 dark:bg-slate-950/30 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
              Exibindo {(pagination.page - 1) * pagination.take + 1} - {Math.min(pagination.page * pagination.take, pagination.total)} de {pagination.total} clientes
            </p>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-slate-400 disabled:opacity-30" 
                disabled={pagination.page <= 1}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                <ChevronLeft size={16} />
              </Button>
              
              <Button className="h-8 w-8 p-0 bg-primary text-white text-xs font-bold rounded-lg shadow-sm">
                {pagination.page}
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-slate-400 disabled:opacity-30" 
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Analytics & Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-headline font-normal tracking-tight text-slate-900 dark:text-white">
            Atividade <span className="font-light text-slate-400">Recente</span>
          </h3>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white/50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 transition-all hover:border-primary/20">
                <div className="p-3 bg-primary/10 rounded-xl text-primary border border-primary/5 shadow-sm">
                  {i === 1 ? <ShoppingCart size={20} /> : <UserPlus size={20} />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {i === 1 ? "Novo pedido aprovado" : "Atualização de cadastro"}
                  </p>
                  <p className="text-[11px] text-slate-500 font-normal">
                    {i === 1 ? "Design Studio X - Impressão de Catálogo" : "Ana Silveira atualizou dados de contato"}
                  </p>
                </div>
                <span className="text-[9px] font-normal text-slate-400 uppercase tracking-widest">Há 2 horas</span>
              </div>
            ))}
          </div>
        </div>

        {/* Insight Card */}
        <div className="bg-gradient-to-br from-primary/10 via-transparent to-primary/5 p-6 rounded-3xl border border-primary/10 flex flex-col justify-between overflow-hidden relative group">
          <div className="relative z-10">
            <h3 className="text-lg font-headline font-normal tracking-tight text-slate-900 dark:text-white mb-2">
              Insight da <span className="font-light text-slate-400">Carteira</span>
            </h3>
            <p className="text-xs text-slate-500 font-normal leading-relaxed">
              74% dos seus clientes corporativos realizaram pedidos recorrentes neste semestre. Isso indica uma alta taxa de fidelização.
            </p>
          </div>
          <div className="mt-8 relative z-10">
            <button className="text-[11px] font-bold text-primary flex items-center gap-1 uppercase tracking-wider group-hover:translate-x-1 transition-transform">
              Ver relatório completo
              <ArrowRight size={14} />
            </button>
          </div>
          {/* Abstract background blur */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-500"></div>
        </div>
      </div>

      {/* Modais */}
      <CustomerDetailsModal 
        open={modalOpen} 
        onOpenChange={setModalOpen} 
        customer={selectedCustomer as any} 
      />
    </div>
  );
}
