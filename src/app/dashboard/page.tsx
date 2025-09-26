'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { CVStatus, Priority, SkillLevel } from '@prisma/client'
import {
  Search,
  FileText,
  User,
  Edit,
  Trash2,
  Download,
  Undo2,
  RefreshCw,
  Zap,
  SlidersHorizontal, // ← أيقونة موحّدة للـ Slider menu
  Globe,
  Calendar,
  Heart,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Bookmark,
  FileSignature,
  XCircle,
  X,
  BookOpen,
  DollarSign,
  Ruler,
  Scale,
  Baby,
  Star,
} from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'
import BulkImageDownloader from '../../components/BulkImageDownloader'
import CountryFlag from '../../components/CountryFlag'
import { BulkActivityLogger, CVActivityLogger, ContractActivityLogger } from '../../lib/activity-logger'
import { getCountryInfo } from '../../lib/country-utils'

interface CV {
  id: string
  fullName: string
  fullNameArabic?: string
  email?: string
  phone?: string
  referenceCode?: string
  monthlySalary?: string
  contractPeriod?: string
  position?: string
  nationality?: string
  maritalStatus?: string
  age?: number
  profileImage?: string
  status: CVStatus
  priority: Priority
  createdBy: { name: string; email: string }
  createdAt: string
  // مهارات اختيارية
  babySitting?: SkillLevel
  childrenCare?: SkillLevel
  tutoring?: SkillLevel
  disabledCare?: SkillLevel
  cleaning?: SkillLevel
  washing?: SkillLevel
  ironing?: SkillLevel
  arabicCooking?: SkillLevel
  sewing?: SkillLevel
  driving?: SkillLevel
  // خصائص اختيارية ذكرتها في الفلاتر
  workExperience?: number
  experience?: number
  arabicLevel?: string
  languageLevel?: string
  // خصائص إضافية للفلاتر المتقدمة
  religion?: string
  education?: string
  passportNumber?: string
  passportExpiryDate?: string
  height?: string
  weight?: string
  numberOfChildren?: number
  livingTown?: string
  placeOfBirth?: string
}

export default function CVsPage() {
  const router = useRouter()

  const [cvs, setCvs] = useState<CV[]>([])
  const [filteredCvs, setFilteredCvs] = useState<CV[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<CVStatus | 'ALL'>('ALL')
  const [nationalityFilter, setNationalityFilter] = useState<string>('ALL')
  const [skillFilter, setSkillFilter] = useState<string>('ALL')
  const [maritalStatusFilter, setMaritalStatusFilter] = useState<string>('ALL')
  const [ageFilter, setAgeFilter] = useState<string>('ALL')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [experienceFilter, setExperienceFilter] = useState<string>('ALL')
  const [languageFilter, setLanguageFilter] = useState<string>('ALL')
  
  // فلاتر إضافية شاملة
  const [religionFilter, setReligionFilter] = useState<string>('ALL')
  const [educationFilter, setEducationFilter] = useState<string>('ALL')
  const [salaryFilter, setSalaryFilter] = useState<string>('ALL')
  const [contractPeriodFilter, setContractPeriodFilter] = useState<string>('ALL')
  const [passportStatusFilter, setPassportStatusFilter] = useState<string>('ALL')
  const [heightFilter, setHeightFilter] = useState<string>('ALL')
  const [weightFilter, setWeightFilter] = useState<string>('ALL')
  const [childrenFilter, setChildrenFilter] = useState<string>('ALL')
  const [locationFilter, setLocationFilter] = useState<string>('ALL')

  const [selectedCvs, setSelectedCvs] = useState<string[]>([])
  const [showBulkDownloader, setShowBulkDownloader] = useState(false)
  const [showBulkOperationModal, setShowBulkOperationModal] = useState(false)
  const [bulkOperationType, setBulkOperationType] = useState<'delete' | 'status' | 'download'>('delete')
  const [bulkProgress, setBulkProgress] = useState(0)
  const [bulkProcessing, setBulkProcessing] = useState(false)
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(30)
  const [paginatedCvs, setPaginatedCvs] = useState<CV[]>([])

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [newBulkStatus, setNewBulkStatus] = useState<CVStatus>(CVStatus.NEW)
  const [isContractModalOpen, setIsContractModalOpen] = useState(false)
  const [contractingCv, setContractingCv] = useState<CV | null>(null)
  const [identityNumber, setIdentityNumber] = useState('')

  useEffect(() => {
    fetchCVs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    filterCVs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cvs, searchTerm, statusFilter, nationalityFilter, skillFilter, maritalStatusFilter, ageFilter, experienceFilter, languageFilter, religionFilter, educationFilter, salaryFilter, contractPeriodFilter, passportStatusFilter, heightFilter, weightFilter, childrenFilter, locationFilter])

  // Pagination effect
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    setPaginatedCvs(filteredCvs.slice(startIndex, endIndex))
  }, [filteredCvs, currentPage, itemsPerPage])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, nationalityFilter, skillFilter, maritalStatusFilter, ageFilter, experienceFilter, languageFilter, religionFilter, educationFilter, salaryFilter, contractPeriodFilter, passportStatusFilter, heightFilter, weightFilter, childrenFilter, locationFilter])

  const fetchCVs = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) return router.push('/login')
      const res = await fetch('/api/cvs', { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setCvs(data.cvs || [])
    } catch {
      toast.error('فشل في تحميل السير الذاتية')
    } finally {
      setIsLoading(false)
    }
  }

  const filterCVs = () => {
    // إخفاء السير المتعاقدة فقط، وإظهار السير المعادة
    let filtered = cvs.filter(cv => cv.status !== CVStatus.HIRED)

    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (cv) =>
          cv.fullName.toLowerCase().includes(q) ||
          (cv.fullNameArabic && cv.fullNameArabic.toLowerCase().includes(q)) ||
          (cv.email && cv.email.toLowerCase().includes(q)) ||
          (cv.phone && cv.phone.includes(searchTerm)) ||
          (cv.position && cv.position.toLowerCase().includes(q)) ||
          (cv.referenceCode && cv.referenceCode.toLowerCase().includes(q)) ||
          (cv.nationality && cv.nationality.toLowerCase().includes(q)),
      )
    }
    if (statusFilter !== 'ALL') filtered = filtered.filter((cv) => cv.status === statusFilter)
    if (nationalityFilter !== 'ALL') filtered = filtered.filter((cv) => cv.nationality === nationalityFilter)
    if (skillFilter !== 'ALL') {
      filtered = filtered.filter((cv) => {
        const val = (cv as any)[skillFilter] as SkillLevel | undefined
        return val === SkillLevel.YES || val === SkillLevel.WILLING
      })
    }
    if (maritalStatusFilter !== 'ALL') filtered = filtered.filter((cv) => cv.maritalStatus === maritalStatusFilter)
    if (ageFilter !== 'ALL') {
      filtered = filtered.filter((cv) => {
        if (!cv.age) return false
        if (ageFilter === '18-25') return cv.age >= 18 && cv.age <= 25
        if (ageFilter === '26-35') return cv.age >= 26 && cv.age <= 35
        if (ageFilter === '36-45') return cv.age >= 36 && cv.age <= 45
        if (ageFilter === '46+') return cv.age >= 46
        return true
      })
    }
    if (experienceFilter !== 'ALL') {
      filtered = filtered.filter((cv) => {
        const experience = cv.workExperience ?? cv.experience ?? 0
        if (typeof experience !== 'number') return false
        if (experienceFilter === '0-1') return experience >= 0 && experience < 1
        if (experienceFilter === '1-3') return experience >= 1 && experience <= 3
        if (experienceFilter === '3-5') return experience >= 3 && experience <= 5
        if (experienceFilter === '5+') return experience > 5
        return true
      })
    }
    if (languageFilter !== 'ALL') {
      filtered = filtered.filter((cv) => {
        const arabicLevel = cv.arabicLevel ?? cv.languageLevel
        return arabicLevel === languageFilter
      })
    }

    // فلاتر إضافية شاملة
    if (religionFilter !== 'ALL') filtered = filtered.filter((cv) => cv.religion === religionFilter)
    if (educationFilter !== 'ALL') filtered = filtered.filter((cv) => cv.education === educationFilter)
    
    if (salaryFilter !== 'ALL') {
      filtered = filtered.filter((cv) => {
        const salary = parseInt(cv.monthlySalary || '0')
        if (salaryFilter === 'LOW') return salary < 1000
        if (salaryFilter === 'MEDIUM') return salary >= 1000 && salary < 2000
        if (salaryFilter === 'HIGH') return salary >= 2000
        return true
      })
    }
    
    if (contractPeriodFilter !== 'ALL') filtered = filtered.filter((cv) => cv.contractPeriod === contractPeriodFilter)
    
    if (passportStatusFilter !== 'ALL') {
      filtered = filtered.filter((cv) => {
        if (passportStatusFilter === 'VALID') return cv.passportNumber && cv.passportExpiryDate
        if (passportStatusFilter === 'EXPIRED') return cv.passportExpiryDate && new Date(cv.passportExpiryDate) < new Date()
        if (passportStatusFilter === 'MISSING') return !cv.passportNumber
        return true
      })
    }
    
    if (heightFilter !== 'ALL') {
      filtered = filtered.filter((cv) => {
        const height = parseInt(cv.height || '0')
        if (heightFilter === 'SHORT') return height < 160
        if (heightFilter === 'MEDIUM') return height >= 160 && height < 170
        if (heightFilter === 'TALL') return height >= 170
        return true
      })
    }
    
    if (weightFilter !== 'ALL') {
      filtered = filtered.filter((cv) => {
        const weight = parseInt(cv.weight || '0')
        if (weightFilter === 'LIGHT') return weight < 60
        if (weightFilter === 'MEDIUM') return weight >= 60 && weight < 80
        if (weightFilter === 'HEAVY') return weight >= 80
        return true
      })
    }
    
    if (childrenFilter !== 'ALL') {
      filtered = filtered.filter((cv) => {
        const children = cv.numberOfChildren || 0
        if (childrenFilter === 'NONE') return children === 0
        if (childrenFilter === 'FEW') return children > 0 && children <= 2
        if (childrenFilter === 'MANY') return children > 2
        return true
      })
    }
    
    if (locationFilter !== 'ALL') {
      filtered = filtered.filter((cv) => 
        cv.livingTown?.toLowerCase().includes(locationFilter.toLowerCase()) ||
        cv.placeOfBirth?.toLowerCase().includes(locationFilter.toLowerCase())
      )
    }

    setFilteredCvs(filtered)
  }

  const toggleCvSelection = (id: string) => {
    setSelectedCvs((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }
  const toggleSelectAll = () => {
    if (selectedCvs.length === paginatedCvs.length) setSelectedCvs([])
    else setSelectedCvs(paginatedCvs.map((cv) => cv.id))
  }

  // Pagination functions
  const totalPages = Math.ceil(filteredCvs.length / itemsPerPage)
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }
  const goToNextPage = () => goToPage(currentPage + 1)
  const goToPrevPage = () => goToPage(currentPage - 1)

  // تنزيل صورة واحدة: افتح صفحة القالب بنمط تنزيل
  const downloadSingleImage = (cvId: string) => {
    const cv = cvs.find(c => c.id === cvId)
    if (cv) {
      CVActivityLogger.viewed(cvId, cv.fullName) // تسجيل عرض السيرة
    }
    
    const url = `/dashboard/cv/${cvId}/alqaeid?download=image`
    window.open(url, '_blank')
    toast.success('تم فتح صفحة التحميل')
  }

  // تنزيل صور المحدد (يستدعي نافذة المجمّع الجديدة)
  const downloadBulkImages = () => {
    if (selectedCvs.length === 0) {
      toast('اختر على الأقل سيرة واحدة')
      return
    }
    
    // تسجيل النشاط
    BulkActivityLogger.download(selectedCvs.length)
    
    setShowBulkDownloader(true)
  }

  // فتح نافذة العمليات الجماعية
  const handleBulkDelete = () => {
    if (selectedCvs.length === 0) {
      toast.error('اختر على الأقل سيرة واحدة للحذف')
      return
    }
    setBulkOperationType('delete')
    setShowBulkOperationModal(true)
  }

  // تنفيذ العمليات الجماعية
  const executeBulkOperation = async () => {
    setBulkProcessing(true)
    setBulkProgress(0)

    try {
      const token = localStorage.getItem('token')
      const totalItems = selectedCvs.length

      if (bulkOperationType === 'delete') {
        for (let i = 0; i < selectedCvs.length; i++) {
          const cvId = selectedCvs[i]
          await fetch(`/api/cvs/${cvId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          })
          setBulkProgress(Math.round(((i + 1) / totalItems) * 100))
          await new Promise(resolve => setTimeout(resolve, 200)) // تأخير بسيط للتأثير البصري
        }
        
        // تحديث القائمة محلياً
        setCvs(prev => prev.filter(cv => !selectedCvs.includes(cv.id)))
        
        // تسجيل النشاط
        BulkActivityLogger.delete(selectedCvs.length)
        
        toast.success(`تم حذف ${selectedCvs.length} سيرة ذاتية بنجاح`)
      }

      setSelectedCvs([])
      setTimeout(() => {
        setShowBulkOperationModal(false)
        setBulkProcessing(false)
        setBulkProgress(0)
      }, 1500)

    } catch (error) {
      console.error('Error in bulk operation:', error)
      toast.error('فشل في تنفيذ العملية')
      setBulkProcessing(false)
    }
  }

  // تحديث الحالة (اختياري)
  const handleStatusChange = async (cvId: string, newStatus: CVStatus) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/cvs/${cvId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error()
      
      // العثور على السيرة الذاتية لتسجيل النشاط
      const cv = cvs.find(c => c.id === cvId)
      if (cv) {
        const statusLabels: Record<string, string> = {
          'NEW': 'جديد',
          'BOOKED': 'محجوز',
          'HIRED': 'متعاقد',
          'REJECTED': 'مرفوض',
          'RETURNED': 'معاد',
          'ARCHIVED': 'مؤرشف'
        }
        
        CVActivityLogger.statusChanged(
          cvId, 
          cv.fullName, 
          statusLabels[cv.status] || cv.status, 
          statusLabels[newStatus] || newStatus
        )
      }
      
      toast.success('تم تحديث الحالة')
      fetchCVs()
    } catch {
      toast.error('فشل تحديث الحالة')
    }
  }


  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-gray-600">جاري التحميل...</div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      {(user) => (
        <div className="space-y-6">
          {/* رسالة توضيحية للمستخدم العادي */}
          {user?.role === 'USER' && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 rounded-lg p-2">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-800 mb-1">مرحباً بك كمستخدم عادي</h3>
                  <p className="text-blue-700 text-xs">يمكنك مشاهدة وتحميل السير الذاتية فقط. للحصول على صلاحيات إضافية، تواصل مع المدير.</p>
                </div>
              </div>
            </div>
          )}

          {/* بنر التحديد الجماعي */}
          {selectedCvs.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 rounded-lg p-3">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-800 mb-1">تم تحديد {selectedCvs.length} سيرة ذاتية</h3>
                    <p className="text-blue-700 text-sm">يمكنك الآن تطبيق العمليات الجماعية على السير المحددة</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedCvs([])}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
                  >
                    <X className="h-4 w-4 ml-2 inline" />
                    إلغاء التحديد
                  </button>
                  <button
                    onClick={downloadBulkImages}
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-semibold"
                  >
                    <Download className="h-4 w-4 ml-2 inline" />
                    تحميل صور ({selectedCvs.length})
                  </button>
                  {(user?.role === 'ADMIN' || user?.role === 'SUB_ADMIN') && (
                    <button
                      onClick={handleBulkDelete}
                      className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-all duration-200"
                    >
                      <Trash2 className="h-4 w-4 ml-2 inline" />
                      حذف المحدد
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* إشعار للسير المعادة */}
          {filteredCvs.some(cv => cv.status === 'RETURNED') && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-orange-100 rounded-lg p-3">
                  <RefreshCw className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-orange-800 mb-1">سير ذاتية معادة من العقود</h3>
                  <p className="text-orange-700 text-sm">
                    يوجد {filteredCvs.filter(cv => cv.status === 'RETURNED').length} سيرة ذاتية تم إعادتها من العقود. يمكنك إعادة التعاقد معها مرة أخرى.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* كرت البحث والتصفية */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center mb-6">
              <div className="bg-blue-100 p-3 rounded-lg ml-4">
                <Search className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  البحث والتصفية المتقدمة
                </h3>
                <p className="text-gray-600 text-sm mt-1">ابحث وصفي السير الذاتية بسهولة</p>
              </div>
            </div>

            <div className="mb-8">
              <div className="relative group">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 h-6 w-6 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder=" ابحث بالاسم، الجنسية، الوظيفة، أو أي معلومة أخرى..."
                  className="w-full pr-14 pl-6 py-5 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all bg-white text-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  dir="rtl"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            {/* الفلاتر السريعة */}
            <div className="flex flex-wrap gap-3 mb-6">
              <select
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm font-medium text-slate-700 hover:bg-slate-100"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as CVStatus | 'ALL')}
              >
                <option value="ALL">جميع الحالات</option>
                <option value={CVStatus.NEW}>جديد</option>
                <option value={CVStatus.BOOKED}>محجوز</option>
                <option value={CVStatus.REJECTED}>مرفوض</option>
                <option value={CVStatus.RETURNED}>معاد</option>
                <option value={CVStatus.ARCHIVED}>مؤرشف</option>
              </select>


              <select
                className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full text-sm font-medium text-emerald-700 hover:bg-emerald-100"
                value={nationalityFilter}
                onChange={(e) => setNationalityFilter(e.target.value)}
              >
                <option value="ALL">جميع الجنسيات</option>
                <option value="FILIPINO">فلبينية</option>
                <option value="INDIAN">هندية</option>
                <option value="BANGLADESHI">بنغلاديشية</option>
                <option value="ETHIOPIAN">إثيوبية</option>
                <option value="KENYAN">كينية</option>
                <option value="UGANDAN">أوغندية</option>
              </select>

              <select
                className="px-4 py-2 bg-purple-50 border border-purple-200 rounded-full text-sm font-medium text-purple-700 hover:bg-purple-100"
                value={ageFilter}
                onChange={(e) => setAgeFilter(e.target.value)}
              >
                <option value="ALL">جميع الأعمار</option>
                <option value="18-25">18-25</option>
                <option value="26-35">26-35</option>
                <option value="36-45">36-45</option>
                <option value="46+">46+</option>
              </select>

              {/* زر المزيد من الفلاتر – نفس أيقونة الـ Slider menu */}
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all border ${
                  showAdvancedFilters
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <SlidersHorizontal className={`h-4 w-4 ${showAdvancedFilters ? 'rotate-90 transition-transform' : ''}`} />
                  المزيد من الفلاتر
                </span>
              </button>
            </div>

            {/* الفلاتر المتقدمة */}
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showAdvancedFilters ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-6 border border-indigo-100">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-indigo-700 mb-2">
                      <Star className="h-4 w-4 ml-2" /> المهارات
                    </label>
                    <select
                      className="w-full border border-indigo-200 rounded-xl px-3 py-2 bg-white/70 focus:ring-2 focus:ring-indigo-400"
                      value={skillFilter}
                      onChange={(e) => setSkillFilter(e.target.value)}
                    >
                      <option value="ALL">جميع المهارات</option>
                      <option value="babySitting">رعاية أطفال</option>
                      <option value="childrenCare">عناية بالأطفال</option>
                      <option value="cleaning">تنظيف</option>
                      <option value="washing">غسيل</option>
                      <option value="ironing">كي</option>
                      <option value="arabicCooking">طبخ عربي</option>
                      <option value="sewing">خياطة</option>
                      <option value="driving">قيادة</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-purple-700 mb-2">
                      <Heart className="h-4 w-4 ml-2" /> الحالة الاجتماعية
                    </label>
                    <select
                      className="w-full border border-purple-200 rounded-xl px-3 py-2 bg-white/70 focus:ring-2 focus:ring-purple-400"
                      value={maritalStatusFilter}
                      onChange={(e) => setMaritalStatusFilter(e.target.value)}
                    >
                      <option value="ALL">الكل</option>
                      <option value="SINGLE">أعزب/عزباء</option>
                      <option value="MARRIED">متزوج/متزوجة</option>
                      <option value="DIVORCED">مطلق/مطلقة</option>
                      <option value="WIDOWED">أرمل/أرملة</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-teal-700 mb-2">
                      <Globe className="h-4 w-4 ml-2" /> مستوى اللغة
                    </label>
                    <select
                      className="w-full border border-teal-200 rounded-xl px-3 py-2 bg-white/70 focus:ring-2 focus:ring-teal-400"
                      value={languageFilter}
                      onChange={(e) => setLanguageFilter(e.target.value)}
                    >
                      <option value="ALL">جميع المستويات</option>
                      <option value="EXCELLENT">ممتاز</option>
                      <option value="GOOD">جيد</option>
                      <option value="FAIR">متوسط</option>
                      <option value="POOR">ضعيف</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-orange-700 mb-2">
                      <Calendar className="h-4 w-4 ml-2" /> سنوات الخبرة
                    </label>
                    <select
                      className="w-full border border-orange-200 rounded-xl px-3 py-2 bg-white/70 focus:ring-2 focus:ring-orange-400"
                      value={experienceFilter}
                      onChange={(e) => setExperienceFilter(e.target.value)}
                    >
                      <option value="ALL">جميع المستويات</option>
                      <option value="0-1">أقل من سنة</option>
                      <option value="1-3">1-3 سنوات</option>
                      <option value="3-5">3-5 سنوات</option>
                      <option value="5+">أكثر من 5 سنوات</option>
                    </select>
                  </div>
                </div>

                {/* صف إضافي للفلاتر الجديدة */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-green-700 mb-2">
                      <Star className="h-4 w-4 ml-2" /> الديانة
                    </label>
                    <select
                      className="w-full border border-green-200 rounded-xl px-3 py-2 bg-white/70 focus:ring-2 focus:ring-green-400"
                      value={religionFilter}
                      onChange={(e) => setReligionFilter(e.target.value)}
                    >
                      <option value="ALL">جميع الديانات</option>
                      <option value="مسلم">مسلم</option>
                      <option value="مسيحي">مسيحي</option>
                      <option value="هندوسي">هندوسي</option>
                      <option value="بوذي">بوذي</option>
                      <option value="أخرى">أخرى</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-blue-700 mb-2">
                      <BookOpen className="h-4 w-4 ml-2" /> المستوى التعليمي
                    </label>
                    <select
                      className="w-full border border-blue-200 rounded-xl px-3 py-2 bg-white/70 focus:ring-2 focus:ring-blue-400"
                      value={educationFilter}
                      onChange={(e) => setEducationFilter(e.target.value)}
                    >
                      <option value="ALL">جميع المستويات</option>
                      <option value="ابتدائي">ابتدائي</option>
                      <option value="متوسط">متوسط</option>
                      <option value="ثانوي">ثانوي</option>
                      <option value="جامعي">جامعي</option>
                      <option value="دراسات عليا">دراسات عليا</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-yellow-700 mb-2">
                      <DollarSign className="h-4 w-4 ml-2" /> الراتب المطلوب
                    </label>
                    <select
                      className="w-full border border-yellow-200 rounded-xl px-3 py-2 bg-white/70 focus:ring-2 focus:ring-yellow-400"
                      value={salaryFilter}
                      onChange={(e) => setSalaryFilter(e.target.value)}
                    >
                      <option value="ALL">جميع الرواتب</option>
                      <option value="LOW">أقل من 1000</option>
                      <option value="MEDIUM">1000 - 2000</option>
                      <option value="HIGH">أكثر من 2000</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-purple-700 mb-2">
                      <Calendar className="h-4 w-4 ml-2" /> مدة العقد
                    </label>
                    <select
                      className="w-full border border-purple-200 rounded-xl px-3 py-2 bg-white/70 focus:ring-2 focus:ring-purple-400"
                      value={contractPeriodFilter}
                      onChange={(e) => setContractPeriodFilter(e.target.value)}
                    >
                      <option value="ALL">جميع المدد</option>
                      <option value="سنة">سنة واحدة</option>
                      <option value="سنتان">سنتان</option>
                      <option value="ثلاث سنوات">ثلاث سنوات</option>
                      <option value="مفتوح">مفتوح</option>
                    </select>
                  </div>
                </div>

                {/* صف ثالث للفلاتر */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-red-700 mb-2">
                      <FileText className="h-4 w-4 ml-2" /> حالة الجواز
                    </label>
                    <select
                      className="w-full border border-red-200 rounded-xl px-3 py-2 bg-white/70 focus:ring-2 focus:ring-red-400"
                      value={passportStatusFilter}
                      onChange={(e) => setPassportStatusFilter(e.target.value)}
                    >
                      <option value="ALL">جميع الحالات</option>
                      <option value="VALID">ساري المفعول</option>
                      <option value="EXPIRED">منتهي الصلاحية</option>
                      <option value="MISSING">غير متوفر</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-indigo-700 mb-2">
                      <Ruler className="h-4 w-4 ml-2" /> الطول
                    </label>
                    <select
                      className="w-full border border-indigo-200 rounded-xl px-3 py-2 bg-white/70 focus:ring-2 focus:ring-indigo-400"
                      value={heightFilter}
                      onChange={(e) => setHeightFilter(e.target.value)}
                    >
                      <option value="ALL">جميع الأطوال</option>
                      <option value="SHORT">قصير (أقل من 160)</option>
                      <option value="MEDIUM">متوسط (160-170)</option>
                      <option value="TALL">طويل (أكثر من 170)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-teal-700 mb-2">
                      <Scale className="h-4 w-4 ml-2" /> الوزن
                    </label>
                    <select
                      className="w-full border border-teal-200 rounded-xl px-3 py-2 bg-white/70 focus:ring-2 focus:ring-teal-400"
                      value={weightFilter}
                      onChange={(e) => setWeightFilter(e.target.value)}
                    >
                      <option value="ALL">جميع الأوزان</option>
                      <option value="LIGHT">خفيف (أقل من 60)</option>
                      <option value="MEDIUM">متوسط (60-80)</option>
                      <option value="HEAVY">ثقيل (أكثر من 80)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-pink-700 mb-2">
                      <Baby className="h-4 w-4 ml-2" /> عدد الأطفال
                    </label>
                    <select
                      className="w-full border border-pink-200 rounded-xl px-3 py-2 bg-white/70 focus:ring-2 focus:ring-pink-400"
                      value={childrenFilter}
                      onChange={(e) => setChildrenFilter(e.target.value)}
                    >
                      <option value="ALL">الكل</option>
                      <option value="NONE">بدون أطفال</option>
                      <option value="FEW">1-2 أطفال</option>
                      <option value="MANY">أكثر من 2</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => {
                      setStatusFilter('ALL')
                      setNationalityFilter('ALL')
                      setSkillFilter('ALL')
                      setMaritalStatusFilter('ALL')
                      setAgeFilter('ALL')
                      setExperienceFilter('ALL')
                      setLanguageFilter('ALL')
                      setReligionFilter('ALL')
                      setEducationFilter('ALL')
                      setSalaryFilter('ALL')
                      setContractPeriodFilter('ALL')
                      setPassportStatusFilter('ALL')
                      setHeightFilter('ALL')
                      setWeightFilter('ALL')
                      setChildrenFilter('ALL')
                      setLocationFilter('ALL')
                      setSearchTerm('')
                    }}
                    className="px-6 py-2 bg-gradient-to-r from-red-400 to-pink-400 text-white rounded-full text-sm font-medium hover:from-red-500 hover:to-pink-500"
                  >
                    مسح جميع الفلاتر
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* سطر أدوات سريع */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center bg-white rounded-lg p-3 shadow-sm border border-gray-200">
              <input
                type="checkbox"
                className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ml-3"
                checked={paginatedCvs.length > 0 && selectedCvs.length === paginatedCvs.length}
                onChange={toggleSelectAll}
              />
              <span className="text-sm font-semibold text-gray-700">تحديد الكل في الصفحة ({paginatedCvs.length})</span>
            </div>
            <div className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
              إجمالي النتائج: <span className="font-bold text-gray-700">{filteredCvs.length}</span> | 
              الصفحة: <span className="font-bold text-blue-600">{currentPage}</span> من <span className="font-bold text-blue-600">{totalPages}</span>
            </div>
          </div>

          {/* الجدول */}
          <div className="overflow-hidden bg-white rounded-lg shadow-lg border border-gray-200">
            {/* رسالة توضيحية للتمرير الأفقي */}
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 text-center">
              <p className="text-xs text-gray-600 flex items-center justify-center gap-2">
                <ChevronLeft className="h-3 w-3" />
                <span>يمكنك التمرير يميناً ويساراً لعرض جميع الأعمدة</span>
                <ChevronRight className="h-3 w-3" />
              </p>
            </div>
            <div className="overflow-x-auto" 
                 style={{
                   scrollbarWidth: 'thin',
                   scrollbarColor: '#d1d5db #f3f4f6'
                 }}>
              <style jsx>{`
                div::-webkit-scrollbar {
                  height: 8px;
                }
                div::-webkit-scrollbar-track {
                  background: #f3f4f6;
                  border-radius: 4px;
                }
                div::-webkit-scrollbar-thumb {
                  background: #d1d5db;
                  border-radius: 4px;
                }
                div::-webkit-scrollbar-thumb:hover {
                  background: #9ca3af;
                }
              `}</style>
              <table className="w-full text-sm text-right text-gray-600 min-w-max"
                     style={{ minWidth: '1200px' }}>
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="p-4 text-center w-12">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        onChange={toggleSelectAll}
                        checked={selectedCvs.length === paginatedCvs.length && paginatedCvs.length > 0}
                      />
                    </th>
                    <th className="px-4 py-4 font-semibold text-gray-700 min-w-48 text-right">الاسم الكامل</th>
                    <th className="px-3 py-4 font-semibold text-gray-700 min-w-24 text-center">الكود المرجعي</th>
                    <th className="px-3 py-4 font-semibold text-gray-700 min-w-32 text-center">الجنسية</th>
                    <th className="px-3 py-4 font-semibold text-gray-700 min-w-28 text-center">الوظيفة</th>
                    <th className="px-3 py-4 font-semibold text-gray-700 min-w-16 text-center">العمر</th>
                    <th className="px-3 py-4 font-semibold text-gray-700 min-w-24 text-center">الحالة</th>
                    <th className="px-3 py-4 font-semibold text-gray-700 min-w-40 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedCvs.map((cv) => (
                    <tr key={cv.id} className={`${selectedCvs.includes(cv.id) ? 'bg-blue-50' : cv.status === 'RETURNED' ? 'bg-orange-50 border-l-4 border-orange-400' : 'bg-white'} hover:bg-gray-50 border-l-4`} style={{ borderLeftColor: cv.nationality ? getCountryInfo(cv.nationality).colors.primary : '#e5e7eb' }}>
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          checked={selectedCvs.includes(cv.id)}
                          onChange={() => toggleCvSelection(cv.id)}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-3">
                          {cv.profileImage ? (
                            <img className="h-10 w-10 rounded-full object-cover flex-shrink-0" src={cv.profileImage} alt={cv.fullName} />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center flex-shrink-0">
                              <User className="h-5 w-5 text-white" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-gray-900 truncate">{cv.fullName}</div>
                            {cv.fullNameArabic && (
                              <div className="text-sm text-gray-500 truncate">{cv.fullNameArabic}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-center">
                        <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {cv.referenceCode}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <CountryFlag nationality={cv.nationality || ''} size="md" />
                      </td>
                      <td className="px-3 py-4">
                        <span className="text-sm text-gray-700 truncate block">{cv.position}</span>
                      </td>
                      <td className="px-3 py-4 text-center">
                        <span className="text-sm font-semibold text-gray-800">{cv.age}</span>
                      </td>
                      <td className="px-3 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          cv.status === 'NEW' ? 'bg-blue-100 text-blue-800' :
                          cv.status === 'BOOKED' ? 'bg-yellow-100 text-yellow-800' :
                          cv.status === 'RETURNED' ? 'bg-orange-100 text-orange-800' :
                          cv.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          cv.status === 'ARCHIVED' ? 'bg-gray-100 text-gray-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {cv.status === 'NEW' ? 'جديد' : 
                           cv.status === 'BOOKED' ? 'محجوز' : 
                           cv.status === 'RETURNED' ? 'معاد' :
                           cv.status === 'REJECTED' ? 'مرفوض' :
                           cv.status === 'ARCHIVED' ? 'مؤرشف' :
                           cv.status}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            CVActivityLogger.viewed(cv.id, cv.fullName)
                            router.push(`/dashboard/cv/${cv.id}/alqaeid`)
                          }}
                          className="p-1.5 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-md"
                          title="عرض السيرة"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => downloadSingleImage(cv.id)}
                          className="p-1.5 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-md"
                          title="تحميل صورة السيرة"
                        >
                          <ImageIcon className="h-4 w-4" />
                        </button>
                        {(user?.role === 'ADMIN' || user?.role === 'SUB_ADMIN') && (
                          <button
                            onClick={() => router.push(`/dashboard/cv/${cv.id}`)}
                            className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg"
                            title="تعديل البيانات"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                        )}
                        {cv.status === CVStatus.NEW && (user?.role === 'ADMIN' || user?.role === 'SUB_ADMIN') && (
                          <>
                            <button
                              onClick={() => handleStatusChange(cv.id, CVStatus.BOOKED)}
                              className="p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-lg"
                              title="حجز"
                            >
                              <Bookmark className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => {
                                setContractingCv(cv)
                                setIsContractModalOpen(true)
                              }}
                              className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg"
                              title="تعاقد"
                            >
                              <FileSignature className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(cv.id, CVStatus.REJECTED)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                              title="رفض"
                            >
                              <XCircle className="h-5 w-5" />
                            </button>
                          </>
                        )}
                        {cv.status === CVStatus.BOOKED && (user?.role === 'ADMIN' || user?.role === 'SUB_ADMIN') && (
                          <>
                            <button
                              onClick={() => {
                                setContractingCv(cv)
                                setIsContractModalOpen(true)
                              }}
                              className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg"
                              title="تعاقد"
                            >
                              <FileSignature className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(cv.id, CVStatus.RETURNED)}
                              className="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-lg"
                              title="إعادة"
                            >
                              <Undo2 className="h-5 w-5" />
                            </button>
                          </>
                        )}
                        {cv.status === CVStatus.RETURNED && (user?.role === 'ADMIN' || user?.role === 'SUB_ADMIN') && (
                          <button
                            onClick={() => {
                              setContractingCv(cv)
                              setIsContractModalOpen(true)
                            }}
                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg"
                            title="إعادة التعاقد"
                          >
                            <FileSignature className="h-5 w-5" />
                          </button>
                        )}
                        {(cv.status === CVStatus.HIRED || cv.status === CVStatus.REJECTED) && (user?.role === 'ADMIN' || user?.role === 'SUB_ADMIN') && (
                          <button
                            onClick={() => handleStatusChange(cv.id, CVStatus.RETURNED)}
                            className="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-lg"
                            title="إعادة"
                          >
                            <Undo2 className="h-5 w-5" />
                          </button>
                        )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">
                    عرض {((currentPage - 1) * itemsPerPage) + 1} إلى {Math.min(currentPage * itemsPerPage, filteredCvs.length)} من أصل {filteredCvs.length} نتيجة
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Previous Button */}
                  <button
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <ChevronRight className="h-4 w-4" />
                    السابق
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    التالي
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* نافذة العمليات الجماعية الجميلة */}
          {showBulkOperationModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm grid place-items-center z-50">
              <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden border border-gray-200">
                {/* Header مع تدرج جميل */}
                <div className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 p-6 text-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-purple-400/20 animate-pulse"></div>
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3">
                      {bulkOperationType === 'delete' ? (
                        <Trash2 className="h-7 w-7" />
                      ) : bulkOperationType === 'status' ? (
                        <RefreshCw className="h-7 w-7" />
                      ) : (
                        <Download className="h-7 w-7" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-1">
                        {bulkOperationType === 'delete' ? 'حذف السير المحددة' : 
                         bulkOperationType === 'status' ? 'تغيير الحالة' : 'تحميل الصور'}
                      </h3>
                      <p className="text-white/80 text-sm">
                        عدد السير المحددة: <span className="font-bold">{selectedCvs.length}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  {!bulkProcessing ? (
                    <>
                      <div className="text-center mb-8">
                        <div className="bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl p-6 mb-6">
                          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                          <p className="text-gray-800 font-medium">
                            {bulkOperationType === 'delete' 
                              ? `هل أنت متأكد من حذف ${selectedCvs.length} سيرة ذاتية؟`
                              : `هل تريد تطبيق العملية على ${selectedCvs.length} سيرة؟`
                            }
                          </p>
                          <p className="text-gray-600 text-sm mt-2">
                            هذا الإجراء لا يمكن التراجع عنه
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <button
                          onClick={() => setShowBulkOperationModal(false)}
                          className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all duration-200"
                        >
                          إلغاء
                        </button>
                        <button
                          onClick={executeBulkOperation}
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          <Sparkles className="h-5 w-5" />
                          تأكيد العملية
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <div className="mb-8">
                        <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl p-8">
                          <Loader2 className="h-16 w-16 text-indigo-600 mx-auto mb-4 animate-spin" />
                          <h4 className="text-xl font-bold text-gray-800 mb-2">جاري التنفيذ...</h4>
                          <p className="text-gray-600">يرجى الانتظار حتى اكتمال العملية</p>
                        </div>
                      </div>

                      {/* شريط التقدم الجميل */}
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm font-medium text-gray-700">التقدم</span>
                          <span className="text-sm font-bold text-indigo-600">{bulkProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out relative"
                            style={{ width: `${bulkProgress}%` }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse"></div>
                          </div>
                        </div>
                      </div>

                      {bulkProgress === 100 && (
                        <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-6">
                          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                          <p className="text-green-800 font-semibold">تم إنجاز العملية بنجاح!</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {/* نافذة التعاقد */}
          {isContractModalOpen && contractingCv && (
            <div className="fixed inset-0 bg-black/50 grid place-items-center z-50">
              <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
                <h3 className="text-2xl font-bold mb-2 text-gray-800">
                  {contractingCv.status === 'RETURNED' ? 'إعادة التعاقد' : 'إنشاء عقد جديد'}
                </h3>
                <p className="mb-4 text-gray-600">
                  {contractingCv.status === 'RETURNED' 
                    ? <>أنت على وشك إعادة التعاقد مع <span className="font-semibold text-green-600">{contractingCv.fullName}</span>. يرجى إدخال رقم هوية جديد.</>
                    : <>أنت على وشك التعاقد مع <span className="font-semibold text-indigo-600">{contractingCv.fullName}</span>.</>
                  }
                </p>
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-sm text-blue-800">
                    📋 <strong>ملاحظة:</strong> بعد التعاقد، ستنتقل السيرة الذاتية إلى صفحة العقود وستختفي من الصفحة الرئيسية.
                  </p>
                </div>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault()
                    if (!identityNumber) return
                    
                    try {
                      const token = localStorage.getItem('token')
                      // إنشاء تاريخ العقد بتوقيت مصر الصحيح
                      const now = new Date()
                      const contractDate = now.toISOString()
                      
                      // تحديث السيرة مباشرة (بدون إنشاء عقد منفصل للسير المعادة)
                      const updateRes = await fetch(`/api/cvs/${contractingCv.id}`, {
                        method: 'PATCH',
                        headers: { 
                          'Content-Type': 'application/json', 
                          Authorization: `Bearer ${token}` 
                        },
                        body: JSON.stringify({ 
                          status: CVStatus.HIRED,
                          contractDate: contractDate,
                          identityNumber: identityNumber
                        }),
                      })
                      
                      if (!updateRes.ok) {
                        const errorData = await updateRes.json().catch(() => ({}))
                        throw new Error(errorData.message || 'فشل في تحديث السيرة')
                      }
                      
                      // إنشاء عقد منفصل فقط للسير الجديدة (غير المعادة)
                      if (contractingCv.status !== 'RETURNED') {
                        try {
                          await fetch('/api/contracts', {
                            method: 'POST',
                            headers: { 
                              'Content-Type': 'application/json', 
                              Authorization: `Bearer ${token}` 
                            },
                            body: JSON.stringify({
                              cvId: contractingCv.id,
                              identityNumber: identityNumber,
                              contractDate: contractDate,
                              status: 'ACTIVE'
                            }),
                          })
                        } catch (contractError) {
                          console.log('Contract creation failed, but CV updated successfully')
                        }
                      }
                      
                      // إزالة السيرة من القائمة المحلية
                      setCvs(prev => prev.filter(cv => cv.id !== contractingCv.id))
                      
                      // تسجيل النشاط
                      if (contractingCv.status === 'RETURNED') {
                        CVActivityLogger.statusChanged(contractingCv.id, contractingCv.fullName, 'معاد', 'متعاقد')
                      } else {
                        ContractActivityLogger.created(contractingCv.id, contractingCv.fullName)
                      }
                      
                      // إغلاق النافذة وتنظيف البيانات
                      setIsContractModalOpen(false)
                      setIdentityNumber('')
                      setContractingCv(null)
                      
                      // رسالة نجاح مع خيار الانتقال لصفحة العقود
                      const successMessage = contractingCv.status === 'RETURNED' 
                        ? `تم إعادة التعاقد مع ${contractingCv.fullName} بنجاح! تم نقل السيرة إلى صفحة العقود.`
                        : `تم التعاقد مع ${contractingCv.fullName} بنجاح! تم نقل السيرة إلى صفحة العقود.`
                      
                      toast.success(successMessage, {
                        duration: 6000,
                      })
                      
                      // عرض إشعار للانتقال لصفحة العقود
                      setTimeout(() => {
                        toast((t) => (
                          <div className="flex items-center gap-3">
                            <span>هل تريد الانتقال إلى صفحة العقود؟</span>
                            <button
                              onClick={() => {
                                router.push('/dashboard/contracts')
                                toast.dismiss(t.id)
                              }}
                              className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
                            >
                              نعم
                            </button>
                            <button
                              onClick={() => toast.dismiss(t.id)}
                              className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
                            >
                              لا
                            </button>
                          </div>
                        ), { duration: 8000 })
                      }, 1000)
                      
                    } catch (error) {
                      console.error('Contract creation error:', error)
                      const errorMessage = error instanceof Error ? error.message : 'فشل في إنشاء العقد. يرجى المحاولة مرة أخرى.'
                      toast.error(errorMessage)
                    }
                  }}
                >
                  <div className="mb-6">
                    <label htmlFor="identityNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      رقم الهوية
                    </label>
                    <input
                      id="identityNumber"
                      type="text"
                      value={identityNumber}
                      onChange={(e) => setIdentityNumber(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      placeholder="أدخل رقم الهوية هنا"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-4">
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsContractModalOpen(false)
                        setContractingCv(null)
                        setIdentityNumber('')
                      }} 
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold transition-all"
                    >
                      إلغاء
                    </button>
                    <button 
                      type="submit" 
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 font-semibold shadow-lg transition-all"
                    >
                      تأكيد التعاقد
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* نافذة التنزيل المجمّع */}
          {showBulkDownloader && (
            <BulkImageDownloader
              cvIds={selectedCvs}
              cvNameById={(id) => cvs.find(c => c.id === id)?.fullName || id}
              onClose={() => setShowBulkDownloader(false)}
              onComplete={() => {
                setShowBulkDownloader(false)
                setSelectedCvs([])
              }}
            />
          )}
        </div>
      )}
    </DashboardLayout>
  )
}
