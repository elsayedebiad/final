'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { 
  ArrowLeft, 
  Download, 
  MessageCircle
} from 'lucide-react'
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
          const response = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          })
          if (response.ok) {
            const data = await response.json()
            setIsLoggedIn(true)
          } else {
            localStorage.removeItem('token')
            setIsLoggedIn(false)
          }
        } catch (error) {
          localStorage.removeItem('token')
          setIsLoggedIn(false)
        }
      } else {
        setIsLoggedIn(false)
      }
    }
    
    checkAuthStatus()
  }, [])

  useEffect(() => {
    if (params.id) {
      fetchCV(params.id as string)
    }
  }, [params.id])

  const fetchCV = async (id: string) => {
    try {
      const response = await fetch(`/api/gallery/cv/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch CV')
      }
      const data = await response.json()
      setCv(data)
    } catch (error) {
      toast.error('فشل في تحميل السيرة الذاتية')
      router.push('/gallery')
    } finally {
      setIsLoading(false)
    }
  }

  const sendWhatsAppMessage = () => {
    if (!cv) return

    const message = `مرحباً، أود الاستفسار عن السيرة الذاتية التالية:

👤 الاسم: ${cv.fullName}
${cv.fullNameArabic ? `📝 الاسم بالعربية: ${cv.fullNameArabic}` : ''}
🏳️ الجنسية: ${cv.nationality || 'غير محدد'}
💼 الوظيفة: ${cv.position || 'غير محدد'}
🎂 العمر: ${cv.age || 'غير محدد'}
📱 رقم الهاتف: ${cv.phone || 'غير محدد'}
🔢 الرقم المرجعي: ${cv.referenceCode || 'غير محدد'}

يرجى التواصل معي لإتمام عملية الحجز.`

    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`
    
    window.open(whatsappUrl, '_blank')
  }

  const downloadCvWithWatermark = async () => {
    if (!cv) return

    setIsDownloading(true)
    toast.loading('جاري إنشاء السيرة الذاتية مع العلامة المائية...')

    try {
      // استخدام html2canvas لتحويل القالب إلى صورة
      const html2canvas = (await import('html2canvas')).default
      const cvElement = document.querySelector('.cv-container')
      
      if (!cvElement) {
        toast.dismiss()
        toast.error('فشل في العثور على عنصر السيرة الذاتية')
        return
      }

      const canvas = await html2canvas(cvElement as HTMLElement, {
        width: 1200,
        height: 1600,
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      })

      // إضافة الـ watermark في أماكن متعددة خلف البيانات
      const ctx = canvas.getContext('2d')
      if (ctx) {
        // حفظ الحالة الحالية
        ctx.save()
        
        // إعدادات الـ watermark
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)' // شفافية أكثر
        ctx.font = 'bold 48px Arial'
        ctx.textAlign = 'center'
        
        // تدوير النص قليلاً
        const angle = -15 * Math.PI / 180 // -15 درجة
        
        // إضافة watermarks في مواقع متعددة
        const watermarkText = 'الاسناد السريع'
        const watermarkTextEn = 'ALASNAD ALSARIE'
        
        // الموقع الأول - وسط الصفحة
        ctx.save()
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.rotate(angle)
        ctx.fillText(watermarkText, 0, -20)
        ctx.fillText(watermarkTextEn, 0, 40)
        ctx.restore()
        
        // الموقع الثاني - الربع الأول
        ctx.save()
        ctx.translate(canvas.width / 4, canvas.height / 3)
        ctx.rotate(angle)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.06)'
        ctx.font = 'bold 36px Arial'
        ctx.fillText(watermarkText, 0, 0)
        ctx.restore()
        
        // الموقع الثالث - الربع الثالث
        ctx.save()
        ctx.translate(3 * canvas.width / 4, 2 * canvas.height / 3)
        ctx.rotate(angle)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.06)'
        ctx.font = 'bold 36px Arial'
        ctx.fillText(watermarkText, 0, 0)
        ctx.restore()
        
        // الموقع الرابع - أعلى يمين
        ctx.save()
        ctx.translate(3 * canvas.width / 4, canvas.height / 4)
        ctx.rotate(angle)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
        ctx.font = 'bold 32px Arial'
        ctx.fillText('ALASNAD', 0, 0)
        ctx.restore()
        
        // الموقع الخامس - أسفل يسار
        ctx.save()
        ctx.translate(canvas.width / 4, 3 * canvas.height / 4)
        ctx.rotate(angle)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
        ctx.font = 'bold 32px Arial'
        ctx.fillText('ALSARIE', 0, 0)
        ctx.restore()
        
        // watermark صغير في الأسفل (كما كان)
        ctx.restore()
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
        ctx.font = 'bold 16px Arial'
        ctx.textAlign = 'center'
        const footerY = canvas.height - 30
        ctx.fillText('الاسناد السريع - ALASNAD ALSARIE - لخدمات العمالة المنزلية', canvas.width / 2, footerY)
      }

      // تحميل الصورة
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `CV_${cv.fullName || cv.referenceCode || 'unknown'}_AlasnadAlsarie.png`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
          
          toast.dismiss()
          toast.success('تم تحميل السيرة الذاتية بنجاح')
        } else {
          toast.dismiss()
          toast.error('فشل في إنشاء الصورة')
        }
      }, 'image/png', 0.95)

    } catch (error) {
      toast.dismiss()
      toast.error('حدث خطأ أثناء إنشاء السيرة الذاتية')
    } finally {
      setIsDownloading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل السيرة الذاتية...</p>
        </div>
      </div>
    )
  }

  if (!cv) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">السيرة الذاتية غير موجودة</h2>
          <button
            onClick={() => router.push('/gallery')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            العودة للمعرض
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header مع أزرار التحكم */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/gallery')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="العودة للمعرض"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">
                  السيرة الذاتية - {cv.fullName}
                </h1>
                <p className="text-sm text-gray-600">
                  {cv.position} • {cv.nationality}
                  {isLoggedIn && <span className="text-green-600 font-medium"> • مسجل دخول</span>}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {isLoggedIn && (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  الداشبورد
                </button>
              )}
              <button
                onClick={sendWhatsAppMessage}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                حجز عبر واتساب
              </button>
              <button
                onClick={downloadCvWithWatermark}
                disabled={isDownloading}
                className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                {isDownloading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    جاري التحميل...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    تحميل مع العلامة المائية
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* قالب القعيد */}
      <div className="cv-container">
        <AlqaeidTemplate cv={cv} />
      </div>

      {/* إشعار العلامة المائية */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-lg p-2">
              <Download className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-800">تحميل السيرة الذاتية</h4>
              <p className="text-blue-700 text-sm">
                عند تحميل السيرة الذاتية، ستحتوي على العلامة المائية لشركة الاسناد السريع
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
