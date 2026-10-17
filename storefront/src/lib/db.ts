import { PrismaClient } from '@prisma/client'
import path from 'path'
import fs from 'fs'

// ضمان اتصال المتجر بنفس قاعدة البيانات المشتركة مع لوحة التحكم (admin-backend)
const resolveDatabaseUrl = () => {
  const candidates = [
    path.resolve(process.cwd(), '..', 'admin-backend', 'prisma', 'dev.db'),
    path.resolve(process.cwd(), 'admin-backend', 'prisma', 'dev.db'),
    path.resolve(process.cwd(), 'prisma', 'dev.db'),
  ]
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return `file:${candidate}`
    }
  }
  return process.env.DATABASE_URL
}

const activeDbUrl = resolveDatabaseUrl()

const prismaClientSingleton = (url?: string) => {
  return new PrismaClient(url ? { datasources: { db: { url } } } : undefined)
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
  var prismaUrl: undefined | string
}

// إعادة إنشاء الاتصال تلقائياً إذا تغير مسار قاعدة البيانات أثناء التطوير (Hot Reload)
if (globalThis.prisma && globalThis.prismaUrl !== activeDbUrl) {
  globalThis.prisma.$disconnect().catch(() => {})
  globalThis.prisma = undefined
}

export const db = globalThis.prisma ?? prismaClientSingleton(activeDbUrl)
export const prisma = db
export default db

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = db
  globalThis.prismaUrl = activeDbUrl
}
