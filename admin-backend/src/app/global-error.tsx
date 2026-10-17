"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, RefreshCw, Home, Copy, Check } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    console.error("Critical Global Root Crash:", error)
  }, [error])

  const copyDiagnostic = () => {
    const text = `Critical Root Crash:\n${error?.message || "Unknown error"}\nDigest: ${error?.digest || "N/A"}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 font-sans antialiased">
        <div className="max-w-md w-full bg-slate-800/90 rounded-3xl p-8 shadow-2xl border border-slate-700 text-center space-y-6 backdrop-blur-md">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/20 shadow-lg">
            <AlertTriangle className="h-10 w-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              حدث خطأ فادح في بنية النظام
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              واجه الخادم مشكلة غير متوقعة أثناء معالجة القالب الجذري للموقع. يمكنك إعادة المحاولة فورياً.
            </p>
          </div>

          {error?.message && (
            <div className="p-3 bg-slate-950/70 border border-slate-850 rounded-xl text-xs font-mono text-slate-400 text-left break-all">
              {error.message}
            </div>
          )}

          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md active:scale-98 cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              <span>إعادة المحاولة · Try Again</span>
            </button>

            <button
              onClick={() => { window.location.href = "/" }}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-semibold transition-all border border-slate-600 cursor-pointer"
            >
              <Home className="h-4 w-4" />
              <span>الصفحة الرئيسية · Homepage</span>
            </button>

            <button
              onClick={copyDiagnostic}
              className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center justify-center gap-1.5 pt-2 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "تم نسخ التقرير" : "نسخ بيانات الخطأ للتشخيص"}</span>
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
