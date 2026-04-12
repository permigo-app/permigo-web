import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Root toujours → landing (page publique)
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/landing', request.url));
  }

  // Route de jeu protégée
  if (pathname === '/app') {
    const done = request.cookies.get('onboarding_done')?.value === 'true';
    if (!done) {
      return NextResponse.redirect(new URL('/landing', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/app'],
};
