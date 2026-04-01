import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"

const clientId = process.env.GITHUB_CLIENT_ID
const clientSecret = process.env.GITHUB_CLIENT_SECRET

if (!clientId || !clientSecret) {
  throw new Error(
    "Missing required environment variables: GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET must be set."
  )
}

const handler = NextAuth({
  providers: [
    GithubProvider({ clientId, clientSecret }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.sub;
      }
      return session;
    },
  },
})

export { handler as GET, handler as POST }