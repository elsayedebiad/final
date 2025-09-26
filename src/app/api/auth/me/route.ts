import { NextRequest, NextResponse } from 'next/server'
import { validateAuthFromRequest } from '@/lib/middleware-auth'

export async function GET(request: NextRequest) {
  try {
    const authResult = await validateAuthFromRequest(request)
    
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      user: authResult.user
    })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
  }
}

