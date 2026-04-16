'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { createProduct, updateProduct, ProductFormData } from '@/app/actions/products'

const ProductSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  sku: z.string().min(2, 'SKU obrigatório'),
  description: z.string().optional(),
  type: z.enum(['SIMPLE', 'VARIABLE', 'SERVICE', 'BUNDLE']).default('SIMPLE'),
  categoryId: z.string().optional(),
  basePrice: z.coerce.number().min(0, 'Preço deve ser positivo'),
  costPrice: z.coerce.number().min(0, 'Preço de custo deve ser positivo').optional(),
  minStock: z.coerce.number().min(0).optional(),
  unit: z.string().default('un'),
  production_time: z.string().optional(),
  substrate: z.string().optional(),
  is_featured: z.boolean().default(false),
  priceTiers: z.array(z.object({
    min_quantity: z.coerce.number().min(1),
    unit_price: z.coerce.number().min(0),
    label: z.string().optional(),
  })).optional(),
  finishes: z.array(z.object({
    name: z.string(),
    cost_modifier: z.coerce.number().default(0),
  })).optional(),
  variants: z.array(z.object({
    name: z.string(),
    sku: z.string(),
    attributes: z.record(z.string()).optional(),
    price: z.coerce.number().min(0),
  })).optional(),
})

interface ProductFormProps {
  initialData?: any
  categories: any[]
}

export function ProductFormFull({ initialData, categories }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const isEdit = !!initialData

  const form = useForm<ProductFormData>({
    resolver: zodResolver(ProductSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      sku: initialData.sku,
      description: initialData.description || '',
      type: initialData.type,
      categoryId: initialData.categoryId || undefined,
      basePrice: Number(initialData.basePrice),
      costPrice: Number(initialData.costPrice),
      unit: initialData.unit,
      production_time: initialData.production_time || '',
      substrate: initialData.substrate || '',
      is_featured: initialData.is_featured || false,
      priceTiers: initialData.product_price_tiers?.map((t: any) => ({
        min_quantity: t.min_quantity,
        unit_price: Number(t.unit_price),
        label: t.label || '',
      })) || [],
      finishes: initialData.product_finishes?.map((f: any) => ({
        name: f.name,
        cost_modifier: Number(f.cost_modifier),
      })) || [],
    } : {
      type: 'SIMPLE',
      unit: 'un',
      basePrice: 0,
      costPrice: 0,
      is_featured: false,
    }
  })

  const { fields: tierFields, append: appendTier, remove: removeTier } = useFieldArray({
    control: form.control,
    name: 'priceTiers'
  })

  const { fields: finishFields, append: appendFinish, remove: removeFinish } = useFieldArray({
    control: form.control,
    name: 'finishes'
  })

  async function onSubmit(data: ProductFormData) {
    setLoading(true)
    try {
      if (isEdit) {
        await updateProduct(initialData.id, data)
        toast.success('Produto atualizado com sucesso')
      } else {
        await createProduct(data)
        toast.success('Produto criado com sucesso')
      }
      router.push('/produtos')
      router.refresh()
    } catch (error: any) {
      toast.error('Erro ao salvar produto: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <span className="p-2 bg-primary/10 rounded-2xl">
                <span className="material-symbols-rounded text-primary text-3xl">
                    {isEdit ? 'edit_note' : 'add_box'}
                </span>
            </span>
            {isEdit ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <p className="text-slate-500 mt-1">
            Configure todos os detalhes técnicos e comerciais do seu item.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading} className="px-8 shadow-lg shadow-primary/20">
            {loading ? 'Salvando...' : 'Salvar Produto'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="geral" className="space-y-6">
        <TabsList className="bg-slate-100/50 p-1 rounded-2xl backdrop-blur-sm border border-slate-200 w-full justify-start overflow-x-auto h-auto">
          <TabsTrigger value="geral" className="rounded-xl px-6 py-3 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md transition-all flex gap-2">
            <span className="material-symbols-rounded">info</span> Geral
          </TabsTrigger>
          <TabsTrigger value="pricing" className="rounded-xl px-6 py-3 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md transition-all flex gap-2">
            <span className="material-symbols-rounded">payments</span> Precificação
          </TabsTrigger>
          <TabsTrigger value="inventory" className="rounded-xl px-6 py-3 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md transition-all flex gap-2">
            <span className="material-symbols-rounded">inventory</span> Estoque
          </TabsTrigger>
          <TabsTrigger value="media" className="rounded-xl px-6 py-3 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md transition-all flex gap-2">
            <span className="material-symbols-rounded">image</span> Mídia
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="geral">
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              className="grid gap-6 md:grid-cols-2"
            >
              <Card className="border-slate-200/60 shadow-sm rounded-3xl overflow-hidden glassmorphism bg-white/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-bold">
                    <span className="material-symbols-rounded text-blue-500 bg-blue-50 p-1.5 rounded-xl">article</span>
                    Dados Principais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Produto</Label>
                    <Input id="name" placeholder="Ex: Cartão de Visita Couché 300g" {...form.register('name')} className="rounded-xl border-slate-200" />
                    {form.formState.errors.name && <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sku">SKU / Código</Label>
                      <Input id="sku" placeholder="CVC-300" {...form.register('sku')} className="rounded-xl border-slate-200" />
                      {form.formState.errors.sku && <p className="text-sm text-red-500">{form.formState.errors.sku.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Tipo de Produto</Label>
                      <Select 
                        defaultValue={form.getValues('type')}
                        onValueChange={(v: any) => form.setValue('type', v)}
                        options={[
                          { value: 'SIMPLE', label: 'Simples' },
                          { value: 'VARIABLE', label: 'Variável' },
                          { value: 'SERVICE', label: 'Serviço' },
                          { value: 'BUNDLE', label: 'Kit / Combo' },
                        ]}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoryId">Categoria</Label>
                    <Select 
                      defaultValue={form.getValues('categoryId')}
                      onValueChange={(v: any) => form.setValue('categoryId', v)}
                      placeholder="Selecione uma categoria"
                      options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200/60 shadow-sm rounded-3xl overflow-hidden glassmorphism bg-white/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-bold">
                    <span className="material-symbols-rounded text-amber-500 bg-amber-50 p-1.5 rounded-xl">settings_input_component</span>
                    Especificações Técnicas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="substrate">Substrato / Material Base</Label>
                    <Input id="substrate" placeholder="Ex: Papel Couché 300g" {...form.register('substrate')} className="rounded-xl border-slate-200" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="production_time">Prazo de Produção</Label>
                    <Input id="production_time" placeholder="Ex: 5 dias úteis" {...form.register('production_time')} className="rounded-xl border-slate-200" />
                  </div>
                  <div className="flex items-center space-x-2 pt-4">
                    <input 
                      type="checkbox" 
                      id="is_featured" 
                      className="w-5 h-5 accent-primary rounded-md border-slate-200" 
                      {...form.register('is_featured')}
                    />
                    <label htmlFor="is_featured" className="text-sm font-medium leading-none cursor-pointer">
                      Destacar este produto na loja/catálogo
                    </label>
                  </div>
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="description">Descrição Estendida</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Detalhes sobre o produto para equipe e clientes..." 
                      className="rounded-xl min-h-[100px] border-slate-200"
                      {...form.register('description')}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="pricing">
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="grid gap-6 md:grid-cols-2"
            >
              <Card className="border-slate-200/60 shadow-sm rounded-3xl overflow-hidden glassmorphism bg-white/60 h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-bold">
                    <span className="material-symbols-rounded text-green-500 bg-green-50 p-1.5 rounded-xl">sell</span>
                    Base de Preços
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="basePrice">Preço de Venda Base</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 pb-2 text-slate-400">R$</span>
                        <Input id="basePrice" type="number" step="0.01" className="pl-10 rounded-xl border-slate-200" {...form.register('basePrice')} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="costPrice">Preço de Custo</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400">R$</span>
                        <Input id="costPrice" type="number" step="0.01" className="pl-10 rounded-xl border-slate-200" {...form.register('costPrice')} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-lg text-slate-900">Margem Estimada</p>
                      <p className="text-xs text-slate-500 text-end">Baseado no preço sugerido</p>
                    </div>
                    <div className="bg-green-100 text-green-700 px-4 py-2 rounded-2xl font-black text-xl">
                      {((Number(form.watch('basePrice') || 0) / Number(form.watch('costPrice') || 1) - 1) * 100).toFixed(0)}%
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200/60 shadow-sm rounded-3xl overflow-hidden glassmorphism bg-white/60">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl font-bold">
                      <span className="material-symbols-rounded text-indigo-500 bg-indigo-50 p-1.5 rounded-xl">layers</span>
                      Precificação por Volume
                    </CardTitle>
                    <CardDescription>Escalas de preço progressivas</CardDescription>
                  </div>
                  <Button type="button" size="icon" variant="ghost" className="rounded-full bg-slate-50" onClick={() => appendTier({ min_quantity: 1, unit_price: 0 })}>
                    <span className="material-symbols-rounded">add</span>
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tierFields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-3 p-3 bg-slate-50/50 rounded-2xl border border-slate-100 animate-in slide-in-from-right-5 duration-300">
                      <div className="flex-1 space-y-2">
                        <Label className="text-xs">Qtd Mínima</Label>
                        <Input type="number" {...form.register(`priceTiers.${index}.min_quantity` as const)} className="rounded-xl bg-white" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <Label className="text-xs">Preço Unitário</Label>
                        <Input type="number" step="0.01" {...form.register(`priceTiers.${index}.unit_price` as const)} className="rounded-xl bg-white" />
                      </div>
                      <Button type="button" variant="ghost" size="icon" className="text-red-400" onClick={() => removeTier(index)}>
                        <span className="material-symbols-rounded">delete</span>
                      </Button>
                    </div>
                  ))}
                  {tierFields.length === 0 && (
                    <div className="text-center py-6 text-slate-400 italic">
                      Nenhuma escala de volume definida.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-slate-200/60 shadow-sm rounded-3xl overflow-hidden glassmorphism bg-white/60 md:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl font-bold">
                      <span className="material-symbols-rounded text-rose-500 bg-rose-50 p-1.5 rounded-xl">palette</span>
                      Acabamentos Disponíveis
                    </CardTitle>
                    <CardDescription>Opcionais que alteram o preço final</CardDescription>
                  </div>
                  <Button type="button" size="sm" variant="outline" className="rounded-xl flex gap-2" onClick={() => appendFinish({ name: '', cost_modifier: 0 })}>
                    <span className="material-symbols-rounded">add</span> Adicionar Acabamento
                  </Button>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                  {finishFields.map((field, index) => (
                    <div key={field.id} className="p-4 bg-slate-50/50 rounded-3xl border border-slate-100 space-y-3 relative group">
                      <div className="space-y-2">
                        <Label className="text-xs">Nome do Acabamento</Label>
                        <Input {...form.register(`finishes.${index}.name` as const)} placeholder="Ex: Verniz Localizado" className="rounded-xl bg-white" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Acréscimo de Custo (R$)</Label>
                        <Input type="number" step="0.01" {...form.register(`finishes.${index}.cost_modifier` as const)} className="rounded-xl bg-white" />
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500" 
                        onClick={() => removeFinish(index)}
                      >
                        <span className="material-symbols-rounded">close</span>
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="inventory">
             <motion.div 
              initial={{ opacity: 0, scale: 0.98 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="grid gap-6 md:grid-cols-2"
            >
               <Card className="border-slate-200/60 shadow-sm rounded-3xl overflow-hidden glassmorphism bg-white/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-bold">
                    <span className="material-symbols-rounded text-cyan-500 bg-cyan-50 p-1.5 rounded-xl">straighten</span>
                    Unidades de Medida
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unidade Padrão de Saída</Label>
                    <Select 
                      defaultValue={form.getValues('unit')}
                      onValueChange={(v: any) => form.setValue('unit', v)}
                      placeholder="Selecione a unidade"
                      options={[
                        { value: 'un', label: 'Unidade (un)' },
                        { value: 'pct', label: 'Pacote (pct)' },
                        { value: 'folha', label: 'Folha' },
                        { value: 'm2', label: 'Metro Quadrado (m²)' },
                        { value: 'kg', label: 'Quilograma (kg)' },
                      ]}
                    />
                  </div>
                  <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex gap-4">
                    <span className="material-symbols-rounded text-blue-500">info_outline</span>
                    <p className="text-sm text-blue-700 leading-relaxed">
                      Este produto utiliza a lógica de <strong>Estoque Inteligente</strong>. Você poderá configurar conversões entre unidade de compra (ex: Fardo) e unidade de processamento (ex: Folha) no módulo de Inventário.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200/60 shadow-sm rounded-3xl overflow-hidden glassmorphism bg-white/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-bold">
                    <span className="material-symbols-rounded text-orange-500 bg-orange-50 p-1.5 rounded-xl">notifications_active</span>
                    Controle de Alertas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="space-y-2">
                    <Label htmlFor="minStock">Estoque Mínimo de Segurança</Label>
                    <div className="relative">
                      <Input id="minStock" type="number" className="rounded-xl border-slate-200 pr-12" {...form.register('minStock')} />
                      <span className="absolute right-3 top-2 text-slate-400 font-medium">un</span>
                    </div>
                    <p className="text-xs text-slate-500">Você receberá uma notificação quando o estoque chegar neste nível.</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="media">
             <Card className="border-slate-200/60 shadow-xl rounded-3xl overflow-hidden glassmorphism bg-white/40 border-dashed border-2 p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                  <span className="material-symbols-rounded text-slate-400 text-5xl">cloud_upload</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Upload de Mídia</h3>
                <p className="text-slate-500 max-w-sm mb-8">
                  Arraste imagens do produto ou cliques para selecionar os arquivos. Formatos suportados: JPG, PNG, WEBP.
                </p>
                <Button variant="outline" className="rounded-2xl px-8 border-2" type="button">
                  Selecionar Imagens
                </Button>
             </Card>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </form>
  )
}
