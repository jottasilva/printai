'use client'

import React, { useState, useEffect } from 'react'
import { createCategory, getCategories } from './actions'
import { Button } from '@/components/ui/button'
import { Sidebar } from '@/components/sidebar'

export default function CategoriasPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    const res = await getCategories()
    if (res.success && res.data) {
      setCategories(res.data)
    }
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await createCategory({ name })
    if (res.success) {
      setName('')
      fetchCategories()
    } else {
      alert(res.error || 'Erro ao criar')
    }
    setLoading(false)
  }

  return (
    <div className="flex h-screen bg-surface dark:bg-slate-950">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 lg:p-10 ml-64">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl tracking-tight text-slate-900 dark:text-white mb-2">Categorias de Produtos</h1>
            <p className="text-slate-500 text-sm">Gerencie divisões do seu catálogo utilizando a instância do Supabase ligada no Prisma.</p>
          </div>

          <form onSubmit={handleAddCategory} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-xs font-semibold text-slate-700">Nova Categoria</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex:: Impressão Digital, Brindes, Cartões"
                className="w-full px-4 py-2 border rounded-xl"
                required
              />
            </div>
            <Button type="submit" disabled={loading || !name} className="bg-primary text-white flex items-center justify-center gap-2 whitespace-nowrap h-10 px-6 rounded-xl">
              <span className="material-symbols-outlined text-xl leading-none shrink-0">add</span>
              <span>{loading ? 'Salvando...' : 'Adicionar'}</span>
            </Button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map(c => (
              <div key={c.id} className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
                <span className="text-sm font-medium">{c.name}</span>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{c.slug}</span>
              </div>
            ))}
            {categories.length === 0 && (
              <p className="col-span-2 text-slate-500 text-center py-6 text-sm">Nenhuma categoria cadastrada via Server Action ainda.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
