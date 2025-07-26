import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Percorsi protetti
  const protectedPaths = ['/user', '/preise', '/bestellungen', '/dokumente', '/adresse']
  const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))
  
  const sid = request.cookies.get('sid')?.value
  const userEmail = request.cookies.get('user')?.value
  
  if (isProtectedPath && (!sid || !userEmail)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  if (userEmail && request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('x-user', userEmail)
  }

  return response
}

export const config = {
  matcher: [
    '/user/:path*',
    '/preise/:path*',
    '/bestellungen/:path*',
    '/dokumente/:path*',
    '/adresse/:path*',
    '/api/prodotti/:path*',
    '/api/prezzi/:path*'
  ]
}
