import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Rotas publicas que nao requerem autenticacao
const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/home']

// Rotas que devem ser acessiveis apenas para usuarios nao autenticados
const authRoutes = ['/login', '/register']

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // Se o usuario esta autenticado e tenta acessar uma rota de auth (ex: login), redireciona para admin
  // EXCETO se houver um erro de perfil (evita loop infinito se o perfil nao existir no banco)
  const hasProfileError = request.nextUrl.searchParams.get('error') === 'profile_missing'
  if (user && authRoutes.includes(pathname) && !hasProfileError) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // Se o usuario nao esta autenticado e tenta acessar uma rota protegida, redireciona para login
  const protectedRoutes = ['/admin', '/pedidos', '/producao', '/produtos', '/clientes', '/estoque', '/financeiro', '/conversas', '/relatorios', '/orcamentos', '/dashboard', '/home']
  if (!user && !publicRoutes.includes(pathname) && protectedRoutes.some(route => pathname.startsWith(route)) && !pathname.startsWith('/_next') && !pathname.startsWith('/api/')) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Permite acesso a /admin mesmo com profile_missing (usuario autenticado)
  // O servidor vai detectar a falta de perfil e fazer logout automático
  if (user && pathname === '/admin' && hasProfileError) {
    return NextResponse.next()
  }

  // A rota raiz (/) e publica - nao redirecionar usuarios autenticados
  // Usuarios logados podem acessar a landing page normalmente

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
