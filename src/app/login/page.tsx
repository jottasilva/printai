'use client'
export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, Mail, Lock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react'
import { FloatingAIWidget } from '@/components/ui/floating-ai-widget'

function LoginForm() {
  const searchParams = useSearchParams()
  const errorParam = searchParams.get('error')
  const messageParam = searchParams.get('message')
  const redirectParam = searchParams.get('redirect')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(
    errorParam === 'profile_missing'
      ? 'Perfil não encontrado. Sua conta pode estar em processo de sincronização.'
      : null
  )
  const [successMessage, setSuccessMessage] = useState<string | null>(
    messageParam === 'registration_success'
      ? 'Conta criada com sucesso! Faça login para continuar.'
      : null
  )

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const savedEmail = localStorage.getItem('printai_remember_email')
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }

    if (errorParam === 'profile_missing') {
      const performLogout = async () => {
        await supabase.auth.signOut()
      }
      performLogout()
    }
  }, [errorParam, supabase.auth])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : authError.message)
      setLoading(false)
    } else {
      if (rememberMe) {
        localStorage.setItem('printai_remember_email', email)
      } else {
        localStorage.removeItem('printai_remember_email')
      }
      router.push(redirectParam || '/admin')
      router.refresh()
    }
  }

  return (
    <div className="flex flex-col justify-center h-full w-full max-w-sm mx-auto py-4 px-4 md:px-0">
      <div className="mb-4 md:mb-6 text-center md:text-left">
        <span className="text-[10px] font-normal tracking-[0.1em] uppercase text-indigo-500 mb-1 block">
          Acesso corporativo
        </span>
        <h2 className="text-xl md:text-2xl font-normal text-gray-900 mb-1 leading-tight">
          Bem-vindo de volta
        </h2>
        <p className="text-gray-500 text-[11px] leading-relaxed">
          Entre com sua conta para continuar
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-3 md:space-y-4 pr-1 scrollbar-hide overflow-y-auto">
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-gray-700 ml-1">E-mail corporativo</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
              <Mail className="w-3.5 h-3.5" />
            </div>
            <input
              type="email"
              placeholder="nome@suagrafica.com.br"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-gray-900 text-xs placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center ml-1">
            <label className="text-[11px] font-semibold text-gray-700">Senha</label>
            <a href="#" className="text-[10px] font-medium text-indigo-500 hover:text-indigo-600 transition-colors">
              Esqueceu?
            </a>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <input
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-gray-900 text-xs placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="peer h-3.5 w-3.5 appearance-none rounded border border-gray-300 bg-white transition-all checked:border-indigo-500 checked:bg-indigo-500 hover:border-indigo-400 focus:outline-none"
              />
              <svg
                className="absolute h-2.5 w-2.5 text-white opacity-0 transition-opacity peer-checked:opacity-100 left-0.5 pointer-events-none"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span className="text-[10px] font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
              Lembrar meu e-mail
            </span>
          </label>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 p-2 bg-red-50 border border-red-100 rounded-lg"
          >
            <AlertCircle className="w-3 h-3 text-red-600 mt-0.5 shrink-0" />
            <p className="text-[10px] font-medium text-red-800 leading-tight">{error}</p>
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-800 text-[10px] font-medium"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            {successMessage}
          </motion.div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white text-sm font-normal rounded-xl shadow-[0_4px_15px_rgba(99,102,241,0.2)] transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 group mt-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Entrar
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <div className="mt-4 pt-4 border-t border-gray-100 shrink-0">
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Não tem uma conta?{' '}
            <a href="/register" className="font-normal text-indigo-500 hover:text-indigo-600 hover:underline transition-colors ml-1">
              Criar conta
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

function IllustrationSection() {
  return (
    <div className="relative h-full flex flex-col p-6 lg:p-10 overflow-hidden bg-gradient-to-br from-[#1A1560] via-[#2B22A0] to-[#3B30CC]">
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-400/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full mb-2">
        <img src="/logo-off.png" alt="PrintAI Logo" className="w-full max-w-[280px] md:max-w-[340px] h-auto object-contain" />
      </div>

      <div className="flex-1 flex items-center justify-center py-2 md:py-4 relative z-10 font-sans">
        <div className="w-full max-w-[140px] md:max-w-[180px] aspect-square">
          <svg viewBox="0 0 260 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
            <rect x="50" y="90" width="160" height="72" rx="12" fill="white" fillOpacity={0.08} stroke="white" strokeOpacity={0.2} strokeWidth={1.5}/>
            <rect x="80" y="152" width="100" height="8" rx="4" fill="white" fillOpacity={0.12}/>
            <rect x="82" y="72" width="96" height="28" rx="4" fill="white" fillOpacity={0.95}/>
            <rect x="93" y="80" width="50" height="3" rx="1.5" fill="#D0D5FF"/>
            <rect x="93" y="87" width="35" height="3" rx="1.5" fill="#E5E7FF"/>
            <circle cx="188" cy="122" r="8" fill="white" fillOpacity={0.1} stroke="white" strokeOpacity={0.2} strokeWidth={1}/>
            <circle cx="188" cy="122" r="3" fill="#A5AFFF"/>
            <rect x="70" y="104" width="48" height="6" rx="3" fill="white" fillOpacity={0.15}/>
            <g opacity="0.8">
              <circle cx="208" cy="64" r="2.5" fill="#A5AFFF"/>
              <line x1="208" y1="57" x2="208" y2="61" stroke="#A5AFFF" strokeWidth={1.5} strokeLinecap="round"/>
              <line x1="208" y1="67" x2="208" y2="71" stroke="#A5AFFF" strokeWidth={1.5} strokeLinecap="round"/>
              <line x1="201" y1="64" x2="205" y2="64" stroke="#A5AFFF" strokeWidth={1.5} strokeLinecap="round"/>
              <line x1="211" y1="64" x2="215" y2="64" stroke="#A5AFFF" strokeWidth={1.5} strokeLinecap="round"/>
            </g>
            <circle cx="95" cy="122" r="6" fill="#FFD600" fillOpacity={0.85}/>
            <circle cx="112" cy="122" r="6" fill="#00B0FF" fillOpacity={0.85}/>
            <circle cx="129" cy="122" r="6" fill="#F72585" fillOpacity={0.85}/>
            <circle cx="146" cy="122" r="6" fill="black" fillOpacity={0.4}/>
            <rect x="164" y="28" width="58" height="42" rx="6" fill="white" fillOpacity={0.1} stroke="white" strokeOpacity={0.2} strokeWidth={1}/>
            <rect x="26" y="60" width="52" height="22" rx="8" fill="#A5AFFF" fillOpacity={0.15} stroke="#A5AFFF" strokeOpacity={0.3} strokeWidth={1}/>
            <text x="52" y="75" textAnchor="middle" fontSize="9" fill="white" fillOpacity={0.95} fontWeight="600">IA + Print</text>
            <rect x="90" y="178" width="80" height="12" rx="3" fill="white" fillOpacity={0.05} stroke="white" strokeOpacity={0.15} strokeWidth={1}/>
          </svg>
        </div>
      </div>

      <div className="relative z-10 mt-auto pt-4 border-t border-white/10">
        <div className="inline-block bg-white/10 backdrop-blur-md border border-white/20 px-2 py-0.5 rounded-full mb-2">
          <span className="text-[9px] font-normal tracking-widest text-indigo-100 uppercase">
            Plataforma Gráfica
          </span>
        </div>
        <h1 className="text-lg md:text-xl font-normal text-white leading-tight mb-2">
          A inteligência que sua <span className="text-indigo-200">gráfica precisa</span>
        </h1>
        <p className="text-indigo-100/70 text-[10px] leading-relaxed mb-3 max-w-xs">
          Gerencie orçamentos e produção com IA integrada. Do briefing ao final.
        </p>

        <div className="grid grid-cols-1 gap-1.5">
          {[
            'Orçamentos automáticos com IA',
            'Controle de produção real',
            'Gestão de clientes e pedidos'
          ].map((text) => (
            <div key={text} className="flex items-center gap-2 text-indigo-50/90 text-[10px] font-medium">
              <div className="flex-shrink-0 w-3.5 h-3.5 rounded bg-white/10 border border-white/20 flex items-center justify-center">
                <CheckCircle2 className="w-2 h-2 text-indigo-300" />
              </div>
              {text}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F4F2EE] flex items-center justify-center p-4 selection:bg-indigo-100 selection:text-indigo-900 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-[90vw] md:w-[70vw] min-h-[500px] max-h-[90vh] grid md:grid-cols-2 bg-white rounded-[2.5rem] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white/40"
      >
        <div className="hidden md:block h-full relative">
          <IllustrationSection />
        </div>

        <div className="h-full relative bg-white overflow-y-auto scrollbar-hide">
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="text-sm font-medium text-gray-400 animate-pulse">Carregando portal...</p>
            </div>
          }>
            <LoginForm />
          </Suspense>
        </div>
      </motion.div>
      
      <FloatingAIWidget />
    </div>
  )
}
