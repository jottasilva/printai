'use client';

import React, { useState, useEffect } from 'react';
import { FormDialog } from '@/components/ui/dialog-system';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';
import { saveCustomer, CustomerFormData } from '@/app/actions/customers';

interface Customer {
  id?: string;
  name: string;
  email: string;
  phone?: string | null;
  document: string;
  documentType: 'CPF' | 'CNPJ';
  type: string;
  companyName?: string | null;
}

interface CustomerDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer | null;
}

export function CustomerDetailsModal({ open, onOpenChange, customer }: CustomerDetailsModalProps) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Customer>({
    name: '',
    email: '',
    phone: '',
    document: '',
    documentType: 'CPF',
    type: 'PERSON',
    companyName: ''
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        ...customer,
        phone: customer.phone || '',
        companyName: customer.companyName || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        document: '',
        documentType: 'CPF',
        type: 'PERSON',
        companyName: ''
      });
    }
  }, [customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await saveCustomer(formData as CustomerFormData);

      if (!result.success) {
        toastError('Erro ao salvar', result.error || 'Verifique os dados e tente novamente.');
        return;
      }

      success(customer?.id ? 'Cliente atualizado' : 'Cliente criado');
      
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toastError('Falha inesperada', 'Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={customer ? 'Editar Cliente' : 'Novo Cliente'}
      description="Preencha os dados básicos do seu cliente para gestão e faturamento."
      onSubmit={handleSubmit}
      onCancel={() => onOpenChange(false)}
      loading={loading}
      submitText={customer ? 'Salvar Alterações' : 'Cadastrar Cliente'}
      size="md"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-2">
          <Label htmlFor="name">Nome Completo / Razão Social</Label>
          <Input 
            id="name" 
            value={formData.name} 
            onChange={e => setFormData({ ...formData, name: e.target.value })} 
            placeholder="Ex: João Silva ou Empresa Ltda"
            required
            className="rounded-xl border-slate-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email"
            value={formData.email} 
            onChange={e => setFormData({ ...formData, email: e.target.value })} 
            placeholder="cliente@email.com"
            required
            className="rounded-xl border-slate-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input 
            id="phone" 
            value={formData.phone || ''} 
            onChange={e => setFormData({ ...formData, phone: e.target.value })} 
            placeholder="(11) 99999-9999"
            className="rounded-xl border-slate-200"
          />
        </div>

        <div className="space-y-2">
          <Label>Tipo de Documento</Label>
          <Select 
            value={formData.documentType} 
            onChange={(e: any) => setFormData({ ...formData, documentType: e.target.value })}
            options={[
              { value: 'CPF', label: 'CPF' },
              { value: 'CNPJ', label: 'CNPJ' }
            ]}
            className="rounded-xl border-slate-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="document">Documento</Label>
          <Input 
            id="document" 
            value={formData.document} 
            onChange={e => setFormData({ ...formData, document: e.target.value })} 
            placeholder="000.000.000-00"
            required
            className="rounded-xl border-slate-200"
          />
        </div>

        <div className="space-y-2">
          <Label>Perfil do Cliente</Label>
          <Select 
            value={formData.type} 
            onChange={(e: any) => setFormData({ ...formData, type: e.target.value })}
            options={[
              { value: 'PERSON', label: 'Varejo / Pessoa Física' },
              { value: 'COMPANY', label: 'Empresarial / Pessoa Jurídica' }
            ]}
            className="rounded-xl border-slate-200"
          />
        </div>

        {formData.type === 'COMPANY' && (
          <div className="space-y-2">
            <Label htmlFor="companyName">Nome Fantasia</Label>
            <Input 
              id="companyName" 
              value={formData.companyName || ''} 
              onChange={e => setFormData({ ...formData, companyName: e.target.value })} 
              placeholder="Ex: Print Digital"
              className="rounded-xl border-slate-200"
            />
          </div>
        )}
      </div>
    </FormDialog>
  );
}
