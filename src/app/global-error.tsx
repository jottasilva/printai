'use client';

import { motion } from 'framer-motion';
import { ShieldAlert, RefreshCcw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-50 min-h-screen flex items-center justify-center font-sans antialiased">
        <div className="max-w-md w-full p-8 text-center bg-white rounded-[32px] shadow-2xl border border-slate-100">
           <div className="w-16 h-16 bg-red-100/50 rounded-2xl flex items-center justify-center mx-auto text-red-600 mb-6">
              <ShieldAlert className="w-8 h-8" />
           </div>
           
           <h1 className="text-2xl font-normal text-slate-900 mb-4 tracking-tight">
             Falha de Sistema Crítica
           </h1>
           
           <p className="text-sm font-light text-slate-500 mb-8 leading-relaxed">
             O sistema de renderização raiz falhou ao inicializar os recursos necessários. 
             Isso pode ocorrer por instabilidade na rede ou no servidor de assets.
           </p>
           
           <button
             onClick={() => window.location.href = '/'}
             className="w-full h-14 bg-slate-900 text-white rounded-2xl font-normal flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95"
           >
             <RefreshCcw className="w-4 h-4" />
             Reiniciar Aplicação
           </button>
           
           <div className="mt-8 pt-6 border-t border-slate-50">
              <p className="text-[10px] font-light text-slate-400 uppercase tracking-widest">
                Proteção de Resiliência Antigravity
              </p>
           </div>
        </div>
      </body>
    </html>
  );
}
