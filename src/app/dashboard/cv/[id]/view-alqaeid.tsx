'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'react-hot-toast'
import AlqaeidTemplate from './alqaeid-template'
import { ArrowLeft, Download, Edit, Printer, FileText } from 'lucide-react'

export default function ViewAlqaeidCV() {
  const router = useRouter()
  const params = useParams()
  interface CV {
  id: string;
  fullName: string;
  // Add other CV fields as needed
}

const [cv, setCv] = useState<CV | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchCV(params.id as string)
    }
  }, [params.id])

  const fetchCV = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch(`/api/cvs/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCv(data.cv)
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
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = () => {
    window.open(`/api/cvs/${params.id}/export-alqaeid`, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
            
            <div className="flex items-center space-x-4">
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
            </div>
          </div>
        </div>
      </div>

      {/* CV Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <AlqaeidTemplate cv={cv} />
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
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

