import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  const { pathname } = request.nextUrl;

  const isProtectedPath =
    pathname.startsWith('/products') ||
    pathname.startsWith('/articles') ||
    pathname.startsWith('/categories') ||
    pathname.startsWith('/seo');
  // Jika mencoba akses dashboard tanpa token, lempar ke login
  if (isProtectedPath && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Jika sudah punya token dan buka halaman login atau root, langsung bawa ke /products
  if ((pathname === '/login' || pathname === '/') && token) {
    const productsUrl = new URL('/products', request.url);
    return NextResponse.redirect(productsUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/products/:path*',
    '/articles/:path*',
    '/categories/:path*',
    '/seo/:path*',
  ],
};
