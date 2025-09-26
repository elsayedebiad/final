'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function SimpleDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (!token || !userData) {
      router.push('/login')
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
    } catch (error) {
      console.error('Error parsing user data:', error)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/login')
      return
    }

    setLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    toast.success('تم تسجيل الخروج بنجاح')
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'مدير عام'
      case 'SUB_ADMIN': return 'مدير فرعي'
      case 'USER': return 'مستخدم عادي'
      default: return role
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800'
      case 'SUB_ADMIN': return 'bg-yellow-100 text-yellow-800'
      case 'USER': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center ml-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">نظام إدارة السير الذاتية</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700 flex items-center">
                <span>مرحباً، <span className="font-medium">{user.name}</span></span>
                <span className={`mr-2 px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                  {getRoleText(user.role)}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors text-sm shadow-lg hover:shadow-xl"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">مرحباً بك، {user.name}!</h2>
              <p className="text-gray-600 text-lg mb-6">أهلاً وسهلاً بك في نظام إدارة السير الذاتية</p>
              <div className={`inline-flex px-4 py-2 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                صلاحيات: {getRoleText(user.role)}
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Add CV */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">إضافة سيرة ذاتية</h3>
              <p className="text-gray-600 mb-4">إضافة سيرة ذاتية جديدة للنظام</p>
              <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
                إضافة الآن
              </button>
            </div>

            {/* View CVs */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">عرض السير الذاتية</h3>
              <p className="text-gray-600 mb-4">استعراض وإدارة السير الذاتية المحفوظة</p>
              <button className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-2 px-4 rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200">
                عرض الآن
              </button>
            </div>

            {/* Import CVs */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">استيراد السير الذاتية</h3>
              <p className="text-gray-600 mb-4">استيراد السير الذاتية من ملفات Excel</p>
              <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200">
                استيراد الآن
              </button>
            </div>

            {/* Statistics */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">الإحصائيات</h3>
              <p className="text-gray-600 mb-4">عرض إحصائيات النظام والتقارير</p>
              <button className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white py-2 px-4 rounded-xl hover:from-yellow-700 hover:to-orange-700 transition-all duration-200">
                عرض الإحصائيات
              </button>
            </div>

            {/* Activity Log */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">سجل النشاط</h3>
              <p className="text-gray-600 mb-4">مراجعة سجل العمليات والأنشطة</p>
              <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200">
                عرض السجل
              </button>
            </div>

            {/* Settings */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">الإعدادات</h3>
              <p className="text-gray-600 mb-4">إدارة إعدادات النظام والحساب</p>
              <button className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-2 px-4 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200">
                الإعدادات
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">إحصائيات سريعة</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-gray-600">إجمالي السير الذاتية</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-gray-600">متعاقد</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">0</div>
                <div className="text-sm text-gray-600">محجوز</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">0</div>
                <div className="text-sm text-gray-600">جديد</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
