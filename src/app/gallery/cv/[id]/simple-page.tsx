'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { 
  ArrowLeft, 
  Download, 
  MessageCircle,
  User,
  Phone,
  Mail,
  Briefcase,
  DollarSign
} from 'lucide-react'

interface CV {
  id: string
  fullName: string
  fullNameArabic?: string
  nationality?: string
  position?: string
  age?: number
  profileImage?: string
  phone?: string
  email?: string
  referenceCode?: string
  maritalStatus?: string
  experience?: string
  skills?: string
  monthlySalary?: string
}

export default function SimpleCvPage() {
  const router = useRouter()
  const params = useParams()
  const [cv, setCv] = useState<CV | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)

  const whatsappNumber = '+201065201900'

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
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        toast.dismiss()
        toast.error('فشل في إنشاء الصورة')
        return
      }

      // أبعاد A4
      canvas.width = 1200
      canvas.height = 1600

      // خلفية بيضاء
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // رسم الصورة الشخصية إذا كانت متوفرة
      if (cv.profileImage) {
        await new Promise<void>((resolve) => {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload = () => {
            const imgSize = 300
            const imgX = (canvas.width - imgSize) / 2
            const imgY = 50
            
            ctx.drawImage(img, imgX, imgY, imgSize, imgSize)
            resolve()
          }
          img.onerror = () => resolve()
          img.src = cv.profileImage!
        })
      }

      // إضافة معلومات السيرة الذاتية
      let yPos = cv.profileImage ? 400 : 100

      // العنوان الرئيسي
      ctx.fillStyle = '#1f2937'
      ctx.font = 'bold 36px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('السيرة الذاتية', canvas.width / 2, yPos)
      yPos += 60

      // الاسم
      if (cv.fullName) {
        ctx.font = 'bold 32px Arial'
        ctx.fillText(cv.fullName, canvas.width / 2, yPos)
        yPos += 40
      }

      if (cv.fullNameArabic && cv.fullNameArabic !== cv.fullName) {
        ctx.font = 'bold 28px Arial'
        ctx.fillText(cv.fullNameArabic, canvas.width / 2, yPos)
        yPos += 40
      }

      // المعلومات الأساسية
      ctx.font = '24px Arial'
      ctx.fillStyle = '#4b5563'
      ctx.textAlign = 'center'

      yPos += 40
      const info = []
      if (cv.position) info.push(`الوظيفة: ${cv.position}`)
      if (cv.nationality) info.push(`الجنسية: ${cv.nationality}`)
      if (cv.age) info.push(`العمر: ${cv.age} سنة`)
      if (cv.maritalStatus) info.push(`الحالة الاجتماعية: ${cv.maritalStatus}`)
      if (cv.phone) info.push(`الهاتف: ${cv.phone}`)
      if (cv.email) info.push(`البريد: ${cv.email}`)
      if (cv.experience) info.push(`الخبرة: ${cv.experience}`)
      if (cv.monthlySalary) info.push(`الراتب المطلوب: ${cv.monthlySalary}`)
      if (cv.referenceCode) info.push(`الرقم المرجعي: ${cv.referenceCode}`)

      info.forEach((text) => {
        ctx.fillText(text, canvas.width / 2, yPos)
        yPos += 35
      })

      // المهارات
      if (cv.skills) {
        yPos += 20
        ctx.font = 'bold 26px Arial'
        ctx.fillText('المهارات:', canvas.width / 2, yPos)
        yPos += 40
        
        ctx.font = '22px Arial'
        const skillsLines = cv.skills.split('\n')
        skillsLines.forEach(line => {
          ctx.fillText(line, canvas.width / 2, yPos)
          yPos += 30
        })
      }

      // إضافة الـ watermark
      const watermarkY = canvas.height - 100
      
      // خلفية شفافة للـ watermark
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.fillRect(0, watermarkY - 20, canvas.width, 80)
      
      // نص الـ watermark
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
      ctx.font = 'bold 24px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('الاسناد السريع - ALASNAD ALSARIE', canvas.width / 2, watermarkY + 10)
      
      ctx.font = '18px Arial'
      ctx.fillText('لخدمات العمالة المنزلية', canvas.width / 2, watermarkY + 35)

      // إضافة إطار
      ctx.strokeStyle = '#e5e7eb'
      ctx.lineWidth = 3
      ctx.strokeRect(0, 0, canvas.width, canvas.height)

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/gallery')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="bg-gradient-to-r from-blue-100 to-green-100 p-3 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  السيرة الذاتية
                </h1>
                <p className="text-gray-600">{cv.fullName}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
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
                    تحميل السيرة
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* CV Content */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {/* Profile Section */}
          <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-8">
            <div className="flex items-center gap-6">
              {cv.profileImage && (
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
                  <img
                    src={cv.profileImage}
                    alt={cv.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-2">{cv.fullName}</h2>
                {cv.fullNameArabic && cv.fullNameArabic !== cv.fullName && (
                  <p className="text-xl text-blue-100 mb-2">{cv.fullNameArabic}</p>
                )}
                <div className="flex items-center gap-4 text-blue-100">
                  {cv.nationality && <span>🏳️ {cv.nationality}</span>}
                  {cv.position && <span>💼 {cv.position}</span>}
                  {cv.age && <span>🎂 {cv.age} سنة</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  المعلومات الشخصية
                </h3>
                <div className="space-y-3">
                  {cv.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700">{cv.phone}</span>
                    </div>
                  )}
                  {cv.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700">{cv.email}</span>
                    </div>
                  )}
                  {cv.maritalStatus && (
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700">الحالة الاجتماعية: {cv.maritalStatus}</span>
                    </div>
                  )}
                  {cv.referenceCode && (
                    <div className="flex items-center gap-3">
                      <span className="text-gray-700">الرقم المرجعي: {cv.referenceCode}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Professional Information */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-green-600" />
                  المعلومات المهنية
                </h3>
                <div className="space-y-3">
                  {cv.experience && (
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700">الخبرة: {cv.experience}</span>
                    </div>
                  )}
                  {cv.monthlySalary && (
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700">الراتب المطلوب: {cv.monthlySalary}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Skills */}
            {cv.skills && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">المهارات</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{cv.skills}</p>
              </div>
            )}

            {/* Watermark Notice */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
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
      </div>
    </div>
  )
}
