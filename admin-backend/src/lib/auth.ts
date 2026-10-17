import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./db"
import bcrypt from "bcryptjs"
import { checkRateLimit, recordFailedAttempt, recordSuccessfulLogin } from "./security"

if (!process.env.NEXTAUTH_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("CRITICAL SECURITY ERROR: NEXTAUTH_SECRET environment variable is missing!")
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("الرجاء إدخال البريد الإلكتروني وكلمة المرور")
        }

        const email = credentials.email.trim().toLowerCase()
        const rawForwarded = req?.headers?.["x-forwarded-for"] as string | undefined
        const clientIp = rawForwarded ? rawForwarded.split(",")[0].trim() : "127.0.0.1"

        // 1. فحص محاولات التخمين والحظر المسبق (Rate-Limiting Check)
        const rateLimit = await checkRateLimit(clientIp, email)
        if (!rateLimit.allowed) {
          throw new Error(rateLimit.message || "تم تقييد الوصول مؤقتاً بسبب تكرار المحاولات.")
        }

        let user
        try {
          user = await prisma.user.findUnique({
            where: { email }
          })
        } catch (dbErr: any) {
          console.error("NextAuth authorize database error:", dbErr)
          throw new Error("تعذر الاتصال بقاعدة البيانات. يرجى التأكد من تشغيل خادم PostgreSQL.")
        }

        if (!user) {
          const fail = await recordFailedAttempt(clientIp, email)
          throw new Error(fail.message || "بيانات الدخول غير صحيحة")
        }

        if (user.status === "SUSPENDED") {
          throw new Error("هذا الحساب موقوف من قبل الإدارة")
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          const fail = await recordFailedAttempt(clientIp, email)
          throw new Error(fail.message || "بيانات الدخول غير صحيحة")
        }

        // نجاح تسجيل الدخول -> إعادة تعيين محاولات الـ IP
        await recordSuccessfulLogin(clientIp, email)

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
        if (session.name) token.name = session.name
        if (session.email) token.email = session.email
        if (session.image !== undefined) token.picture = session.image
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        if (token.name) session.user.name = token.name as string
        if (token.email) session.user.email = token.email as string
        session.user.image = (token.picture as string | null) || null
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
  secret: process.env.NEXTAUTH_SECRET || "smomo_dev_fallback_secret_change_in_production",
}
