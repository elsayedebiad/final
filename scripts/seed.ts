import { PrismaClient, Role } from '@prisma/client'
import { AuthService } from '../src/lib/auth'

const db = new PrismaClient()

async function seed() {
  try {
    console.log('🌱 Starting database seed...')

    // Delete all existing users
    await db.user.deleteMany({})
    console.log('🗑️ Deleted all existing users.')

    // Create default admin user
    const adminUser = await AuthService.register(
      'admin@cvmanagement.com',
      'admin123',
      'المدير العام',
      Role.ADMIN
    )

    console.log('✅ Created admin user:', adminUser.email)

    // Create a sub-admin user
    const subAdminUser = await AuthService.register(
      'subadmin@cvmanagement.com',
      'subadmin123',
      'مدير فرعي',
      Role.SUB_ADMIN
    )

    console.log('✅ Created sub-admin user:', subAdminUser.email)

    // Create a regular user
    const regularUser = await AuthService.register(
      'user@cvmanagement.com',
      'user123',
      'مستخدم عادي',
      Role.USER
    )

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
