import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

export const db = globalThis.prisma ?? prismaClientSingleton()
export const prisma = db
export default db

if (process.env.NODE_ENV !== 'production') globalThis.prisma = db

