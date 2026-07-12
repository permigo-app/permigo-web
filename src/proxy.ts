import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Route protégée : redirige vers la connexion si pas onboardé
  if (pathname === '/app') {
    const done = request.cookies.get('onboarding_done')?.value === 'true';
    if (!done) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/app'],
};
