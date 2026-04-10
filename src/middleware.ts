import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/onboarding', '/login', '/register', '/landing', '/privacy', '/terms', '/sitemap.xml', '/robots.txt'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths, static files, and Next.js internals
  if (
    PUBLIC_PATHS.some(p => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/monuments') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const onboardingDone = request.cookies.get('onboarding_done')?.value === 'true';

  if (!onboardingDone) {
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
