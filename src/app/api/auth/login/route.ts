import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { UserActivityLogger } from '@/lib/activity-logger'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني وكلمة المرور مطلوبان' },
        { status: 400 }
      )
    }

    // Login user
    const loginResult = await AuthService.login(email, password)

    // Log login activity
    try {
      await UserActivityLogger.login(loginResult.user.id)
    } catch (error) {
      console.error('Failed to log login activity:', error)
      // Don't fail the login if activity logging fails
    }

    return NextResponse.json({
      message: 'تم تسجيل الدخول بنجاح',
      user: loginResult.user,
      token: loginResult.token,
      session: loginResult.session
    })

  } catch (error) {
    console.error('Login error:', error)
    
    if (error instanceof Error) {
      if (error.message === 'Invalid credentials') {
        return NextResponse.json(
          { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
          { status: 401 }
        )
      }
      if (error.message === 'Account is deactivated') {
        return NextResponse.json(
          { error: 'الحساب معطل، يرجى الاتصال بالمدير' },
          { status: 403 }
        )
      }
    }

    return NextResponse.json(
      { error: 'حدث خطأ في تسجيل الدخول' },
      { status: 500 }
    )
  }
}
