import { randomBytes } from "node:crypto";
import NextAuth, { getServerSession } from "next-auth/next";
import type { Session, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const allowedEmails = new Set(
  (process.env.ALLOWED_ISSUER_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
);

const isIssuerEmail = (email?: string | null) => {
  if (!email) return false;
  if (allowedEmails.size === 0) return true;
  return allowedEmails.has(email.toLowerCase());
};

const authSecret =
  process.env.JWT_SECRET?.trim() && process.env.JWT_SECRET.trim().length >= 32
    ? process.env.JWT_SECRET.trim()
    : randomBytes(32).toString("hex");

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({ user }: { user?: User | null }) {
      const email = (user as { email?: string | null } | null)?.email ?? null;
      return isIssuerEmail(email);
    },
    async session({ session }: { session: Session }) {
      if (session.user) {
        (session.user as Session["user"] & { isIssuer?: boolean }).isIssuer =
          isIssuerEmail(session.user.email ?? null);
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: authSecret,
};

const handler = NextAuth(authOptions as any);

type IssuerSession = Session & {
  user?: Session["user"] & { isIssuer?: boolean };
};

export async function requireIssuerSession(): Promise<IssuerSession | null> {
  const session = (await getServerSession(authOptions as any)) as IssuerSession | null;
  if (!session?.user?.isIssuer) {
    return null;
  }
  return session;
}

export { handler as authHandler, isIssuerEmail };

