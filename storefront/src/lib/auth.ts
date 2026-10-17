import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./db"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("الرجاء إدخال البريد الإلكتروني وكلمة المرور")
        }

        const email = credentials.email.trim().toLowerCase()

        const user = await prisma.user.findUnique({
          where: { email }
        })

        if (!user) {
          throw new Error("بيانات الدخول غير صحيحة")
        }

        if (user.status === "SUSPENDED") {
          throw new Error("هذا الحساب موقوف من قبل الإدارة")
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error("بيانات الدخول غير صحيحة")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.imageUrl,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.picture = user.image || null
      }
      if (trigger === "update" && session) {
        token.name = session.name || token.name
        token.picture = session.image || token.picture
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        if (token.picture) {
          session.user.image = token.picture as string
        }
      }
      return session
    }
  },
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "smomo_secret_key_2026",
}
