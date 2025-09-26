'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Priority, MaritalStatus, SkillLevel } from '@prisma/client'
import { ArrowLeft, Save, FileText, Upload, Camera, Plus, Trash2 } from 'lucide-react'
import DashboardLayout from '../../../components/DashboardLayout'

export default function AddCVAlqaeidPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [employmentHistory, setEmploymentHistory] = useState([
    { period: '', country: '', position: '' },
  ])
  
  const [formData, setFormData] = useState({
    // Basic Information
    fullName: '',
    fullNameArabic: '',
    email: '',
    phone: '',
    
    // Employment Details
    monthlySalary: '',
    contractPeriod: '',
    position: '',
    
    // Passport Information
    passportNumber: '',
    passportIssueDate: '',
    passportExpiryDate: '',
    passportIssuePlace: '',
    
    // Personal Information
    nationality: '',
    religion: '',
    dateOfBirth: '',
    placeOfBirth: '',
    livingTown: '',
    maritalStatus: MaritalStatus.SINGLE,
    numberOfChildren: 0,
    weight: '',
    height: '',
    complexion: '',
    age: 0,
    
    // Languages and Education
    englishLevel: SkillLevel.NO,
    arabicLevel: SkillLevel.NO,
    
    // Skills and Experiences
    babySitting: SkillLevel.NO,
    childrenCare: SkillLevel.NO,
    tutoring: SkillLevel.NO,
    disabledCare: SkillLevel.NO,
    cleaning: SkillLevel.NO,
    washing: SkillLevel.NO,
    ironing: SkillLevel.NO,
    arabicCooking: SkillLevel.NO,
    sewing: SkillLevel.NO,
    driving: SkillLevel.NO,
    
    // Previous Employment (JSON string)
    previousEmployment: '[]',
    
    // Profile Image
    profileImage: '',
    
    // System fields
    priority: Priority.MEDIUM,
    notes: '',
    source: 'Manual - Al-Gaeid Template'
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 0,
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleEmploymentChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target
    const list = [...employmentHistory]
    list[index][name as 'period' | 'country' | 'position'] = value
    setEmploymentHistory(list)
  }

  const addEmploymentRow = () => {
    setEmploymentHistory([...employmentHistory, { period: '', country: '', position: '' }])
  }

  const removeEmploymentRow = (index: number) => {
    const list = [...employmentHistory]
    if (list.length > 1) {
      list.splice(index, 1)
      setEmploymentHistory(list)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to server
    try {
      const formData = new FormData()
      formData.append('image', file)

      const token = localStorage.getItem('token')
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({
          ...prev,
          profileImage: data.imageUrl,
        }))
        toast.success('تم رفع الصورة بنجاح')
      } else {
        toast.error('فشل في رفع الصورة')
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء رفع الصورة')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const finalFormData = {
      ...formData,
      previousEmployment: JSON.stringify(employmentHistory.filter(j => j.period || j.country || j.position)),
    }
    
    // التحقق من جميع الحقول المطلوبة
    const requiredFields = [
      { field: 'fullName', label: 'الاسم الكامل' },
      { field: 'email', label: 'البريد الإلكتروني' },
      { field: 'phone', label: 'رقم الهاتف' },
      { field: 'monthlySalary', label: 'الراتب الشهري' },
      { field: 'contractPeriod', label: 'مدة العقد' },
      { field: 'passportNumber', label: 'رقم جواز السفر' },
      { field: 'passportIssueDate', label: 'تاريخ صدور الجواز' },
      { field: 'passportExpiryDate', label: 'تاريخ انتهاء الجواز' },
      { field: 'passportIssuePlace', label: 'مكان صدور الجواز' },
      { field: 'nationality', label: 'الجنسية' },
      { field: 'religion', label: 'الديانة' },
      { field: 'dateOfBirth', label: 'تاريخ الميلاد' },
      { field: 'placeOfBirth', label: 'مكان الميلاد' },
      { field: 'livingTown', label: 'مكان السكن' },
      { field: 'weight', label: 'الوزن' },
      { field: 'height', label: 'الطول' },
      { field: 'complexion', label: 'لون البشرة' },
      { field: 'age', label: 'العمر' }
    ]

    for (const { field, label } of requiredFields) {
      if (!formData[field as keyof typeof formData] || 
          (typeof formData[field as keyof typeof formData] === 'string' && 
           !formData[field as keyof typeof formData].toString().trim())) {
        toast.error(`${label} مطلوب`)
        return
      }
    }

    // التحقق من العمر
    if (formData.age < 18 || formData.age > 65) {
      toast.error('العمر يجب أن يكون بين 18 و 65 سنة')
      return
    }

    // التحقق من صحة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error('البريد الإلكتروني غير صحيح')
      return
    }

    // التحقق من صحة رقم الهاتف
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      toast.error('رقم الهاتف غير صحيح')
      return
    }

    setIsLoading(true)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/cvs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(finalFormData),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('تم إضافة السيرة الذاتية بنجاح')
        router.push(`/dashboard/cv/${data.cv.id}/alqaeid`)
      } else if (response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'فشل في إضافة السيرة الذاتية')
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء إضافة السيرة الذاتية')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center">
          <FileText className="h-6 w-6 text-blue-600 ml-3" />
          <h1 className="text-2xl font-bold text-gray-900">
            إضافة سيرة ذاتية جديدة - CV
          </h1>
        </div>

        {/* Form */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Image */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">الصورة الشخصية</h3>
            <div className="flex items-center space-x-6">
              <div className="flex-shrink-0">
                <div className="w-32 h-40 bg-gray-200 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-gray-400">
                      <Camera className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">صورة كاملة للجسم</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </label>
                <p className="text-sm text-gray-500 mt-2">اختر صورة واضحة بخلفية بيضاء</p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">المعلومات الأساسية *</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم الكامل بالإنجليزية *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white text-black font-medium"
                  placeholder="MEYRAMA MUSTEFA EDO"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البريد الإلكتروني *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white text-black font-medium"
                  placeholder="example@email.com"
                  dir="ltr"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الهاتف *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white text-black font-medium"
                  placeholder="+966501234567"
                  dir="ltr"
                  required
                />
              </div>
            </div>
          </div>

          {/* Employment Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">تفاصيل العمل *</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الراتب الشهري *
                </label>
                <input
                  type="text"
                  name="monthlySalary"
                  value={formData.monthlySalary}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white text-black font-medium"
                  placeholder="1000SAR"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  مدة العقد *
                </label>
                <input
                  type="text"
                  name="contractPeriod"
                  value={formData.contractPeriod}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white text-black font-medium"
                  placeholder="2 YEARS"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المنصب المطلوب
                </label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white text-black font-medium"
                  placeholder="عاملة منزلية"
                />
              </div>
            </div>
          </div>

          {/* Passport Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">بيانات جواز السفر *</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم جواز السفر *
                </label>
                <input
                  type="text"
                  name="passportNumber"
                  value={formData.passportNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white text-black font-medium"
                  placeholder="EP8746771"
                  dir="ltr"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاريخ صدور الجواز *
                </label>
                <input
                  type="date"
                  name="passportIssueDate"
                  value={formData.passportIssueDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white text-black font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاريخ انتهاء الجواز *
                </label>
                <input
                  type="date"
                  name="passportExpiryDate"
                  value={formData.passportExpiryDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white text-black font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  مكان صدور الجواز *
                </label>
                <input
                  type="text"
                  name="passportIssuePlace"
                  value={formData.passportIssuePlace}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white text-black font-medium"
                  placeholder="ADDIS ABABA"
                  required
                />
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">المعلومات الشخصية *</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الجنسية *
                </label>
                <select
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white text-black font-medium"
                  required
                >
                  <option value="">اختر الجنسية</option>
                  <option value="ETHIOPIAN">إثيوبية</option>
                  <option value="FILIPINO">فلبينية</option>
                  <option value="INDIAN">هندية</option>
                  <option value="BANGLADESHI">بنغلاديشية</option>
                  <option value="KENYAN">كينية</option>
                  <option value="UGANDAN">أوغندية</option>
                  <option value="OTHER">أخرى</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الديانة *
                </label>
                <select
                  name="religion"
                  value={formData.religion}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white text-black font-medium"
                  required
                >
                  <option value="">اختر الديانة</option>
                  <option value="MUSLIM">مسلمة</option>
                  <option value="CHRISTIAN">مسيحية</option>
                  <option value="OTHER">أخرى</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاريخ الميلاد *
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white text-black font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  مكان الميلاد *
                </label>
                <input
                  type="text"
                  name="placeOfBirth"
                  value={formData.placeOfBirth}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white text-black font-medium"
                  placeholder="GUNA"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  مكان السكن *
                </label>
                <input
                  type="text"
                  name="livingTown"
                  value={formData.livingTown}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white text-black font-medium"
                  placeholder="GUNA"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الحالة الاجتماعية *
                </label>
                <select
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white text-black font-medium"
                  required
                >
                  <option value={MaritalStatus.SINGLE}>أعزب</option>
                  <option value={MaritalStatus.MARRIED}>متزوج</option>
                  <option value={MaritalStatus.DIVORCED}>مطلق</option>
                  <option value={MaritalStatus.WIDOWED}>أرمل</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عدد الأطفال
                </label>
                <input
                  type="number"
                  name="numberOfChildren"
                  value={formData.numberOfChildren}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white text-black font-medium"
                  min="0"
                  max="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الوزن *
                </label>
                <input
                  type="text"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white text-black font-medium"
                  placeholder="54kg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الطول *
                </label>
                <input
                  type="text"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white text-black font-medium"
                  placeholder="158cm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  لون البشرة *
                </label>
                <select
                  name="complexion"
                  value={formData.complexion}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white text-black font-medium"
                  required
                >
                  <option value="">اختر لون البشرة</option>
                  <option value="LIGHT">فاتح</option>
                  <option value="MEDIUM">متوسط</option>
                  <option value="BROWN">بني</option>
                  <option value="DARK">داكن</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  العمر *
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white text-black font-medium"
                  min="18"
                  max="65"
                  placeholder="24"
                  required
                />
              </div>
            </div>
          </div>

          {/* Languages and Education */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">اللغة والتعليم</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  مستوى الإنجليزية
                </label>
                <select
                  name="englishLevel"
                  value={formData.englishLevel}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white text-black font-medium"
                >
                  <option value={SkillLevel.NO}>لا</option>
                  <option value={SkillLevel.YES}>نعم</option>
                  <option value={SkillLevel.WILLING}>مستعدة للتعلم</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  مستوى العربية
                </label>
                <select
                  name="arabicLevel"
                  value={formData.arabicLevel}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white text-black font-medium"
                >
                  <option value={SkillLevel.NO}>لا</option>
                  <option value={SkillLevel.YES}>نعم</option>
                  <option value={SkillLevel.WILLING}>مستعدة للتعلم</option>
                </select>
              </div>
            </div>
          </div>

          {/* Skills and Experiences */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">المهارات والخبرات</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: 'babySitting', label: 'عناية الرضع' },
                { name: 'childrenCare', label: 'عناية الأطفال' },
                { name: 'tutoring', label: 'تعليم الأطفال' },
                { name: 'disabledCare', label: 'عناية العجزة' },
                { name: 'cleaning', label: 'التنظيف' },
                { name: 'washing', label: 'الغسيل' },
                { name: 'ironing', label: 'الكوي' },
                { name: 'arabicCooking', label: 'الطبخ العربي' },
                { name: 'sewing', label: 'الخياطة' },
                { name: 'driving', label: 'القيادة' },
              ].map((skill) => (
                <div key={skill.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {skill.label}
                  </label>
                  <select
                    name={skill.name}
                    value={formData[skill.name as keyof typeof formData] as string}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white text-black font-medium"
                  >
                    <option value={SkillLevel.NO}>لا</option>
                    <option value={SkillLevel.YES}>نعم</option>
                    <option value={SkillLevel.WILLING}>مستعدة للتعلم</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Previous Employment Abroad */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">الخبرة السابقة بالخارج</h3>
            <div className="space-y-4">
              {employmentHistory.map((job, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <input
                    type="text"
                    name="period"
                    value={job.period}
                    onChange={(e) => handleEmploymentChange(index, e)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="الفترة (مثال: 2018-2020)"
                  />
                  <input
                    type="text"
                    name="country"
                    value={job.country}
                    onChange={(e) => handleEmploymentChange(index, e)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="الدولة"
                  />
                  <input
                    type="text"
                    name="position"
                    value={job.position}
                    onChange={(e) => handleEmploymentChange(index, e)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="المنصب"
                  />
                  <button
                    type="button"
                    onClick={() => removeEmploymentRow(index)}
                    className="text-red-500 hover:text-red-700 disabled:opacity-50"
                    disabled={employmentHistory.length === 1}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addEmploymentRow}
              className="mt-4 flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              <Plus className="h-4 w-4 ml-1" />
              إضافة خبرة أخرى
            </button>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">ملاحظات إضافية</h3>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white text-black font-medium"
              placeholder="أي ملاحظات إضافية..."
              dir="rtl"
            />
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
              ) : (
                <Save className="h-4 w-4 ml-2" />
              )}
              {isLoading ? 'جاري الحفظ...' : 'حفظ السيرة الذاتية'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
