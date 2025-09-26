import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ActivityType } from '@prisma/client'
import { validateAuthFromRequest } from '@/lib/middleware-auth'
import { CVActivityLogger } from '@/lib/activity-logger'

async function parseAndValidateCvId(params: Promise<{ id: string }>): Promise<number | null> {
  const resolvedParams = await params
  const cvId = parseInt(resolvedParams.id, 10)
  if (isNaN(cvId)) {
    return null
  }
  return cvId
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id:string }> }
) {
  try {
    const authResult = await validateAuthFromRequest(request)
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { user } = authResult
    
    const cvId = await parseAndValidateCvId(params);
    if (cvId === null) {
      return NextResponse.json({ error: 'Invalid CV ID format' }, { status: 400 });
    }

    const cv = await db.cV.findUnique({
      where: { id: Number(cvId) },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
        updatedBy: {
          select: {
            name: true,
            email: true,
          },
        },
        versions: {
          orderBy: {
            version: 'desc',
          },
          take: 5,
        },
      },
    })

    if (!cv) {
      return NextResponse.json(
        { error: 'CV not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ cv })
  } catch (error) {
    console.error('Error fetching CV:', error)
    return NextResponse.json(
      { error: 'Failed to fetch CV' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await validateAuthFromRequest(request)
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { user } = authResult

    const cvId = await parseAndValidateCvId(params);
    if (cvId === null) {
      return NextResponse.json({ error: 'Invalid CV ID format' }, { status: 400 });
    }

    const body = await request.json()
    const {
      fullName,
      fullNameArabic,
      email,
      phone,
      referenceCode,
      monthlySalary,
      contractPeriod,
      position,
      passportNumber,
      passportIssueDate,
      passportExpiryDate,
      passportIssuePlace,
      nationality,
      religion,
      dateOfBirth,
      placeOfBirth,
      livingTown,
      maritalStatus,
      numberOfChildren,
      weight,
      height,
      complexion,
      age,
      englishLevel,
      arabicLevel,
      babySitting,
      childrenCare,
      tutoring,
      disabledCare,
      cleaning,
      washing,
      ironing,
      arabicCooking,
      sewing,
      driving,
      previousEmployment,
      profileImage,
      experience,
      education,
      skills,
      summary,
      content,
      status,
      priority,
      notes,
    } = body

    // Get current CV for version history
    const currentCV = await db.cV.findUnique({
      where: { id: Number(cvId) },
    })

    if (!currentCV) {
      return NextResponse.json(
        { error: 'CV not found' },
        { status: 404 }
      )
    }

    // Create version history if content changed
    if (content && content !== currentCV.content) {
      const latestVersion = await db.cVVersion.findFirst({
        where: { cvId: Number(cvId) },
        orderBy: { version: 'desc' },
      })

      const nextVersion = (latestVersion?.version || 0) + 1

      await db.cVVersion.create({
        data: {
          cvId: Number(cvId),
          content: currentCV.content || '',
          version: nextVersion,
          createdBy: user.id,
        },
      })
    }

    const updatedCV = await db.cV.update({
      where: { id: Number(cvId) },
      data: {
        ...(fullName && { fullName }),
        ...(fullNameArabic !== undefined && { fullNameArabic }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(referenceCode !== undefined && { referenceCode }),
        ...(monthlySalary !== undefined && { monthlySalary }),
        ...(contractPeriod !== undefined && { contractPeriod }),
        ...(position !== undefined && { position }),
        ...(passportNumber !== undefined && { passportNumber }),
        ...(passportIssueDate !== undefined && { passportIssueDate }),
        ...(passportExpiryDate !== undefined && { passportExpiryDate }),
        ...(passportIssuePlace !== undefined && { passportIssuePlace }),
        ...(nationality !== undefined && { nationality }),
        ...(religion !== undefined && { religion }),
        ...(dateOfBirth !== undefined && { dateOfBirth }),
        ...(placeOfBirth !== undefined && { placeOfBirth }),
        ...(livingTown !== undefined && { livingTown }),
        ...(maritalStatus !== undefined && { maritalStatus }),
        ...(numberOfChildren !== undefined && { numberOfChildren }),
        ...(weight !== undefined && { weight }),
        ...(height !== undefined && { height }),
        ...(complexion !== undefined && { complexion }),
        ...(age !== undefined && { age }),
        ...(englishLevel !== undefined && { englishLevel }),
        ...(arabicLevel !== undefined && { arabicLevel }),
        ...(babySitting !== undefined && { babySitting }),
        ...(childrenCare !== undefined && { childrenCare }),
        ...(tutoring !== undefined && { tutoring }),
        ...(disabledCare !== undefined && { disabledCare }),
        ...(cleaning !== undefined && { cleaning }),
        ...(washing !== undefined && { washing }),
        ...(ironing !== undefined && { ironing }),
        ...(arabicCooking !== undefined && { arabicCooking }),
        ...(sewing !== undefined && { sewing }),
        ...(driving !== undefined && { driving }),
        ...(previousEmployment !== undefined && { previousEmployment }),
        ...(profileImage !== undefined && { profileImage }),
        ...(experience !== undefined && { experience }),
        ...(education !== undefined && { education }),
        ...(skills !== undefined && { skills }),
        ...(summary !== undefined && { summary }),
        ...(content !== undefined && { content }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(notes !== undefined && { notes }),
        updatedById: user.id,
      },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
        updatedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    // Log activity
    const changes = Object.keys(body).filter(key => body[key] !== undefined)
    
    if (status && status !== currentCV.status) {
      await CVActivityLogger.statusChanged(user.id, Number(cvId), updatedCV.fullName, currentCV.status, status)
    } else {
      await CVActivityLogger.updated(user.id, Number(cvId), updatedCV.fullName, changes)
    }

    return NextResponse.json({ cv: updatedCV })
  } catch (error) {
    console.error('Error updating CV:', error)
    return NextResponse.json(
      { error: 'Failed to update CV' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await validateAuthFromRequest(request)
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { user } = authResult
    
    const cvId = await parseAndValidateCvId(params);
    if (cvId === null) {
      return NextResponse.json({ error: 'Invalid CV ID format' }, { status: 400 });
    }

    // Check if user has permission to delete
    if (user.role !== 'ADMIN' && user.role !== 'SUB_ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const cv = await db.cV.findUnique({
      where: { id: Number(cvId) },
    })

    if (!cv) {
      return NextResponse.json(
        { error: 'CV not found' },
        { status: 404 }
      )
    }

    // Delete related contract first to avoid FK constraint errors
    await db.contract.deleteMany({
      where: { cvId: Number(cvId) },
    })

    // Delete related activity logs
    await db.activityLog.deleteMany({
      where: { cvId: Number(cvId) },
    })

    // Delete CV and related data (cascade will handle versions)
    await db.cV.delete({
      where: { id: Number(cvId) },
    })

    // Log activity
    await CVActivityLogger.deleted(user.id, Number(cvId), cv.fullName)

    return NextResponse.json({ message: 'CV deleted successfully' })
  } catch (error) {
    console.error('Error deleting CV:', error)
    return NextResponse.json(
      { error: 'Failed to delete CV' },
      { status: 500 }
    )
  }
}
