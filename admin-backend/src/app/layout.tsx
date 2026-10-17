import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import AuthProvider from "@/components/session-provider"
import { LocaleProvider } from "@/components/providers/LocaleProvider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Smomo Shop",
  description: "Advanced e-commerce store",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className="h-full">
      <body className={`${inter.className} min-h-screen bg-background antialiased flex flex-col`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <LocaleProvider>
              {children}
              <Toaster />
            </LocaleProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
