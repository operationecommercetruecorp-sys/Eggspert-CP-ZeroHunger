import type { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import type { SessionUser } from '@/types/next-auth';

export const authOptions: AuthOptions = {
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/backoffice/login',
  },
  providers: [
    CredentialsProvider({
      id: 'staff-credentials',
      name: 'Staff login',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        const sessionUser: SessionUser = {
          kind: 'staff',
          id: user.id,
          role: user.role,
          schoolId: user.schoolId,
          nameTh: user.nameTh,
          nameEn: user.nameEn,
          isMainContact: user.isMainContact,
        };
        return { id: user.id, sessionUser };
      },
    }),
    CredentialsProvider({
      id: 'school-credentials',
      name: 'School login',
      credentials: {
        code: { label: 'School code', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.code || !credentials.password) return null;

        const school = await prisma.school.findUnique({
          where: { code: credentials.code.trim() },
        });
        if (!school) return null;

        const valid = await bcrypt.compare(credentials.password, school.passwordHash);
        if (!valid) return null;

        const sessionUser: SessionUser = {
          kind: 'school',
          id: school.id,
          schoolId: school.id,
          schoolName: school.name,
        };
        return { id: school.id, sessionUser };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sessionUser = (user as { sessionUser: SessionUser }).sessionUser;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sessionUser) {
        session.user = token.sessionUser;
      }
      return session;
    },
  },
};
