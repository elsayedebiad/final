import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import * as XLSX from 'xlsx'

interface ExcelRow {
  'الاسم الكامل'?: string
  'Full Name'?: string
  'البريد الإلكتروني'?: string
  'Email'?: string
  'رقم الهاتف'?: string
  'Phone'?: string
  'المنصب'?: string
  'Position'?: string
  'سنوات الخبرة'?: string
  'Experience'?: string
  'المؤهل العلمي'?: string
  'Education'?: string
  'المهارات'?: string
  'Skills'?: string
  'الملخص المهني'?: string
  'Summary'?: string
  'الأولوية'?: string
  'Priority'?: string
  'ملاحظات'?: string
  'Notes'?: string
}

interface ParsedCV {
  fullName: string
  email?: string
  phone?: string
  position?: string
  experience?: string
  education?: string
  skills?: string
  summary?: string
  priority: string
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
    const jsonData = XLSX.utils.sheet_to_json(worksheet) as ExcelRow[]

    if (jsonData.length === 0) {
      return NextResponse.json(
        { error: 'Excel file is empty or has no valid data' },
        { status: 400 }
      )
    }

    // Parse and validate data
    const parsedCVs: ParsedCV[] = jsonData.map((row, index) => {
      const cv: ParsedCV = {
        fullName: '',
        priority: 'MEDIUM',
        isValid: true,
        errors: []
      }

      // Extract full name (try both Arabic and English headers)
      const fullName = row['الاسم الكامل'] || row['Full Name'] || ''
      if (!fullName.trim()) {
        cv.errors.push(`Row ${index + 1}: Full name is required`)
        cv.isValid = false
      } else {
        cv.fullName = fullName.trim()
      }

      // Extract other fields
      cv.email = (row['البريد الإلكتروني'] || row['Email'] || '').trim()
      cv.phone = (row['رقم الهاتف'] || row['Phone'] || '').trim()
      cv.position = (row['المنصب'] || row['Position'] || '').trim()
      cv.experience = (row['سنوات الخبرة'] || row['Experience'] || '').trim()
      cv.education = (row['المؤهل العلمي'] || row['Education'] || '').trim()
      cv.skills = (row['المهارات'] || row['Skills'] || '').trim()
      cv.summary = (row['الملخص المهني'] || row['Summary'] || '').trim()
      cv.notes = (row['ملاحظات'] || row['Notes'] || '').trim()

      // Parse priority
      const priorityStr = (row['الأولوية'] || row['Priority'] || '').toLowerCase().trim()
      switch (priorityStr) {
        case 'منخفضة':
        case 'low':
          cv.priority = 'LOW'
          break
        case 'عالية':
        case 'high':
          cv.priority = 'HIGH'
          break
        case 'عاجلة':
        case 'urgent':
          cv.priority = 'URGENT'
          break
        default:
          cv.priority = 'MEDIUM'
      }

      // Validate email format if provided
      if (cv.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cv.email)) {
        cv.errors.push(`Row ${index + 1}: Invalid email format`)
        cv.isValid = false
      }

      return cv
    })

    const validCVs = parsedCVs.filter(cv => cv.isValid)
    const invalidCVs = parsedCVs.filter(cv => !cv.isValid)

    // If action is 'preview', return parsed data for review
    if (action === 'preview') {
      return NextResponse.json({
        total: parsedCVs.length,
        valid: validCVs.length,
        invalid: invalidCVs.length,
        validCVs: validCVs.slice(0, 10), // Return first 10 for preview
        invalidCVs: invalidCVs,
        message: `Found ${validCVs.length} valid CVs and ${invalidCVs.length} invalid entries`
      })
    }

    // If action is 'import', save valid CVs to database
    if (action === 'import') {
      if (validCVs.length === 0) {
        return NextResponse.json(
          { error: 'No valid CVs to import' },
          { status: 400 }
        )
      }

      // Bulk insert CVs
      const createdCVs = await Promise.all(
        validCVs.map(cv => 
          db.cV.create({
            data: {
              fullName: cv.fullName,
              email: cv.email || null,
              phone: cv.phone || null,
              position: cv.position || null,
              experience: cv.experience || null,
              education: cv.education || null,
              skills: cv.skills || null,
              summary: cv.summary || null,
              priority: cv.priority,
              notes: cv.notes || null,
              source: 'Excel Import',
              status: 'NEW',
              createdById: userId,
              updatedById: userId,
            }
          })
        )
      )

      // Log activity
      await db.activityLog.create({
        data: {
          userId,
          action: 'EXCEL_IMPORT',
          description: `Imported ${createdCVs.length} CVs from Excel file: ${file.name}`,
          metadata: JSON.stringify({
            fileName: file.name,
            totalRows: parsedCVs.length,
            validRows: validCVs.length,
            invalidRows: invalidCVs.length,
            importedCVs: createdCVs.length
          }),
        },
      })

      return NextResponse.json({
        message: 'CVs imported successfully',
        imported: createdCVs.length,
        total: parsedCVs.length,
        skipped: invalidCVs.length,
        cvs: createdCVs
      })
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "preview" or "import"' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error importing CVs:', error)
    return NextResponse.json(
      { error: 'Failed to import CVs', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
