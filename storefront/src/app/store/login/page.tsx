"use client"

import { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Store } from "lucide-react"

const loginSchema = z.object({
  email: z.string().email("صيغة البريد الإلكتروني غير صحيحة"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
})

type LoginFormValues = z.infer<typeof loginSchema>

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/store"
  const registered = searchParams.get("registered")
  
  const [error, setError] = useState<string | null>(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    setError(null)
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      })

      if (res?.error) {
        setError(res.error)
      } else {
        window.location.href = callbackUrl
      }
    } catch (err: any) {
      setError("حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.")
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <div className="text-center flex flex-col items-center">
          <div className="w-12 h-12 bg-[#ff2d55]/10 text-[#ff2d55] rounded-full flex items-center justify-center mb-4">
            <Store className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">تسجيل الدخول</h2>
          <p className="mt-2 text-sm text-gray-600">
            أو{" "}
            <Link href="/store/register" className="font-medium text-[#ff2d55] hover:text-[#e6224c]">
              إنشاء حساب جديد
            </Link>
          </p>
        </div>

        {registered && (
          <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm text-center border border-green-100">
            تم إنشاء حسابك بنجاح! يمكنك الآن تسجيل الدخول.
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm text-center border border-red-100">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)} dir="rtl">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
              <input
                {...register("email")}
                type="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#ff2d55] focus:border-[#ff2d55] outline-none text-left"
                dir="ltr"
                placeholder="ahmad@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
              <input
                {...register("password")}
                type="password"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#ff2d55] focus:border-[#ff2d55] outline-none text-left"
                dir="ltr"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#ff2d55] hover:bg-[#e6224c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff2d55] disabled:opacity-70 transition-colors"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "دخول"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#ff2d55]" /></div>}>
      <LoginForm />
    </Suspense>
  )
}
