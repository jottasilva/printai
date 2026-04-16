'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Clock, ShieldAlert, Cpu } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Anomaly {
  id: string;
  level: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  isResolved: boolean;
  createdAt: Date;
  sector?: { name: string };
}

export function AuditView({ anomalies }: { anomalies: Anomaly[] }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-blue-50/50 dark:bg-blue-500/5">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-600/80">Monitoramento</p>
              <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100">24/7 Ativo</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-amber-50/50 dark:bg-amber-500/5">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center text-amber-600">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-600/80">Alertas Ativos</p>
              <h3 className="text-2xl font-bold text-amber-800 dark:text-amber-100">
                {anomalies.filter(a => !a.isResolved).length}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-emerald-50/50 dark:bg-emerald-500/5">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <Cpu className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-600/80">Saúde da Planta</p>
              <h3 className="text-2xl font-bold text-emerald-800 dark:text-emerald-100">98.5%</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:bg-slate-900 rounded-[2rem] overflow-hidden">
        <CardHeader className="bg-slate-50 dark:bg-slate-800/50 p-8 border-b dark:border-slate-800">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Log de Auditoria de Planta
            </CardTitle>
            <Button variant="outline" size="sm" className="rounded-xl bg-white">Ver Histórico Completo</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y dark:divide-slate-800">
            {anomalies.map((anomaly) => (
              <div key={anomaly.id} className="p-6 flex items-start justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                <div className="flex gap-4">
                  <div className={`mt-1 h-3 w-3 rounded-full shrink-0 ${
                    anomaly.level === 'CRITICAL' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse' :
                    anomaly.level === 'WARNING' ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                      {anomaly.message}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px] h-5 rounded-lg font-bold">
                        {anomaly.sector?.name || 'Sistema'}
                      </Badge>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {format(new Date(anomaly.createdAt), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {anomaly.isResolved ? (
                    <Badge className="bg-emerald-50 text-emerald-600 border-none rounded-lg h-7 font-bold text-[10px] flex gap-1 items-center">
                      <CheckCircle2 className="h-3 w-3" /> RESOLVIDO
                    </Badge>
                  ) : (
                    <Button variant="outline" className="h-8 rounded-lg text-[10px] font-bold border-slate-200">
                      RESOLVER AGORA
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {anomalies.length === 0 && (
              <div className="p-20 text-center space-y-4 opacity-40">
                <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-500" />
                <p className="text-sm font-medium">Nenhuma anomalia detectada nas últimas 24h.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
