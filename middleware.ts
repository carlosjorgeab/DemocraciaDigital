import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken } from '@/lib/auth-crypto';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Static files and Next.js internals to ignore
  if (
    pathname.startsWith('/_next') ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|txt|woff2?)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 2. Auth API routes: let them handle their own requests without middleware redirection
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // 3. Public application routes
  const isPublicRoute =
    pathname === '/login' ||
    pathname.startsWith('/p/') ||
    pathname === '/folder';

  // 4. Read token from HttpOnly cookie
  const token = request.cookies.get('democracia_token')?.value;
  const session = token ? await verifySessionToken(token) : null;
  const isAuthenticated = Boolean(session?.sub);

  // 5. Protected API routes: return JSON 401 if unauthenticated
  if (pathname.startsWith('/api/') && !isAuthenticated && !isPublicRoute) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  // 6. Redirect unauthenticated users from protected dashboard pages to /login
  if (!isAuthenticated && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 7. Redirect authenticated users from /login to dashboard home
  if (isAuthenticated && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files
     */
    '/((?!_next/static|_next/image|favicon.ico|icon.svg).*)',
  ],
};
