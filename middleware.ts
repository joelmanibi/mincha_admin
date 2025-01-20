import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROUTES } from '@/lib/constants/routes';


export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('micha_auth_token')?.value;
  const isAuthPage = request.nextUrl.pathname === ROUTES.AUTH;


  if (!authToken && !isAuthPage) {
    return NextResponse.redirect(new URL(ROUTES.AUTH, request.url));
  }

  if (authToken && isAuthPage) {
    return NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

