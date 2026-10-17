import { prisma } from "./db"

// مدة التبريد بالدقائق (Cool-down)
const COOLDOWN_DURATION_MS = 5 * 60 * 1000 // 5 minutes
// الحد الأقصى للمحاولات المتتالية قبل التبريد (القاعدة الأولى)
const MAX_CONSECUTIVE_ATTEMPTS = 3
// الحد الأقصى للمحاولات الفاشلة الإجمالية قبل الحظر التام (القاعدة الثانية)
const MAX_TOTAL_FAILURES_BEFORE_BAN = 5

interface MemoryAttemptState {
  consecutiveFailures: number
  totalFailures: number
  lastAttemptTime: number
  coolDownUntil: number | null
}

// ذاكرة كاش محلية سريعة جداً للميكرو-ثانية (In-Memory Micro Cache)
const memoryCache = new Map<string, MemoryAttemptState>()

export interface RateLimitCheckResult {
  allowed: boolean
  isBlocked: boolean
  isCoolingDown: boolean
  remainingSeconds: number
  message?: string
}

/**
 * دالة استخراج وتنسيق عنوان الـ IP من الطلب
 */
export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for")
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim()
  }
  const realIp = headers.get("x-real-ip")
  if (realIp) {
    return realIp.trim()
  }
  return "127.0.0.1"
}

/**
 * فحص حالة الـ IP قبل إتاحة تقديم طلب تسجيل الدخول
 */
export async function checkRateLimit(ipAddress: string, email?: string): Promise<RateLimitCheckResult> {
  const now = Date.now()

  // 1. التحقق من الحظر الدائم في قاعدة البيانات
  try {
    const blockedRecord = await prisma.blockedTarget.findUnique({
      where: { ipAddress },
    })

    if (blockedRecord) {
      if (blockedRecord.isPermanent || !blockedRecord.blockedUntil || blockedRecord.blockedUntil.getTime() > now) {
        return {
          allowed: false,
          isBlocked: true,
          isCoolingDown: false,
          remainingSeconds: -1,
          message: "تم حظر هذا الجهاز تماماً لمحاولات دخول متكررة مشبوهة. تم قفل الوصول لأسباب أمنية.",
        }
      } else {
        // انتهت فترة الحظر المؤقت
        await prisma.blockedTarget.delete({ where: { ipAddress } }).catch(() => {})
      }
    }
  } catch (error: any) {
    // في حال عدم إمكانية الوصول لقاعدة البيانات، نعتمد على الفحص السريع بالذاكرة دون إسقاط التطبيق
    console.warn(`[Security] Database unreachable during rate limit check for ${ipAddress}:`, error?.message || error)
  }

  // 2. التحقق من حالة الذاكرة السريعة (In-Memory)
  const cached = memoryCache.get(ipAddress)
  if (cached) {
    if (cached.coolDownUntil && cached.coolDownUntil > now) {
      const remainingSeconds = Math.ceil((cached.coolDownUntil - now) / 1000)
      return {
        allowed: false,
        isBlocked: false,
        isCoolingDown: true,
        remainingSeconds,
        message: `لقد استنفدت محاولات الدخول المتاحة (${MAX_CONSECUTIVE_ATTEMPTS} محاولات). يرجى الانتظار ${Math.ceil(remainingSeconds / 60)} دقيقة للمحاولة مجدداً.`,
      }
    }

    // إذا انتهت فترة التبريد، يتم إعادة تعيين المحاولات المتتالية مع الاحتفاظ بمجموع الإخفاقات
    if (cached.coolDownUntil && cached.coolDownUntil <= now) {
      cached.coolDownUntil = null
      cached.consecutiveFailures = 0
    }
  }

  return {
    allowed: true,
    isBlocked: false,
    isCoolingDown: false,
    remainingSeconds: 0,
  }
}

/**
 * تسجيل محاولة فاشلة وتطبيق سياسات الأمان (Cool-down أو Block)
 */
export async function recordFailedAttempt(
  ipAddress: string,
  email: string,
  userAgent?: string
): Promise<RateLimitCheckResult> {
  const now = Date.now()

  // تحديث الذاكرة السريعة
  let state = memoryCache.get(ipAddress)
  if (!state) {
    state = {
      consecutiveFailures: 0,
      totalFailures: 0,
      lastAttemptTime: now,
      coolDownUntil: null,
    }
    memoryCache.set(ipAddress, state)
  }

  state.consecutiveFailures += 1
  state.totalFailures += 1
  state.lastAttemptTime = now

  // تسجيل المحاولة في قاعدة البيانات
  await prisma.loginAttempt.create({
    data: {
      ipAddress,
      email: email || "unknown",
      success: false,
    },
  }).catch((e) => console.error("Error saving login attempt:", e))

  // القاعدة الثانية: إذا تجاوز إجمالي المحاولات الفاشلة الحد الأقصى -> حظر تام للجهاز
  if (state.totalFailures >= MAX_TOTAL_FAILURES_BEFORE_BAN) {
    await prisma.blockedTarget.upsert({
      where: { ipAddress },
      update: {
        reason: "Repeated failed login attempts across sessions (Brute force defense)",
        isPermanent: true,
      },
      create: {
        ipAddress,
        reason: "Repeated failed login attempts across sessions (Brute force defense)",
        isPermanent: true,
      },
    }).catch((e) => console.error("Error creating blocked target:", e))

    // تسجيل الحدث الأمني الحرج
    await prisma.securityLog.create({
      data: {
        eventType: "IP_BLOCKED",
        severity: "CRITICAL",
        ipAddress,
        email,
        details: `IP permanently banned after ${state.totalFailures} total failed login attempts. User-Agent: ${userAgent || "N/A"}`,
      },
    }).catch((e) => console.error("Error creating security log:", e))

    return {
      allowed: false,
      isBlocked: true,
      isCoolingDown: false,
      remainingSeconds: -1,
      message: "تم حظر هذا الجهاز نهائياً لمحاولات دخول متكررة غير مصرح بها. تم تدوين هذه المحاولة في سجلات الأمان.",
    }
  }

  // القاعدة الأولى: 3 محاولات متتالية -> مهلة تبريد 5 دقائق (Cool-down)
  if (state.consecutiveFailures >= MAX_CONSECUTIVE_ATTEMPTS) {
    state.coolDownUntil = now + COOLDOWN_DURATION_MS
    const remainingSeconds = 300 // 5 minutes

    // تسجيل الحدث الأمني
    await prisma.securityLog.create({
      data: {
        eventType: "COOLDOWN_APPLIED",
        severity: "WARNING",
        ipAddress,
        email,
        details: `Account temporarily locked for 5 minutes after 3 consecutive failed attempts.`,
      },
    }).catch((e) => console.error("Error creating security log:", e))

    return {
      allowed: false,
      isBlocked: false,
      isCoolingDown: true,
      remainingSeconds,
      message: `لقد استنفدت محاولات الدخول المتاحة (${MAX_CONSECUTIVE_ATTEMPTS} محاولات). يرجى الانتظار 5 دقائق قبل إعادة المحاولة.`,
    }
  }

  // تسجيل محاولة فاشلة عادية
  await prisma.securityLog.create({
    data: {
      eventType: "LOGIN_FAILED",
      severity: "INFO",
      ipAddress,
      email,
      details: `Failed attempt ${state.consecutiveFailures} of ${MAX_CONSECUTIVE_ATTEMPTS}`,
    },
  }).catch((e) => console.error("Error creating security log:", e))

  const attemptsLeft = MAX_CONSECUTIVE_ATTEMPTS - state.consecutiveFailures
  return {
    allowed: true,
    isBlocked: false,
    isCoolingDown: false,
    remainingSeconds: 0,
    message: `بيانات الدخول غير صحيحة. يتبقى لك ${attemptsLeft} محاولة قبل إيقاف الحساب مؤقتاً.`,
  }
}

/**
 * تسجيل نجاح الدخول وإعادة تعيين العدادات
 */
export async function recordSuccessfulLogin(
  ipAddress: string,
  email: string,
  userAgent?: string
): Promise<void> {
  // إعادة تعيين محاولات الـ IP
  memoryCache.delete(ipAddress)

  await prisma.loginAttempt.create({
    data: {
      ipAddress,
      email,
      success: true,
    },
  }).catch((e) => console.error("Error saving successful attempt:", e))

  await prisma.securityLog.create({
    data: {
      eventType: "LOGIN_SUCCESS",
      severity: "INFO",
      ipAddress,
      email,
      details: `Admin logged in successfully. User-Agent: ${userAgent || "N/A"}`,
    },
  }).catch((e) => console.error("Error saving security log:", e))
}
