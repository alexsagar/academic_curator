import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { getOptionalEnv } from "@/lib/env";

const googleClientId = getOptionalEnv("GOOGLE_CLIENT_ID");
const googleClientSecret = getOptionalEnv("GOOGLE_CLIENT_SECRET");

const providers = [];

if (googleClientId && googleClientSecret) {
  providers.push(
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    })
  );
}

providers.push(
  Credentials({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      const user = await prisma.user.findUnique({
        where: { email: String(credentials.email).trim().toLowerCase() },
      });

      if (!user || !user.password) {
        return null;
      }

      const isValid = await bcrypt.compare(
        credentials.password as string,
        user.password
      );

      if (!isValid || !user.isActive) {
        return null;
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      };
    },
  })
);

export const { handlers, signIn, signOut, auth: rawAuth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      const userId =
        (typeof user?.id === "string" && user.id) ||
        (typeof token.id === "string" && token.id) ||
        (typeof token.sub === "string" && token.sub) ||
        null;

      const email =
        (typeof user?.email === "string" && user.email.trim().toLowerCase()) ||
        (typeof token.email === "string" && token.email.trim().toLowerCase()) ||
        null;

      if (!userId && !email) {
        token.id = undefined;
        token.role = undefined;
        token.isActive = false;
        return token;
      }

      const dbUser = await prisma.user.findFirst({
        where: userId ? { id: userId } : { email: email ?? undefined },
        select: { id: true, email: true, role: true, isActive: true },
      });

      if (!dbUser) {
        token.id = undefined;
        token.role = undefined;
        token.isActive = false;
        return token;
      }

      token.sub = dbUser.id;
      token.id = dbUser.id;
      token.email = dbUser.email;
      token.role = dbUser.role;
      token.isActive = dbUser.isActive;

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.id === "string" ? token.id : "";
        session.user.role = typeof token.role === "string" ? token.role : "USER";
        session.user.isActive = token.isActive === true;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    newUser: "/signup",
  },
});

export const auth = rawAuth;

export async function getActiveSession() {
  const session = await rawAuth();

  if (!session?.user?.id || session.user.isActive !== true) {
    return null;
  }

  return session;
}

export async function getAdminSession() {
  const session = await getActiveSession();

  if (!session || session.user.role !== "ADMIN") {
    return null;
  }

  return session;
}
