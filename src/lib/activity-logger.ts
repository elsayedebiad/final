/**
 * Client-side activity logger - sends activities to API
 */
export interface ActivityLogData {
  action: string
  description: string
  targetType?: 'CV' | 'CONTRACT' | 'USER' | 'SYSTEM'
  targetId?: string
  targetName?: string
  metadata?: Record<string, unknown>
}

/**
 * Log activity to localStorage (and optionally to server)
 */
export async function logActivity(data: ActivityLogData) {
  try {
    // إنشاء سجل النشاط
    const activity = {
      id: Date.now().toString(),
      ...data,
      userId: 'current-user', // سيتم تحديثه لاحقاً
      userName: 'المستخدم الحالي', // سيتم تحديثه لاحقاً
      userEmail: 'user@example.com', // سيتم تحديثه لاحقاً
      ipAddress: '127.0.0.1',
      userAgent: navigator.userAgent,
      createdAt: new Date().toISOString()
    }

    // حفظ في localStorage
    const existingActivities = JSON.parse(localStorage.getItem('activityLog') || '[]')
    existingActivities.push(activity)
    
    // الاحتفاظ بآخر 100 نشاط فقط
    if (existingActivities.length > 100) {
      existingActivities.splice(0, existingActivities.length - 100)
    }
    
    localStorage.setItem('activityLog', JSON.stringify(existingActivities))

    // محاولة إرسال للسيرفر (اختياري)
    const token = localStorage.getItem('token')
    if (token) {
      try {
        await fetch('/api/activity-log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(data)
        })
      } catch (serverError) {
        console.log('Server logging failed, but local logging succeeded')
      }
    }
  } catch (error) {
    console.error('Error logging activity:', error)
  }
}

/**
 * CV-related activity loggers
 */
export const CVActivityLogger = {
  created: async (cvId: string, fullName: string) => {
    return logActivity({
      action: 'CV_CREATED',
      description: `تم إنشاء سيرة ذاتية جديدة لـ ${fullName}`,
      targetType: 'CV',
      targetId: cvId,
      targetName: fullName
    })
  },

  updated: async (cvId: string, fullName: string, changes: string[]) => {
    return logActivity({
      action: 'CV_UPDATED',
      description: `تم تحديث السيرة الذاتية لـ ${fullName}`,
      targetType: 'CV',
      targetId: cvId,
      targetName: fullName,
      metadata: { changes }
    })
  },

  deleted: async (cvId: string, fullName: string) => {
    return logActivity({
      action: 'CV_DELETED',
      description: `تم حذف السيرة الذاتية لـ ${fullName}`,
      targetType: 'CV',
      targetId: cvId,
      targetName: fullName
    })
  },

  statusChanged: async (cvId: string, fullName: string, fromStatus: string, toStatus: string) => {
    return logActivity({
      action: 'STATUS_CHANGED',
      description: `تم تغيير حالة السيرة الذاتية لـ ${fullName} من ${fromStatus} إلى ${toStatus}`,
      targetType: 'CV',
      targetId: cvId,
      targetName: fullName,
      metadata: { fromStatus, toStatus }
    })
  },

  viewed: async (cvId: string, fullName: string) => {
    return logActivity({
      action: 'CV_VIEWED',
      description: `تم عرض السيرة الذاتية لـ ${fullName}`,
      targetType: 'CV',
      targetId: cvId,
      targetName: fullName
    })
  }
}

/**
 * Contract-related activity loggers
 */
export const ContractActivityLogger = {
  created: async (contractId: string, cvName: string) => {
    return logActivity({
      action: 'CONTRACT_CREATED',
      description: `تم إنشاء عقد جديد مع ${cvName}`,
      targetType: 'CONTRACT',
      targetId: contractId,
      targetName: cvName
    })
  },

  updated: async (contractId: string, cvName: string) => {
    return logActivity({
      action: 'CONTRACT_UPDATED',
      description: `تم تحديث العقد مع ${cvName}`,
      targetType: 'CONTRACT',
      targetId: contractId,
      targetName: cvName
    })
  },

  deleted: async (contractId: string, cvName: string) => {
    return logActivity({
      action: 'CONTRACT_DELETED',
      description: `تم حذف العقد مع ${cvName}`,
      targetType: 'CONTRACT',
      targetId: contractId,
      targetName: cvName
    })
  }
}

/**
 * User-related activity loggers
 */
export const UserActivityLogger = {
  login: async (userId?: number | string) => {
    return logActivity({
      action: 'USER_LOGIN',
      description: 'تم تسجيل الدخول',
      targetType: 'USER',
      targetId: userId?.toString()
    })
  },

  logout: async (userId?: number | string) => {
    return logActivity({
      action: 'USER_LOGOUT',
      description: 'تم تسجيل الخروج',
      targetType: 'USER',
      targetId: userId?.toString()
    })
  }
}

/**
 * Bulk operations activity loggers
 */
export const BulkActivityLogger = {
  delete: async (count: number) => {
    return logActivity({
      action: 'BULK_DELETE',
      description: `تم حذف ${count} سيرة ذاتية`,
      targetType: 'SYSTEM',
      metadata: { count }
    })
  },

  download: async (count: number) => {
    return logActivity({
      action: 'BULK_DOWNLOAD',
      description: `تم تحميل ${count} صورة سيرة ذاتية`,
      targetType: 'SYSTEM',
      metadata: { count }
    })
  }
}

