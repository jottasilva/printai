'use client'

import { useQueryState, parseAsString } from 'nuqs'
import { Search, Filter, X, Calendar as CalendarIcon, Settings2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface AuditFiltersProps {
  sectors: { id: string, name: string }[]
  users?: { id: string, name: string }[]
}

export function AuditFilters({ sectors, users = [] }: AuditFiltersProps) {
  const [q, setQ] = useQueryState('q', parseAsString.withDefault(''))
  const [sector, setSector] = useQueryState('sector', parseAsString.withDefault('ALL'))
  const [status, setStatus] = useQueryState('status', parseAsString.withDefault('ALL'))
  const [startDate, setStartDate] = useQueryState('start', parseAsString.withDefault(''))
  
  const resetFilters = () => {
    setQ('')
    setSector('ALL')
    setStatus('ALL')
    setStartDate('')
  }

  const hasFilters = q !== '' || sector !== 'ALL' || status !== 'ALL' || startDate !== ''

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-4 items-center">
      <div className="relative w-full md:w-80 group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
        <Input
          placeholder="Nº Pedido ou Cliente..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-11 border-slate-100 bg-slate-50/50 rounded-xl focus-visible:ring-primary/20"
        />
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
        <Select 
          value={sector} 
          onChange={(e) => setSector(e.target.value)}
          options={[
            { value: 'ALL', label: 'Todos os Setores' },
            { value: 'triagem', label: 'Triagem' },
            ...sectors.map(s => ({ value: s.id, label: s.name }))
          ]}
          icon={<Filter className="w-3.5 h-3.5" />}
          className="w-[180px]"
        />

        <Select 
          value={status} 
          onChange={(e) => setStatus(e.target.value)}
          options={[
            { value: 'ALL', label: 'Todos Status' },
            { value: 'PENDING', label: 'Pendente' },
            { value: 'IN_PROGRESS', label: 'Em Produção' },
            { value: 'PAUSED', label: 'Pausado' },
            { value: 'FINISHED', label: 'Concluído' }
          ]}
          icon={<Settings2 className="w-3.5 h-3.5" />}
          className="w-[180px]"
        />

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[200px] justify-start text-xs font-bold uppercase tracking-wider rounded-xl border-slate-100 bg-slate-50/50 h-10",
                !startDate && "text-slate-500"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
              {startDate ? format(new Date(startDate), "dd/MM/yyyy") : "Período"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 rounded-2xl overflow-hidden shadow-2xl border-none" align="start">
            <Calendar
              mode="single"
              selected={startDate ? new Date(startDate) : undefined}
              onSelect={(date) => setStartDate(date ? date.toISOString() : '')}
              initialFocus
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>

        {hasFilters && (
          <Button 
            variant="ghost" 
            onClick={resetFilters}
            className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl px-4"
          >
            <X className="w-3 h-3 mr-2" />
            Limpar
          </Button>
        )}
      </div>
    </div>
  )
}
