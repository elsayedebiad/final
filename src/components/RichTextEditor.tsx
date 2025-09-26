'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useState } from 'react'
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo,
  Save
} from 'lucide-react'

interface RichTextEditorProps {
  content?: string
  onChange?: (content: string) => void
  onSave?: () => void
  cvId?: string
  userId?: string
  userName?: string
  isReadOnly?: boolean
}


export default function RichTextEditor({ 
  content = '', 
  onChange, 
  onSave,
  cvId,
  userId,
  userName,
  isReadOnly = false 
}: RichTextEditorProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [useSimpleEditor, setUseSimpleEditor] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: {
          depth: 100,
        },
      }),
    ],
    content,
    editable: !isReadOnly,
    onUpdate: ({ editor }) => {
      if (onChange && !isReadOnly) {
        onChange(editor.getHTML())
      }
    },
    onCreate: () => {
      // Editor created successfully
      setUseSimpleEditor(false)
    },
    onDestroy: () => {
      // Editor destroyed
    },
  }, [useSimpleEditor])

  // Error boundary effect
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      if (error.message && error.message.includes('addProseMirrorPlugins')) {
        console.warn('TipTap editor failed to initialize, falling back to simple editor')
        setUseSimpleEditor(true)
      }
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  // Fallback to simple editor if TipTap fails
  useEffect(() => {
    if (editor && !useSimpleEditor && content && editor.getHTML() !== content) {
      editor.commands.setContent(content, false)
    }
  }, [content, editor, useSimpleEditor])

  if (useSimpleEditor) {
    return (
      <div className="border rounded-lg overflow-hidden">
        {!isReadOnly && (
          <div className="border-b bg-gray-50 p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">محرر نص بسيط</div>
              {onSave && (
                <button
                  onClick={onSave}
                  disabled={isSaving}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4 ml-1" />
                  {isSaving ? 'جاري الحفظ...' : 'حفظ'}
                </button>
              )}
            </div>
          </div>
        )}
        <textarea
          value={content}
          onChange={(e) => onChange?.(e.target.value)}
          readOnly={isReadOnly}
          className="w-full p-4 min-h-[400px] border-0 focus:outline-none resize-none"
          dir="rtl"
          placeholder={isReadOnly ? '' : 'اكتب المحتوى هنا...'}
        />
        {isReadOnly && (
          <div className="bg-gray-50 px-4 py-2 text-sm text-gray-600 text-center">
            وضع القراءة فقط
          </div>
        )}
      </div>
    )
  }

  const handleSave = async () => {
    if (!onSave || !editor) return
    
    setIsSaving(true)
    try {
      await onSave()
    } finally {
      setIsSaving(false)
    }
  }

  if (!editor) {
    return (
      <div className="border rounded-lg p-4 min-h-[400px] flex items-center justify-center">
        <div className="text-gray-500">جاري تحميل المحرر...</div>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {!isReadOnly && (
        <div className="border-b bg-gray-50 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Format buttons */}
              <div className="flex items-center space-x-1 border-l border-gray-300 pl-2 ml-2">
                <button
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={`p-2 rounded hover:bg-gray-200 ${
                    editor.isActive('bold') ? 'bg-gray-200' : ''
                  }`}
                  title="عريض"
                >
                  <Bold className="h-4 w-4" />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={`p-2 rounded hover:bg-gray-200 ${
                    editor.isActive('italic') ? 'bg-gray-200' : ''
                  }`}
                  title="مائل"
                >
                  <Italic className="h-4 w-4" />
                </button>
              </div>

              {/* List buttons */}
              <div className="flex items-center space-x-1 border-l border-gray-300 pl-2 ml-2">
                <button
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  className={`p-2 rounded hover:bg-gray-200 ${
                    editor.isActive('bulletList') ? 'bg-gray-200' : ''
                  }`}
                  title="قائمة نقطية"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  className={`p-2 rounded hover:bg-gray-200 ${
                    editor.isActive('orderedList') ? 'bg-gray-200' : ''
                  }`}
                  title="قائمة مرقمة"
                >
                  <ListOrdered className="h-4 w-4" />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  className={`p-2 rounded hover:bg-gray-200 ${
                    editor.isActive('blockquote') ? 'bg-gray-200' : ''
                  }`}
                  title="اقتباس"
                >
                  <Quote className="h-4 w-4" />
                </button>
              </div>

              {/* History buttons */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => editor.chain().focus().undo().run()}
                  disabled={!editor.can().undo()}
                  className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="تراجع"
                >
                  <Undo className="h-4 w-4" />
                </button>
                <button
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={!editor.can().redo()}
                  className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="إعادة"
                >
                  <Redo className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Save button */}
            <div className="flex items-center space-x-4">
              {onSave && (
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4 ml-1" />
                  {isSaving ? 'جاري الحفظ...' : 'حفظ'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="prose prose-sm max-w-none p-4 min-h-[400px] focus-within:outline-none" dir="rtl">
        <EditorContent 
          editor={editor} 
          className="focus:outline-none min-h-[350px]"
        />
      </div>

      {isReadOnly && (
        <div className="bg-gray-50 px-4 py-2 text-sm text-gray-600 text-center">
          وضع القراءة فقط
        </div>
      )}
    </div>
  )
}
