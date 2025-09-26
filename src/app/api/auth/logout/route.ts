import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      await AuthService.logout(token)
    }

    return NextResponse.json({ message: 'تم تسجيل الخروج بنجاح' })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ message: 'تم تسجيل الخروج بنجاح' }) // Always return success for logout
  }
}

