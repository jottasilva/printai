'use client';

import React from 'react';
import { Sidebar } from '@/components/sidebar';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface PagePlaceholderProps {
  title: string;
  description: string;
  icon: string;
}

export function PagePlaceholder({ title, description, icon }: PagePlaceholderProps) {
  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0A0A0B] flex admin-theme">
      <Sidebar />
      <main className="flex-1 flex flex-col p-4 lg:p-8 overflow-y-auto lg:ml-64">
        <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full text-center py-12">
          <div className="relative mb-10 overflow-visible">
            {/* Animated Background Orbs */}
            <div className="absolute -inset-10 bg-[#7C3AED]/5 blur-3xl rounded-full opacity-60 animate-pulse" />
            <div className="absolute -inset-20 bg-purple-500/5 blur-[100px] rounded-full opacity-40 animate-slow-spin" />
            
            <div className="relative z-10 w-32 h-32 rounded-[2.5rem] bg-white shadow-premium flex items-center justify-center border border-purple-50 rotate-3 transition-transform hover:rotate-0 duration-500 group">
              <span className="material-symbols-outlined text-[56px] text-[#7C3AED] animate-float">{icon}</span>
              <div className="absolute -top-3 -right-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#7C3AED] blur-md opacity-30 animate-pulse" />
                  <Sparkles className="w-8 h-8 text-[#7C3AED] relative z-10 animate-bounce" />
                </div>
              </div>
            </div>
          </div>

          <Badge variant="purple" className="mb-6 px-4 py-1 text-[11px] font-normal uppercase tracking-[0.2em] shadow-sm">
            Módulo em Construção
          </Badge>

          <h1 className="text-4xl md:text-5xl font-light text-slate-900 border-none tracking-tighter mb-6">
            {title}
          </h1>
          
          <p className="text-gray-500 max-w-xl mx-auto mb-12 text-lg font-normal leading-relaxed">
            {description}
          </p>

          <div className="flex flex-col sm:flex-row gap-6 items-center justify-center w-full">
            <Link href="/admin">
              <Button variant="outline" className="h-14 px-10 rounded-2xl border-gray-100 bg-white shadow-premium hover:bg-gray-50 transition-all font-normal text-gray-700 group">
                <ArrowLeft className="w-5 h-4 mr-3 transition-transform group-hover:-translate-x-1" />
                Painel Principal
              </Button>
            </Link>
            <Button className="h-14 px-10 rounded-[20px] bg-slate-900 text-white font-normal hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95">
              Solicitar Acesso Antecipado
            </Button>
          </div>

          <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
            {[
              { label: 'Status do Projeto', value: 'Desenvolvimento', icon: '⚡', color: 'text-amber-500' },
              { label: 'Prioridade Técnica', value: 'Máxima', icon: '🔥', color: 'text-[#7C3AED]' },
              { label: 'Lançamento', value: 'Q3 2026', icon: '🚀', color: 'text-emerald-500' },
            ].map((stat) => (
              <div key={stat.label} className="p-6 rounded-3xl bg-white border border-gray-100 shadow-premium transition-transform hover:-translate-y-1 duration-300">
                <div className="text-2xl mb-2">{stat.icon}</div>
                <p className="text-[10px] text-gray-400 font-normal uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                <p className={`font-normal ${stat.color} text-sm tracking-tight`}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        <footer className="py-8 text-center text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] opacity-60">
          Tecnologia PrintAI — Construindo o Futuro da Impressão
        </footer>
      </main>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes slow-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-slow-spin {
          animation: slow-spin 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
