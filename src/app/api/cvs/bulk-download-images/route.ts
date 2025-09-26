import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // التحقق من التوكن
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || request.nextUrl.searchParams.get('token')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await AuthService.verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // الحصول على معرفات السير الذاتية
    const idsParam = request.nextUrl.searchParams.get('ids')
    if (!idsParam) {
      return NextResponse.json({ error: 'No IDs provided' }, { status: 400 })
    }

    const cvIds = idsParam.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id))
    
    // التحقق من وجود السير الذاتية
    const cvs = await db.cV.findMany({
      where: {
        id: { in: cvIds },
        createdById: user.id
      },
      select: {
        id: true,
        fullName: true
      }
    })

    if (cvs.length === 0) {
      return NextResponse.json({ error: 'No CVs found' }, { status: 404 })
    }

    // بدلاً من معالجة الصور هنا، نرسل قائمة بروابط التحميل
    const downloadLinks = cvs.map(cv => ({
      id: cv.id,
      name: cv.fullName,
      url: `/dashboard/cv/${cv.id}/alqaeid?download=image`
    }))

    return NextResponse.json({ 
      message: 'CVs found successfully',
      count: cvs.length,
      downloadLinks 
    })

  } catch (error) {
    console.error('Bulk download error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
