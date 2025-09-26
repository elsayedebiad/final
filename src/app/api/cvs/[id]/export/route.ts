import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ActivityType } from '@prisma/client'
import puppeteer from 'puppeteer'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id')
    const resolvedParams = await params

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cv = await db.cV.findUnique({
      where: { id: resolvedParams.id },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!cv) {
      return NextResponse.json(
        { error: 'CV not found' },
        { status: 404 }
      )
    }

    // Generate HTML template for PDF
    const htmlTemplate = generateCVHTML(cv)

    // Launch puppeteer to generate PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    
    const page = await browser.newPage()
    await page.setContent(htmlTemplate, { 
      waitUntil: 'networkidle0' 
    })

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    })

    await browser.close()

    // Log export activity
    await db.activityLog.create({
      data: {
        userId,
        cvId: cv.id,
        action: ActivityType.CV_EXPORTED,
        description: `Exported CV for ${cv.fullName} to PDF`,
        metadata: JSON.stringify({ 
          format: 'PDF',
          fileName: `CV_${cv.fullName.replace(/\s+/g, '_')}.pdf`
        }),
      },
    })

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="CV_${cv.fullName.replace(/\s+/g, '_')}.pdf"`,
      },
    })

  } catch (error) {
    console.error('Error exporting CV:', error)
    return NextResponse.json(
      { error: 'Failed to export CV', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

function generateCVHTML(cv: any): string {
  const getStatusText = (status: string) => {
    switch (status) {
      case 'NEW': return 'جديد'
      case 'BOOKED': return 'محجوز'
      case 'HIRED': return 'متعاقد'
      case 'REJECTED': return 'مرفوض'
      case 'ARCHIVED': return 'مؤرشف'
      default: return status
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'منخفضة'
      case 'MEDIUM': return 'متوسطة'
      case 'HIGH': return 'عالية'
      case 'URGENT': return 'عاجلة'
      default: return priority
    }
  }

  return `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>سيرة ذاتية - ${cv.fullName}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap');
            
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Noto Sans Arabic', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                background: #fff;
                direction: rtl;
            }
            
            .container {
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }
            
            .header {
                text-align: center;
                margin-bottom: 30px;
                padding: 30px 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 10px;
            }
            
            .header h1 {
                font-size: 2.5em;
                font-weight: 700;
                margin-bottom: 10px;
            }
            
            .header .position {
                font-size: 1.3em;
                font-weight: 400;
                opacity: 0.9;
            }
            
            .contact-info {
                display: flex;
                justify-content: center;
                gap: 30px;
                margin-top: 20px;
                flex-wrap: wrap;
            }
            
            .contact-item {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 1.1em;
            }
            
            .section {
                margin-bottom: 30px;
                background: #f8f9fa;
                padding: 25px;
                border-radius: 10px;
                border-right: 4px solid #667eea;
            }
            
            .section h2 {
                font-size: 1.8em;
                font-weight: 600;
                color: #667eea;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 2px solid #e9ecef;
            }
            
            .section p, .section div {
                font-size: 1.1em;
                line-height: 1.8;
                margin-bottom: 10px;
            }
            
            .meta-info {
                background: #e3f2fd;
                padding: 20px;
                border-radius: 10px;
                margin-top: 30px;
                border-right: 4px solid #2196f3;
            }
            
            .meta-info h3 {
                color: #1976d2;
                margin-bottom: 15px;
                font-size: 1.3em;
            }
            
            .meta-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                padding: 5px 0;
                border-bottom: 1px solid #bbdefb;
            }
            
            .meta-row:last-child {
                border-bottom: none;
            }
            
            .status-badge {
                display: inline-block;
                padding: 5px 12px;
                border-radius: 20px;
                font-size: 0.9em;
                font-weight: 500;
            }
            
            .status-new { background: #e3f2fd; color: #1976d2; }
            .status-booked { background: #fff3e0; color: #f57c00; }
            .status-hired { background: #e8f5e8; color: #2e7d32; }
            .status-rejected { background: #ffebee; color: #d32f2f; }
            .status-archived { background: #f5f5f5; color: #616161; }
            
            .priority-low { background: #f5f5f5; color: #616161; }
            .priority-medium { background: #e3f2fd; color: #1976d2; }
            .priority-high { background: #fff3e0; color: #f57c00; }
            .priority-urgent { background: #ffebee; color: #d32f2f; }
            
            .content {
                white-space: pre-wrap;
                line-height: 1.8;
            }
            
            .footer {
                text-align: center;
                margin-top: 40px;
                padding: 20px;
                border-top: 2px solid #e9ecef;
                color: #666;
                font-size: 0.9em;
            }
            
            @media print {
                body { font-size: 12px; }
                .container { padding: 10px; }
                .section { page-break-inside: avoid; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- Header -->
            <div class="header">
                <h1>${cv.fullName}</h1>
                ${cv.position ? `<div class="position">${cv.position}</div>` : ''}
                <div class="contact-info">
                    ${cv.email ? `<div class="contact-item">📧 ${cv.email}</div>` : ''}
                    ${cv.phone ? `<div class="contact-item">📱 ${cv.phone}</div>` : ''}
                    ${cv.experience ? `<div class="contact-item">⏰ ${cv.experience} سنوات خبرة</div>` : ''}
                </div>
            </div>

            <!-- Summary -->
            ${cv.summary ? `
            <div class="section">
                <h2>الملخص المهني</h2>
                <div class="content">${cv.summary}</div>
            </div>
            ` : ''}

            <!-- Education -->
            ${cv.education ? `
            <div class="section">
                <h2>المؤهل العلمي</h2>
                <div class="content">${cv.education}</div>
            </div>
            ` : ''}

            <!-- Skills -->
            ${cv.skills ? `
            <div class="section">
                <h2>المهارات</h2>
                <div class="content">${cv.skills}</div>
            </div>
            ` : ''}

            <!-- Content -->
            ${cv.content ? `
            <div class="section">
                <h2>التفاصيل</h2>
                <div class="content">${cv.content.replace(/<[^>]*>/g, '')}</div>
            </div>
            ` : ''}

            <!-- Notes -->
            ${cv.notes ? `
            <div class="section">
                <h2>ملاحظات</h2>
                <div class="content">${cv.notes}</div>
            </div>
            ` : ''}

            <!-- Meta Information -->
            <div class="meta-info">
                <h3>معلومات إضافية</h3>
                <div class="meta-row">
                    <span><strong>الحالة:</strong></span>
                    <span class="status-badge status-${cv.status.toLowerCase()}">${getStatusText(cv.status)}</span>
                </div>
                <div class="meta-row">
                    <span><strong>الأولوية:</strong></span>
                    <span class="status-badge priority-${cv.priority.toLowerCase()}">${getPriorityText(cv.priority)}</span>
                </div>
                <div class="meta-row">
                    <span><strong>تاريخ الإنشاء:</strong></span>
                    <span>${new Date(cv.createdAt).toLocaleDateString('ar-SA')}</span>
                </div>
                <div class="meta-row">
                    <span><strong>تم الإنشاء بواسطة:</strong></span>
                    <span>${cv.createdBy.name}</span>
                </div>
                ${cv.updatedAt !== cv.createdAt ? `
                <div class="meta-row">
                    <span><strong>آخر تحديث:</strong></span>
                    <span>${new Date(cv.updatedAt).toLocaleDateString('ar-SA')}</span>
                </div>
                ` : ''}
            </div>

            <!-- Footer -->
            <div class="footer">
                <p>تم إنشاء هذه السيرة الذاتية بواسطة نظام إدارة السير الذاتية</p>
                <p>تاريخ التصدير: ${new Date().toLocaleDateString('ar-SA')}</p>
            </div>
        </div>
    </body>
    </html>
  `
}
