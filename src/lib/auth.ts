import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { compare } from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        // Use casting to bypass adapter-user type shadowing that might hide 'password'
        const dbUser = user as any;
        if (!dbUser || !dbUser.password) return null;

        const isPasswordValid = await compare(
          credentials.password as string,
          dbUser.password
        );

        if (!isPasswordValid) return null;

        return {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user && user.id) {
        // Ensure user has a profile even if signed up via credentials
        const existing = await prisma.gamificationProfile.findUnique({
          where: { userId: user.id },
        });
        if (!existing) {
          await prisma.gamificationProfile.create({
            data: { userId: user.id as string },
          }).catch(() => {/* handle silent failure if race condition still exists */ });
        }

        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        });
        token.role = dbUser?.role ?? "USER";
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (user.id) {
        await prisma.gamificationProfile.create({
          data: { userId: user.id as string },
        }).catch(err => console.error("Event Profile creation error:", err));
      }
    }
  }
});
