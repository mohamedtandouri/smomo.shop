import { NextResponse } from "next/server"
import { db as prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { z } from "zod"

// Validation schema
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate input
    const validationResult = registerSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      )
    }

    const { name, email, password, phone } = validationResult.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "هذا البريد الإلكتروني مسجل مسبقاً" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user and profile
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: "USER", // Default role
        profile: {
          create: {} // Create an empty profile to be filled later
        }
      }
    })

    // Remove password from response for security
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      { message: "تم إنشاء الحساب بنجاح", user: userWithoutPassword },
      { status: 201 }
    )

  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء الحساب" },
      { status: 500 }
    )
  }
}
