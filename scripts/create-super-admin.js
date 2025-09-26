const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createSuperAdmin() {
  try {
    const email = 'engelsayedebaid@gmail.com'
    const password = 'Engelsayedebaid24112002'
    const name = 'المهندس السيد عبيد'

    // التحقق من وجود الحساب مسبقاً
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('المستخدم موجود بالفعل')
      return
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 12)

    // إنشاء المستخدم
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'ADMIN', // استخدام ADMIN بدلاً من SUPER_ADMIN
        isActive: true
      }
    })

    console.log('تم إنشاء حساب المدير العام بنجاح:')
    console.log({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    })

  } catch (error) {
    console.error('خطأ في إنشاء الحساب:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createSuperAdmin()
