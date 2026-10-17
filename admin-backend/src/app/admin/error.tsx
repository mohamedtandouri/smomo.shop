"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, RefreshCw, Home, Copy, Check, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [copied, setCopied] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    console.error("Admin Layout Caught Error:", error)
  }, [error])

  const copyDiagnostics = () => {
    const report = `Admin Error Report:\nError: ${error?.message || "Unknown error"}\nDigest: ${error?.digest || "N/A"}\nStack: ${error?.stack || "N/A"}`
    navigator.clipboard.writeText(report)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
      <div className="max-w-xl w-full text-center space-y-6 bg-card border border-border rounded-3xl p-8 sm:p-12 shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-2 shadow-xs">
          <AlertTriangle className="h-8 w-8" />
        </div>
        
        <div className="space-y-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-destructive/15 text-destructive">
            Admin Error 500
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            حدث خطأ أثناء تحميل لوحة التحكم
          </h2>
          <p className="max-w-md mx-auto text-sm text-muted-foreground leading-relaxed">
            واجه النظام خطأً غير متوقع أثناء معالجة بيانات هذه الصفحة الإدارية. يمكنك إعادة المحاولة بأمان.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button 
            onClick={() => reset()} 
            className="gap-2 shadow-xs"
          >
            <RefreshCw className="h-4 w-4" />
            <span>إعادة المحاولة (Try Again)</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => { window.location.href = "/admin" }} 
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            <span>الرئيسية (Dashboard)</span>
          </Button>
        </div>

        {/* Technical Diagnostics */}
        <div className="pt-4 border-t border-border text-left">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center justify-between w-full text-xs text-muted-foreground hover:text-foreground font-medium py-1 transition-colors cursor-pointer"
          >
            <span>تفاصيل الخطأ الفني للمطور (Developer Diagnostics)</span>
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showDetails && (
            <div className="mt-3 p-3.5 rounded-xl bg-muted/60 border border-border font-mono text-xs text-muted-foreground space-y-2 overflow-x-auto text-left">
              {error?.digest && (
                <div>
                  <span className="font-semibold text-foreground">Digest: </span>
                  {error.digest}
                </div>
              )}
              <div className="break-all whitespace-pre-wrap">
                <span className="font-semibold text-foreground">Error: </span>
                {error?.message || "Unknown error occurred in admin module"}
              </div>

              <div className="pt-2 flex justify-end">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={copyDiagnostics}
                  className="h-7 px-2.5 text-xs gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "تم النسخ" : "نسخ بيانات الخطأ"}</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
