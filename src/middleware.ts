import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // In production, redirect HTTP to HTTPS
  if (process.env.NODE_ENV === 'production') {
    const requestHeaders = new Headers(request.headers);
    const protocol = requestHeaders.get('x-forwarded-proto');
    
    if (protocol === 'http') {
      const host = request.headers.get('host');
      const { pathname, search } = request.nextUrl;
      const httpsUrl = `https://${host}${pathname}${search}`;
      return NextResponse.redirect(httpsUrl, 308); // 308 Permanent Redirect
    }
  }

  return NextResponse.next();
}

export const config = {
  // Match all request paths except for the ones starting with:
  // - api (API routes)
  // - _next/static (static files)
  // - _next/image (image optimization files)
  // - favicon.ico (favicon file)
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
