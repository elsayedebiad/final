'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast, Toaster } from 'react-hot-toast'
import AlqaeidTemplate from '../alqaeid-template'
import { ArrowLeft, Download, Edit, Printer, FileText, Image } from 'lucide-react'
import { getCountryInfo, getCountryGradient } from '../../../../../lib/country-utils'

export default function AlqaeidCvPage() {
  const router = useRouter()
  const params = useParams()
  const [cv, setCv] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // تأمين id كسلسلة
  const rawId = (params as any)?.id
  const id = Array.isArray(rawId) ? rawId[0] : rawId

  useEffect(() => {
    let isMounted = true

    const fetchCV = async (cvId: string) => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          router.push('/login')
          return
        }

        const response = await fetch(`/api/cvs/${cvId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          const data = await response.json()
          if (isMounted) {
            setCv(data.cv)
            
            // التحقق من معاملة التحميل التلقائي
            const urlParams = new URLSearchParams(window.location.search)
            if (urlParams.get('download') === 'image') {
              // انتظار قصير للتأكد من اكتمال الرندر ثم تحميل الصورة
              setTimeout(() => {
                handleDownloadImage()
              }, 2000)
            }
          }
        } else if (response.status === 401) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          router.push('/login')
        } else {
          toast.error('فشل في تحميل السيرة الذاتية')
          router.push('/dashboard')
        }
      } catch (error) {
        toast.error('حدث خطأ أثناء تحميل البيانات')
        router.push('/dashboard')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    if (id) fetchCV(id)
    return () => { isMounted = false }
  }, [id, router])

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = () => {
    if (!id) return
    window.open(`/api/cvs/${id}/export-alqaeid`, '_blank', 'noopener,noreferrer')
  }

  /**
   * الحل: استخدام html-to-image أولاً لتفادي oklch،
   * ثم fallback إلى html2canvas لو حصل خطأ (بدون scale لتفادي تعارض الأنواع).
   */
  const handleDownloadImage = async () => {
    const toastId = toast.loading('جاري إنشاء الصورة...')
    try {
      const cvElement = document.querySelector('.cv-template') as HTMLElement | null
      if (!cvElement) {
        toast.error('لم يتم العثور على السيرة الذاتية', { id: toastId })
        return
      }

      // ثبّت الـlayout قبل الالتقاط
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))

      // 1) المحاولة الأساسية: html-to-image
      try {
        const { toPng } = await import('html-to-image')
        const dataUrl = await toPng(cvElement, {
          cacheBust: true,
          backgroundColor: '#ffffff',
          pixelRatio: 2, // جودة أعلى
          // تجاهل العناصر المخفية في الطباعة
          filter: (node) => {
            if (node instanceof HTMLElement && node.classList?.contains('print:hidden')) return false
            return true
          },
        })

        const link = document.createElement('a')
        link.download = `CV-${cv?.fullName || 'Unknown'}.png`
        link.href = dataUrl
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast.success('تم تحميل الصورة بنجاح', { id: toastId })
        return
      } catch {
        // لو html-to-image فشل لأي سبب، هنحاول html2canvas
      }

      // 2) محاولة احتياطية: html2canvas (بدون scale لتفادي خطأ الأنواع)
      try {
        const { default: html2canvas } = await import('html2canvas')
        const options: any = {
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: cvElement.scrollWidth,
          height: cvElement.scrollHeight,
          foreignObjectRendering: true,
          ignoreElements: (el: Element) =>
            (el as HTMLElement).classList?.contains('print:hidden'),
        }

        const canvas = await html2canvas(cvElement, options)

        const link = document.createElement('a')
        link.download = `CV-${cv?.fullName || 'Unknown'}.png`
        link.href = canvas.toDataURL('image/png')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast.success('تم تحميل الصورة بنجاح', { id: toastId })
      } catch (err) {
        console.error('Error downloading image (fallback):', err)
        toast.error('حدث خطأ أثناء تحميل الصورة', { id: toastId })
      }
    } catch (error) {
      console.error('Error downloading image:', error)
      toast.error('حدث خطأ أثناء تحميل الصورة', { id: toastId })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Toaster position="top-center" />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل السيرة الذاتية...</p>
        </div>
      </div>
    )
  }

  if (!cv) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Toaster position="top-center" />
        <div className="text-center">
          <p className="text-gray-600">السيرة الذاتية غير موجودة</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            العودة إلى لوحة التحكم
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />

      {/* Header - Hidden during print */}
      <div className="bg-white shadow-sm border-b print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center">
                <FileText className="h-6 w-6 text-purple-600 ml-3" />
                <h1 className="text-2xl font-bold text-gray-900">
                  {cv.fullName} - قالب القعيد
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/dashboard/cv/${cv.id}/edit`)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Edit className="h-4 w-4 ml-2" />
                تعديل
              </button>

              <button
                onClick={handlePrint}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Printer className="h-4 w-4 ml-2" />
                طباعة
              </button>

              <button
                onClick={handleDownloadPDF}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
              >
                <Download className="h-4 w-4 ml-2" />
                تحميل PDF
              </button>

              <button
                onClick={handleDownloadImage}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center"
              >
                <Image className="h-4 w-4 ml-2" />
                تحميل صورة
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CV Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden cv-template">
          <AlqaeidTemplate cv={cv} />
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page { size: A4; margin: 0; }
          body { margin: 0; }
          .print\\:hidden { display: none !important; }
          .bg-gray-50 { background: white !important; }
          .shadow-lg { box-shadow: none !important; }
          .rounded-lg { border-radius: 0 !important; }
        }
      `}</style>
    </div>
  )
}
