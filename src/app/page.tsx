'use client';

import { Search, ShoppingCart, ArrowRight, MessageCircle, MapPin, Clock, Mail, Phone, Facebook, Instagram, Twitter, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { useState } from 'react';
import Link from 'next/link';

// Imagens do Stitch MCP
const STITCH_IMAGES = {
  // Home Dark Mode Desktop
  heroCard1: 'https://lh3.googleusercontent.com/aida/ADBb0uh1hCGMGk2rAea4c4c70c2be4f6e8a9b0c1d2e3f4g5h6i7j8k9l0',
  heroCard2: 'https://lh3.googleusercontent.com/aida/ADBb0uheoqCKoHUDb8t_screenshot2',
  // Placeholders com gradientes para simular as imagens do Stitch
  placeholder1: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&h=300&fit=crop',
  placeholder2: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
  placeholder3: 'https://images.unsplash.com/photo-1586717799252-bd134f5c0e0e?w=400&h=300&fit=crop',
  placeholder4: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&h=300&fit=crop',
  banner1: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&h=400&fit=crop',
  banner2: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=300&fit=crop',
  product1: 'https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1?w=400&h=400&fit=crop',
  product2: 'https://images.unsplash.com/photo-1612196808214-b7e239e5f6b7?w=400&h=400&fit=crop',
  product3: 'https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=400&h=400&fit=crop',
  product4: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
};

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Impress&atilde;o', href: '#' },
    { label: 'Corte Laser', href: '#' },
    { label: 'MDF', href: '#' },
    { label: 'Acr&iacute;lico', href: '#' },
    { label: 'Personalizados', href: '#' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0B] text-gray-900 dark:text-white transition-colors duration-300">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-gray-900 border-l border-white/10 transform transition-transform duration-300 ease-in-out md:hidden ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <span className="text-lg font-bold text-white">Menu</span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-lg text-gray-400 hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${link.label === 'INÍCIO'
                ? 'text-purple-400 bg-purple-500/10'
                : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10 space-y-3">
          <Button asChild className="w-full bg-purple-600 hover:bg-purple-700 text-white">
            <Link href="/admin">Acessar Painel</Link>
          </Button>
          <Button variant="outline" asChild className="w-full border-white/20 text-gray-300 hover:bg-white/5">
            <Link href="/login">Fazer Login</Link>
          </Button>
        </div>
      </div>
      {/* Top Bar - NOT fixed, scrolls with page */}
      <div className="border-b border-gray-100 dark:border-white/5 bg-white dark:bg-[#0A0A0B] py-3 transition-colors">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Rua Jos&eacute; Bertho, 217 - Vila Sette, Jacarezinho-PR
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Seg-Sex: 08:00 - 18:00
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:flex items-center gap-1">
              <Phone className="h-3 w-3" />
              (43) 99135-9790
            </span>
            <span className="flex items-center gap-1">
              <a href="mailto:contato@printai.app" className="hover:text-purple-400 transition-colors">contato@printai.app</a>
            </span>
          </div>
        </div>
      </div>

      {/* Navbar - Sticky below top bar */}
      <header className="sticky top-0 z-50 bg-gray-900/95 dark:bg-[#0A0A0B]/95 backdrop-blur-xl shadow-xl shadow-black/20 border-b border-white/10 transition-all duration-300">
        <div className="mx-auto flex max-w-7xl h-14 items-center justify-between px-6">
          <div className="flex items-center">
            <img src="/logo.png" alt="Logo" className="h-10 w-auto object-contain" />
          </div>

          <nav className="hidden lg:flex items-center gap-5">
            <a href="#" className="text-sm font-light text-white hover:text-purple-400 transition-colors">Impress&atilde;o</a>
            <a href="#" className="text-sm font-light text-gray-400 hover:text-white transition-colors">Corte Laser</a>
            <a href="#" className="text-sm font-light text-gray-400 hover:text-white transition-colors">MDF</a>
            <a href="#" className="text-sm font-light text-gray-400 hover:text-white transition-colors">Acr&iacute;lico</a>
            <a href="#" className="text-sm font-light text-gray-400 hover:text-white transition-colors">Personalizados</a>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg text-gray-400 hover:bg-white/10 lg:hidden"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <button className="hidden lg:block p-2 text-gray-400 hover:text-white transition-colors">
              <Search className="h-5 w-5" />
            </button>
            <button className="hidden lg:block relative p-2 text-gray-400 hover:text-white transition-colors">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-purple-600 text-[10px] font-bold text-white flex items-center justify-center">3</span>
            </button>
          </div>
        </div>
      </header>

      {/* Spacer for navbar */}
      <div className="h-[56px]" />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-purple-50/50 dark:from-[#0A0A0B] dark:via-[#0A0A0B] dark:to-purple-900/10 py-20 lg:py-28 transition-colors">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-purple-200/40 dark:bg-purple-900/20 blur-[100px] animate-pulse-slow" />
          <div className="absolute top-1/2 -left-20 h-[400px] w-[400px] rounded-full bg-blue-200/40 dark:bg-blue-900/20 blur-[100px] animate-pulse-slow animation-delay-2000" />
          <div className="absolute bottom-0 right-1/4 h-[350px] w-[350px] rounded-full bg-pink-200/30 dark:bg-pink-900/15 blur-[80px] animate-pulse-slow animation-delay-4000" />
          {/* Floating particles */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-purple-400/30 dark:bg-purple-400/20 animate-float" />
          <div className="absolute top-1/3 right-1/3 w-3 h-3 rounded-full bg-blue-400/30 dark:bg-blue-400/20 animate-float animation-delay-3000" />
          <div className="absolute bottom-1/3 left-1/2 w-2 h-2 rounded-full bg-pink-400/30 dark:bg-pink-400/20 animate-float animation-delay-1500" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
                Impressões que{' '}
                <span className="text-purple-600 dark:text-purple-400">destacam</span> sua{' '}
                <span className="text-purple-600 dark:text-purple-400">marca</span>
              </h1>
              <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg">
                O cockpit operacional definitivo para indústrias gráficas. Automatize orçamentos, produção e controle financeiro.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button asChild className="h-12 px-6 bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20">
                  <Link href="/produtos">
                    Ver Produtos
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-12 px-6 border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">
                  <Link href="/contato">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    WhatsApp
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="rounded-2xl overflow-hidden shadow-xl shadow-purple-500/10 dark:shadow-purple-500/20 bg-gradient-to-br from-gray-800 to-gray-900 p-8 aspect-square flex items-center justify-center">
                    <img
                      src={STITCH_IMAGES.placeholder1}
                      alt="Cartões Premium"
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmaWxsPSIjNjY2IiBmb250LXNpemU9IjE4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Q2FydMO1ZXM8L3RleHQ+PC9zdmc+';
                      }}
                    />
                  </div>
                  <div className="rounded-2xl overflow-hidden shadow-xl shadow-purple-500/10 dark:shadow-purple-500/20 bg-gradient-to-br from-blue-600 to-blue-800 p-6 aspect-[4/3] flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="text-lg font-bold">DESIGN</div>
                      <div className="text-sm opacity-80">GRÁFICO</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="rounded-2xl overflow-hidden shadow-xl shadow-purple-500/10 dark:shadow-purple-500/20 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/20 p-6 aspect-square flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-1">
                      <div className="w-8 h-8 bg-orange-300 dark:bg-orange-600 rounded" />
                      <div className="w-8 h-8 bg-orange-400 dark:bg-orange-500 rounded" />
                      <div className="w-8 h-8 bg-yellow-200 dark:bg-yellow-600 rounded" />
                      <div className="w-8 h-8 bg-yellow-300 dark:bg-yellow-500 rounded" />
                    </div>
                  </div>
                  <div className="rounded-2xl overflow-hidden shadow-xl shadow-purple-500/10 dark:shadow-purple-500/20 bg-gradient-to-br from-purple-700 to-purple-900 p-6 aspect-[4/3] flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="text-lg font-bold">BANNER</div>
                      <div className="text-sm opacity-80">ROLL-UP</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white dark:bg-[#0A0A0B] transition-colors">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Categorias de Sucesso</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Soluções completas para sua identidade visual</p>
            </div>
            <div className="flex gap-2">
              <button className="p-2 rounded-full border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button className="p-2 rounded-full border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: 'Cartões de visita', price: 'R$ 49,90', image: STITCH_IMAGES.placeholder1, badge: 'Mais vendido' },
              { name: 'Flyers', price: 'R$ 89,90', image: STITCH_IMAGES.placeholder2, badge: 'Popular' },
              { name: 'Banners', price: 'R$ 120,00', image: STITCH_IMAGES.placeholder3, badge: 'Destaque' },
              { name: 'Adesivos', price: 'R$ 35,00', image: STITCH_IMAGES.placeholder4, badge: 'Novo' },
            ].map((category) => (
              <div key={category.name} className="group rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/[0.02] overflow-hidden hover:shadow-lg dark:hover:shadow-white/5 transition-all duration-300">
                <div className="aspect-[4/3] relative overflow-hidden bg-gray-100 dark:bg-white/5">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-purple-600 text-white text-[10px] font-bold">{category.badge}</span>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{category.name}</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">A partir de {category.price}</p>
                  <Button variant="outline" size="sm" className="mt-4 w-full border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-200 dark:hover:border-purple-500/20">
                    Pedir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Most Ordered Section */}
      <section className="py-20 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 dark:from-purple-950 dark:via-purple-900 dark:to-indigo-950 transition-colors">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-2xl font-bold text-white mb-12">Mais Pedidos</h2>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Large Card */}
            <div className="lg:col-span-2 rounded-3xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 dark:from-white/10 dark:to-white/5 p-8 relative border border-white/10">
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 rounded-full bg-green-500 text-white text-xs font-medium">DESTAQUE</span>
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-white">Combo Identidade Visual Premium</h3>
                <p className="mt-2 text-gray-400">Cartões + Envelopes + Papel Timbrado com acabamento fosco e verniz localizado.</p>
                <Button className="mt-6 bg-white text-purple-900 hover:bg-gray-100">
                  Ver Detalhes
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div className="absolute bottom-0 right-0 w-64 h-48 opacity-20">
                <img src={STITCH_IMAGES.banner1} alt="" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Small Card */}
            <div className="rounded-3xl overflow-hidden bg-white dark:bg-white/[0.05] dark:border dark:border-white/10 p-6 transition-colors">
              <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-medium">NOVIDADE</span>
              <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">Adesivos em Vinil</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Resistentes a água e sol. Perfeitos para embalagens e brindes.</p>
              <div className="mt-4 rounded-xl bg-gray-100 dark:bg-white/5 aspect-video overflow-hidden">
                <img
                  src={STITCH_IMAGES.banner2}
                  alt="Adesivos"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <Button className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white">
                Customizar agora
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Launches Section */}
      <section className="py-20 bg-white dark:bg-[#0A0A0B] transition-colors">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Lançamentos</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Inovação em acabamentos e materiais sustentáveis para sua marca.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: 'Papel Semente', price: 'R$ 108,00', desc: 'Sustentável com flores. Papel que pode ser plantado.', image: STITCH_IMAGES.product1 },
              { name: 'Costura Aparente', price: 'R$ 65,00', desc: 'Catalogo premium com acabamento artesanal.', image: STITCH_IMAGES.product2 },
              { name: 'Canvas Galeria', price: 'R$ 180,00', desc: 'Impressão em tecido canvas com acabamento museu.', image: STITCH_IMAGES.product3 },
              { name: 'Acrílico Laser', price: 'Sob consulta', desc: 'Placas elegantes cortadas a laser com precisão.', image: STITCH_IMAGES.product4 },
            ].map((product) => (
              <div key={product.name} className="group rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/[0.02] overflow-hidden hover:shadow-lg dark:hover:shadow-white/5 transition-all duration-300">
                <div className="aspect-square bg-gray-100 dark:bg-white/5 relative overflow-hidden">
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-0.5 rounded bg-yellow-400 text-gray-900 text-[10px] font-bold">NOVO</span>
                  </div>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{product.desc}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-lg font-bold text-purple-600 dark:text-purple-400">{product.price}</span>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white h-8 px-3 text-xs">
                      Pedir
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 p-12 text-center lg:p-16">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/50 to-pink-500/50" />
            <div className="relative">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">Pronto para imprimir sua ideia?</h2>
              <p className="mx-auto mt-4 max-w-xl text-white/80">
                Seja para um evento, seu novo negócio ou uma campanha especial, nós garantimos o melhor resultado final.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Button className="h-12 px-8 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold shadow-lg">
                  Fazer pedido agora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" className="h-12 px-8 border-white/30 text-white hover:bg-white/10">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Orçamento Customizado
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-white/5 bg-white dark:bg-[#0A0A0B] py-16 transition-colors">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="mb-4">
                <img src="/logo.png" alt="Logo" className="h-14 w-auto object-contain" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Excelência em impressão digital com tecnologia de ponta e acabamento premium.
              </p>
              <div className="mt-4 flex gap-3">
                <a href="#" className="p-2 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-purple-100 dark:hover:bg-purple-500/20 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  <Facebook className="h-4 w-4" />
                </a>
                <a href="#" className="p-2 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-purple-100 dark:hover:bg-purple-500/20 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  <Instagram className="h-4 w-4" />
                </a>
                <a href="#" className="p-2 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-purple-100 dark:hover:bg-purple-500/20 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  <Twitter className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Produtos */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">PRODUTOS</h3>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li><a href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Cartões de Visita</a></li>
                <li><a href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Banners e Lonas</a></li>
                <li><a href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Flyers e Panfletos</a></li>
                <li><a href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Adesivos Customizados</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">EMPRESA</h3>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li><a href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Envios</a></li>
              </ul>
            </div>

            {/* Atendimento */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">ATENDIMENTO</h3>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Segunda a Sexta: 08:00 - 18:00
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <a href="tel:+5543991359790" className="text-purple-600 dark:text-purple-400 hover:underline">(43) 99135-9790</a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <a href="mailto:contato@printai.app" className="text-purple-600 dark:text-purple-400 hover:underline">contato@printai.app</a>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5" />
                  <span>Rua José Bertho, 217<br />Vila Sette, Jacarezinho-PR</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100 dark:border-white/5 text-center">
            <p className="text-xs text-gray-400">
              &copy; 2026 Inteligência Gráfica Digital. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
