const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUsers() {
  try {
    console.log('🔍 التحقق من المستخدمين في قاعدة البيانات...')
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    })

    console.log(`📊 عدد المستخدمين: ${users.length}`)
    
    if (users.length === 0) {
      console.log('⚠️  قاعدة البيانات فارغة - لا يوجد مستخدمين')
    } else {
      console.log('\n👥 قائمة المستخدمين:')
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. المستخدم:`)
        console.log(`   🆔 المعرف: ${user.id}`)
        console.log(`   📧 البريد: ${user.email}`)
        console.log(`   👤 الاسم: ${user.name}`)
        console.log(`   🔑 الدور: ${user.role}`)
        console.log(`   ✅ نشط: ${user.isActive}`)
        console.log(`   📅 تاريخ الإنشاء: ${user.createdAt}`)
      })
    }

    // التحقق من المستخدم المحدد
    const specificUser = await prisma.user.findUnique({
      where: { email: 'engelsayedebaid@gmail.com' }
    })

    if (specificUser) {
      console.log('\n✅ تم العثور على المستخدم المطلوب:')
      console.log(`   📧 البريد: ${specificUser.email}`)
      console.log(`   👤 الاسم: ${specificUser.name}`)
      console.log(`   🔑 الدور: ${specificUser.role}`)
      console.log(`   ✅ نشط: ${specificUser.isActive}`)
    } else {
      console.log('\n❌ لم يتم العثور على المستخدم المطلوب')
    }

  } catch (error) {
    console.error('❌ خطأ في التحقق من المستخدمين:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()
