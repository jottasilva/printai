'use client';

import { useState } from 'react';
import { updateShippingDetails } from '@/app/actions/shipping';
import { 
  Box, 
  Truck, 
  MapPin, 
  Calendar, 
  Clipboard, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  Info,
  X
} from 'lucide-react';
import { 
  Drawer
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ShippingItem {
  id: string;
  name: string;
  quantity: number;
  status: string;
}

interface ShippingDetailsModalProps {
  shipment: {
    id: string;
    orderId: string;
    cliente: string;
    transportadora: string;
    rastreio: string;
    dataEnvio: string;
    dataEstimada: string;
    status: string;
    address: {
      street: string;
      number: string;
      city: string;
      state: string;
      zipCode: string;
    } | null;
    items: ShippingItem[];
  };
}

export function ShippingDetailsModal({ shipment }: ShippingDetailsModalProps) {
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // States para edição
  const [carrier, setCarrier] = useState(shipment.transportadora);
  const [trackingCode, setTrackingCode] = useState(shipment.rastreio);
  const [status, setStatus] = useState(shipment.status);
  const [notes, setNotes] = useState('');

  const statusOptions = ['Pronto p/ Coleta', 'Em Trânsito', 'Entregue', 'Problema'];

  async function handleSave() {
    setLoading(true);
    try {
      await updateShippingDetails(shipment.id, {
        carrier,
        trackingCode,
        status,
        notes
      });
      setIsEditing(false);
      setOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button 
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all group border border-transparent hover:border-slate-300 dark:hover:border-slate-600"
      >
        <span className="text-xs font-bold uppercase tracking-wider">Gerenciar</span>
        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </button>

      <Drawer 
        open={open} 
        onOpenChange={setOpen} 
        title={`Remessa #${shipment.id}`}
        description="Gestão de Logística e Expedição"
        size="60%"
      >
        <div className="p-8 pt-6 space-y-8">
          <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-5">
               <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 shadow-xl flex items-center justify-center border border-slate-100 dark:border-slate-800 transition-transform hover:scale-105">
                 <Truck className={cn("w-8 h-8", status === 'Entregue' ? "text-emerald-500" : "text-indigo-500")} />
               </div>
               <div>
                 <div className="flex items-center gap-2 mb-1">
                   <div className={cn("w-2 h-2 rounded-full animate-pulse", status === 'Entregue' ? "bg-emerald-500" : "bg-indigo-500")} />
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Rastreamento da Remessa</span>
                 </div>
                 <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{status}</h3>
               </div>
            </div>
            
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 text-xs font-black text-indigo-500 hover:text-indigo-400 transition-colors uppercase tracking-widest bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md"
            >
              {isEditing ? 'Cancelar Edição' : 'Modificar Registro'}
              <Clipboard className="w-4 h-4" />
            </button>
          </div>

            <AnimatePresence mode="wait">
              {!isEditing ? (
                <motion.div 
                  key="view"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-8"
                >
                  {/* Coluna Esquerda: Informações Gerais */}
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100 italic">
                        <MapPin className="w-4 h-4 text-indigo-500" /> Endereço de Entrega
                      </h4>
                      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800/50">
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{shipment.cliente}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          {shipment.address?.street}, {shipment.address?.number}<br />
                          {shipment.address?.city} - {shipment.address?.state}<br />
                          <span className="font-mono text-xs">{shipment.address?.zipCode}</span>
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100 italic">
                        <Box className="w-4 h-4 text-indigo-500" /> Itens na Carga
                      </h4>
                      <div className="space-y-2 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                        {shipment.items.map(item => (
                          <div key={item.id} className="flex justify-between items-center bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm">
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate max-w-[180px]">{item.name}</span>
                            <Badge variant="secondary" className="text-[10px] font-mono">x{item.quantity}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Coluna Direita: Dados de Transporte */}
                  <div className="space-y-6">
                    <div className="bg-slate-900 dark:bg-slate-900 text-white p-5 rounded-2xl relative overflow-hidden shadow-lg border-l-4 border-indigo-500">
                      <Truck className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 pointer-events-none" />
                      <div className="relative z-10 flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Transportadora</span>
                          <Badge variant="outline" className="text-[9px] border-emerald-500/50 text-emerald-400 font-black">{status}</Badge>
                        </div>
                        <div>
                          <p className="text-xl font-black">{shipment.transportadora}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="text-xs text-indigo-300 font-mono tracking-wider">{shipment.rastreio}</code>
                            <button className="text-slate-400 hover:text-white transition-colors">
                              <Clipboard className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 text-slate-400 mb-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className="text-[9px] font-bold uppercase">Enviado em</span>
                        </div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{shipment.dataEnvio}</p>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 text-slate-400 mb-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-[9px] font-bold uppercase">Estimativa</span>
                        </div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{shipment.dataEstimada}</p>
                      </div>
                    </div>

                    <Button className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-widest h-12 rounded-xl group hover:shadow-xl transition-all">
                      Acompanhar no Site
                      <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="edit"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="space-y-6"
                >
                  <div className="bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-xl flex gap-3 items-center">
                    <Info className="w-5 h-5 text-indigo-500" />
                    <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium">
                      Alterar dados de rastreio irá atualizar automaticamente o status do pedido para "Em Trânsito" e notificar o sistema de auditoria.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Transportadora</Label>
                      <Input 
                        value={carrier}
                        onChange={e => setCarrier(e.target.value)}
                        className="h-11 bg-slate-50 dark:bg-slate-900 border-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Código de Rastreio</Label>
                      <Input 
                        value={trackingCode}
                        onChange={e => setTrackingCode(e.target.value)}
                        className="h-11 bg-slate-50 dark:bg-slate-900 border-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Status Operacional</Label>
                      <select 
                        value={status}
                        onChange={e => setStatus(e.target.value)}
                        className="w-full h-11 bg-slate-50 dark:bg-slate-900 border-none rounded-md px-3 text-sm focus:ring-2 focus:ring-indigo-500/20 dark:text-white"
                      >
                        {statusOptions.map(opt => <option key={opt}>{opt}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Previsão Entrega</Label>
                      <Input type="date" className="h-11 bg-slate-50 dark:bg-slate-900 border-none focus:ring-2 focus:ring-indigo-500/20" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Notas de Expedição (Interno)</Label>
                    <Textarea 
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Observações sobre coleta, problemas de carga ou orientações para o entregador..."
                      className="bg-slate-50 dark:bg-slate-900 border-none min-h-[100px] focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button 
                      variant="ghost" 
                      className="flex-1 h-12 text-slate-500 font-bold uppercase tracking-widest text-xs"
                      onClick={() => setIsEditing(false)}
                    >
                      Descartar
                    </Button>
                    <Button 
                      className="flex-3 h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-[0.2em] text-xs shadow-lg shadow-indigo-500/20 px-12"
                      onClick={handleSave}
                      disabled={loading}
                    >
                      {loading ? 'Sincronizando...' : 'Concluir Modificação'}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer info line */}
          <div className="bg-slate-50 dark:bg-slate-900/80 px-8 py-3 flex justify-between items-center border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sincronizado com Transportadora</span>
            </div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">ID Pedido Original: #{shipment.orderId}</p>
          </div>
      </Drawer>
    </>
  );
}
