import React from 'react';
import MainLayout from '@/components/layout/main-layout';
import { getFinancialData } from '@/app/actions/financial';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils'; // Assumindo que existe, se não usarei Intf

export default async function FinanceiroPage() {
  const data = await getFinancialData();
  const { kpis, transactions, chartData } = data;

  const fCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <MainLayout className="bg-surface text-on-surface">
      <div className="pt-8 px-8 pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-on-surface">Gestão Financeira</h2>
            <p className="text-on-surface-variant mt-1">Visão geral e controle de fluxo de caixa para a produção.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-surface-container-low p-1 rounded-lg">
              <button className="px-4 py-1.5 text-xs font-semibold rounded bg-surface-container-lowest shadow-sm text-on-surface">Este Mês</button>
              <button className="px-4 py-1.5 text-xs font-medium text-on-surface-variant hover:text-on-surface transition-colors">Últimos 3 meses</button>
              <button className="px-4 py-1.5 text-xs font-medium text-on-surface-variant hover:text-on-surface transition-colors">Personalizado</button>
            </div>
            <button className="bg-surface-container-low p-2 rounded-lg text-on-surface-variant hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined">filter_list</span>
            </button>
          </div>
        </div>

        {/* KPI Cards (Bento Grid Style) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Saldo (Verde/Primary) */}
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 flex flex-col justify-between h-32 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Saldo em Caixa</span>
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-on-surface">{fCurrency(kpis.balance)}</h3>
              <p className="text-[10px] text-emerald-600 font-medium mt-1">+12% em relação ao mês anterior</p>
            </div>
          </div>

          {/* Contas a Receber (Azul/Secondary) */}
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 flex flex-col justify-between h-32 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-secondary-container/20 rounded-full blur-2xl group-hover:bg-secondary-container/30 transition-colors"></div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Contas a Receber</span>
              <span className="material-symbols-outlined text-secondary" data-icon="call_received">call_received</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-on-surface">{fCurrency(kpis.receivables)}</h3>
              <p className="text-[10px] text-secondary font-medium mt-1">Sincronizado com pedidos pendentes</p>
            </div>
          </div>

          {/* Contas a Pagar (Laranja/Coral/Error) */}
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 flex flex-col justify-between h-32 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-error-container/10 rounded-full blur-2xl group-hover:bg-error-container/20 transition-colors"></div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Contas a Pagar</span>
              <span className="material-symbols-outlined text-error" data-icon="call_made">call_made</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-on-surface">{fCurrency(kpis.payables)}</h3>
              <p className="text-[10px] text-error font-medium mt-1">Vencimento em monitoramento</p>
            </div>
          </div>

          {/* Previsão 7 Dias (Roxo/Tertiary) */}
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 flex flex-col justify-between h-32 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-tertiary/5 rounded-full blur-2xl group-hover:bg-tertiary/10 transition-colors"></div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Previsão Líquida</span>
              <span className="material-symbols-outlined text-tertiary" data-icon="auto_graph">auto_graph</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-on-surface">{fCurrency(kpis.forecast)}</h3>
              <p className="text-[10px] text-tertiary font-medium mt-1">Baseado em ordens aprovadas</p>
            </div>
          </div>
        </div>

        {/* Main Transaction Section */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/5 shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center border-b border-surface-container">
            <button className="px-8 py-5 text-sm font-semibold text-on-surface border-b-2 border-primary">
              Transações Recentes
            </button>
            <button className="px-8 py-5 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">
              Entradas
            </button>
            <button className="px-8 py-5 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">
              Saídas
            </button>
            <div className="ml-auto pr-6 flex items-center gap-4">
              <button className="text-on-surface-variant hover:text-on-surface flex items-center gap-2 text-xs font-medium">
                <span className="material-symbols-outlined text-lg">download</span> Exportar CSV
              </button>
            </div>
          </div>
          
          {/* Table Wrapper */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low/50">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Data</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Descrição</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Categoria</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right">Valor</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Status</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-surface-container-low/30 transition-colors group">
                      <td className="px-6 py-5">
                        <p className="text-sm font-medium text-on-surface">{tx.date}</p>
                        <p className="text-[10px] text-on-surface-variant">{tx.time}</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center">
                            <span className="material-symbols-outlined text-lg text-primary">
                              {tx.isIncome ? 'call_received' : 'call_made'}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-on-surface">{tx.description}</p>
                            <p className="text-xs text-on-surface-variant">Cliente/Fornecedor: {tx.customer}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-2.5 py-1 rounded-full bg-secondary-container/30 text-secondary text-[10px] font-bold uppercase">
                          {tx.category}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <p className={cn("text-sm font-bold", tx.isIncome ? "text-on-surface" : "text-on-surface")}>
                          {tx.isIncome ? '' : '- '} {fCurrency(tx.amount)}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-on-tertiary-container bg-on-tertiary-container/10 px-2 py-0.5 rounded w-fit">
                          <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container"></span>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-on-surface-variant hover:text-primary">
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-on-surface-variant">
                      Nenhuma transação encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer / Pagination */}
          <div className="flex items-center justify-between px-6 py-4 bg-surface-container-low/30">
            <p className="text-xs text-on-surface-variant font-medium">Exibindo {transactions.length} transações recentes</p>
            <div className="flex items-center gap-2">
              <button className="p-1 rounded hover:bg-surface-container transition-colors disabled:opacity-30" disabled>
                <span className="material-symbols-outlined text-lg">chevron_left</span>
              </button>
              <button className="px-2 py-1 text-xs font-bold bg-primary text-on-primary rounded shadow-sm">1</button>
              <button className="p-1 rounded hover:bg-surface-container transition-colors disabled:opacity-30" disabled>
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Analysis Section (Glassmorphism Cards) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10">
          <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-bold text-on-surface">Fluxo de Caixa Mensal</h4>
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">Entradas</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-error"></span>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">Saídas</span>
                </div>
              </div>
            </div>
            {/* Mock Chart Visualization */}
            <div className="h-48 flex items-end justify-between gap-2 px-2">
              {chartData.map((item, idx) => (
                <div key={idx} className="w-full bg-surface-container-low rounded-t-sm relative group">
                  <div 
                    className="absolute bottom-0 left-0 w-1/2 bg-primary rounded-t-sm group-hover:brightness-110 transition-all" 
                    style={{ height: `${item.entries}%` }}
                  ></div>
                  <div 
                    className="absolute bottom-0 right-0 w-1/2 bg-error rounded-t-sm group-hover:brightness-110 transition-all" 
                    style={{ height: `${item.outputs}%` }}
                  ></div>
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-medium text-on-surface-variant whitespace-nowrap">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-primary p-8 rounded-xl flex flex-col justify-between text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-12 -mt-12 blur-3xl"></div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest opacity-80">Próximo Vencimento</h4>
              <p className="text-2xl font-bold mt-2">Folha de Pagamento</p>
              <p className="text-sm mt-1 opacity-90">28 de Maio, 2024</p>
            </div>
            <div className="mt-8 pt-6 border-t border-white/20">
              <p className="text-xs uppercase tracking-widest opacity-70">Total Previsto</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-2xl font-extrabold">R$ 18.200,00</p>
                <button className="bg-white text-primary px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-100 transition-all">
                  Pagar Agora
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
