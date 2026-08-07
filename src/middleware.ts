import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Coarse gate: any signed-in staff session may pass; fine-grained role checks
// happen in requireStaffPage()/requireRole() in the actual page/route, since
// those need per-screen role lists this middleware doesn't know about.
export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isStaff = token?.sessionUser?.kind === 'staff';

  if (!isStaff) {
    const loginUrl = new URL('/backoffice/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/backoffice/((?!login).*)'],
};
