import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateAuthFromRequest } from '@/lib/middleware-auth'
import { CVStatus, ActivityType } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const authResult = await validateAuthFromRequest(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { user } = authResult;

    const body = await request.json()
    const { cvIds, action, status } = body

    if (!cvIds || !Array.isArray(cvIds) || cvIds.length === 0) {
      return NextResponse.json({ error: 'CV IDs must be a non-empty array' }, { status: 400 })
    }

    const numericIds = cvIds.map(id => parseInt(id, 10));

    if (action === 'delete') {
      if (user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      // Perform cascade delete manually for related entities
      await db.contract.deleteMany({ where: { cvId: { in: numericIds } } });
      await db.activityLog.deleteMany({ where: { cvId: { in: numericIds } } });
      await db.cVVersion.deleteMany({ where: { cvId: { in: numericIds } } });

      const result = await db.cV.deleteMany({
        where: { id: { in: numericIds } },
      });

      // Log this bulk action
      await db.activityLog.create({
        data: {
          userId: user.id,
          action: ActivityType.CV_DELETED,
          description: `Bulk deleted ${result.count} CVs.`,
          metadata: JSON.stringify({ cvIds: numericIds, count: result.count })
        }
      });

      return NextResponse.json({ deletedCount: result.count });

    } else if (action === 'statusChange') {
      if (!status || !Object.values(CVStatus).includes(status)) {
        return NextResponse.json({ error: 'Invalid status provided' }, { status: 400 });
      }

      const result = await db.cV.updateMany({
        where: { id: { in: numericIds } },
        data: { status },
      });

      // Log this bulk action
      await db.activityLog.create({
        data: {
          userId: user.id,
          action: ActivityType.CV_STATUS_CHANGED,
          description: `Bulk updated status to ${status} for ${result.count} CVs.`,
          metadata: JSON.stringify({ cvIds: numericIds, newStatus: status, count: result.count })
        }
      });

      return NextResponse.json({ updatedCount: result.count });

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Bulk operation failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}