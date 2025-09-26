import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { CVStatus } from '@prisma/client'

// API route للمعرض العام - بدون authentication
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const status = url.searchParams.get('status') as CVStatus | null

    // عرض جميع السير الذاتية للمعرض العام (يمكن تخصيص هذا لاحقاً)
    const whereClause: any = {
      // يمكن إضافة شروط للخصوصية هنا
    }

    // إذا تم تحديد status معين
    if (status) {
      whereClause.status = status
    }

    const cvs = await db.cV.findMany({
      where: whereClause,
      select: {
        // اختيار الحقول المناسبة للعرض العام فقط
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
        // إخفاء الحقول الحساسة
        // createdBy: false,
        // updatedBy: false,
        // contracts: false,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(cvs)
  } catch (error) {
    console.error('Error fetching gallery CVs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch CVs for gallery' },
      { status: 500 }
    )
  }
}
