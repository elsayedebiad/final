import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ActivityType, CVStatus, Priority, MaritalStatus, SkillLevel } from '@prisma/client'
import * as XLSX from 'xlsx'

interface AlQaeidExcelRow {
  'الاسم الكامل'?: string
  'الاسم بالعربية'?: string
  'البريد الإلكتروني'?: string
  'رقم الهاتف'?: string
  'كود المرجع'?: string
  'رابط الصورة الشخصية'?: string
  'الراتب الشهري'?: string
  'مدة العقد'?: string
  'المنصب'?: string
  'رقم الجواز'?: string
  'تاريخ إصدار الجواز'?: string
  'تاريخ انتهاء الجواز'?: string
  'مكان إصدار الجواز'?: string
  'الجنسية'?: string
  'الديانة'?: string
  'تاريخ الميلاد'?: string
  'مكان الميلاد'?: string
  'مكان السكن'?: string
  'الحالة الاجتماعية'?: string
  'عدد الأطفال'?: string
  'الوزن'?: string
  'الطول'?: string
  'لون البشرة'?: string
  'العمر'?: string
  'الإنجليزية'?: string
  'العربية'?: string
  'عناية الرضع'?: string
  'عناية الأطفال'?: string
  'تعليم الأطفال'?: string
  'عناية المعوقين'?: string
  'التنظيف'?: string
  'الغسيل'?: string
  'الكي'?: string
  'الطبخ العربي'?: string
  'الخياطة'?: string
  'القيادة'?: string
  'الأولوية'?: string
  'ملاحظات'?: string
}

interface ParsedAlQaeidCV {
  fullName: string
  fullNameArabic?: string
  email?: string
  phone?: string
  referenceCode?: string
  profileImage?: string
  monthlySalary?: string
  contractPeriod?: string
  position?: string
  passportNumber?: string
  passportIssueDate?: string
  passportExpiryDate?: string
  passportIssuePlace?: string
  nationality?: string
  religion?: string
  dateOfBirth?: string
  placeOfBirth?: string
  livingTown?: string
  maritalStatus?: MaritalStatus
  numberOfChildren?: number
  weight?: string
  height?: string
  complexion?: string
  age?: number
  englishLevel?: SkillLevel
  arabicLevel?: SkillLevel
  babySitting?: SkillLevel
  childrenCare?: SkillLevel
  tutoring?: SkillLevel
  disabledCare?: SkillLevel
  cleaning?: SkillLevel
  washing?: SkillLevel
  ironing?: SkillLevel
  arabicCooking?: SkillLevel
  sewing?: SkillLevel
  driving?: SkillLevel
  priority: Priority
  notes?: string
  isValid: boolean
  errors: string[]
}

export async function POST(request: NextRequest) {
  try {
    const userIdString = request.headers.get('x-user-id')
    const userRole = request.headers.get('x-user-role')

    if (!userIdString) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(userIdString, 10)
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    // Check if user has permission to import
    if (userRole !== 'ADMIN' && userRole !== 'SUB_ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const action = formData.get('action') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload Excel (.xlsx, .xls) or CSV file.' },
        { status: 400 }
      )
    }

    // Read file buffer
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json(worksheet) as AlQaeidExcelRow[]

    if (jsonData.length === 0) {
      return NextResponse.json(
        { error: 'Excel file is empty or has no valid data' },
        { status: 400 }
      )
    }

    // Parse and validate data
    const parsedCVs: ParsedAlQaeidCV[] = jsonData.map((row, index) => {
      const cv: ParsedAlQaeidCV = {
        fullName: '',
        priority: Priority.MEDIUM,
        isValid: true,
        errors: []
      }

      // Extract and validate full name
      const fullName = row['الاسم الكامل'] || ''
      if (!fullName.trim()) {
        cv.errors.push(`Row ${index + 1}: Full name is required`)
        cv.isValid = false
      } else {
        cv.fullName = fullName.trim()
      }

      // Basic Information
      cv.fullNameArabic = String(row['الاسم بالعربية'] || '').trim()
      cv.email = String(row['البريد الإلكتروني'] || '').trim()
      cv.phone = String(row['رقم الهاتف'] || '').trim()
      cv.referenceCode = String(row['كود المرجع'] || '').trim()
      cv.profileImage = String(row['رابط الصورة الشخصية'] || '').trim()

      // Employment Details
      cv.monthlySalary = String(row['الراتب الشهري'] || '').trim()
      cv.contractPeriod = String(row['مدة العقد'] || '').trim()
      cv.position = String(row['المنصب'] || '').trim()

      // Passport Information
      cv.passportNumber = String(row['رقم الجواز'] || '').trim()
      cv.passportIssueDate = String(row['تاريخ إصدار الجواز'] || '').trim()
      cv.passportExpiryDate = String(row['تاريخ انتهاء الجواز'] || '').trim()
      cv.passportIssuePlace = String(row['مكان إصدار الجواز'] || '').trim()

      // Personal Information
      cv.nationality = String(row['الجنسية'] || '').trim()
      cv.religion = String(row['الديانة'] || '').trim()
      cv.dateOfBirth = String(row['تاريخ الميلاد'] || '').trim()
      cv.placeOfBirth = String(row['مكان الميلاد'] || '').trim()
      cv.livingTown = String(row['مكان السكن'] || '').trim()
      cv.weight = String(row['الوزن'] || '').trim()
      cv.height = String(row['الطول'] || '').trim()
      cv.complexion = String(row['لون البشرة'] || '').trim()

      // Parse marital status
      const maritalStatusStr = (row['الحالة الاجتماعية'] || '').toLowerCase().trim()
      switch (maritalStatusStr) {
        case 'single':
        case 'أعزب':
        case 'عزباء':
          cv.maritalStatus = MaritalStatus.SINGLE
          break
        case 'married':
        case 'متزوج':
        case 'متزوجة':
          cv.maritalStatus = MaritalStatus.MARRIED
          break
        case 'divorced':
        case 'مطلق':
        case 'مطلقة':
          cv.maritalStatus = MaritalStatus.DIVORCED
          break
        case 'widowed':
        case 'أرمل':
        case 'أرملة':
          cv.maritalStatus = MaritalStatus.WIDOWED
          break
        default:
          cv.maritalStatus = MaritalStatus.SINGLE
      }

      // Parse numbers
      cv.numberOfChildren = parseInt(row['عدد الأطفال'] || '0') || 0
      cv.age = parseInt(row['العمر'] || '0') || 0

      // Parse skill levels
      const parseSkillLevel = (value: string): SkillLevel => {
        const val = value.toLowerCase().trim()
        switch (val) {
          case 'yes':
          case 'نعم':
            return SkillLevel.YES
          case 'willing':
          case 'مستعد':
          case 'مستعدة':
            return SkillLevel.WILLING
          default:
            return SkillLevel.NO
        }
      }

      // Languages
      cv.englishLevel = parseSkillLevel(row['الإنجليزية'] || 'no')
      cv.arabicLevel = parseSkillLevel(row['العربية'] || 'no')

      // Skills
      cv.babySitting = parseSkillLevel(row['عناية الرضع'] || 'no')
      cv.childrenCare = parseSkillLevel(row['عناية الأطفال'] || 'no')
      cv.tutoring = parseSkillLevel(row['تعليم الأطفال'] || 'no')
      cv.disabledCare = parseSkillLevel(row['عناية المعوقين'] || 'no')
      cv.cleaning = parseSkillLevel(row['التنظيف'] || 'no')
      cv.washing = parseSkillLevel(row['الغسيل'] || 'no')
      cv.ironing = parseSkillLevel(row['الكي'] || 'no')
      cv.arabicCooking = parseSkillLevel(row['الطبخ العربي'] || 'no')
      cv.sewing = parseSkillLevel(row['الخياطة'] || 'no')
      cv.driving = parseSkillLevel(row['القيادة'] || 'no')

      // Parse priority
      const priorityStr = (row['الأولوية'] || '').toLowerCase().trim()
      switch (priorityStr) {
        case 'منخفضة':
        case 'low':
          cv.priority = Priority.LOW
          break
        case 'عالية':
        case 'high':
          cv.priority = Priority.HIGH
          break
        case 'عاجلة':
        case 'urgent':
          cv.priority = Priority.URGENT
          break
        default:
          cv.priority = Priority.MEDIUM
      }

      cv.notes = (row['ملاحظات'] || '').trim()

      // Validate email format if provided
      if (cv.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cv.email)) {
        cv.errors.push(`Row ${index + 1}: Invalid email format`)
        cv.isValid = false
      }

      return cv
    })

    const validCVs = parsedCVs.filter(cv => cv.isValid)
    const invalidCVs = parsedCVs.filter(cv => !cv.isValid)

    if (validCVs.length === 0) {
      return NextResponse.json(
        { error: 'No valid CVs to import' },
        { status: 400 }
      )
    }

    // Bulk insert CVs and then update with a unique reference code
    const createdCVs = await Promise.all(
      validCVs.map(async (cv) => {
        const newCv = await db.cV.create({
          data: {
            // Basic Information
            fullName: cv.fullName,
            fullNameArabic: cv.fullNameArabic,
            email: cv.email,
            phone: cv.phone,
            referenceCode: cv.referenceCode,
            profileImage: cv.profileImage,
            
            // Employment Details
            monthlySalary: cv.monthlySalary,
            contractPeriod: cv.contractPeriod,
            position: cv.position,
            
            // Passport Information
            passportNumber: cv.passportNumber,
            passportIssueDate: cv.passportIssueDate,
            passportExpiryDate: cv.passportExpiryDate,
            passportIssuePlace: cv.passportIssuePlace,
            
            // Personal Information
            nationality: cv.nationality,
            religion: cv.religion,
            dateOfBirth: cv.dateOfBirth,
            placeOfBirth: cv.placeOfBirth,
            livingTown: cv.livingTown,
            maritalStatus: cv.maritalStatus,
            numberOfChildren: cv.numberOfChildren,
            weight: cv.weight,
            height: cv.height,
            complexion: cv.complexion,
            age: cv.age,
            
            // Languages and Education
            englishLevel: cv.englishLevel,
            arabicLevel: cv.arabicLevel,
            
            // Skills and Experiences
            babySitting: cv.babySitting,
            childrenCare: cv.childrenCare,
            tutoring: cv.tutoring,
            disabledCare: cv.disabledCare,
            cleaning: cv.cleaning,
            washing: cv.washing,
            ironing: cv.ironing,
            arabicCooking: cv.arabicCooking,
            sewing: cv.sewing,
            driving: cv.driving,
            
            // System fields
            priority: cv.priority,
            notes: cv.notes,
            source: 'Excel Import - Al-Qaeid Template',
            status: CVStatus.NEW,
            createdById: userId,
            updatedById: userId,
          }
        });

        // Generate and update with a unique reference code
        const newReferenceCode = `EA-${String(newCv.id).slice(-6).toUpperCase()}`;
        return db.cV.update({
          where: { id: newCv.id },
          data: { referenceCode: newReferenceCode },
        });
      })
    );

    // Log activity
    await db.activityLog.create({
      data: {
        userId,
        action: ActivityType.EXCEL_IMPORT,
        description: `Imported ${createdCVs.length} Al-Qaeid CVs from Excel file: ${file.name}`,
        metadata: JSON.stringify({
          fileName: file.name,
          template: 'Al-Qaeid',
          totalRows: parsedCVs.length,
          validRows: validCVs.length,
          invalidRows: invalidCVs.length,
          importedCVs: createdCVs.length
        }),
      },
    })

    return NextResponse.json({
      message: 'Al-Qaeid CVs imported successfully',
      imported: createdCVs.length,
      total: parsedCVs.length,
      skipped: invalidCVs.length,
      template: 'Al-Qaeid',
      cvs: createdCVs
    })

  } catch (error) {
    console.error('Error importing Al-Qaeid CVs:', error)
    return NextResponse.json(
      { error: 'Failed to import CVs', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
