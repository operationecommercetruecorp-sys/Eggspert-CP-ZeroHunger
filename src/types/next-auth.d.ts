import type { Role } from '@prisma/client';
import type { DefaultSession } from 'next-auth';

export type SessionUser =
  | {
      kind: 'staff';
      id: string;
      role: Role;
      schoolId: string | null;
      nameTh: string;
      nameEn: string;
      isMainContact: boolean;
    }
  | {
      kind: 'school';
      id: string;
      schoolId: string;
      schoolName: string;
    };

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: SessionUser;
  }

  interface User {
    sessionUser: SessionUser;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    sessionUser?: SessionUser;
  }
}
