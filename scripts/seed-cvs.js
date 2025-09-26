const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

// بيانات تجريبية للسير الذاتية
const sampleCVs = [
  {
    fullName: 'فاطمة أحمد محمد',
    fullNameArabic: 'فاطمة أحمد محمد',
    email: 'fatima.ahmed@email.com',
    phone: '+201234567890',
    referenceCode: 'FA001',
    monthlySalary: '2500',
    contractPeriod: '24 شهر',
    position: 'مربية أطفال',
    passportNumber: 'A12345678',
    passportIssueDate: '2020-01-15',
    passportExpiryDate: '2030-01-15',
    passportIssuePlace: 'القاهرة',
    nationality: 'مصرية',
    religion: 'مسلمة',
    dateOfBirth: '1990-05-20',
    placeOfBirth: 'القاهرة',
    livingTown: 'الجيزة',
    maritalStatus: 'MARRIED',
    numberOfChildren: 2,
    weight: '65 كيلو',
    height: '165 سم',
    complexion: 'سمراء',
    age: 34,
    englishLevel: 'YES',
    arabicLevel: 'YES',
    babySitting: 'YES',
    childrenCare: 'YES',
    tutoring: 'WILLING',
    disabledCare: 'NO',
    cleaning: 'YES',
    washing: 'YES',
    ironing: 'YES',
    arabicCooking: 'YES',
    sewing: 'WILLING',
    driving: 'NO',
    previousEmployment: JSON.stringify([
      { period: '2018-2020', country: 'السعودية', position: 'مربية أطفال' },
      { period: '2020-2022', country: 'الكويت', position: 'عاملة منزلية' }
    ]),
    experience: 'خبرة 6 سنوات في رعاية الأطفال والأعمال المنزلية',
    education: 'دبلوم تجارة',
    skills: 'رعاية الأطفال، الطبخ، التنظيف',
    summary: 'مربية محترفة مع خبرة واسعة في رعاية الأطفال',
    status: 'NEW',
    priority: 'HIGH'
  },
  {
    fullName: 'مريم حسن علي',
    fullNameArabic: 'مريم حسن علي',
    email: 'mariam.hassan@email.com',
    phone: '+201987654321',
    referenceCode: 'MH002',
    monthlySalary: '2800',
    contractPeriod: '24 شهر',
    position: 'عاملة منزلية',
    passportNumber: 'B87654321',
    passportIssueDate: '2019-03-10',
    passportExpiryDate: '2029-03-10',
    passportIssuePlace: 'الإسكندرية',
    nationality: 'مصرية',
    religion: 'مسيحية',
    dateOfBirth: '1985-12-08',
    placeOfBirth: 'الإسكندرية',
    livingTown: 'الإسكندرية',
    maritalStatus: 'SINGLE',
    numberOfChildren: 0,
    weight: '58 كيلو',
    height: '160 سم',
    complexion: 'بيضاء',
    age: 39,
    englishLevel: 'WILLING',
    arabicLevel: 'YES',
    babySitting: 'WILLING',
    childrenCare: 'YES',
    tutoring: 'NO',
    disabledCare: 'WILLING',
    cleaning: 'YES',
    washing: 'YES',
    ironing: 'YES',
    arabicCooking: 'YES',
    sewing: 'YES',
    driving: 'NO',
    previousEmployment: JSON.stringify([
      { period: '2015-2018', country: 'الإمارات', position: 'عاملة منزلية' },
      { period: '2019-2021', country: 'قطر', position: 'مربية ومنظفة' }
    ]),
    experience: 'خبرة 8 سنوات في الأعمال المنزلية والتنظيف',
    education: 'الثانوية العامة',
    skills: 'التنظيف، الطبخ، الخياطة، رعاية كبار السن',
    summary: 'عاملة منزلية ماهرة مع خبرة طويلة',
    status: 'BOOKED',
    priority: 'MEDIUM'
  },
  {
    fullName: 'عائشة محمود إبراهيم',
    fullNameArabic: 'عائشة محمود إبراهيم',
    email: 'aisha.mahmoud@email.com',
    phone: '+201122334455',
    referenceCode: 'AM003',
    monthlySalary: '3000',
    contractPeriod: '36 شهر',
    position: 'مربية ومدرسة',
    passportNumber: 'C11223344',
    passportIssueDate: '2021-06-20',
    passportExpiryDate: '2031-06-20',
    passportIssuePlace: 'أسوان',
    nationality: 'مصرية',
    religion: 'مسلمة',
    dateOfBirth: '1988-09-15',
    placeOfBirth: 'أسوان',
    livingTown: 'القاهرة',
    maritalStatus: 'DIVORCED',
    numberOfChildren: 1,
    weight: '70 كيلو',
    height: '170 سم',
    complexion: 'سمراء',
    age: 36,
    englishLevel: 'YES',
    arabicLevel: 'YES',
    babySitting: 'YES',
    childrenCare: 'YES',
    tutoring: 'YES',
    disabledCare: 'WILLING',
    cleaning: 'YES',
    washing: 'YES',
    ironing: 'YES',
    arabicCooking: 'YES',
    sewing: 'NO',
    driving: 'WILLING',
    previousEmployment: JSON.stringify([
      { period: '2016-2019', country: 'السعودية', position: 'مدرسة ومربية' },
      { period: '2020-2023', country: 'الكويت', position: 'مربية أطفال' }
    ]),
    experience: 'خبرة 10 سنوات في التدريس ورعاية الأطفال',
    education: 'بكالوريوس تربية',
    skills: 'التدريس، رعاية الأطفال، اللغة الإنجليزية',
    summary: 'مدرسة ومربية محترفة مع مؤهل جامعي',
    status: 'HIRED',
    priority: 'HIGH'
  },
  {
    fullName: 'زينب عبد الرحمن',
    fullNameArabic: 'زينب عبد الرحمن',
    email: 'zeinab.abdelrahman@email.com',
    phone: '+201555666777',
    referenceCode: 'ZA004',
    monthlySalary: '2200',
    contractPeriod: '18 شهر',
    position: 'عاملة تنظيف',
    passportNumber: 'D55566677',
    passportIssueDate: '2018-11-05',
    passportExpiryDate: '2028-11-05',
    passportIssuePlace: 'المنيا',
    nationality: 'مصرية',
    religion: 'مسلمة',
    dateOfBirth: '1992-03-25',
    placeOfBirth: 'المنيا',
    livingTown: 'المنيا',
    maritalStatus: 'MARRIED',
    numberOfChildren: 3,
    weight: '62 كيلو',
    height: '155 سم',
    complexion: 'بيضاء',
    age: 32,
    englishLevel: 'NO',
    arabicLevel: 'YES',
    babySitting: 'WILLING',
    childrenCare: 'WILLING',
    tutoring: 'NO',
    disabledCare: 'NO',
    cleaning: 'YES',
    washing: 'YES',
    ironing: 'YES',
    arabicCooking: 'YES',
    sewing: 'WILLING',
    driving: 'NO',
    previousEmployment: JSON.stringify([
      { period: '2020-2022', country: 'الأردن', position: 'عاملة تنظيف' }
    ]),
    experience: 'خبرة 4 سنوات في التنظيف والأعمال المنزلية',
    education: 'إعدادية',
    skills: 'التنظيف العميق، الطبخ المصري، الغسيل',
    summary: 'عاملة تنظيف مجتهدة وأمينة',
    status: 'NEW',
    priority: 'MEDIUM'
  },
  {
    fullName: 'سارة أحمد فتحي',
    fullNameArabic: 'سارة أحمد فتحي',
    email: 'sara.ahmed@email.com',
    phone: '+201888999000',
    referenceCode: 'SA005',
    monthlySalary: '3200',
    contractPeriod: '24 شهر',
    position: 'ممرضة ومربية',
    passportNumber: 'E88899900',
    passportIssueDate: '2022-02-14',
    passportExpiryDate: '2032-02-14',
    passportIssuePlace: 'طنطا',
    nationality: 'مصرية',
    religion: 'مسلمة',
    dateOfBirth: '1987-07-30',
    placeOfBirth: 'طنطا',
    livingTown: 'طنطا',
    maritalStatus: 'SINGLE',
    numberOfChildren: 0,
    weight: '55 كيلو',
    height: '168 سم',
    complexion: 'بيضاء',
    age: 37,
    englishLevel: 'YES',
    arabicLevel: 'YES',
    babySitting: 'YES',
    childrenCare: 'YES',
    tutoring: 'YES',
    disabledCare: 'YES',
    cleaning: 'WILLING',
    washing: 'WILLING',
    ironing: 'WILLING',
    arabicCooking: 'YES',
    sewing: 'NO',
    driving: 'YES',
    previousEmployment: JSON.stringify([
      { period: '2017-2020', country: 'الإمارات', position: 'ممرضة منزلية' },
      { period: '2021-2023', country: 'السعودية', position: 'مربية ومساعدة طبية' }
    ]),
    experience: 'خبرة 8 سنوات في التمريض ورعاية الأطفال وكبار السن',
    education: 'دبلوم تمريض',
    skills: 'التمريض، الإسعافات الأولية، رعاية كبار السن، القيادة',
    summary: 'ممرضة محترفة مع خبرة في الرعاية الطبية المنزلية',
    status: 'RETURNED',
    priority: 'HIGH'
  }
]

async function seedCVs() {
  try {
    console.log('🌱 بدء إضافة السير الذاتية التجريبية...')

    // التأكد من وجود مستخدم إداري
    let adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!adminUser) {
      console.log('❌ لا يوجد مستخدم إداري. يرجى تشغيل create-admin-user.js أولاً')
      return
    }

    console.log('✅ تم العثور على المستخدم الإداري:', adminUser.name)

    // حذف السير الذاتية الموجودة (إن وجدت)
    const existingCVs = await prisma.cV.count()
    if (existingCVs > 0) {
      console.log(`🗑️  حذف ${existingCVs} سيرة ذاتية موجودة...`)
      await prisma.cV.deleteMany()
    }

    // إضافة السير الذاتية الجديدة
    console.log('📝 إضافة السير الذاتية الجديدة...')
    
    for (let i = 0; i < sampleCVs.length; i++) {
      const cvData = sampleCVs[i]
      
      const cv = await prisma.cV.create({
        data: {
          ...cvData,
          createdById: adminUser.id,
          updatedById: adminUser.id
        }
      })

      console.log(`✅ تم إنشاء السيرة الذاتية: ${cv.fullName} (${cv.referenceCode})`)
    }

    // إحصائيات
    const totalCVs = await prisma.cV.count()
    const cvsByStatus = await prisma.cV.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    })

    console.log('\n📊 إحصائيات السير الذاتية:')
    console.log(`📋 إجمالي السير الذاتية: ${totalCVs}`)
    
    cvsByStatus.forEach(stat => {
      console.log(`   ${stat.status}: ${stat._count.status}`)
    })

    console.log('\n🎉 تم إنشاء السير الذاتية التجريبية بنجاح!')
    console.log('💡 يمكنك الآن تسجيل الدخول وعرض السير الذاتية')

  } catch (error) {
    console.error('❌ خطأ في إنشاء السير الذاتية:', error.message)
    console.error('📋 تفاصيل الخطأ:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedCVs()
