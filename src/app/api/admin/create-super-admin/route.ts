import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// إنشاء حساب المدير العام الخاص
export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    // التحقق من وجود الحساب مسبقاً
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'المستخدم موجود بالفعل' },
        { status: 400 }
      )
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 12)

    // إنشاء المستخدم
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'SUPER_ADMIN', // دور خاص للمدير العام
        isActive: true
      }
    })

    return NextResponse.json({
      message: 'تم إنشاء حساب المدير العام بنجاح',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })

  } catch (error) {
    console.error('Error creating super admin:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء الحساب' },
      { status: 500 }
    )
  }
}
