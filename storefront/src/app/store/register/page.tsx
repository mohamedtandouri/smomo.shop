"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Store } from "lucide-react"

const registerSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يحتوي على حرفين على الأقل"),
  email: z.string().email("صيغة البريد الإلكتروني غير صحيحة"),
  password: z.string().min(6, "كلمة المرور يجب أن تتكون من 6 أحرف على الأقل"),
  phone: z.string().optional(),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormValues) => {
    setError(null)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
      
      const result = await res.json()
      
      if (!res.ok) {
        throw new Error(result.error || "حدث خطأ أثناء التسجيل")
      }
      
      // Auto-login after successful registration
      const signInRes = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      })

      if (signInRes?.error) {
        // If auto-login fails, redirect to login page
        router.push("/store/login?registered=true")
      } else {
        // Redirect to store and refresh state
        window.location.href = "/store"
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <div className="text-center flex flex-col items-center">
          <div className="w-12 h-12 bg-[#ff2d55]/10 text-[#ff2d55] rounded-full flex items-center justify-center mb-4">
            <Store className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">إنشاء حساب جديد</h2>
          <p className="mt-2 text-sm text-gray-600">
            أو{" "}
            <Link href="/store/login" className="font-medium text-[#ff2d55] hover:text-[#e6224c]">
              تسجيل الدخول إذا كان لديك حساب
            </Link>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm text-center border border-red-100">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)} dir="rtl">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
              <input
                {...register("name")}
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#ff2d55] focus:border-[#ff2d55] outline-none"
                placeholder="أحمد محمد"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

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
              <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف (اختياري)</label>
              <input
                {...register("phone")}
                type="tel"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#ff2d55] focus:border-[#ff2d55] outline-none text-left"
                dir="ltr"
                placeholder="+971 50 123 4567"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
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
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "إنشاء الحساب"}
          </button>
        </form>
      </div>
    </div>
  )
}
