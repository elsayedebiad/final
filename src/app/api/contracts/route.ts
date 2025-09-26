import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateAuthFromRequest } from '@/lib/middleware-auth'

export async function POST(request: NextRequest) {
  try {
    const authResult = await validateAuthFromRequest(request)
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { cvId, identityNumber } = body

    if (!cvId || !identityNumber) {
      return NextResponse.json(
        { error: 'CV ID and Identity Number are required' },
        { status: 400 }
      )
    }

    const contract = await db.contract.create({
      data: {
        cvId: Number(cvId),
        identityNumber: identityNumber,
        // You can add more fields here as needed, like contractStartDate, etc.
      },
    })

    return NextResponse.json({ contract }, { status: 201 })
  } catch (error) {
    console.error('Error creating contract:', error)
    return NextResponse.json(
      { error: 'Failed to create contract' },
      { status: 500 }
    )
  }
}
