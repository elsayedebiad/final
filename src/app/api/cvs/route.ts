import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ActivityType, CVStatus, Priority } from '@prisma/client'
import { CVActivityLogger } from '@/lib/activity-logger'

export async function GET(request: NextRequest) {
  try {
    const { validateAuthFromRequest } = await import('@/lib/middleware-auth')
    const authResult = await validateAuthFromRequest(request)

    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user } = authResult

    const url = new URL(request.url)
    const status = url.searchParams.get('status') as CVStatus | null

    const whereClause: any = {}
    if (status) {
      whereClause.status = status
    }

    const cvs = await db.cV.findMany({
      where: whereClause,
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
        contract: true, // Include contract data
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ cvs })
  } catch (error) {
    console.error('Error fetching CVs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch CVs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { validateAuthFromRequest } = await import('@/lib/middleware-auth')
    const authResult = await validateAuthFromRequest(request)

    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user } = authResult

    const body = await request.json()
    const {
      // Basic Information
      fullName,
      fullNameArabic,
      email,
      phone,

      // Employment Details
      monthlySalary,
      contractPeriod,
      position,

      // Passport Information
      passportNumber,
      passportIssueDate,
      passportExpiryDate,
      passportIssuePlace,

      // Personal Information
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

      // Languages and Education
      englishLevel,
      arabicLevel,

      // Skills and Experiences
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

      // Previous Employment
      previousEmployment,

      // Profile Image
      profileImage,

      // Legacy fields for backward compatibility
      experience,
      education,
      skills,
      summary,
      content,
      notes,
      attachments,

      // System fields
      priority = Priority.MEDIUM,
    } = body

    if (!fullName) {
      return NextResponse.json(
        { error: 'Full name is required' },
        { status: 400 }
      )
    }

    const cv = await db.cV.create({
      data: {
        // Basic Information
        fullName,
        fullNameArabic,
        email,
        phone,

        // Employment Details
        monthlySalary,
        contractPeriod,
        position,

        // Passport Information
        passportNumber,
        passportIssueDate,
        passportExpiryDate,
        passportIssuePlace,

        // Personal Information
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

        // Languages and Education
        englishLevel,
        arabicLevel,

        // Skills and Experiences
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

        // Previous Employment
        previousEmployment,

        // Profile Image
        profileImage,

        // Legacy fields
        experience,
        education,
        skills,
        summary,
        content,
        notes,
        attachments,

        // System fields
        priority,
        source: 'Manual',
        status: CVStatus.NEW,
        createdById: user.id,
        updatedById: user.id,
      },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    // Generate a unique reference code
    const newReferenceCode = `EA-${String(cv.id).slice(-6).toUpperCase()}`;

    // Update the CV with the new reference code
    const updatedCv = await db.cV.update({
      where: { id: cv.id },
      data: { referenceCode: newReferenceCode },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Log activity
    await CVActivityLogger.created(user.id, updatedCv.id, fullName, 'Manual')

    return NextResponse.json({ cv: updatedCv }, { status: 201 })
  } catch (error) {
    console.error('Error creating CV:', error)
    return NextResponse.json(
      { error: 'Failed to create CV' },
      { status: 500 }
    )
  }
}
