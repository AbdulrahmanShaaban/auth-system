import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Protected routes
  const isProtectedRoute = pathname === '/dashboard' || pathname === '/';
  
  // Auth routes (should not be accessible if already logged in)
  const isAuthRoute = pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register');

  if (isProtectedRoute && !token) {
    // Redirect to login if trying to access a protected route without a token
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  if (isAuthRoute && token) {
    // Redirect to dashboard if trying to access auth pages while logged in
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Apply middleware to all routes except api, _next/static, _next/image, favicon.ico
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
