"use client"

import { useEffect, useState } from "react"
import { AlertCircle, RefreshCw, Home, Copy, Check, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [copied, setCopied] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    // Log unexpected root errors for monitoring
    console.error("Root Application Error:", error)
  }, [error])

  const copyErrorDetails = () => {
    const info = `Error: ${error?.message || "Unknown error"}\nDigest: ${error?.digest || "N/A"}\nStack: ${error?.stack || "N/A"}`
    navigator.clipboard.writeText(info)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-xl text-center space-y-6 bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-xl">
        {/* Error Icon */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center shadow-inner">
          <AlertCircle className="w-10 h-10" />
        </div>

        {/* Headings */}
        <div className="space-y-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-destructive/15 text-destructive">
            Error 500 · خلل في المعالجة
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            حدث خطأ غير متوقع في النظام
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            واجه التطبيق مشكلة تقنية أثناء معالجة طلبك. بياناتك وسلتك في أمان تام.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button 
            onClick={() => reset()} 
            size="lg" 
            className="gap-2 shadow-md"
          >
            <RefreshCw className="w-4 h-4" />
            <span>إعادة المحاولة · Try Again</span>
          </Button>

          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => { window.location.href = "/" }}
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            <span>الصفحة الرئيسية · Home</span>
          </Button>
        </div>

        {/* Technical Details Toggle */}
        <div className="pt-4 border-t border-border/60 text-left">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center justify-between w-full text-xs text-muted-foreground hover:text-foreground font-medium py-1 transition-colors"
          >
            <span>تفاصيل الخطأ الفني (Technical Diagnostic)</span>
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showDetails && (
            <div className="mt-3 p-3.5 rounded-xl bg-muted/60 border border-border font-mono text-xs text-muted-foreground space-y-2 overflow-x-auto">
              {error?.digest && (
                <div className="text-[11px] text-muted-foreground/80">
                  <span className="font-semibold text-foreground">Digest: </span>
                  {error.digest}
                </div>
              )}
              <div className="break-all whitespace-pre-wrap">
                <span className="font-semibold text-foreground">Message: </span>
                {error?.message || "No specific error message provided."}
              </div>

              <div className="pt-2 flex justify-end">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={copyErrorDetails}
                  className="h-7 px-2.5 text-xs gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "تم النسخ" : "نسخ تقرير الخطأ"}</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
