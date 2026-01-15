import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "demo@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Check demo account
        if (
          credentials?.email === "demo@example.com" &&
          credentials?.password === "password123"
        ) {
          return {
            id: "1",
            name: "Demo User",
            email: "demo@example.com",
            role: "admin"
          };
        }
        
        // Check registered users from database
        try {
          const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password
            }),
          });

          const data = await response.json();

          if (data.success && data.user) {
            return {
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              role: data.user.role,
              isVerified: data.user.isVerified,
              verificationStatus: data.user.verificationStatus
            };
          }
        } catch (error) {
          console.error("Auth error:", error);
        }
        
        // Return null if user data could not be retrieved
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isVerified = user.isVerified;
        token.verificationStatus = user.verificationStatus;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.isVerified = token.isVerified;
        session.user.verificationStatus = token.verificationStatus;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
