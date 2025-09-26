'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { 
  Shield, 
  Key, 
  AlertTriangle, 
  CheckCircle,
  ArrowLeft,
  Lock
} from 'lucide-react'

const VALID_CODES = ['30211241501596', '24112002', '2592012']
const MAX_ATTEMPTS = 3

export default function ActivationPage() {
  const router = useRouter()
  const [activationCode, setActivationCode] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)

  useEffect(() => {
    // التحقق من حالة التفعيل والمحاولات المحفوظة
    const savedAttempts = localStorage.getItem('activation_attempts')
    const lastAttemptTime = localStorage.getItem('last_attempt_time')
    const isActivated = localStorage.getItem('system_activated')

    if (isActivated === 'true') {
      router.push('/dashboard')
      return
    }

    if (savedAttempts) {
      const attemptCount = parseInt(savedAttempts)
      setAttempts(attemptCount)
      
      if (attemptCount >= MAX_ATTEMPTS) {
        const lastTime = lastAttemptTime ? parseInt(lastAttemptTime) : 0
        const currentTime = Date.now()
        const timeDiff = currentTime - lastTime
        const oneHour = 60 * 60 * 1000 // ساعة واحدة بالميلي ثانية
        
        if (timeDiff < oneHour) {
          setIsBlocked(true)
        } else {
          // إعادة تعيين المحاولات بعد ساعة
          localStorage.removeItem('activation_attempts')
          localStorage.removeItem('last_attempt_time')
          setAttempts(0)
        }
      }
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isBlocked) {
      toast.error('تم حظر النظام مؤقتاً. حاول مرة أخرى بعد ساعة.')
      return
    }

    if (!activationCode.trim()) {
      toast.error('يرجى إدخال كود التفعيل')
      return
    }

    setIsLoading(true)

    try {
      // محاكاة تأخير الشبكة
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (VALID_CODES.includes(activationCode.trim())) {
        // كود صحيح
        localStorage.setItem('system_activated', 'true')
        localStorage.removeItem('activation_attempts')
        localStorage.removeItem('last_attempt_time')
        
        toast.success('تم تفعيل النظام بنجاح!')
        
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      } else {
        // كود خاطئ
        const newAttempts = attempts + 1
        setAttempts(newAttempts)
        localStorage.setItem('activation_attempts', newAttempts.toString())
        localStorage.setItem('last_attempt_time', Date.now().toString())

        if (newAttempts >= MAX_ATTEMPTS) {
          setIsBlocked(true)
          toast.error('تم استنفاد المحاولات المسموحة. سيتم إعادة توجيهك لتسجيل الدخول.')
          
          setTimeout(() => {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            router.push('/login')
          }, 3000)
        } else {
          const remainingAttempts = MAX_ATTEMPTS - newAttempts
          toast.error(`كود التفعيل غير صحيح. المحاولات المتبقية: ${remainingAttempts}`)
        }
        
        setActivationCode('')
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء التحقق من كود التفعيل')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToLogin = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const remainingAttempts = MAX_ATTEMPTS - attempts

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
            تفعيل النظام
          </h1>
          <p className="text-gray-600">
            يرجى إدخال كود التفعيل للمتابعة
          </p>
        </div>

        {/* Activation Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {!isBlocked ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Key className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-800 mb-1">تعليمات التفعيل</h3>
                    <p className="text-blue-700 text-sm">
                      اطلب من المهندس السيد عبيد كود التفعيل
                    </p>
                    <p className="text-blue-600 text-xs mt-1">
                      المحاولات المتبقية: {remainingAttempts}
                    </p>
                  </div>
                </div>
              </div>

              {/* Activation Code Input */}
              <div>
                <label htmlFor="activationCode" className="block text-sm font-medium text-gray-700 mb-2">
                  كود التفعيل
                </label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="activationCode"
                    value={activationCode}
                    onChange={(e) => setActivationCode(e.target.value)}
                    className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="أدخل كود التفعيل"
                    disabled={isLoading}
                    maxLength={20}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !activationCode.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:shadow-none"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    جاري التحقق...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    تفعيل النظام
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Blocked State */
            <div className="text-center space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h3 className="font-semibold text-red-800 mb-2">تم حظر النظام مؤقتاً</h3>
                <p className="text-red-700 text-sm mb-4">
                  تم استنفاد المحاولات المسموحة ({MAX_ATTEMPTS} محاولات)
                </p>
                <p className="text-red-600 text-xs">
                  يمكنك المحاولة مرة أخرى بعد ساعة واحدة
                </p>
              </div>
            </div>
          )}

          {/* Back to Login */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleBackToLogin}
              className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 transition-colors py-2"
            >
              <ArrowLeft className="h-4 w-4" />
              العودة لتسجيل الدخول
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            نظام إدارة السير الذاتية - الاسناد السريع
          </p>
        </div>
      </div>
    </div>
  )
}
