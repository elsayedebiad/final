// خدمة المزامنة التلقائية مع Google Sheets
import { googleSheetsService } from './google-sheets'
import { googleSheetsDemoService } from './google-sheets-demo'

interface SyncStats {
  lastSync: Date
  totalSynced: number
  totalUpdated: number
  errors: string[]
  isRunning: boolean
}

class AutoSyncService {
  private syncInterval: NodeJS.Timeout | null = null
  private stats: SyncStats = {
    lastSync: new Date(),
    totalSynced: 0,
    totalUpdated: 0,
    errors: [],
    isRunning: false
  }
  
  // بدء المزامنة التلقائية (بالثواني)
  startAutoSync(intervalSeconds: number = 0.5) {
    if (this.syncInterval) {
      this.stopAutoSync()
    }

    const displayTime = intervalSeconds < 1 ? 
      `${intervalSeconds * 1000} ميلي ثانية` : 
      `${intervalSeconds} ثانية`
    
    console.log(`⚡ بدء المزامنة الفورية كل ${displayTime}`)
    
    // مزامنة فورية
    this.performSync()
    
    // مزامنة دورية (بالميلي ثانية)
    this.syncInterval = setInterval(() => {
      this.performSync()
    }, intervalSeconds * 1000)

    this.stats.isRunning = true
  }

  // إيقاف المزامنة التلقائية
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
      this.stats.isRunning = false
      console.log('⏹️ تم إيقاف المزامنة التلقائية')
    }
  }

  // تنفيذ عملية المزامنة
  private async performSync() {
    try {
      console.log('🔄 بدء مزامنة تلقائية...')
      
      const response = await fetch('/api/google-sheets/sync', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        
        this.stats.lastSync = new Date()
        this.stats.totalSynced += result.synced || 0
        this.stats.totalUpdated += result.updated || 0
        
        if (result.synced > 0 || result.updated > 0) {
          console.log(`✅ مزامنة تلقائية: ${result.synced} جديد، ${result.updated} محدث`)
          
          // إشعار المستخدم
          if (typeof window !== 'undefined' && 'Notification' in window) {
            this.showNotification(result.synced, result.updated)
          }
        }
        
        // مسح الأخطاء القديمة عند النجاح
        this.stats.errors = []
        
      } else {
        const error = await response.json()
        this.stats.errors.push(`${new Date().toLocaleTimeString()}: ${error.error}`)
        console.error('❌ خطأ في المزامنة التلقائية:', error.error)
      }
      
    } catch (error: any) {
      this.stats.errors.push(`${new Date().toLocaleTimeString()}: ${error.message}`)
      console.error('❌ خطأ في المزامنة التلقائية:', error.message)
    }
  }

  // عرض إشعار للمستخدم
  private showNotification(synced: number, updated: number) {
    if (Notification.permission === 'granted') {
      let message = ''
      if (synced > 0 && updated > 0) {
        message = `تم إضافة ${synced} سيرة جديدة وتحديث ${updated} سيرة`
      } else if (synced > 0) {
        message = `تم إضافة ${synced} سيرة ذاتية جديدة`
      } else if (updated > 0) {
        message = `تم تحديث ${updated} سيرة ذاتية`
      }

      if (message) {
        new Notification('مزامنة Google Sheets', {
          body: message,
          icon: '/favicon.ico'
        })
      }
    }
  }

  // طلب إذن الإشعارات
  async requestNotificationPermission() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission()
        return permission === 'granted'
      }
      return Notification.permission === 'granted'
    }
    return false
  }

  // الحصول على إحصائيات المزامنة
  getStats(): SyncStats {
    return { ...this.stats }
  }

  // إعادة تعيين الإحصائيات
  resetStats() {
    this.stats = {
      lastSync: new Date(),
      totalSynced: 0,
      totalUpdated: 0,
      errors: [],
      isRunning: this.stats.isRunning
    }
  }

  // التحقق من حالة المزامنة
  isAutoSyncRunning(): boolean {
    return this.stats.isRunning
  }

  // تغيير فترة المزامنة (بالثواني)
  changeInterval(intervalSeconds: number) {
    if (this.stats.isRunning) {
      this.stopAutoSync()
      this.startAutoSync(intervalSeconds)
    }
  }
}

// إنشاء instance واحد للاستخدام في التطبيق
export const autoSyncService = new AutoSyncService()

// تصدير الكلاس للاستخدام المتقدم
export { AutoSyncService }

// تصدير الأنواع
export type { SyncStats }
