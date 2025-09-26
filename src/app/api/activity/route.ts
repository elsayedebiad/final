import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateAuthFromRequest } from '@/lib/middleware-auth'

export async function GET(request: NextRequest) {
  try {
    // Use the same authentication method as other APIs
    const authResult = await validateAuthFromRequest(request)
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { user } = authResult
    const userId = user.id
    const userRole = user.role

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const cvId = searchParams.get('cvId')
    const action = searchParams.get('action')

    const skip = (page - 1) * limit

    const where: any = {}

    // If not admin, only show user's own activities or activities on their CVs
    if (userRole !== 'ADMIN') {
      where.OR = [
        { userId },
        { cv: { createdById: userId } }
      ]
    }

    // Filter by CV ID if provided
    if (cvId) {
      where.cvId = cvId
    }

    // Filter by action type if provided
    if (action) {
      where.action = action
    }

    const [activities, total] = await Promise.all([
      db.activityLog.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          cv: {
            select: {
              fullName: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      db.activityLog.count({ where })
    ])

    return NextResponse.json({
      activities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching activity log:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activity log' },
      { status: 500 }
    )
  }
}
