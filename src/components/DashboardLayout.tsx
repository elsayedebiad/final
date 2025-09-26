'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Sidebar from './Sidebar'

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface DashboardLayoutProps {
  children: React.ReactNode | ((user: User | null) => React.ReactNode)
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      // التحقق من حالة تفعيل النظام
      const isActivated = localStorage.getItem('system_activated')
      if (isActivated !== 'true') {
        router.push('/activation')
        return
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
      }
    } catch (error) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    toast.success('تم تسجيل الخروج بنجاح')
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="h-screen bg-gray-50 flex" dir="rtl">
      {/* Sidebar - Fixed */}
      <div className="flex-shrink-0">
        <Sidebar user={user} onLogout={handleLogout} />
      </div>
      
      {/* Main Content - Scrollable */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-8 max-w-7xl">
            {typeof children === 'function' ? children(user) : children}
          </div>
        </main>
      </div>
    </div>
  )
}
