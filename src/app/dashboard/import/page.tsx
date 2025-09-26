'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Priority } from '@prisma/client'
import { 
  ArrowLeft, 
  Upload, 
  FileSpreadsheet, 
  Eye, 
  Download, 
  AlertCircle, 
  CheckCircle,
  X,
  Check
} from 'lucide-react'

interface ParsedCV {
  fullName: string
  email?: string
  phone?: string
  position?: string
  experience?: string
  education?: string
  skills?: string
  summary?: string
  priority: Priority
  notes?: string
  isValid: boolean
  errors: string[]
}

interface ImportResult {
  total: number
  valid: number
  invalid: number
  validCVs: ParsedCV[]
  invalidCVs: ParsedCV[]
  message: string
}

export default function ImportPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [previewData, setPreviewData] = useState<ImportResult | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setPreviewData(null)
      setShowPreview(false)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file) {
      setSelectedFile(file)
      setPreviewData(null)
      setShowPreview(false)
    }
  }

  const previewImport = async () => {
    if (!selectedFile) {
      toast.error('يرجى اختيار ملف أولاً')
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('action', 'preview')

      const response = await fetch('/api/cvs/import', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setPreviewData(data)
        setShowPreview(true)
        toast.success('تم تحليل الملف بنجاح')
      } else {
        toast.error(data.error || 'فشل في تحليل الملف')
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تحليل الملف')
    } finally {
      setIsLoading(false)
    }
  }

  const executeImport = async () => {
    if (!selectedFile || !previewData) {
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('action', 'import')

      const response = await fetch('/api/cvs/import', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`تم استيراد ${data.imported} سيرة ذاتية بنجاح`)
        router.push('/dashboard')
      } else {
        toast.error(data.error || 'فشل في استيراد السير الذاتية')
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء الاستيراد')
    } finally {
      setIsLoading(false)
    }
  }

  const downloadTemplate = () => {
    // Create a simple CSV template
    const template = `الاسم الكامل,البريد الإلكتروني,رقم الهاتف,المنصب,سنوات الخبرة,المؤهل العلمي,المهارات,الملخص المهني,الأولوية,ملاحظات
أحمد محمد,ahmed@example.com,+966501234567,مطور ويب,5,بكالوريوس علوم حاسوب,"JavaScript, React, Node.js",مطور ويب مع خبرة 5 سنوات في تطوير التطبيقات الحديثة,متوسطة,مرشح ممتاز
فاطمة علي,fatima@example.com,+966507654321,مصممة جرافيك,3,دبلوم تصميم جرافيكي,"Photoshop, Illustrator, InDesign",مصممة إبداعية مع خبرة في التسويق الرقمي,عالية,موصى بها`

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'cv_template.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getPriorityText = (priority: Priority) => {
    switch (priority) {
      case Priority.LOW:
        return 'منخفضة'
      case Priority.MEDIUM:
        return 'متوسطة'
      case Priority.HIGH:
        return 'عالية'
      case Priority.URGENT:
        return 'عاجلة'
      default:
        return priority
    }
  }

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.LOW:
        return 'bg-gray-100 text-gray-800'
      case Priority.MEDIUM:
        return 'bg-blue-100 text-blue-800'
      case Priority.HIGH:
        return 'bg-orange-100 text-orange-800'
      case Priority.URGENT:
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="ml-4 p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <FileSpreadsheet className="h-6 w-6 text-indigo-600 ml-3" />
              <h1 className="text-xl font-semibold text-gray-900">استيراد من Excel</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!showPreview ? (
          <div className="space-y-8">
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-blue-900 mb-3">تعليمات الاستيراد</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-blue-600 ml-2" />
                  يدعم النظام ملفات Excel (.xlsx, .xls) و CSV
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-blue-600 ml-2" />
                  الحد الأدنى المطلوب: الاسم الكامل في العمود الأول
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-blue-600 ml-2" />
                  يمكن استخدام العناوين باللغة العربية أو الإنجليزية
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-blue-600 ml-2" />
                  سيتم تجاهل الصفوف التي تحتوي على أخطاء
                </li>
              </ul>
            </div>

            {/* Template Download */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">قالب Excel</h3>
                <button
                  onClick={downloadTemplate}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Download className="h-4 w-4 ml-2" />
                  تحميل القالب
                </button>
              </div>
              <p className="text-sm text-gray-600">
                احصل على قالب Excel جاهز مع العناوين الصحيحة وأمثلة على البيانات
              </p>
            </div>

            {/* File Upload */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">اختيار الملف</h3>
              
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900">
                    اسحب وأفلت ملف Excel هنا
                  </p>
                  <p className="text-sm text-gray-500">أو</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Upload className="h-4 w-4 ml-2" />
                    اختر ملف
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  يدعم: .xlsx, .xls, .csv (حتى 10MB)
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />

              {selectedFile && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileSpreadsheet className="h-5 w-5 text-green-600 ml-2" />
                      <span className="text-sm font-medium text-gray-900">
                        {selectedFile.name}
                      </span>
                      <span className="text-xs text-gray-500 mr-2">
                        ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Preview Button */}
            {selectedFile && (
              <div className="flex justify-center">
                <button
                  onClick={previewImport}
                  disabled={isLoading}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Eye className="h-5 w-5 ml-2" />
                  {isLoading ? 'جاري التحليل...' : 'معاينة البيانات'}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Preview Results */
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">ملخص الاستيراد</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <FileSpreadsheet className="h-8 w-8 text-blue-600" />
                    <div className="mr-3">
                      <p className="text-sm font-medium text-blue-900">إجمالي الصفوف</p>
                      <p className="text-2xl font-bold text-blue-600">{previewData?.total}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div className="mr-3">
                      <p className="text-sm font-medium text-green-900">صحيحة</p>
                      <p className="text-2xl font-bold text-green-600">{previewData?.valid}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                    <div className="mr-3">
                      <p className="text-sm font-medium text-red-900">بها أخطاء</p>
                      <p className="text-2xl font-bold text-red-600">{previewData?.invalid}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Valid CVs Preview */}
            {previewData && previewData.validCVs.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    السير الذاتية الصحيحة (أول 10)
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {previewData.validCVs.map((cv, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{cv.fullName}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(cv.priority)}`}>
                            {getPriorityText(cv.priority)}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          {cv.email && <p>📧 {cv.email}</p>}
                          {cv.phone && <p>📱 {cv.phone}</p>}
                          {cv.position && <p>💼 {cv.position}</p>}
                          {cv.experience && <p>⏰ {cv.experience}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Invalid CVs */}
            {previewData && previewData.invalidCVs.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-red-900">
                    الصفوف التي تحتوي على أخطاء
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {previewData.invalidCVs.map((cv, index) => (
                      <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                        <h4 className="font-medium text-red-900 mb-2">
                          {cv.fullName || 'بيانات غير مكتملة'}
                        </h4>
                        <ul className="list-disc list-inside text-sm text-red-800 space-y-1">
                          {cv.errors.map((error, errorIndex) => (
                            <li key={errorIndex}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                العودة للتعديل
              </button>
              <div className="flex space-x-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={executeImport}
                  disabled={isLoading || !previewData?.valid}
                  className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="h-4 w-4 ml-2" />
                  {isLoading ? 'جاري الاستيراد...' : `استيراد ${previewData?.valid} سيرة ذاتية`}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
