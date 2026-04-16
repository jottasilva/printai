'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Plus, Package, Search, Filter, Trash2, Edit } from 'lucide-react'
import { cn } from '@/lib/utils'
import { deleteProduct } from '@/app/actions/products'
import { useToast } from '@/components/ui/toast'
import { ConfirmDialog } from '@/components/ui/dialog-system'

export function ProductListClient({ initialProducts }: { initialProducts: any[] }) {
  const { success, error: toastError } = useToast()
  const [products, setProducts] = useState(initialProducts)
  const [search, setSearch] = useState('')
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = (id: string) => {
    setProductToDelete(id)
    setIsConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!productToDelete) return
    setIsConfirmOpen(false)
    setIsDeleting(true)
    try {
      await deleteProduct(productToDelete)
      setProducts(products.filter(p => p.id !== productToDelete))
      success('Produto excluído!')
    } catch (e: any) {
      toastError('Erro ao excluir', e.message)
    } finally {
      setIsDeleting(false)
      setProductToDelete(null)
    }
  }

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-premium border border-gray-100">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-gray-900">Catálogo de Produtos</h1>
          <p className="text-gray-500 mt-1 font-normal">Gerencie seus produtos, serviços e insumos com precisão.</p>
        </div>
        <Link 
          href="/produtos/novo"
          className="flex items-center justify-center gap-2 whitespace-nowrap bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-6 py-3 rounded-xl font-normal shadow-lg shadow-purple-200 transition-all active:scale-[0.98]">
          <Plus className="w-5 h-5 shrink-0" />
          <span>Novo Produto</span>
        </Link>
      </header>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#7C3AED] transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, SKU ou categoria..."
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl shadow-premium focus:ring-2 focus:ring-purple-100 focus:border-[#7C3AED] outline-none transition-all placeholder:text-gray-400 text-gray-900 font-normal"
          />
        </div>
        <button className="flex items-center justify-center gap-2 whitespace-nowrap px-6 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm font-normal text-gray-700 shadow-premium hover:bg-gray-50 transition-colors">
          <Filter className="w-4 h-4 text-[#7C3AED] shrink-0" />
          <span>Filtros Avançados</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-premium border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-5 text-[10px] font-normal uppercase tracking-[0.2em] text-gray-500 text-center w-16">#</th>
                <th className="px-6 py-5 text-[10px] font-normal uppercase tracking-[0.2em] text-gray-500">Produto</th>
                <th className="px-6 py-5 text-[10px] font-normal uppercase tracking-[0.2em] text-gray-500">Identificação (SKU)</th>
                <th className="px-6 py-5 text-[10px] font-normal uppercase tracking-[0.2em] text-gray-500">Tipo</th>
                <th className="px-6 py-5 text-[10px] font-normal uppercase tracking-[0.2em] text-gray-500 text-right">Preço Base</th>
                <th className="px-6 py-5 text-[10px] font-normal uppercase tracking-[0.2em] text-gray-500 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-sans">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 rounded-3xl bg-purple-50 flex items-center justify-center text-purple-200 border border-purple-50">
                        <Package className="w-10 h-10" />
                      </div>
                      <div>
                        <p className="text-gray-900 font-normal text-lg">Sua prateleira está vazia</p>
                        <p className="text-gray-500 mt-1 max-w-[300px] mx-auto">Comece adicionando seus produtos para gerenciar suas vendas e produção.</p>
                      </div>
                      <Link href="/produtos/novo" className="mt-2 text-[#7C3AED] hover:text-[#6D28D9] text-sm font-normal uppercase tracking-wider underline-offset-4 hover:underline transition-all">
                        Adicionar meu primeiro produto
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((product, idx) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5 text-sm text-center text-gray-400 font-normal">{idx + 1}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0 group-hover:scale-105 transition-transform">
                          <Package className="w-6 h-6 text-[#7C3AED] opacity-80" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-light text-gray-900 tracking-tight truncate max-w-[250px]">{product.name}</p>
                          <p className="text-[10px] font-normal text-gray-400 uppercase tracking-widest mt-0.5">{product.category?.name || 'Geral'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-mono text-[11px] font-normal text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">{product.sku}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={cn(
                        "text-[10px] font-normal uppercase tracking-wider px-2.5 py-1 rounded-full border-2",
                        product.type === 'SIMPLE' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                          product.type === 'VARIABLE' ? "bg-amber-50 text-amber-700 border-amber-100" :
                            "bg-sky-50 text-sky-700 border-sky-100"
                      )}>
                        {product.type === 'SIMPLE' ? 'Simples' : product.type === 'VARIABLE' ? 'Variável' : 'Virtual'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="font-light text-gray-900 text-base">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(product.basePrice))}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/produtos/${product.id}/editar`} className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-[#7C3AED] transition-all">
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button onClick={() => handleDelete(product.id)} className="p-2.5 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-600 transition-all">
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
        <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em] font-normal opacity-70">
          PrintAI Industrial ERP — Sistema de Gestão Inteligente
        </p>
      </footer>

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onConfirm={confirmDelete}
        title="Excluir Produto"
        description="Tem certeza que deseja excluir este produto do catálogo? Esta ação não pode ser desfeita e pode afetar pedidos existentes."
        variant="destructive"
        confirmText="Excluir do Catálogo"
        cancelText="Manter Produto"
        loading={isDeleting}
      />
    </div>
  )
}
