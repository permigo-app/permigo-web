import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only intercept the root route
  if (pathname !== '/') {
    return NextResponse.next();
  }

  const done = request.cookies.get('onboarding_done')?.value === 'true';

  if (!done) {
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/'],
};
