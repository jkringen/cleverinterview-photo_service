import { NextRequest, NextResponse } from 'next/server';

/**
 * Returns one of two types of next auth session tokens.
 * @param {NextRequest} req Request
 * @returns {string | null}
 */
function getSessionToken(req: NextRequest) {
  return (
    req.cookies.get('__Secure-next-auth.session-token')?.value ??
    req.cookies.get('next-auth.session-token')?.value ??
    null
  );
}

export async function middleware(request: NextRequest) {
  // Skip prefetch & HEAD (Next.js may prefetch matched routes)
  if (request.headers.get('x-middleware-prefetch') === '1' || request.method === 'HEAD') {
    return NextResponse.next();
  }

  // if no session token is found, redirect to login page (with / as callback page)
  const sessionToken = getSessionToken(request);
  if (!sessionToken) {
    const loginUrl = new URL('/loginRequired', request.url);
    loginUrl.searchParams.set('callbackUrl', '/');
    return NextResponse.redirect(loginUrl);
  }

  // Ask NextAuth to confirm the session is valid (not expired)
  const sessionRes = await fetch(new URL('/api/auth/session', request.url), {
    headers: { Cookie: request.headers.get('cookie') ?? '' },
    cache: 'no-store',
  });

  if (sessionRes.ok) {
    const session = await sessionRes.json();
    if (session?.expires && new Date(session.expires) > new Date()) {
      return NextResponse.next();
    }
  }

  // redirect to login page (with / as callback page)
  const loginUrl = new URL('/loginRequired', request.url);
  loginUrl.searchParams.set('callbackUrl', '/'); // force home after login
  return NextResponse.redirect(loginUrl);
}

// these are the login protected routes / pages
export const config = {
  matcher: ['/jobs', '/newJob'],
};
