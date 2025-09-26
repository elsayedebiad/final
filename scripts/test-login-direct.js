const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const prisma = new PrismaClient()

async function testLoginDirect() {
  try {
    console.log('🔐 اختبار تسجيل الدخول المباشر...')
    
    const email = 'engelsayedebaid@gmail.com'
    const password = 'Engelsayedebaid24112002'
    
    console.log('📧 البريد الإلكتروني:', email)
    console.log('🔑 كلمة المرور:', password)
    
    // محاكاة نفس منطق AuthService.login
    console.log('\n🔍 البحث عن المستخدم...')
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      console.log('❌ المستخدم غير موجود')
      return
    }

    console.log('✅ تم العثور على المستخدم')
    console.log('👤 الاسم:', user.name)
    console.log('🔑 الدور:', user.role)
    console.log('✅ نشط:', user.isActive)

    if (!user.isActive) {
      console.log('❌ الحساب معطل')
      return
    }

    console.log('\n🔐 التحقق من كلمة المرور...')
    const isValidPassword = await bcrypt.compare(password, user.password)
    
    if (!isValidPassword) {
      console.log('❌ كلمة المرور خاطئة')
      return
    }

    console.log('✅ كلمة المرور صحيحة')

    console.log('\n🎫 إنشاء JWT Token...')
    const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production-2024'
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    console.log('✅ تم إنشاء Token بنجاح')
    console.log('🎫 Token:', token.substring(0, 50) + '...')

    console.log('\n📝 إنشاء Session...')
    const userIdAsNumber = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;

    if (isNaN(userIdAsNumber)) {
      console.log('❌ معرف المستخدم غير صالح')
      return
    }

    const session = await prisma.session.create({
      data: {
        userId: userIdAsNumber,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      }
    })

    console.log('✅ تم إنشاء Session بنجاح')
    console.log('🆔 Session ID:', session.id)

    console.log('\n🎉 تسجيل الدخول نجح بالكامل!')
    console.log('✅ جميع الخطوات تمت بنجاح')

  } catch (error) {
    console.error('❌ خطأ في تسجيل الدخول:', error.message)
    console.error('📋 تفاصيل الخطأ:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testLoginDirect()
