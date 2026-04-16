'use client';

import React, { useState, useEffect } from 'react';
import { FormDialog } from '@/components/ui/dialog-system';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';
import { createProduct, updateProduct, ProductFormData } from '@/app/actions/products';

interface ProductDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: any | null;
}

export function ProductDetailsModal({ open, onOpenChange, product }: ProductDetailsModalProps) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    sku: '',
    description: '',
    type: 'SIMPLE',
    basePrice: 0,
    costPrice: 0,
    minStock: 0
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        sku: product.sku,
        description: product.description || '',
        type: product.type as any,
        basePrice: Number(product.basePrice),
        costPrice: Number(product.costPrice) || 0,
      });
    } else {
      setFormData({
        name: '',
        sku: '',
        description: '',
        type: 'SIMPLE',
        basePrice: 0,
        costPrice: 0,
        minStock: 0
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (product) {
        await updateProduct(product.id, formData);
        success('Produto atualizado');
      } else {
        await createProduct(formData);
        success('Produto criado com sucesso');
      }

      onOpenChange(false);
    } catch (err: any) {
      toastError('Erro ao salvar produto', err.message || 'Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={product ? 'Editar Produto' : 'Novo Produto'}
      description="Preencha os dados básicos do seu produto ou insumo para compor vendas e produção."
      onSubmit={handleSubmit}
      onCancel={() => onOpenChange(false)}
      loading={loading}
      submitText={product ? 'Salvar Alterações' : 'Criar Produto'}
      size="md"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-2">
          <Label htmlFor="name">Nome do Produto</Label>
          <Input 
            id="name" 
            value={formData.name} 
            onChange={e => setFormData({ ...formData, name: e.target.value })} 
            placeholder="Ex: Cartão de Visita Couché 250g"
            required
            className="rounded-xl border-slate-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sku">Cód. Identificação (SKU)</Label>
          <Input 
            id="sku" 
            value={formData.sku} 
            onChange={e => setFormData({ ...formData, sku: e.target.value })} 
            placeholder="Ex: CV-250-4X4"
            required
            className="rounded-xl border-slate-200 uppercase"
          />
        </div>

        <div className="space-y-2">
          <Label>Tipo de Produto</Label>
          <Select 
            value={formData.type} 
            onChange={(e: any) => setFormData({ ...formData, type: e.target.value })}
            options={[
              { value: 'SIMPLE', label: 'Produto Físico Final' },
              { value: 'VARIABLE', label: 'Com Variações' },
              { value: 'SERVICE', label: 'Serviço (Design, Corte)' },
              { value: 'BUNDLE', label: 'Kit Diferenciado' },
            ]}
            className="rounded-xl border-slate-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="basePrice">Preço de Venda (R$)</Label>
          <Input 
            id="basePrice" 
            type="number"
            step="0.01"
            value={formData.basePrice} 
            onChange={e => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })} 
            required
            className="rounded-xl border-slate-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="costPrice">Preço de Custo (R$) Estimado</Label>
          <Input 
            id="costPrice" 
            type="number"
            step="0.01"
            value={formData.costPrice} 
            onChange={e => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })} 
            className="rounded-xl border-slate-200"
          />
        </div>

        <div className="col-span-2 space-y-2">
          <Label htmlFor="description">Descrição Técnica</Label>
          <Input 
            id="description" 
            value={formData.description} 
            onChange={e => setFormData({ ...formData, description: e.target.value })} 
            placeholder="Especificações de impressão e acabamento..."
            className="rounded-xl border-slate-200"
          />
        </div>
      </div>
    </FormDialog>
  );
}
