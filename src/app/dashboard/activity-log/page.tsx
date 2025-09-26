'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import {
  Activity,
  Clock,
  User,
  FileText,
  Trash2,
  Edit,
  UserPlus,
  FileSignature,
  Download,
  Search,
  Filter,
  Calendar,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import DashboardLayout from '../../../components/DashboardLayout'

interface ActivityLog {
  id: string
  action: string
  description: string
  userId: string
  userName: string
  userEmail: string
  targetType: 'CV' | 'CONTRACT' | 'USER' | 'SYSTEM'
  targetId?: string
  targetName?: string
  metadata?: any
  ipAddress?: string
  userAgent?: string
  createdAt: string
}

const actionIcons: Record<string, any> = {
  'CV_CREATED': FileText,
  'CV_UPDATED': Edit,
  'CV_DELETED': Trash2,
  'CV_VIEWED': Eye,
  'CONTRACT_CREATED': FileSignature,
  'CONTRACT_UPDATED': Edit,
  'CONTRACT_DELETED': Trash2,
  'USER_LOGIN': UserPlus,
  'USER_LOGOUT': User,
  'BULK_DELETE': Trash2,
  'BULK_DOWNLOAD': Download,
  'STATUS_CHANGED': RefreshCw,
  'SYSTEM_BACKUP': CheckCircle,
  'SYSTEM_ERROR': XCircle,
}

const actionColors: Record<string, string> = {
  'CV_CREATED': 'text-green-600 bg-green-100',
  'CV_UPDATED': 'text-blue-600 bg-blue-100',
  'CV_DELETED': 'text-red-600 bg-red-100',
  'CV_VIEWED': 'text-gray-600 bg-gray-100',
  'CONTRACT_CREATED': 'text-purple-600 bg-purple-100',
  'CONTRACT_UPDATED': 'text-indigo-600 bg-indigo-100',
  'CONTRACT_DELETED': 'text-red-600 bg-red-100',
  'USER_LOGIN': 'text-emerald-600 bg-emerald-100',
  'USER_LOGOUT': 'text-orange-600 bg-orange-100',
  'BULK_DELETE': 'text-red-600 bg-red-100',
  'BULK_DOWNLOAD': 'text-blue-600 bg-blue-100',
  'STATUS_CHANGED': 'text-yellow-600 bg-yellow-100',
  'SYSTEM_BACKUP': 'text-green-600 bg-green-100',
  'SYSTEM_ERROR': 'text-red-600 bg-red-100',
}

const actionLabels: Record<string, string> = {
  'CV_CREATED': 'إنشاء سيرة ذاتية',
  'CV_UPDATED': 'تحديث سيرة ذاتية',
  'CV_DELETED': 'حذف سيرة ذاتية',
  'CV_VIEWED': 'عرض سيرة ذاتية',
  'CONTRACT_CREATED': 'إنشاء عقد',
  'CONTRACT_UPDATED': 'تحديث عقد',
  'CONTRACT_DELETED': 'حذف عقد',
  'USER_LOGIN': 'تسجيل دخول',
  'USER_LOGOUT': 'تسجيل خروج',
  'BULK_DELETE': 'حذف جماعي',
  'BULK_DOWNLOAD': 'تحميل جماعي',
  'STATUS_CHANGED': 'تغيير الحالة',
  'SYSTEM_BACKUP': 'نسخ احتياطي',
  'SYSTEM_ERROR': 'خطأ في النظام',
}
function ActivityLogPageContent() {
  const router = useRouter()
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAction, setFilterAction] = useState<string>('ALL')
  const [filterUser, setFilterUser] = useState<string>('ALL')
  const [filterDate, setFilterDate] = useState<string>('ALL')
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [userRole, setUserRole] = useState<string | null>(null)
  const itemsPerPage = 20

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          router.push('/login')
          return
        }

        const response = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.user.role !== 'ADMIN') {
            toast.error('غير مسموح لك بالوصول لهذه الصفحة - المديرين العامين فقط')
            router.push('/dashboard')
            return
          }
          setUserRole(data.user.role)
        } else {
          router.push('/login')
        }
      } catch (error) {
        router.push('/login')
      }
    }

    checkAdminAccess()
  }, [])

  useEffect(() => {
    if (userRole === 'ADMIN') {
      fetchActivities()
    }
  }, [userRole])

  const fetchActivities = async () => {
    try {
      // محاولة جلب البيانات من localStorage أولاً
      const storedActivities = localStorage.getItem('activityLog')
      if (storedActivities) {
        const parsedActivities = JSON.parse(storedActivities)
        setActivities(parsedActivities.reverse()) // عرض الأحدث أولاً
      } else {
        // إذا لم توجد بيانات، ابدأ بقائمة فارغة
        setActivities([])
      }
    } catch (error) {
      console.error('Error loading activities:', error)
      setActivities([])
    } finally {
      setIsLoading(false)
    }
  }

  const clearActivityLog = () => {
    if (confirm('هل أنت متأكد من مسح جميع سجلات الأنشطة؟')) {
      localStorage.removeItem('activityLog')
      setActivities([])
      toast.success('تم مسح سجل الأنشطة')
    }
  }

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = !searchTerm || 
      activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (activity.targetName && activity.targetName.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesAction = filterAction === 'ALL' || activity.action === filterAction
    const matchesUser = filterUser === 'ALL' || activity.userId === filterUser
    
    const matchesDate = filterDate === 'ALL' || (() => {
      const activityDate = new Date(activity.createdAt)
      const today = new Date()
      
      switch (filterDate) {
        case 'TODAY':
          return activityDate.toDateString() === today.toDateString()
        case 'WEEK':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          return activityDate >= weekAgo
        case 'MONTH':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
          return activityDate >= monthAgo
        default:
          return true
      }
    })()

    return matchesSearch && matchesAction && matchesUser && matchesDate
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('ar-SA'),
      time: date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
    }
  }

  const uniqueUsers = Array.from(new Set(activities.map(a => a.userId)))
    .map(userId => activities.find(a => a.userId === userId))
    .filter(Boolean) as ActivityLog[]

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-center">
          <Activity className="h-12 w-12 text-indigo-600 mx-auto mb-4 animate-pulse" />
          <div className="text-gray-600">جاري تحميل سجل الأنشطة...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200 mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 rounded-lg p-4">
            <Activity className="h-8 w-8 text-blue-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-gray-800 mb-2">سجل الأنشطة</h1>
            <p className="text-gray-600">تتبع جميع الأنشطة والعمليات في النظام</p>
          </div>
          {activities.length > 0 && (
            <button
              onClick={clearActivityLog}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium flex items-center"
            >
              <Trash2 className="h-4 w-4 ml-2" />
              مسح السجل
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* البحث */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="البحث في الأنشطة..."
              className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* نوع العملية */}
          <select
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
          >
            <option value="ALL">جميع العمليات</option>
            {Object.entries(actionLabels).map(([action, label]) => (
              <option key={action} value={action}>{label}</option>
            ))}
          </select>

          {/* المستخدم */}
          <select
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
          >
            <option value="ALL">جميع المستخدمين</option>
            {uniqueUsers.map((activity) => (
              <option key={activity.userId} value={activity.userId}>
                {activity.userName} ({activity.userEmail})
              </option>
            ))}
          </select>

          {/* التاريخ */}
          <select
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          >
            <option value="ALL">جميع التواريخ</option>
            <option value="TODAY">اليوم</option>
            <option value="WEEK">آخر أسبوع</option>
            <option value="MONTH">آخر شهر</option>
          </select>
        </div>

        <div className="text-sm text-gray-500">
          عرض {filteredActivities.length} من أصل {activities.length} نشاط
        </div>
      </div>

      {/* Activities List */}
      <div className="space-y-4">
        {filteredActivities.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد أنشطة</h3>
            <p className="text-gray-500">لم يتم العثور على أنشطة تطابق المعايير المحددة</p>
          </div>
        ) : (
          filteredActivities.map((activity) => {
            const IconComponent = actionIcons[activity.action] || Activity
            const colorClass = actionColors[activity.action] || 'text-gray-600 bg-gray-100'
            const { date, time } = formatDate(activity.createdAt)
            const isExpanded = expandedActivity === activity.id

            return (
              <div key={activity.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-200">
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-3 rounded-xl ${colorClass} flex-shrink-0`}>
                      <IconComponent className="h-6 w-6" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {actionLabels[activity.action] || activity.action}
                          </h3>
                          <p className="text-gray-600">{activity.description}</p>
                        </div>
                        <div className="text-right text-sm text-gray-500 flex-shrink-0 mr-4">
                          <div className="flex items-center gap-1 mb-1">
                            <Calendar className="h-4 w-4" />
                            {date}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {time}
                          </div>
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{activity.userName}</span>
                        <span>({activity.userEmail})</span>
                      </div>

                      {/* Target Info */}
                      {activity.targetName && (
                        <div className="text-sm text-gray-600 mb-3">
                          <span className="font-medium">الهدف:</span> {activity.targetName}
                        </div>
                      )}

                      {/* Expand Button */}
                      {(activity.metadata || activity.ipAddress) && (
                        <button
                          onClick={() => setExpandedActivity(isExpanded ? null : activity.id)}
                          className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          {isExpanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {activity.ipAddress && (
                          <div>
                            <span className="font-medium text-gray-700">عنوان IP:</span>
                            <span className="text-gray-600 mr-2">{activity.ipAddress}</span>
                          </div>
                        )}
                        {activity.userAgent && (
                          <div>
                            <span className="font-medium text-gray-700">المتصفح:</span>
                            <span className="text-gray-600 mr-2 truncate">{activity.userAgent}</span>
                          </div>
                        )}
                        {activity.metadata && (
                          <div className="md:col-span-2">
                            <span className="font-medium text-gray-700">بيانات إضافية:</span>
                            <pre className="text-gray-600 bg-gray-50 p-3 rounded-lg mt-2 text-xs overflow-x-auto">
                              {JSON.stringify(activity.metadata, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// الصفحة الافتراضية مع التحقق من الصلاحيات
export default function ActivityLogPage() {
  return (
    <DashboardLayout>
      {(user) => {
        if (!user) return null
        
        // التحقق من صلاحيات المدير العام
        if (user.role !== 'ADMIN') {
          return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">غير مسموح بالوصول</h2>
                <p className="text-gray-600 mb-6">هذه الصفحة متاحة للمديرين العامين فقط</p>
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                >
                  العودة للداشبورد
                </button>
              </div>
            </div>
          )
        }
        
        return <ActivityLogPageContent />
      }}
    </DashboardLayout>
  )
}
