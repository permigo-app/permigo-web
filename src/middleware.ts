import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that never require onboarding
const BYPASS = [
  '/onboarding',
  '/login',
  '/register',
  '/landing',
  '/privacy',
  '/terms',
  '/_next',
  '/api',
  '/images',
  '/monuments',
  '/favicon',
  '/sitemap',
  '/robots',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files and bypass paths
  if (BYPASS.some(p => pathname.startsWith(p)) || pathname.includes('.')) {
    return NextResponse.next();
  }

  const done = request.cookies.get('onboarding_done')?.value === 'true';

  if (!done) {
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
