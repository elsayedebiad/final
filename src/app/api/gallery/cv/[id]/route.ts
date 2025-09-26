import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// API route لعرض سيرة ذاتية محددة للمعرض العام - بدون authentication
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cvId = parseInt(params.id)

    const cv = await db.cV.findUnique({
      where: {
        id: cvId
      },
      select: {
        // جميع الحقول المناسبة للعرض العام
        id: true,
        fullName: true,
        fullNameArabic: true,
        nationality: true,
        position: true,
        age: true,
        profileImage: true,
        phone: true,
        referenceCode: true,
        status: true,
        // معلومات إضافية للسيرة الكاملة - جميع الحقول المتاحة
        email: true,
        maritalStatus: true,
        // الحقول المتاحة في قاعدة البيانات
        religion: true,
        dateOfBirth: true,
        placeOfBirth: true,
        livingTown: true,
        numberOfChildren: true,
        weight: true,
        height: true,
        arabicLevel: true,
        englishLevel: true,
        passportNumber: true,
        passportIssueDate: true,
        passportExpiryDate: true,
        passportIssuePlace: true,
        babySitting: true,
        childrenCare: true,
        cleaning: true,
        washing: true,
        ironing: true,
        arabicCooking: true,
        sewing: true,
        driving: true,
        previousEmployment: true,
        // إخفاء الحقول الحساسة
        // createdBy: false,
        // updatedBy: false,
        // contracts: false,
      }
    })

    if (!cv) {
      return NextResponse.json(
        { error: 'CV not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(cv)
  } catch (error) {
    console.error('Error fetching CV for gallery:', error)
    return NextResponse.json(
      { error: 'Failed to fetch CV' },
      { status: 500 }
    )
  }
}
