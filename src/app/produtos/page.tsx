import { getProducts } from '@/app/actions/products'
import { Sidebar } from '@/components/sidebar'
import { Plus, Package, Search, Filter, Trash2, Edit } from 'lucide-react'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <div className="flex h-screen bg-[#F8F9FA] dark:bg-[#0A0A0B] admin-theme font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Header */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-premium border border-gray-100">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Catálogo de Produtos</h1>
              <p className="text-gray-500 mt-1 font-medium">Gerencie seus produtos, serviços e insumos com precisão.</p>
            </div>
            <button className="flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-purple-200 transition-all active:scale-[0.98]">
              <Plus className="w-5 h-5" />
              Novo Produto
            </button>
          </header>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#7C3AED] transition-colors" />
              <input
                type="text"
                placeholder="Buscar por nome, SKU ou categoria..."
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl shadow-premium focus:ring-2 focus:ring-purple-100 focus:border-[#7C3AED] outline-none transition-all placeholder:text-gray-400 text-gray-900 font-medium"
              />
            </div>
            <button className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-700 shadow-premium hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4 text-[#7C3AED]" />
              Filtros Avançados
            </button>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-3xl shadow-premium border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 text-center w-16">#</th>
                    <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Produto</th>
                    <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Identificação (SKU)</th>
                    <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Tipo</th>
                    <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 text-right">Preço Base</th>
                    <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-sans">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-24 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-20 h-20 rounded-3xl bg-purple-50 flex items-center justify-center text-purple-200 border border-purple-50">
                            <Package className="w-10 h-10" />
                          </div>
                          <div>
                            <p className="text-gray-900 font-bold text-lg">Sua prateleira está vazia</p>
                            <p className="text-gray-500 mt-1 max-w-[300px] mx-auto">Comece adicionando seus produtos para gerenciar suas vendas e produção.</p>
                          </div>
                          <button className="mt-2 text-[#7C3AED] hover:text-[#6D28D9] text-sm font-extrabold uppercase tracking-wider underline-offset-4 hover:underline transition-all">
                            Adicionar meu primeiro produto
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    products.map((product, idx) => (
                      <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-5 text-sm text-center text-gray-400 font-medium">{idx + 1}</td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0 group-hover:scale-105 transition-transform">
                              <Package className="w-6 h-6 text-[#7C3AED] opacity-80" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-extrabold text-gray-900 tracking-tight truncate max-w-[250px]">{product.name}</p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{product.category?.name || 'Geral'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="font-mono text-[11px] font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">{product.sku}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className={cn(
                            "text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border-2",
                            product.type === 'SIMPLE' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                              product.type === 'VARIABLE' ? "bg-amber-50 text-amber-700 border-amber-100" :
                                "bg-sky-50 text-sky-700 border-sky-100"
                          )}>
                            {product.type}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <span className="font-extrabold text-gray-900 text-base">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(product.basePrice))}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex justify-end gap-2">
                            <button className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-[#7C3AED] transition-all">
                              <Edit className="w-5 h-5" />
                            </button>
                            <button className="p-2.5 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-600 transition-all">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <footer className="flex justify-center pt-4">
            <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em] font-bold opacity-70">
              PrintAI Industrial ERP — Sistema de Gestão Inteligente
            </p>
          </footer>
        </div>
      </main>
    </div>
  )
}
