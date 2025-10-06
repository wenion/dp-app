import type { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const config: NextAuthConfig = {
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid email profile",
          access_type: "offline",
          prompt: "consent",           // needed to (re)issue refresh_token
          response_type: "code"
        }
      }
    }),
    // ...add more providers here
  ],

  pages: {
    signIn: "/signin",      // where to send users when they need to log in
    signOut: "/signout",    // where to send after logging out
    // error: "/error",        // shown when there's an auth error (e.g. OAuth failed)
    // verifyRequest: "/verify", // used for email sign-in flows (magic links)
    // newUser: "/welcome",    // first login only — onboarding page
  },

  // Option B: Redirect users after login/logout
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Always redirect to dashboard after login
      return "/";
    },
  },
}

export default config;
