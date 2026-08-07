import 'server-only';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import type { Role } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import type { SessionUser } from '@/types/next-auth';

export type StaffSessionUser = Extract<SessionUser, { kind: 'staff' }>;
export type SchoolSessionUser = Extract<SessionUser, { kind: 'school' }>;

export class UnauthorizedError extends Error {
  constructor(message = 'Not signed in') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'Not allowed') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

/** Roles that see every school's data rather than being scoped to one. */
export const ORG_WIDE_ROLES: Role[] = ['developer', 'admin', 'cp'];

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}

/** Throws UnauthorizedError / ForbiddenError — used inside API route handlers and server actions. */
export function requireRole(user: SessionUser | null, allowedRoles: Role[]): StaffSessionUser {
  if (!user) throw new UnauthorizedError();
  if (user.kind !== 'staff') throw new ForbiddenError('Staff session required');
  if (!allowedRoles.includes(user.role)) throw new ForbiddenError(`Role ${user.role} not permitted`);
  return user;
}

/**
 * Ensures a staff user may act on the given schoolId: developer/admin/cp reach every school,
 * teacher/student are confined to their own schoolId. Call after requireRole so the role is
 * already known to be one that has a meaningful schoolId scope (teacher/student), or any role
 * at all if org-wide roles should simply pass through.
 */
export function requireSchoolAccess(user: StaffSessionUser, schoolId: string): void {
  if (ORG_WIDE_ROLES.includes(user.role)) return;
  if (user.schoolId !== schoolId) {
    throw new ForbiddenError('Not scoped to this school');
  }
}

/** Ensures a public "Find your school" session may view the given schoolId. */
export function requireSchoolSession(user: SessionUser | null, schoolId: string): SchoolSessionUser {
  if (!user || user.kind !== 'school') throw new UnauthorizedError('School login required');
  if (user.schoolId !== schoolId) throw new ForbiddenError('Not scoped to this school');
  return user;
}

function errorToResponse(err: unknown): NextResponse {
  if (err instanceof UnauthorizedError) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
  if (err instanceof ForbiddenError) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
  throw err;
}

/**
 * Wraps an API route handler so requireRole/requireSchoolAccess/requireSchoolSession
 * failures inside it become the right HTTP status instead of an unhandled 500.
 */
export function apiHandler<Args extends unknown[]>(
  fn: (...args: Args) => Promise<NextResponse>,
) {
  return async (...args: Args): Promise<NextResponse> => {
    try {
      return await fn(...args);
    } catch (err) {
      try {
        return errorToResponse(err);
      } catch {
        console.error(err);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
      }
    }
  };
}

/** For Server Components/pages: redirects instead of throwing. */
export async function requireStaffPage(allowedRoles?: Role[]): Promise<StaffSessionUser> {
  const user = await getSessionUser();
  if (!user || user.kind !== 'staff') {
    redirect('/backoffice/login');
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    redirect('/backoffice');
  }
  return user;
}
