// نسخة تجريبية من Google Sheets Service للاختبار
// لا تحتاج إعداد Google Cloud

export class GoogleSheetsDemoService {
  
  // بيانات تجريبية للاختبار
  private demoData = [
    {
      'الاسم الكامل': 'أحمد محمد علي',
      'الاسم بالعربية': 'أحمد محمد علي',
      'البريد الإلكتروني': 'ahmed@example.com',
      'رقم الهاتف': '+201234567890',
      'رمز المرجع': 'AM001',
      'الراتب الشهري': '2800',
      'فترة العقد': '24 شهر',
      'المنصب': 'سائق',
      'الجنسية': 'مصرية',
      'الديانة': 'مسلم',
      'تاريخ الميلاد': '1985-03-15',
      'العمر': '39',
      'الحالة الاجتماعية': 'متزوج',
      'عدد الأطفال': '2',
      'الوزن': '75 كيلو',
      'الطول': '175 سم',
      'لون البشرة': 'أسمر',
      'مستوى الإنجليزية': 'مستعد',
      'مستوى العربية': 'نعم',
      'رعاية الأطفال': 'لا',
      'التنظيف': 'نعم',
      'الطبخ العربي': 'نعم',
      'القيادة': 'نعم',
      'الأولوية': 'متوسطة',
      'رابط الفيديو': 'https://youtube.com/watch?v=example1'
    },
    {
      'الاسم الكامل': 'سارة أحمد حسن',
      'الاسم بالعربية': 'سارة أحمد حسن',
      'البريد الإلكتروني': 'sara@example.com',
      'رقم الهاتف': '+201987654321',
      'رمز المرجع': 'SA002',
      'الراتب الشهري': '3000',
      'فترة العقد': '36 شهر',
      'المنصب': 'مربية أطفال',
      'الجنسية': 'مصرية',
      'الديانة': 'مسلمة',
      'تاريخ الميلاد': '1990-07-22',
      'العمر': '34',
      'الحالة الاجتماعية': 'عزباء',
      'عدد الأطفال': '0',
      'الوزن': '60 كيلو',
      'الطول': '165 سم',
      'لون البشرة': 'بيضاء',
      'مستوى الإنجليزية': 'نعم',
      'مستوى العربية': 'نعم',
      'رعاية الأطفال': 'نعم',
      'التنظيف': 'نعم',
      'الطبخ العربي': 'نعم',
      'القيادة': 'لا',
      'الأولوية': 'عالية',
      'رابط الفيديو': 'https://youtube.com/watch?v=example2'
    }
  ]

  async getAllData() {
    // محاكاة تأخير الشبكة
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('📊 استخدام البيانات التجريبية للاختبار')
    return this.demoData
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
    const normalizedData: any = {}
    
    // تحويل أسماء الحقول
    Object.keys(sheetData).forEach(key => {
      const normalizedKey = this.normalizeHeaderName(key)
      normalizedData[normalizedKey] = sheetData[key]
    })

    return {
      fullName: normalizedData.fullName || '',
      fullNameArabic: normalizedData.fullNameArabic || normalizedData.fullName || '',
      email: normalizedData.email || null,
      phone: normalizedData.phone || null,
      referenceCode: normalizedData.referenceCode || null,
      monthlySalary: normalizedData.monthlySalary || null,
      contractPeriod: normalizedData.contractPeriod || null,
      position: normalizedData.position || null,
      passportNumber: normalizedData.passportNumber || null,
      passportIssueDate: normalizedData.passportIssueDate || null,
      passportExpiryDate: normalizedData.passportExpiryDate || null,
      passportIssuePlace: normalizedData.passportIssuePlace || null,
      nationality: normalizedData.nationality || null,
      religion: normalizedData.religion || null,
      dateOfBirth: normalizedData.dateOfBirth || null,
      placeOfBirth: normalizedData.placeOfBirth || null,
      livingTown: normalizedData.livingTown || null,
      maritalStatus: this.mapMaritalStatus(normalizedData.maritalStatus),
      numberOfChildren: parseInt(normalizedData.numberOfChildren) || 0,
      weight: normalizedData.weight || null,
      height: normalizedData.height || null,
      complexion: normalizedData.complexion || null,
      age: parseInt(normalizedData.age) || null,
      englishLevel: this.mapSkillLevel(normalizedData.englishLevel),
      arabicLevel: this.mapSkillLevel(normalizedData.arabicLevel),
      babySitting: this.mapSkillLevel(normalizedData.babySitting),
      childrenCare: this.mapSkillLevel(normalizedData.childrenCare),
      tutoring: this.mapSkillLevel(normalizedData.tutoring),
      disabledCare: this.mapSkillLevel(normalizedData.disabledCare),
      cleaning: this.mapSkillLevel(normalizedData.cleaning),
      washing: this.mapSkillLevel(normalizedData.washing),
      ironing: this.mapSkillLevel(normalizedData.ironing),
      arabicCooking: this.mapSkillLevel(normalizedData.arabicCooking),
      sewing: this.mapSkillLevel(normalizedData.sewing),
      driving: this.mapSkillLevel(normalizedData.driving),
      previousEmployment: normalizedData.previousEmployment || null,
      experience: normalizedData.experience || null,
      education: normalizedData.education || null,
      skills: normalizedData.skills || null,
      summary: normalizedData.summary || null,
      priority: this.mapPriority(normalizedData.priority),
      notes: normalizedData.notes || null,
      videoLink: normalizedData.videoLink || null,
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

  async addRow(data: any[]) {
    console.log('📝 إضافة صف جديد (وضع تجريبي)')
    return { success: true }
  }

  async updateRow(rowIndex: number, data: any[]) {
    console.log('🔄 تحديث صف (وضع تجريبي)')
    return { success: true }
  }

  async createCVSheet() {
    console.log('📋 إنشاء شيت جديد (وضع تجريبي)')
    return ['الاسم الكامل', 'البريد الإلكتروني', '...']
  }
}

export const googleSheetsDemoService = new GoogleSheetsDemoService()
