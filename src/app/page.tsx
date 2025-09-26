'use client'

import { useRouter } from 'next/navigation'
import { Users, FileText, Search, Download, Star, ArrowLeft } from 'lucide-react'

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-lg p-2">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                نظام إدارة السير الذاتية
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/home')}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <FileText className="h-4 w-4" />
                الرئيسية
              </button>
              <button
                onClick={() => router.push('/login')}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <ArrowLeft className="h-4 w-4" />
                تسجيل الدخول
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <div className="bg-gradient-to-r from-blue-100 to-green-100 rounded-full p-4 w-24 h-24 mx-auto mb-8 flex items-center justify-center">
            <Users className="h-12 w-12 text-blue-600" />
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
            مرحباً بك في
            <span className="block bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              نظام إدارة السير الذاتية
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            نظام شامل ومتطور لإدارة السير الذاتية مع إمكانيات البحث والفلترة المتقدمة، 
            والتحميل الجماعي، وعرض جميل للبيانات
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => router.push('/home')}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center gap-3 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              <FileText className="h-6 w-6" />
              استعراض المعرض
            </button>
            <button
              onClick={() => router.push('/login')}
              className="bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-300 hover:border-blue-400 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl"
            >
              <ArrowLeft className="h-6 w-6" />
              تسجيل الدخول للإدارة
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200">
            <div className="bg-blue-100 rounded-lg p-3 w-fit mb-4">
              <Search className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">بحث متقدم</h3>
            <p className="text-gray-600">
              ابحث في السير الذاتية بالاسم، الجنسية، المهارات، والمزيد من المعايير المتقدمة
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200">
            <div className="bg-green-100 rounded-lg p-3 w-fit mb-4">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">عرض جميل</h3>
            <p className="text-gray-600">
              عرض السير الذاتية في تخطيطات جميلة مع إمكانية التبديل بين الشبكة والقائمة
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-orange-200">
            <div className="bg-orange-100 rounded-lg p-3 w-fit mb-4">
              <Download className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">تحميل جماعي</h3>
            <p className="text-gray-600">
              حدد عدة سير ذاتية وحملها كملف ZIP واحد مع شريط تقدم جميل
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200">
            <div className="bg-purple-100 rounded-lg p-3 w-fit mb-4">
              <Star className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">إدارة متقدمة</h3>
            <p className="text-gray-600">
              أدوات إدارة شاملة مع فلاتر متقدمة وإحصائيات مفصلة
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-3xl p-8 md:p-12 text-center text-white">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            ابدأ الآن في استعراض السير الذاتية
          </h3>
          <p className="text-xl mb-8 opacity-90">
            اكتشف مجموعة واسعة من السير الذاتية المنظمة والمفصلة
          </p>
          <button
            onClick={() => router.push('/home')}
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center gap-3 mx-auto shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <FileText className="h-6 w-6" />
            دخول المعرض
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-lg p-2">
              <Users className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold">نظام إدارة السير الذاتية</span>
          </div>
          <p className="text-gray-400">
            نظام متطور وشامل لإدارة وعرض السير الذاتية بطريقة احترافية
          </p>
        </div>
      </footer>
    </div>
  )
}
