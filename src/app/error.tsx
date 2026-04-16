'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log do erro para monitoramento interno (Ex: Sentry)
    console.error('Capturado erro de renderização:', error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center space-y-8"
      >
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
          <div className="relative w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto text-primary">
            <AlertTriangle className="w-10 h-10" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-normal tracking-tight text-foreground">
            Ops! Algo deu errado.
          </h1>
          <p className="text-sm font-light text-muted-foreground leading-relaxed">
            Detectamos uma falha inesperada na renderização desta página. 
            Nosso sistema de resiliência já registrou o log para análise.
          </p>
          <pre className="text-xs text-red-500 overflow-auto text-left bg-black/10 p-4 rounded mt-4">
            {error.message}
            {'\n'}
            {error.stack}
          </pre>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => reset()}
            variant="default"
            size="lg"
            className="rounded-2xl gap-2 font-normal px-8 h-12"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar Novamente
          </Button>
          
          <Link href="/">
            <Button
              variant="outline"
              size="lg"
              className="rounded-2xl gap-2 font-normal px-8 h-12 w-full sm:w-auto"
            >
              <Home className="w-4 h-4" />
              Página Inicial
            </Button>
          </Link>
        </div>

        <div className="pt-8 border-t border-slate-50">
          <p className="text-[10px] items-center justify-center flex font-light text-muted-foreground uppercase tracking-widest gap-2">
            ID do Erro: <span className="font-mono text-primary/60">{error.digest || 'S/N'}</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
