import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const activities = await prisma.activityLog.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    })

    const formattedActivities = activities.map(activity => ({
      id: activity.id.toString(),
      action: activity.action,
      description: activity.description,
      userId: activity.userId.toString(),
      userName: activity.user.name || 'مستخدم غير معروف',
      userEmail: activity.user.email,
      targetType: activity.targetType || 'SYSTEM',
      targetId: activity.targetId,
      targetName: activity.targetName,
      metadata: activity.metadata,
      ipAddress: activity.ipAddress,
      userAgent: activity.userAgent,
      createdAt: activity.createdAt.toISOString()
    }))

    return NextResponse.json({ activities: formattedActivities })
  } catch (error) {
    console.error('Activity log fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const body = await request.json()
    
    const {
      action,
      description,
      targetType,
      targetId,
      targetName,
      metadata
    } = body

    const userAgent = request.headers.get('user-agent') || undefined
    const forwarded = request.headers.get('x-forwarded-for')
    const ipAddress = forwarded ? forwarded.split(',')[0] : '127.0.0.1'

    const activity = await prisma.activityLog.create({
      data: {
        action,
        description,
        userId: decoded.userId,
        targetType,
        targetId,
        targetName,
        metadata: metadata ? JSON.stringify(metadata) : null,
        ipAddress,
        userAgent
      }
    })

    return NextResponse.json({ activity })
  } catch (error) {
    console.error('Activity log creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
