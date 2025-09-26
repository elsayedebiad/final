'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Download, CheckCircle2, AlertTriangle, SlidersHorizontal } from 'lucide-react'
import JSZip from 'jszip'
import { toPng } from 'html-to-image'

type Props = {
  cvIds: string[]
  cvNameById?: (id: string) => string
  onClose: () => void
  onComplete: () => void
}

export default function BulkImageDownloader({ cvIds, cvNameById, onClose, onComplete }: Props) {
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const [errorCount, setErrorCount] = useState(0)
  const [busy, setBusy] = useState(false)
  const iframeHostRef = useRef<HTMLDivElement>(null)

  const cvRoute = (id: string) => `/dashboard/cv/${id}/alqaeid?embed=1`

  useEffect(() => {
    // يبدأ تلقائيًا
    run().catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const run = async () => {
    if (!cvIds?.length) return
    setBusy(true)

    const zip = new JSZip()
    let index = 0

    for (const id of cvIds) {
      try {
        const { iframe, node } = await loadIframeAndNode(id)
        const dataUrl = await toPng(node, {
          cacheBust: true,
          backgroundColor: '#ffffff',
          pixelRatio: 2,
          width: node.scrollWidth,
          height: node.scrollHeight,
          filter: (n) => !(n instanceof HTMLElement && n.classList?.contains('print:hidden')),
        })
        cleanupIframe(iframe)

        const base64 = dataUrl.split(',')[1]
        const nameHint = (cvNameById?.(id) || id).replace(/[\\/:*?"<>|]+/g, '-')
        zip.file(`${nameHint}.png`, base64, { base64: true })
      } catch (e) {
        console.warn('فشل تنزيل صورة لسيرة، متابعة...', e)
        setErrorCount((c) => c + 1)
      } finally {
        index++
        setProgress(Math.round((index / cvIds.length) * 100))
      }
    }

    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    triggerDownload(url, `CVs-${new Date().toISOString().slice(0,10)}.zip`, true)
    setDone(true)
    setBusy(false)
    onComplete()
  }

  const loadIframeAndNode = (id: string): Promise<{ iframe: HTMLIFrameElement; node: HTMLElement }> =>
    new Promise((resolve, reject) => {
      const host = iframeHostRef.current!
      const iframe = document.createElement('iframe')
      iframe.src = cvRoute(id)
      iframe.style.width = '1200px'
      iframe.style.height = '1700px'
      iframe.style.position = 'absolute'
      iframe.style.left = '-99999px'
      iframe.style.top = '-99999px'
      iframe.style.border = '0'
      iframe.onload = async () => {
        try {
          const doc = iframe.contentDocument!
          // fonts
          const w = iframe.contentWindow as any
          if (w?.document?.fonts?.ready) {
            try { await w.document.fonts.ready } catch {}
          }
          // images
          const imgs = Array.from(doc.querySelectorAll('img')) as HTMLImageElement[]
          await Promise.all(imgs.map(img => {
            if (img.complete && img.naturalWidth > 0) return Promise.resolve()
            return new Promise<void>(res => {
              const done = () => { img.removeEventListener('load', done); img.removeEventListener('error', done); res() }
              img.addEventListener('load', done)
              img.addEventListener('error', done)
            })
          }))
          // element
          const node = doc.querySelector('.cv-template') as HTMLElement | null
          if (!node) return reject(new Error('cv-template not found'))
          // wait frames
          await new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())))
          // ensure dimensions
          const start = Date.now()
          while ((node.scrollWidth === 0 || node.scrollHeight === 0) && Date.now() - start < 2000) {
            await new Promise(r => setTimeout(r, 50))
          }
          resolve({ iframe, node })
        } catch (e) {
          reject(e)
        }
      }
      iframe.onerror = () => reject(new Error('iframe load error'))
      host.appendChild(iframe)
    })

  const cleanupIframe = (iframe: HTMLIFrameElement) => {
    try { iframe.remove() } catch {}
  }

  const triggerDownload = (urlOrDataUrl: string, filename: string, isObjectUrl = false) => {
    const a = document.createElement('a')
    a.href = urlOrDataUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    if (isObjectUrl) URL.revokeObjectURL(urlOrDataUrl)
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 left-3 p-2 rounded-full hover:bg-slate-100"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-slate-600" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 grid place-items-center">
            <SlidersHorizontal className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">تنزيل صور السير المحددة</h3>
            <p className="text-xs text-slate-500">سنقوم بتحويل كل سيرة لصورة PNG وتجميعها في ملف ZIP</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-slate-600 flex items-center justify-between">
            <span>التقدم: {progress}%</span>
            {errorCount > 0 && (
              <span className="inline-flex items-center gap-1 text-amber-600">
                <AlertTriangle className="h-4 w-4" /> أخطاء: {errorCount}
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          {!busy && done ? (
            <span className="inline-flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" /> انتهى التنزيل
            </span>
          ) : (
            <button
              disabled
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white inline-flex items-center gap-2 opacity-70"
            >
              <Download className="h-4 w-4" /> جاري التحضير...
            </button>
          )}
          <button onClick={onClose} className="px-4 py-2 rounded-lg border hover:bg-slate-50">إغلاق</button>
        </div>

        {/* حاوية iframes المخفية */}
        <div ref={iframeHostRef} style={{ position: 'fixed', left: -99999, top: -99999, width: 0, height: 0 }} aria-hidden />
      </div>
    </div>
  )
}
