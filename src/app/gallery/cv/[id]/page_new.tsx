'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { ArrowLeft, Download, MessageCircle, Eye } from 'lucide-react'
import AlqaeidTemplate from '../../../dashboard/cv/[id]/alqaeid-template'

// استخدام نفس interface من القالب الأصلي
interface CV { 
  id: string;
  fullName: string;
  fullNameArabic?: string;
  email?: string;
  phone?: string;
  referenceCode?: string;
  position?: string;
  nationality?: string;
  religion?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  livingTown?: string;
  maritalStatus?: string;
  numberOfChildren?: number;
  weight?: string;
  height?: string;
  age?: number;
  arabicLevel?: string;
  englishLevel?: string;
  passportNumber?: string;
  passportIssueDate?: string;
  passportExpiryDate?: string;
  passportIssuePlace?: string;
  babySitting?: string;
  childrenCare?: string;
  cleaning?: string;
  washing?: string;
  ironing?: string;
  arabicCooking?: string;
  sewing?: string;
  driving?: string;
  previousEmployment?: string;
  profileImage?: string;
}

export default function PublicCvPage() {
  const router = useRouter()
  const params = useParams()
  const [cv, setCv] = useState<CV | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const whatsappNumber = '+201065201900'

  // التحقق من حالة تسجيل الدخول
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const response = await fetch('/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          if (response.ok) {
            setIsLoggedIn(true)
          }
        } catch (error) {
          console.error('Error verifying token:', error)
        }
      }
    }
    checkAuthStatus()
  }, [])

  // تحميل بيانات السيرة الذاتية
  useEffect(() => {
    const fetchCV = async () => {
      try {
        const response = await fetch(`/api/gallery/cv/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setCv(data)
        } else {
          toast.error('لم يتم العثور على السيرة الذاتية')
          router.push('/gallery')
        }
      } catch (error) {
        console.error('Error fetching CV:', error)
        toast.error('حدث خطأ في تحميل السيرة الذاتية')
        router.push('/gallery')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchCV()
    }
  }, [params.id, router])

  // دالة إرسال رسالة واتساب
  const sendWhatsAppMessage = () => {
    if (!cv) return
    
    const message = `مرحباً، أريد الاستفسار عن السيرة الذاتية:\n\nالاسم: ${cv.fullName}\nرقم المرجع: ${cv.referenceCode || cv.id}\nالمنصب: ${cv.position || 'غير محدد'}\n\nشكراً لكم`
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodedMessage}`
    window.open(whatsappUrl, '_blank')
  }

  // دالة تحميل السيرة الذاتية
  const downloadCV = async () => {
    if (!cv || isDownloading) return
    
    setIsDownloading(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      
      // البحث عن عنصر القالب
      const element = document.querySelector('.alqaeid-template')
      if (!element) {
        toast.error('لم يتم العثور على القالب')
        return
      }

      // إنشاء صورة من القالب
      const canvas = await html2canvas(element as HTMLElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123
      })

      // تحويل إلى صورة وتحميلها
      const link = document.createElement('a')
      link.download = `CV_${cv.fullName}_${cv.referenceCode || cv.id}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      
      toast.success('تم تحميل السيرة الذاتية بنجاح')
    } catch (error) {
      console.error('Error downloading CV:', error)
      toast.error('حدث خطأ أثناء تحميل السيرة الذاتية')
    } finally {
      setIsDownloading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل السيرة الذاتية...</p>
        </div>
      </div>
    )
  }

  if (!cv) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">لم يتم العثور على السيرة الذاتية</p>
          <button
            onClick={() => router.push('/gallery')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            العودة للمعرض
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* شريط التنقل */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/gallery')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">العودة للمعرض</span>
            </button>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={sendWhatsAppMessage}
                className="flex items-center gap-2 bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
              >
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">تواصل معنا</span>
              </button>
              
              <button
                onClick={downloadCV}
                disabled={isDownloading}
                className="flex items-center gap-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
              >
                {isDownloading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span className="hidden sm:inline">جاري التحميل...</span>
                  </>
                ) : (
                  <>
                    <div className="bg-white/20 p-1 rounded-full flex-shrink-0">
                      <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <span className="text-base sm:text-lg">تحميل السيرة</span>
                    <div className="bg-white/10 px-2 py-1 rounded-full text-xs font-medium hidden sm:block">
                      PNG
                    </div>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* قالب القعيد - متجاوب */}
      <div className="cv-container px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="max-w-6xl mx-auto">
          <AlqaeidTemplate cv={cv} />
        </div>
      </div>

      {/* إشعارات متجاوبة */}
      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 pb-6 sm:pb-8 space-y-3 sm:space-y-4">
        {/* إشعار التحميل */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="bg-blue-100 rounded-lg p-2 flex-shrink-0">
              <Download className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-blue-900 text-sm sm:text-base">تحميل السيرة الذاتية</h3>
              <p className="text-xs sm:text-sm text-blue-700 mt-1">
                يمكنك تحميل السيرة الذاتية كصورة PNG مع العلامة المائية للشركة
              </p>
            </div>
          </div>
        </div>

        {/* إشعار المعلومات المخفية - للمستخدمين غير المسجلين */}
        {!isLoggedIn && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="bg-yellow-100 rounded-lg p-2 flex-shrink-0">
                <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-yellow-900 text-sm sm:text-base">معلومات مخفية</h3>
                <p className="text-xs sm:text-sm text-yellow-700 mt-1">
                  بعض المعلومات الحساسة مثل رقم الهاتف مخفية. سجل دخول لعرض جميع التفاصيل.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* إشعار التواصل */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="bg-green-100 rounded-lg p-2 flex-shrink-0">
              <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-green-900 text-sm sm:text-base">التواصل والحجز</h3>
              <p className="text-xs sm:text-sm text-green-700 mt-1">
                للاستفسار أو الحجز، يمكنك التواصل معنا مباشرة عبر واتساب
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
