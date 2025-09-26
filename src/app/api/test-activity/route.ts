import { NextRequest, NextResponse } from 'next/server'
import { validateAuthFromRequest } from '@/lib/middleware-auth'
import { CVActivityLogger, UserActivityLogger, ImportActivityLogger } from '@/lib/activity-logger'

export async function POST(request: NextRequest) {
  try {
    const authResult = await validateAuthFromRequest(request)
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { user } = authResult

    // Create some test activities
    const activities = [
      await CVActivityLogger.created(user.id, 'test-cv-1', 'أحمد محمد', 'Manual'),
      await CVActivityLogger.updated(user.id, 'test-cv-1', 'أحمد محمد', ['fullName', 'email']),
      await CVActivityLogger.statusChanged(user.id, 'test-cv-1', 'أحمد محمد', 'NEW', 'BOOKED'),
      await UserActivityLogger.login(user.id),
      await ImportActivityLogger.excelImport(user.id, 25, 'Excel File'),
    ]

    return NextResponse.json({
      message: 'Test activities created successfully',
      activities: activities.length
    })
  } catch (error) {
    console.error('Error creating test activities:', error)
    return NextResponse.json(
      { error: 'Failed to create test activities' },
      { status: 500 }
    )
  }
}

