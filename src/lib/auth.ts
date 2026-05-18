import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    // LINE Login provider
    {
      id: "line",
      name: "LINE",
      type: "oauth",
      authorization: {
        url: "https://access.line.me/oauth2/v2.1/authorize",
        params: { scope: "profile openid email", bot_prompt: "normal" },
      },
      token: "https://api.line.me/oauth2/v2.1/token",
      userinfo: "https://api.line.me/v2/profile",
      clientId: process.env.LINE_CHANNEL_ID,
      clientSecret: process.env.LINE_CHANNEL_SECRET,
      profile(profile) {
        return {
          id: profile.userId,
          name: profile.displayName,
          image: profile.pictureUrl,
          email: null,
        };
      },
    },
    // Credentials provider for simple login
    CredentialsProvider({
      name: "Phone",
      credentials: {
        phone: { label: "Phone", type: "text", placeholder: "0812345678" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.name) return null;

        let user = await prisma.user.findFirst({
          where: { phone: credentials.phone },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              name: credentials.name,
              phone: credentials.phone,
              role: "MEMBER",
            },
          });
        }

        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "line") {
        const existingUser = await prisma.user.findUnique({
          where: { lineId: user.id },
        });
        if (!existingUser) {
          await prisma.user.create({
            data: {
              lineId: user.id,
              name: user.name || "LINE User",
              avatarUrl: user.image,
              role: "MEMBER",
            },
          });
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        const dbUser = await prisma.user.findFirst({
          where: {
            OR: [{ id: token.sub }, { lineId: token.sub }],
          },
        });
        if (dbUser) {
          (session.user as { id: string; role: string }).id = dbUser.id;
          (session.user as { id: string; role: string }).role = dbUser.role;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
};
