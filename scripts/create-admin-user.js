const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    console.log('🔄 بدء إنشاء حساب المدير العام...')
    
    const email = 'engelsayedebaid@gmail.com'
    const password = 'Engelsayedebaid24112002'
    const name = 'المهندس السيد عبيد'

    // التحقق من وجود الحساب مسبقاً
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('✅ المستخدم موجود بالفعل')
      console.log('📧 البريد الإلكتروني:', existingUser.email)
      console.log('👤 الاسم:', existingUser.name)
      console.log('🔑 الدور:', existingUser.role)
      console.log('✅ نشط:', existingUser.isActive)
      
      // تحديث كلمة المرور إذا كان المستخدم موجود
      const hashedPassword = await bcrypt.hash(password, 12)
      await prisma.user.update({
        where: { email },
        data: { 
          password: hashedPassword,
          isActive: true 
        }
      })
      console.log('🔄 تم تحديث كلمة المرور بنجاح')
      return
    }

    // تشفير كلمة المرور
    console.log('🔐 تشفير كلمة المرور...')
    const hashedPassword = await bcrypt.hash(password, 12)

    // إنشاء المستخدم
    console.log('👤 إنشاء المستخدم...')
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'ADMIN',
        isActive: true
      }
    })

    console.log('✅ تم إنشاء حساب المدير العام بنجاح!')
    console.log('📧 البريد الإلكتروني:', user.email)
    console.log('👤 الاسم:', user.name)
    console.log('🔑 الدور:', user.role)
    console.log('🆔 المعرف:', user.id)
    
    console.log('\n🔑 بيانات تسجيل الدخول:')
    console.log('البريد الإلكتروني: engelsayedebaid@gmail.com')
    console.log('كلمة المرور: Engelsayedebaid24112002')

  } catch (error) {
    console.error('❌ خطأ في إنشاء الحساب:', error.message)
    console.error('تفاصيل الخطأ:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()
