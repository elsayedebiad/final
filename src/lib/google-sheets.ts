import { google } from 'googleapis'

// Google Sheets configuration
const GOOGLE_SHEETS_CONFIG = {
  spreadsheetId: process.env.GOOGLE_SHEETS_ID || '',
  range: 'CVs!A:AZ', // نطاق البيانات
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL || '',
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
  }
}

// Initialize Google Sheets API
export class GoogleSheetsService {
  private sheets: any
  private auth: any
  private isInitialized: boolean = false

  constructor() {
    // لا نقوم بالتهيئة في الـ constructor لتجنب الأخطاء
  }

  private async initializeAuth() {
    if (this.isInitialized) {
      return
    }

    try {
      // التحقق من وجود متغيرات البيئة
      if (!GOOGLE_SHEETS_CONFIG.credentials.client_email || !GOOGLE_SHEETS_CONFIG.credentials.private_key) {
        throw new Error('Google Sheets credentials are not configured. Please check your environment variables.')
      }

      if (!GOOGLE_SHEETS_CONFIG.spreadsheetId) {
        throw new Error('Google Sheets ID is not configured. Please set GOOGLE_SHEETS_ID in your environment variables.')
      }

      this.auth = new google.auth.JWT({
        email: GOOGLE_SHEETS_CONFIG.credentials.client_email,
        key: GOOGLE_SHEETS_CONFIG.credentials.private_key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      })

      await this.auth.authorize()
      this.sheets = google.sheets({ version: 'v4', auth: this.auth })
      this.isInitialized = true
      console.log('✅ Google Sheets API initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize Google Sheets API:', error)
      throw error
    }
  }

  // قراءة جميع البيانات من الشيت
  async getAllData() {
    try {
      // تأكد من التهيئة قبل الاستخدام
      if (!this.isInitialized) {
        await this.initializeAuth()
      }
      
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: GOOGLE_SHEETS_CONFIG.spreadsheetId,
        range: GOOGLE_SHEETS_CONFIG.range,
      })

      const rows = response.data.values || []
      if (rows.length === 0) {
        return []
      }

      // الصف الأول يحتوي على العناوين
      const headers = rows[0]
      const data = rows.slice(1).map((row: any[]) => {
        const rowData: any = {}
        headers.forEach((header: string, index: number) => {
          rowData[this.normalizeHeaderName(header)] = row[index] || ''
        })
        return rowData
      })

      return data
    } catch (error) {
      console.error('❌ Error reading Google Sheets data:', error)
      throw error
    }
  }

  // تحويل أسماء الأعمدة إلى أسماء متوافقة مع قاعدة البيانات
  private normalizeHeaderName(header: string): string {
    const headerMap: { [key: string]: string } = {
      'الاسم الكامل': 'fullName',
      'الاسم بالعربية': 'fullNameArabic',
      'البريد الإلكتروني': 'email',
      'رقم الهاتف': 'phone',
      'رمز المرجع': 'referenceCode',
      'الراتب الشهري': 'monthlySalary',
      'فترة العقد': 'contractPeriod',
      'المنصب': 'position',
      'رقم جواز السفر': 'passportNumber',
      'تاريخ إصدار الجواز': 'passportIssueDate',
      'تاريخ انتهاء الجواز': 'passportExpiryDate',
      'مكان إصدار الجواز': 'passportIssuePlace',
      'الجنسية': 'nationality',
      'الديانة': 'religion',
      'تاريخ الميلاد': 'dateOfBirth',
      'مكان الميلاد': 'placeOfBirth',
      'مكان السكن': 'livingTown',
      'الحالة الاجتماعية': 'maritalStatus',
      'عدد الأطفال': 'numberOfChildren',
      'الوزن': 'weight',
      'الطول': 'height',
      'لون البشرة': 'complexion',
      'العمر': 'age',
      'مستوى الإنجليزية': 'englishLevel',
      'مستوى العربية': 'arabicLevel',
      'رعاية الأطفال': 'babySitting',
      'رعاية الأطفال المتقدمة': 'childrenCare',
      'التدريس': 'tutoring',
      'رعاية ذوي الاحتياجات الخاصة': 'disabledCare',
      'التنظيف': 'cleaning',
      'الغسيل': 'washing',
      'الكي': 'ironing',
      'الطبخ العربي': 'arabicCooking',
      'الخياطة': 'sewing',
      'القيادة': 'driving',
      'الخبرة السابقة': 'previousEmployment',
      'الخبرة': 'experience',
      'التعليم': 'education',
      'المهارات': 'skills',
      'الملخص': 'summary',
      'الأولوية': 'priority',
      'ملاحظات': 'notes',
      'رابط الفيديو': 'videoLink'
    }

    return headerMap[header] || header.toLowerCase().replace(/\s+/g, '_')
  }

  // تحويل البيانات إلى نموذج قاعدة البيانات
  transformToDBFormat(sheetData: any): any {
    return {
      fullName: sheetData.fullName || '',
      fullNameArabic: sheetData.fullNameArabic || sheetData.fullName || '',
      email: sheetData.email || null,
      phone: sheetData.phone || null,
      referenceCode: sheetData.referenceCode || null,
      monthlySalary: sheetData.monthlySalary || null,
      contractPeriod: sheetData.contractPeriod || null,
      position: sheetData.position || null,
      passportNumber: sheetData.passportNumber || null,
      passportIssueDate: sheetData.passportIssueDate || null,
      passportExpiryDate: sheetData.passportExpiryDate || null,
      passportIssuePlace: sheetData.passportIssuePlace || null,
      nationality: sheetData.nationality || null,
      religion: sheetData.religion || null,
      dateOfBirth: sheetData.dateOfBirth || null,
      placeOfBirth: sheetData.placeOfBirth || null,
      livingTown: sheetData.livingTown || null,
      maritalStatus: this.mapMaritalStatus(sheetData.maritalStatus),
      numberOfChildren: parseInt(sheetData.numberOfChildren) || 0,
      weight: sheetData.weight || null,
      height: sheetData.height || null,
      complexion: sheetData.complexion || null,
      age: parseInt(sheetData.age) || null,
      englishLevel: this.mapSkillLevel(sheetData.englishLevel),
      arabicLevel: this.mapSkillLevel(sheetData.arabicLevel),
      babySitting: this.mapSkillLevel(sheetData.babySitting),
      childrenCare: this.mapSkillLevel(sheetData.childrenCare),
      tutoring: this.mapSkillLevel(sheetData.tutoring),
      disabledCare: this.mapSkillLevel(sheetData.disabledCare),
      cleaning: this.mapSkillLevel(sheetData.cleaning),
      washing: this.mapSkillLevel(sheetData.washing),
      ironing: this.mapSkillLevel(sheetData.ironing),
      arabicCooking: this.mapSkillLevel(sheetData.arabicCooking),
      sewing: this.mapSkillLevel(sheetData.sewing),
      driving: this.mapSkillLevel(sheetData.driving),
      previousEmployment: sheetData.previousEmployment || null,
      experience: sheetData.experience || null,
      education: sheetData.education || null,
      skills: sheetData.skills || null,
      summary: sheetData.summary || null,
      priority: this.mapPriority(sheetData.priority),
      notes: sheetData.notes || null,
      videoLink: sheetData.videoLink || null,
      status: 'NEW'
    }
  }

  // تحويل الحالة الاجتماعية
  private mapMaritalStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'أعزب': 'SINGLE',
      'عزباء': 'SINGLE',
      'متزوج': 'MARRIED',
      'متزوجة': 'MARRIED',
      'مطلق': 'DIVORCED',
      'مطلقة': 'DIVORCED',
      'أرمل': 'WIDOWED',
      'أرملة': 'WIDOWED'
    }
    return statusMap[status] || 'SINGLE'
  }

  // تحويل مستوى المهارة
  private mapSkillLevel(level: string): string {
    const levelMap: { [key: string]: string } = {
      'نعم': 'YES',
      'لا': 'NO',
      'مستعد': 'WILLING',
      'مستعدة': 'WILLING'
    }
    return levelMap[level] || 'NO'
  }

  // تحويل الأولوية
  private mapPriority(priority: string): string {
    const priorityMap: { [key: string]: string } = {
      'منخفضة': 'LOW',
      'متوسطة': 'MEDIUM',
      'عالية': 'HIGH',
      'عاجلة': 'URGENT'
    }
    return priorityMap[priority] || 'MEDIUM'
  }

  // إضافة صف جديد إلى الشيت
  async addRow(data: any[]) {
    try {
      // تأكد من التهيئة قبل الاستخدام
      if (!this.isInitialized) {
        await this.initializeAuth()
      }
      
      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId: GOOGLE_SHEETS_CONFIG.spreadsheetId,
        range: 'CVs!A:AZ',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [data]
        }
      })
      return response.data
    } catch (error) {
      console.error('❌ Error adding row to Google Sheets:', error)
      throw error
    }
  }

  // تحديث صف موجود
  async updateRow(rowIndex: number, data: any[]) {
    try {
      // تأكد من التهيئة قبل الاستخدام
      if (!this.isInitialized) {
        await this.initializeAuth()
      }
      
      const range = `CVs!A${rowIndex + 1}:AZ${rowIndex + 1}`
      const response = await this.sheets.spreadsheets.values.update({
        spreadsheetId: GOOGLE_SHEETS_CONFIG.spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [data]
        }
      })
      return response.data
    } catch (error) {
      console.error('❌ Error updating row in Google Sheets:', error)
      throw error
    }
  }

  // إنشاء الشيت مع العناوين المطلوبة
  async createCVSheet() {
    try {
      // تأكد من التهيئة قبل الاستخدام
      if (!this.isInitialized) {
        await this.initializeAuth()
      }
      
      const headers = [
        'الاسم الكامل', 'الاسم بالعربية', 'البريد الإلكتروني', 'رقم الهاتف', 'رمز المرجع',
        'الراتب الشهري', 'فترة العقد', 'المنصب',
        'رقم جواز السفر', 'تاريخ إصدار الجواز', 'تاريخ انتهاء الجواز', 'مكان إصدار الجواز',
        'الجنسية', 'الديانة', 'تاريخ الميلاد', 'مكان الميلاد', 'مكان السكن',
        'الحالة الاجتماعية', 'عدد الأطفال', 'الوزن', 'الطول', 'لون البشرة', 'العمر',
        'مستوى الإنجليزية', 'مستوى العربية',
        'رعاية الأطفال', 'رعاية الأطفال المتقدمة', 'التدريس', 'رعاية ذوي الاحتياجات الخاصة',
        'التنظيف', 'الغسيل', 'الكي', 'الطبخ العربي', 'الخياطة', 'القيادة',
        'الخبرة السابقة', 'الخبرة', 'التعليم', 'المهارات', 'الملخص', 'الأولوية', 'ملاحظات', 'رابط الفيديو'
      ]

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: GOOGLE_SHEETS_CONFIG.spreadsheetId,
        range: 'CVs!A1:AQ1',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [headers]
        }
      })

      console.log('✅ CV Sheet headers created successfully')
      return headers
    } catch (error) {
      console.error('❌ Error creating CV sheet headers:', error)
      throw error
    }
  }
}

export const googleSheetsService = new GoogleSheetsService()
