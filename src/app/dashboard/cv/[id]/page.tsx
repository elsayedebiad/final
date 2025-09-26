'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { CVStatus, Priority, Role } from '@prisma/client'
import { 
  ArrowLeft, 
  Save, 
  FileText, 
  User, 
  Mail, 
  Phone, 
  Briefcase,
  Calendar,
  GraduationCap,
  Award,
  FileEdit,
  Clock,
  Trash2
} from 'lucide-react'
import RichTextEditor from '@/components/RichTextEditor'

interface CV {
  id: string
  fullName: string
  fullNameArabic?: string
  email?: string
  phone?: string
  referenceCode?: string
  
  // Employment Details
  monthlySalary?: string
  contractPeriod?: string
  position?: string
  
  // Passport Information
  passportNumber?: string
  passportIssueDate?: string
  passportExpiryDate?: string
  passportIssuePlace?: string
  
  // Personal Information
  nationality?: string
  religion?: string
  dateOfBirth?: string
  placeOfBirth?: string
  livingTown?: string
  maritalStatus?: string
  numberOfChildren?: number
  weight?: string
  height?: string
  complexion?: string
  age?: number
  
  // Languages and Education
  englishLevel?: string
  arabicLevel?: string
  
  // Skills and Experiences
  babySitting?: string
  childrenCare?: string
  tutoring?: string
  disabledCare?: string
  cleaning?: string
  washing?: string
  ironing?: string
  arabicCooking?: string
  sewing?: string
  driving?: string
  
  // Previous Employment
  previousEmployment?: string
  
  // Profile Image
  profileImage?: string
  
  // Legacy fields
  experience?: string
  education?: string
  skills?: string
  summary?: string
  content?: string
  notes?: string
  attachments?: string
  
  // System fields
  status: CVStatus
  priority: Priority
  source?: string
  createdAt: string
  updatedAt: string
  createdBy: {
    name: string
    email: string
  }
  updatedBy?: {
    name: string
    email: string
  }
  versions?: Array<{
    id: string
    version: number
    createdAt: string
  }>
}

interface User {
  id: string
  email: string
  name: string
  role: Role
}

export default function CVDetailPage() {
  const router = useRouter()
  const params = useParams()
  const cvId = params.id as string

  const [user, setUser] = useState<User | null>(null)
  const [cv, setCv] = useState<CV | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    fullNameArabic: '',
    email: '',
    phone: '',
    referenceCode: '',
    monthlySalary: '',
    contractPeriod: '',
    position: '',
    passportNumber: '',
    passportIssueDate: '',
    passportExpiryDate: '',
    passportIssuePlace: '',
    nationality: '',
    religion: '',
    dateOfBirth: '',
    placeOfBirth: '',
    livingTown: '',
    maritalStatus: '',
    numberOfChildren: 0,
    weight: '',
    height: '',
    complexion: '',
    age: 0,
    englishLevel: '',
    arabicLevel: '',
    babySitting: '',
    childrenCare: '',
    tutoring: '',
    disabledCare: '',
    cleaning: '',
    washing: '',
    ironing: '',
    arabicCooking: '',
    sewing: '',
    driving: '',
    previousEmployment: '',
    profileImage: '',
    experience: '',
    education: '',
    skills: '',
    summary: '',
    status: CVStatus.NEW,
    priority: Priority.MEDIUM,
    notes: '',
  })
  const [content, setContent] = useState('')

  useEffect(() => {
    checkAuth()
    if (cvId) {
      fetchCV()
    }
  }, [cvId])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
      }
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    }
  };

  const fetchCV = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch(`/api/cvs/${cvId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setCv(data.cv)
        setContent(data.cv.content || '')
        setFormData({
          fullName: data.cv.fullName || '',
          fullNameArabic: data.cv.fullNameArabic || '',
          email: data.cv.email || '',
          phone: data.cv.phone || '',
          referenceCode: data.cv.referenceCode || '',
          monthlySalary: data.cv.monthlySalary || '',
          contractPeriod: data.cv.contractPeriod || '',
          position: data.cv.position || '',
          passportNumber: data.cv.passportNumber || '',
          passportIssueDate: data.cv.passportIssueDate || '',
          passportExpiryDate: data.cv.passportExpiryDate || '',
          passportIssuePlace: data.cv.passportIssuePlace || '',
          nationality: data.cv.nationality || '',
          religion: data.cv.religion || '',
          dateOfBirth: data.cv.dateOfBirth || '',
          placeOfBirth: data.cv.placeOfBirth || '',
          livingTown: data.cv.livingTown || '',
          maritalStatus: data.cv.maritalStatus || '',
          numberOfChildren: data.cv.numberOfChildren || 0,
          weight: data.cv.weight || '',
          height: data.cv.height || '',
          complexion: data.cv.complexion || '',
          age: data.cv.age || 0,
          englishLevel: data.cv.englishLevel || '',
          arabicLevel: data.cv.arabicLevel || '',
          babySitting: data.cv.babySitting || '',
          childrenCare: data.cv.childrenCare || '',
          tutoring: data.cv.tutoring || '',
          disabledCare: data.cv.disabledCare || '',
          cleaning: data.cv.cleaning || '',
          washing: data.cv.washing || '',
          ironing: data.cv.ironing || '',
          arabicCooking: data.cv.arabicCooking || '',
          sewing: data.cv.sewing || '',
          driving: data.cv.driving || '',
          previousEmployment: data.cv.previousEmployment || '',
          profileImage: data.cv.profileImage || '',
          experience: data.cv.experience || '',
          education: data.cv.education || '',
          skills: data.cv.skills || '',
          summary: data.cv.summary || '',
          status: data.cv.status,
          priority: data.cv.priority,
          notes: data.cv.notes || '',
        })
      } else {
        toast.error('فشل في تحميل السيرة الذاتية')
        router.push('/dashboard')
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تحميل البيانات')
      router.push('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!cv) return

    setIsSaving(true)
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
        body: JSON.stringify({
          ...formData,
          content,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setCv(data.cv)
        setIsEditing(false)
        toast.success('تم حفظ التغييرات بنجاح')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'فشل في حفظ التغييرات')
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء الحفظ')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!cv || !confirm('هل أنت متأكد من حذف هذه السيرة الذاتية؟')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch(`/api/cvs/${cvId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast.success('تم حذف السيرة الذاتية بنجاح')
        router.push('/dashboard')
      } else {
        toast.error('فشل في حذف السيرة الذاتية')
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء الحذف')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const getStatusColor = (status: CVStatus) => {
    switch (status) {
      case CVStatus.NEW:
        return 'bg-blue-100 text-blue-800'
      case CVStatus.BOOKED:
        return 'bg-yellow-100 text-yellow-800'
      case CVStatus.HIRED:
        return 'bg-green-100 text-green-800'
      case CVStatus.REJECTED:
        return 'bg-red-100 text-red-800'
      case CVStatus.RETURNED:
        return 'bg-orange-100 text-orange-800'
      case CVStatus.ARCHIVED:
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: CVStatus) => {
    switch (status) {
      case CVStatus.NEW:
        return 'جديد'
      case CVStatus.BOOKED:
        return 'محجوز'
      case CVStatus.HIRED:
        return 'متعاقد'
      case CVStatus.REJECTED:
        return 'مرفوض'
      case CVStatus.RETURNED:
        return 'معاد'
      case CVStatus.ARCHIVED:
        return 'مؤرشف'
      default:
        return status
    }
  }

  const getPriorityText = (priority: Priority) => {
    switch (priority) {
      case Priority.LOW:
        return 'منخفضة'
      case Priority.MEDIUM:
        return 'متوسطة'
      case Priority.HIGH:
        return 'عالية'
      case Priority.URGENT:
        return 'عاجلة'
      default:
        return priority
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!cv) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">السيرة الذاتية غير موجودة</h2>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 text-indigo-600 hover:text-indigo-800"
          >
            العودة للوحة التحكم
          </button>
        </div>
      </div>
    )
  }

  const canEdit = user && (user.role === Role.ADMIN || user.role === Role.SUB_ADMIN)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="ml-4 p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <FileText className="h-6 w-6 text-indigo-600 ml-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{cv.fullName}</h1>
                <p className="text-sm text-gray-500">{cv.position}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(cv.status)}`}>
                {getStatusText(cv.status)}
              </span>
              {canEdit && (
                <div className="flex items-center space-x-2">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <FileEdit className="h-4 w-4 ml-1" />
                      تعديل
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        إلغاء
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                      >
                        <Save className="h-4 w-4 ml-1" />
                        {isSaving ? 'جاري الحفظ...' : 'حفظ'}
                      </button>
                    </>
                  )}
                  <button
                    onClick={handleDelete}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4 ml-1" />
                    حذف
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Personal Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <h3 className="text-lg font-medium text-gray-900">المعلومات الشخصية</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      dir="rtl"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <User className="h-4 w-4 text-gray-400 ml-2" />
                      {cv.fullName}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      dir="rtl"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <Mail className="h-4 w-4 text-gray-400 ml-2" />
                      {cv.email || 'غير محدد'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      dir="rtl"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <Phone className="h-4 w-4 text-gray-400 ml-2" />
                      {cv.phone || 'غير محدد'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الاسم بالعربية</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="fullNameArabic"
                      value={formData.fullNameArabic}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      dir="rtl"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <User className="h-4 w-4 text-gray-400 ml-2" />
                      {cv.fullNameArabic || 'غير محدد'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">كود المرجع</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="referenceCode"
                      value={formData.referenceCode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      dir="rtl"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <FileText className="h-4 w-4 text-gray-400 ml-2" />
                      {cv.referenceCode || 'غير محدد'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الراتب الشهري</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="monthlySalary"
                      value={formData.monthlySalary}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      dir="rtl"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <span className="text-gray-400 ml-2">$</span>
                      {cv.monthlySalary || 'غير محدد'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">مدة العقد</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="contractPeriod"
                      value={formData.contractPeriod}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      dir="rtl"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <Clock className="h-4 w-4 text-gray-400 ml-2" />
                      {cv.contractPeriod || 'غير محدد'}
                    </div>
                  )}
                </div>

                {/* Passport Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رقم الجواز</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="passportNumber"
                      value={formData.passportNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      dir="rtl"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      {cv.passportNumber || 'غير محدد'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ إصدار الجواز</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="passportIssueDate"
                      value={formData.passportIssueDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      dir="rtl"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      {cv.passportIssueDate || 'غير محدد'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ انتهاء الجواز</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="passportExpiryDate"
                      value={formData.passportExpiryDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      dir="rtl"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      {cv.passportExpiryDate || 'غير محدد'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">مكان إصدار الجواز</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="passportIssuePlace"
                      value={formData.passportIssuePlace}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      dir="rtl"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      {cv.passportIssuePlace || 'غير محدد'}
                    </div>
                  )}
                </div>

                {/* More Personal Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الجنسية</label>
                  {isEditing ? (
                    <input type="text" name="nationality" value={formData.nationality} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  ) : (
                    <div className="flex items-center text-gray-900">{cv.nationality || 'غير محدد'}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الديانة</label>
                  {isEditing ? (
                    <input type="text" name="religion" value={formData.religion} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  ) : (
                    <div className="flex items-center text-gray-900">{cv.religion || 'غير محدد'}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الميلاد</label>
                  {isEditing ? (
                    <input type="text" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  ) : (
                    <div className="flex items-center text-gray-900">{cv.dateOfBirth || 'غير محدد'}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">مكان الميلاد</label>
                  {isEditing ? (
                    <input type="text" name="placeOfBirth" value={formData.placeOfBirth} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  ) : (
                    <div className="flex items-center text-gray-900">{cv.placeOfBirth || 'غير محدد'}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">مكان السكن</label>
                  {isEditing ? (
                    <input type="text" name="livingTown" value={formData.livingTown} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  ) : (
                    <div className="flex items-center text-gray-900">{cv.livingTown || 'غير محدد'}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الحالة الاجتماعية</label>
                  {isEditing ? (
                    <input type="text" name="maritalStatus" value={formData.maritalStatus} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  ) : (
                    <div className="flex items-center text-gray-900">{cv.maritalStatus || 'غير محدد'}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">عدد الأطفال</label>
                  {isEditing ? (
                    <input type="number" name="numberOfChildren" value={formData.numberOfChildren} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  ) : (
                    <div className="flex items-center text-gray-900">{cv.numberOfChildren}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الوزن</label>
                  {isEditing ? (
                    <input type="text" name="weight" value={formData.weight} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  ) : (
                    <div className="flex items-center text-gray-900">{cv.weight || 'غير محدد'}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الطول</label>
                  {isEditing ? (
                    <input type="text" name="height" value={formData.height} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  ) : (
                    <div className="flex items-center text-gray-900">{cv.height || 'غير محدد'}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">لون البشرة</label>
                  {isEditing ? (
                    <input type="text" name="complexion" value={formData.complexion} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  ) : (
                    <div className="flex items-center text-gray-900">{cv.complexion || 'غير محدد'}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">العمر</label>
                  {isEditing ? (
                    <input type="number" name="age" value={formData.age} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  ) : (
                    <div className="flex items-center text-gray-900">{cv.age}</div>
                  )}
                </div>

                {/* Language and Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">مستوى الإنجليزية</label>
                  {isEditing ? (
                    <input type="text" name="englishLevel" value={formData.englishLevel} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  ) : (
                    <div className="flex items-center text-gray-900">{cv.englishLevel || 'غير محدد'}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">مستوى العربية</label>
                  {isEditing ? (
                    <input type="text" name="arabicLevel" value={formData.arabicLevel} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  ) : (
                    <div className="flex items-center text-gray-900">{cv.arabicLevel || 'غير محدد'}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">عناية الرضع</label>
                  {isEditing ? (
                    <input type="text" name="babySitting" value={formData.babySitting} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  ) : (
                    <div className="flex items-center text-gray-900">{cv.babySitting || 'غير محدد'}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">عناية الأطفال</label>
                  {isEditing ? (
                    <input type="text" name="childrenCare" value={formData.childrenCare} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  ) : (
                    <div className="flex items-center text-gray-900">{cv.childrenCare || 'غير محدد'}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">التنظيف</label>
                  {isEditing ? (
                    <input type="text" name="cleaning" value={formData.cleaning} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  ) : (
                    <div className="flex items-center text-gray-900">{cv.cleaning || 'غير محدد'}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الغسيل</label>
                  {isEditing ? (
                    <input type="text" name="washing" value={formData.washing} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  ) : (
                    <div className="flex items-center text-gray-900">{cv.washing || 'غير محدد'}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الكوي</label>
                  {isEditing ? (
                    <input type="text" name="ironing" value={formData.ironing} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  ) : (
                    <div className="flex items-center text-gray-900">{cv.ironing || 'غير محدد'}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الطبخ العربي</label>
                  {isEditing ? (
                    <input type="text" name="arabicCooking" value={formData.arabicCooking} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  ) : (
                    <div className="flex items-center text-gray-900">{cv.arabicCooking || 'غير محدد'}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الخياطة</label>
                  {isEditing ? (
                    <input type="text" name="sewing" value={formData.sewing} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  ) : (
                    <div className="flex items-center text-gray-900">{cv.sewing || 'غير محدد'}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">القيادة</label>
                  {isEditing ? (
                    <input type="text" name="driving" value={formData.driving} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  ) : (
                    <div className="flex items-center text-gray-900">{cv.driving || 'غير محدد'}</div>
                  )}
                </div>

                {isEditing && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value={CVStatus.NEW}>جديد</option>
                        <option value={CVStatus.BOOKED}>محجوز</option>
                        <option value={CVStatus.HIRED}>متعاقد</option>
                        <option value={CVStatus.REJECTED}>مرفوض</option>
                        <option value={CVStatus.RETURNED}>معاد</option>
                        <option value={CVStatus.ARCHIVED}>مؤرشف</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">الأولوية</label>
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value={Priority.LOW}>منخفضة</option>
                        <option value={Priority.MEDIUM}>متوسطة</option>
                        <option value={Priority.HIGH}>عالية</option>
                        <option value={Priority.URGENT}>عاجلة</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              {/* Metadata */}
              <div className="border-t pt-4 space-y-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 ml-1" />
                  تم الإنشاء: {new Date(cv.createdAt).toLocaleDateString('ar-SA')}
                </div>
                <div>بواسطة: {cv.createdBy.name}</div>
                {cv.updatedAt !== cv.createdAt && (
                  <div>
                    آخر تحديث: {new Date(cv.updatedAt).toLocaleDateString('ar-SA')}
                    {cv.updatedBy && <span> بواسطة: {cv.updatedBy.name}</span>}
                  </div>
                )}
                {cv.versions && cv.versions.length > 0 && (
                  <div>الإصدارات: {cv.versions.length}</div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Professional Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">المؤهل العلمي والمهارات</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">المؤهل العلمي</label>
                  {isEditing ? (
                    <textarea
                      name="education"
                      value={formData.education}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      dir="rtl"
                    />
                  ) : (
                    <div className="text-gray-900 whitespace-pre-wrap">
                      {cv.education || 'غير محدد'}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">المهارات</label>
                  {isEditing ? (
                    <textarea
                      name="skills"
                      value={formData.skills}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      dir="rtl"
                    />
                  ) : (
                    <div className="text-gray-900 whitespace-pre-wrap">
                      {cv.skills || 'غير محدد'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">الملخص المهني</h3>
              {isEditing ? (
                <textarea
                  name="summary"
                  value={formData.summary}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  dir="rtl"
                />
              ) : (
                <div className="text-gray-900 whitespace-pre-wrap">
                  {cv.summary || 'غير محدد'}
                </div>
              )}
            </div>

            {/* Rich Text Content */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">المحتوى التفصيلي</h3>
              <RichTextEditor
                content={content}
                onChange={setContent}
                onSave={isEditing ? handleSave : undefined}
                cvId={cvId}
                userId={user?.id}
                userName={user?.name}
                isReadOnly={!isEditing}
              />
            </div>

            {/* Notes */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">ملاحظات</h3>
              {isEditing ? (
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  dir="rtl"
                  placeholder="أي ملاحظات إضافية..."
                />
              ) : (
                <div className="text-gray-900 whitespace-pre-wrap">
                  {cv.notes || 'لا توجد ملاحظات'}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
