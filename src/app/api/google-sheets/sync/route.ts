import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { googleSheetsService } from '@/lib/google-sheets'
import { googleSheetsDemoService } from '@/lib/google-sheets-demo'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// GET - جلب البيانات من Google Sheets ومزامنتها
export async function GET(request: NextRequest) {
  try {
    // التحقق من صحة المصادقة
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } })
    
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUB_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    console.log('🔄 بدء مزامنة البيانات من Google Sheets...')

    // قراءة البيانات من Google Sheets
    let sheetData
    let isDemo = false
    
    try {
      sheetData = await googleSheetsService.getAllData()
      console.log(`📊 تم العثور على ${sheetData.length} صف في Google Sheets`)
    } catch (authError: any) {
      if (authError.message.includes('credentials') || authError.message.includes('GOOGLE_SHEETS')) {
        // استخدام البيانات التجريبية
        console.log('⚠️  استخدام البيانات التجريبية لعدم توفر إعدادات Google Sheets')
        sheetData = await googleSheetsDemoService.getAllData()
        isDemo = true
      } else {
        throw authError
      }
    }

    if (sheetData.length === 0) {
      return NextResponse.json({ 
        message: 'لا توجد بيانات في Google Sheets',
        synced: 0,
        errors: []
      })
    }

    const results = {
      synced: 0,
      updated: 0,
      errors: [] as string[]
    }

    // معالجة كل صف
    for (let i = 0; i < sheetData.length; i++) {
      try {
        const rowData = sheetData[i]
        
        // تحويل البيانات إلى نموذج قاعدة البيانات
        const service = isDemo ? googleSheetsDemoService : googleSheetsService
        const cvData = service.transformToDBFormat(rowData)
        
        // التحقق من وجود الاسم الكامل (مطلوب)
        if (!cvData.fullName || cvData.fullName.trim() === '') {
          results.errors.push(`الصف ${i + 2}: الاسم الكامل مطلوب`)
          continue
        }

        // البحث عن سيرة ذاتية موجودة بنفس الاسم أو رمز المرجع
        let existingCV = null
        if (cvData.referenceCode) {
          existingCV = await prisma.cV.findFirst({
            where: { referenceCode: cvData.referenceCode }
          })
        }
        
        if (!existingCV) {
          existingCV = await prisma.cV.findFirst({
            where: { fullName: cvData.fullName }
          })
        }

        if (existingCV) {
          // تحديث السيرة الذاتية الموجودة
          await prisma.cV.update({
            where: { id: existingCV.id },
            data: {
              ...cvData,
              updatedById: user.id
            }
          })
          results.updated++
          console.log(`✅ تم تحديث: ${cvData.fullName}`)
        } else {
          // إنشاء سيرة ذاتية جديدة
          await prisma.cV.create({
            data: {
              ...cvData,
              createdById: user.id,
              updatedById: user.id
            }
          })
          results.synced++
          console.log(`✅ تم إنشاء: ${cvData.fullName}`)
        }

      } catch (error: any) {
        results.errors.push(`الصف ${i + 2}: ${error.message}`)
        console.error(`❌ خطأ في الصف ${i + 2}:`, error.message)
      }
    }

    console.log(`🎉 انتهت المزامنة: ${results.synced} جديد، ${results.updated} محدث، ${results.errors.length} أخطاء`)

    return NextResponse.json({
      message: isDemo ? 'تمت المزامنة بنجاح (وضع تجريبي)' : 'تمت المزامنة بنجاح',
      synced: results.synced,
      updated: results.updated,
      errors: results.errors,
      totalProcessed: sheetData.length,
      isDemo
    })

  } catch (error: any) {
    console.error('❌ خطأ في مزامنة Google Sheets:', error)
    return NextResponse.json({ 
      error: 'فشل في المزامنة',
      details: error.message 
    }, { status: 500 })
  }
}

// POST - إضافة سيرة ذاتية جديدة إلى Google Sheets
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } })
    
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUB_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { cvId } = await request.json()

    // جلب بيانات السيرة الذاتية
    const cv = await prisma.cV.findUnique({
      where: { id: cvId }
    })

    if (!cv) {
      return NextResponse.json({ error: 'السيرة الذاتية غير موجودة' }, { status: 404 })
    }

    // تحويل البيانات إلى صف في الشيت
    const rowData = [
      cv.fullName,
      cv.fullNameArabic,
      cv.email,
      cv.phone,
      cv.referenceCode,
      cv.monthlySalary,
      cv.contractPeriod,
      cv.position,
      cv.passportNumber,
      cv.passportIssueDate,
      cv.passportExpiryDate,
      cv.passportIssuePlace,
      cv.nationality,
      cv.religion,
      cv.dateOfBirth,
      cv.placeOfBirth,
      cv.livingTown,
      cv.maritalStatus,
      cv.numberOfChildren?.toString(),
      cv.weight,
      cv.height,
      cv.complexion,
      cv.age?.toString(),
      cv.englishLevel,
      cv.arabicLevel,
      cv.babySitting,
      cv.childrenCare,
      cv.tutoring,
      cv.disabledCare,
      cv.cleaning,
      cv.washing,
      cv.ironing,
      cv.arabicCooking,
      cv.sewing,
      cv.driving,
      cv.previousEmployment,
      cv.experience,
      cv.education,
      cv.skills,
      cv.summary,
      cv.priority,
      cv.notes,
      cv.videoLink
    ]

    // إضافة الصف إلى Google Sheets
    await googleSheetsService.addRow(rowData)

    return NextResponse.json({
      message: 'تم إضافة السيرة الذاتية إلى Google Sheets بنجاح',
      cvName: cv.fullName
    })

  } catch (error: any) {
    console.error('❌ خطأ في إضافة السيرة الذاتية إلى Google Sheets:', error)
    return NextResponse.json({ 
      error: 'فشل في إضافة السيرة الذاتية',
      details: error.message 
    }, { status: 500 })
  }
}
