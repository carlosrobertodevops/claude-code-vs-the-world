import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Função placeholder para o Next.js 16 Proxy (substituto do middleware)
export function proxy(request: NextRequest) {
  // Passa a requisição adiante sem modificações por enquanto
  return NextResponse.next();
}

// Configuração opcional para definir onde o proxy deve rodar
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
