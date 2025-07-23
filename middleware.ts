import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const session = request.cookies.get('session');
  const user = request.cookies.get('user');

  if (user?.value) {
    response.headers.set('x-user', user.value);
  }

  return response;
}
