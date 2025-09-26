const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testPassword() {
  try {
    console.log('🔐 اختبار كلمة المرور...')
    
    const email = 'engelsayedebaid@gmail.com'
    const password = 'Engelsayedebaid24112002'
    
    // الحصول على المستخدم
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      console.log('❌ المستخدم غير موجود')
      return
    }

    console.log('✅ تم العثور على المستخدم')
    console.log('📧 البريد:', user.email)
    console.log('👤 الاسم:', user.name)
    console.log('🔑 الدور:', user.role)
    console.log('✅ نشط:', user.isActive)
    
    // اختبار كلمة المرور
    console.log('\n🔐 اختبار كلمة المرور...')
    const isValidPassword = await bcrypt.compare(password, user.password)
    
    if (isValidPassword) {
      console.log('✅ كلمة المرور صحيحة!')
    } else {
      console.log('❌ كلمة المرور خاطئة!')
      
      // إعادة تعيين كلمة المرور
      console.log('🔄 إعادة تعيين كلمة المرور...')
      const hashedPassword = await bcrypt.hash(password, 12)
      
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
      })
      
      console.log('✅ تم إعادة تعيين كلمة المرور بنجاح!')
      
      // اختبار مرة أخرى
      const newTest = await bcrypt.compare(password, hashedPassword)
      console.log('🔐 اختبار كلمة المرور الجديدة:', newTest ? '✅ نجح' : '❌ فشل')
    }

  } catch (error) {
    console.error('❌ خطأ في اختبار كلمة المرور:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testPassword()
