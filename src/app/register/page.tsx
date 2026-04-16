'use client'
export const dynamic = 'force-dynamic';

import { useState, Suspense, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  Mail, Lock, Loader2, User, Building, AlertCircle, 
  CheckCircle2, ArrowRight, ArrowLeft, MapPin, 
  Phone, Briefcase, CreditCard, Clock, Globe
} from 'lucide-react'
import { registerUser } from '@/app/actions/auth'
import { FloatingAIWidget } from '@/components/ui/floating-ai-widget'

// --- Utilitários de Máscara ---
const maskCNPJ = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .slice(0, 18)
}

const maskPhone = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15)
}

const maskCEP = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{5})(\d)/, '$1-$2')
    .slice(0, 9)
}

function RegisterForm() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    cnpj: '',
    telefone: '',
    cep: '',
    logradouro: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    prazoProducao: '3 a 5 dias úteis',
    formasPagamento: [] as string[],
  })
  
  const [loading, setLoading] = useState(false)
  const [validatingCEP, setValidatingCEP] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  // --- Busca de CEP ---
  useEffect(() => {
    const fetchCEP = async () => {
      const cleanCEP = formData.cep.replace(/\D/g, '')
      if (cleanCEP.length === 8) {
        setValidatingCEP(true)
        try {
          const res = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)
          const data = await res.json()
          if (!data.erro) {
            setFormData(prev => ({
              ...prev,
              logradouro: data.logradouro,
              bairro: data.bairro,
              cidade: data.localidade,
              estado: data.uf
            }))
          }
        } catch (err) {
          console.error('Erro ao buscar CEP')
        } finally {
          setValidatingCEP(false)
        }
      }
    }
    fetchCEP()
  }, [formData.cep])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    let maskedValue = value

    if (name === 'cnpj') maskedValue = maskCNPJ(value)
    if (name === 'telefone') maskedValue = maskPhone(value)
    if (name === 'cep') maskedValue = maskCEP(value)

    setFormData(prev => ({ ...prev, [name]: maskedValue }))
    if (error) setError(null)
  }

  const nextStep = () => {
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password) {
        setError('Preencha os dados da conta')
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setError('As senhas não coincidem')
        return
      }
    }
    if (step === 2) {
      if (!formData.companyName || !formData.cnpj) {
        setError('Preencha os dados da empresa')
        return
      }
    }
    setError(null)
    setStep(prev => prev + 1)
  }

  const prevStep = () => setStep(prev => prev - 1)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result = await registerUser({
        name: formData.name,
        email: formData.email,
        companyName: formData.companyName,
        password: formData.password,
        cnpj: formData.cnpj,
        telefone: formData.telefone,
        cep: formData.cep,
        logradouro: formData.logradouro,
        numero: formData.numero,
        bairro: formData.bairro,
        cidade: formData.cidade,
        estado: formData.estado,
        prazoProducao: formData.prazoProducao,
        formasPagamento: formData.formasPagamento
      })

      if (!result.success) {
        setError(result.error || 'Erro ao criar conta')
        setLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/login?message=registration_success')
      }, 3000)
    } catch (err: any) {
      setError('Erro inesperado. Tente novamente.')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20">
          <CheckCircle2 className="w-12 h-12 text-emerald-500" />
        </div>
        <h2 className="text-3xl font-light text-gray-900 mb-3 tracking-tight">Cadastro Concluído!</h2>
        <p className="text-gray-500 text-sm max-w-[280px] leading-relaxed">
          Sua gráfica está sendo preparada com IA. Redirecionando para o login...
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col justify-center h-full w-full max-w-md mx-auto py-6 px-6">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-normal uppercase tracking-widest text-indigo-600">
            Sessão {step} de 4
          </span>
          <span className="text-[10px] font-medium text-gray-400">
            {step === 1 && "Credenciais"}
            {step === 2 && "Sua Empresa"}
            {step === 3 && "Localização"}
            {step === 4 && "Configurações Gráficas"}
          </span>
        </div>
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-indigo-500"
            initial={{ width: "25%" }}
            animate={{ width: `${step * 25}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-600">Seu Nome</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Como quer ser chamado?" autoComplete="name" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-600">Email Corporativo</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="seu@email.com" autoComplete="email" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-600">Senha</label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" autoComplete="new-password" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-600">Confirmar</label>
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" autoComplete="new-password" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm" />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-600">Nome da Empresa (Fantasia)</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Ex: Gráfica Premium" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-600">CNPJ</label>
                  <input type="text" name="cnpj" value={formData.cnpj} onChange={handleChange} placeholder="00.000.000/0000-00" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-600">WhatsApp Comercial</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                    <input type="text" name="telefone" value={formData.telefone} onChange={handleChange} placeholder="(00) 00000-0000" className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-600">CEP</label>
                  <div className="relative">
                    <input type="text" name="cep" value={formData.cep} onChange={handleChange} placeholder="00000-000" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-mono" />
                    {validatingCEP && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-indigo-500" />}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-600">Estado</label>
                  <input type="text" name="estado" value={formData.estado} readOnly className="w-full px-4 py-2.5 bg-gray-100/50 border border-gray-200 rounded-xl text-sm" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-600">Logradouro</label>
                <input type="text" name="logradouro" value={formData.logradouro} onChange={handleChange} placeholder="Rua, Av..." className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-600">Número</label>
                  <input type="text" name="numero" value={formData.numero} onChange={handleChange} placeholder="123" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-[11px] font-bold text-gray-600">Cidade</label>
                  <input type="text" name="cidade" value={formData.cidade} readOnly className="w-full px-4 py-2.5 bg-gray-100/50 border border-gray-200 rounded-xl text-sm" />
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-600">Prazo de Produção Padrão</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select name="prazoProducao" value={formData.prazoProducao} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm appearance-none">
                    <option>Imediato</option>
                    <option>1 a 2 dias úteis</option>
                    <option>3 a 5 dias úteis</option>
                    <option>7 a 10 dias úteis</option>
                  </select>
                </div>
              </div>
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  <span className="text-[11px] font-bold text-indigo-900 uppercase">Formas de Pagamento</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {['Pix', 'Cartão', 'Boleto', 'Dinheiro'].map(opt => (
                    <label key={opt} className="flex items-center gap-2 text-xs text-gray-600">
                      <input 
                        type="checkbox" 
                        checked={formData.formasPagamento.includes(opt)}
                        onChange={(e) => {
                          const val = opt
                          setFormData(prev => ({
                            ...prev,
                            formasPagamento: e.target.checked 
                              ? [...prev.formasPagamento, val]
                              : prev.formasPagamento.filter(x => x !== val)
                          }))
                        }}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" 
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <p className="text-[11px] font-bold text-red-800">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          {step > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="flex-1 py-3 px-6 bg-white border border-gray-200 text-gray-600 text-sm font-bold rounded-2xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
          )}
          
          {step < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex-[2] py-3 px-6 bg-indigo-600 text-white text-sm font-bold rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 group"
            >
              Continuar
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-3 px-6 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-sm font-bold rounded-2xl shadow-lg shadow-emerald-100 hover:from-emerald-700 hover:to-emerald-600 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Concluir Cadastro"}
            </button>
          )}
        </div>
      </form>

      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          Já tem uma conta? <a href="/login" className="font-bold text-indigo-600 hover:underline">Fazer login</a>
        </p>
      </div>
    </div>
  )
}

function IllustrationSection() {
  return (
    <div className="relative h-full flex flex-col p-12 overflow-hidden bg-gradient-to-br from-[#1A1560] via-[#2B22A0] to-[#3B30CC]">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white opacity-[0.03] blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
      
      <div className="relative z-10 w-full mb-12">
        <img src="/logo-off.png" alt="PrintAI Logo" className="w-[180px] h-auto" />
      </div>

      <div className="flex-1 flex flex-col justify-center relative z-10">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-[2.5rem] mb-8 inline-block self-start">
          <Globe className="w-8 h-8 text-indigo-200 mb-4" />
          <h1 className="text-2xl font-light text-white leading-tight mb-2">A Próxima Geração de ERP Gráfico</h1>
          <p className="text-indigo-100/70 text-xs leading-relaxed max-w-xs">Automatize orçamentos, gerencie produção e escale sua gráfica com inteligência artificial de ponta.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white/5 border border-white/10 rounded-3xl">
            <h3 className="text-white font-bold text-sm mb-1">+45%</h3>
            <p className="text-indigo-200/60 text-[10px]">Eficiência Operacional</p>
          </div>
          <div className="p-4 bg-white/5 border border-white/10 rounded-3xl">
            <h3 className="text-white font-bold text-sm mb-1">24/7</h3>
            <p className="text-indigo-200/60 text-[10px]">Orçamentos com IA</p>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-8 border-t border-white/10 flex items-center justify-between">
        <span className="text-[10px] font-bold tracking-widest text-white/40 uppercase">© 2026 PrintAI v2.0</span>
        <div className="flex gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9px] text-indigo-300 font-bold">SISTEMA ONLINE</span>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center p-4 selection:bg-indigo-100 selection:text-indigo-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[1000px] min-h-[600px] grid md:grid-cols-2 bg-white rounded-[3rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] border border-white"
      >
        <div className="hidden md:block h-full">
          <IllustrationSection />
        </div>

        <div className="h-full relative bg-white flex flex-col items-center justify-center">
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
              <p className="text-xs font-normal text-indigo-900 tracking-tighter uppercase">Iniciando...</p>
            </div>
          }>
            <RegisterForm />
          </Suspense>
        </div>
      </motion.div>
      <FloatingAIWidget />
    </div>
  )
}
