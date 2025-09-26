const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const db = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'file:./dev.db'
    }
  }
})

async function hashPassword(password) {
  return bcrypt.hash(password, 12)
}

async function seed() {
  try {
    console.log('🌱 Starting database seed...')

    // Check if admin already exists
    const existingAdmin = await db.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (existingAdmin) {
      console.log('✅ Admin user already exists')
      return
    }

    // Create default admin user
    const adminPassword = await hashPassword('admin123')
    const adminUser = await db.user.create({
      data: {
        email: 'admin@cvmanagement.com',
        password: adminPassword,
        name: 'المدير العام',
        role: 'ADMIN',
      }
    })

    console.log('✅ Created admin user:', adminUser.email)

    // Create a sub-admin user
    const subAdminPassword = await hashPassword('subadmin123')
    const subAdminUser = await db.user.create({
      data: {
        email: 'subadmin@cvmanagement.com',
        password: subAdminPassword,
        name: 'مدير فرعي',
        role: 'SUB_ADMIN',
      }
    })

    console.log('✅ Created sub-admin user:', subAdminUser.email)

    // Create a regular user
    const userPassword = await hashPassword('user123')
    const regularUser = await db.user.create({
      data: {
        email: 'user@cvmanagement.com',
        password: userPassword,
        name: 'مستخدم عادي',
        role: 'USER',
      }
    })

    console.log('✅ Created regular user:', regularUser.email)

    console.log('🎉 Database seeded successfully!')
    console.log('\n📋 Login credentials:')
    console.log('Admin: admin@cvmanagement.com / admin123')
    console.log('Sub-Admin: subadmin@cvmanagement.com / subadmin123')
    console.log('User: user@cvmanagement.com / user123')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

seed()
