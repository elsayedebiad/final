'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { CVStatus, Priority } from '@prisma/client'
import { 
  UserX, 
  Search, 
  User, 
  Phone, 
  Mail, 
  Calendar,
  Edit,
  Download,
  ArrowLeft,
  RefreshCw,
  UserCheck
} from 'lucide-react'

interface CV {
  id: string
  fullName: string
  email?: string
  phone?: string
  position?: string
  experience?: string
  status: CVStatus
  priority: Priority
  createdAt: string
  updatedAt: string
  createdBy: {
    name: string
    email: string
  }
}

export default function ReturnedCVsPage() {
  const router = useRouter()
  const [cvs, setCvs] = useState<CV[]>([])
  const [filteredCvs, setFilteredCvs] = useState<CV[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchReturnedCVs()
  }, [])

  useEffect(() => {
    filterCVs()
  }, [cvs, searchTerm])

  const fetchReturnedCVs = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/cvs?status=RETURNED', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCvs(data.cvs || [])
      } else {
        toast.error('فشل في تحميل السير الذاتية المعادة')
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تحميل البيانات')
    } finally {
      setIsLoading(false)
    }
  }

  const filterCVs = () => {
    let filtered = cvs

    if (searchTerm) {
      filtered = filtered.filter(cv =>
        cv.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cv.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cv.phone?.includes(searchTerm) ||
        cv.position?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredCvs(filtered)
  }

  const handleStatusChange = async (cvId: string, newStatus: CVStatus) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch(`/api/cvs/${cvId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast.success('تم تحديث الحالة بنجاح')
        fetchReturnedCVs()
      } else {
        toast.error('فشل في تحديث الحالة')
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تحديث الحالة')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="ml-4 p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <UserX className="h-8 w-8 text-orange-600 ml-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">السير الذاتية المعادة</h1>
                <p className="text-sm text-gray-600">المرشحون الذين تم إعادتهم</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="البحث في السير الذاتية المعادة..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              dir="rtl"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCvs.map((cv) => (
            <div key={cv.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border-l-4 border-orange-500">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <UserX className="h-5 w-5 text-orange-600 ml-2" />
                      <h3 className="text-lg font-semibold text-gray-900">{cv.fullName}</h3>
                    </div>
                    {cv.position && (
                      <p className="text-sm text-gray-600 mb-2">{cv.position}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {cv.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 ml-2" />
                      {cv.email}
                    </div>
                  )}
                  {cv.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 ml-2" />
                      {cv.phone}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => router.push(`/dashboard/cv/${cv.id}`)}
                      className="text-indigo-600 hover:text-indigo-800 transition-colors"
                      title="عرض التفاصيل"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleStatusChange(cv.id, CVStatus.BOOKED)}
                      className="text-yellow-600 hover:text-yellow-800 transition-colors"
                      title="إعادة الحجز"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleStatusChange(cv.id, CVStatus.HIRED)}
                      className="text-green-600 hover:text-green-800 transition-colors"
                      title="إعادة التعاقد"
                    >
                      <UserCheck className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                    معاد
                  </div>
                </div>

                <div className="mt-3 text-xs text-gray-500">
                  تاريخ الإعادة: {new Date(cv.updatedAt).toLocaleDateString('ar-SA')}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCvs.length === 0 && (
          <div className="text-center py-12">
            <UserX className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد سير ذاتية معادة</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'لا توجد نتائج تطابق البحث' : 'لم يتم إعادة أي مرشحين بعد'}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
