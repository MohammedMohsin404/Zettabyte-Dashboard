import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      authorization: { params: { prompt: "consent", access_type: "offline", response_type: "code" } },
    }),
  ],
  // optional: set pages, callbacks, etc.
});

export const GET = handlers.GET;
export const POST = handlers.POST;
