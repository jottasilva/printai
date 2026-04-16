'use client';

import { useEffect } from 'react';

/**
 * Script de resiliência injetado no lado do cliente para detectar falhas críticas
 * de carregamento de recursos e forçar uma recuperação automática selecionada.
 */
export function RecoveryScript() {
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent | PromiseRejectionEvent) => {
      const error = 'message' in event ? event.message : (event as any).reason?.message;
      
      // Detecção de falhas de carregamento de Assets do Next.js/Webpack
      const isChunkError = /Loading chunk .* failed/.test(error) || 
                          /Loading CSS chunk .* failed/.test(error) ||
                          /Failed to load resource/.test(error);

      if (isChunkError) {
        console.warn('Detectada falha de recurso vital. Iniciando auto-recuperação...');
        
        // Evitar loop infinito de reloads
        const lastReload = sessionStorage.getItem('last_auto_recovery');
        const now = Date.now();
        
        if (!lastReload || now - parseInt(lastReload) > 10000) {
          sessionStorage.setItem('last_auto_recovery', now.toString());
          window.location.reload();
        } else {
          console.error('Falha persistente detectada após tentativa de recuperação.');
        }
      }
    };

    // Listener para erros de rede em tags (script, link)
    const handleResourceError = (event: ErrorEvent) => {
      const target = event.target as HTMLElement;
      if (target && (target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
        const src = (target as any).src || (target as any).href;
        if (src && src.includes('_next/static')) {
          handleGlobalError({ message: 'Failed to load resource: ' + src } as any);
        }
      }
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleGlobalError);
    window.addEventListener('error', handleResourceError, true); // true para capturar fase de captura de tags

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleGlobalError);
      window.removeEventListener('error', handleResourceError, true);
    };
  }, []);

  return null;
}
