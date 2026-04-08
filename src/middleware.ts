import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Rotas públicas que não requerem autenticação
const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password']

// Rotas que devem ser acessíveis apenas para usuários não autenticados
const authRoutes = ['/login']

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

  // Se o usuário está autenticado e tenta acessar uma rota de auth (ex: login), redireciona para admin
  if (user && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // Se o usuário não está autenticado e tenta acessar uma rota protegida, redireciona para login
  const protectedRoutes = ['/admin', '/pedidos', '/producao', '/produtos', '/clientes', '/estoque', '/financeiro', '/conversas', '/relatorios', '/orcamentos', '/dashboard']
  if (!user && !publicRoutes.includes(pathname) && protectedRoutes.some(route => pathname.startsWith(route)) && !pathname.startsWith('/_next') && !pathname.startsWith('/api/')) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // A rota raiz (/) é pública - não redirecionar usuários autenticados
  // Usuários logados podem acessar a landing page normalmente

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
