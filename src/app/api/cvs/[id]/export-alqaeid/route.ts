import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ActivityType, SkillLevel, MaritalStatus } from '@prisma/client'
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

    // Generate Al-Qaeid HTML template for PDF
    const htmlTemplate = generateAlQaeidCVHTML(cv)

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
        top: '10px',
        right: '10px',
        bottom: '10px',
        left: '10px'
      }
    })

    await browser.close()

    // Log export activity
    await db.activityLog.create({
      data: {
        userId,
        action: ActivityType.CV_EXPORTED,
        description: `Exported Al-Qaeid CV for ${cv.fullName} to PDF`,
        metadata: JSON.stringify({ 
          format: 'PDF',
          template: 'Al-Qaeid',
          fileName: `AlQaeid_CV_${(cv.fullName || 'CV').replace(/\s+/g, '_')}.pdf`
        }),
      },
    })

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="AlQaeid_CV_${(cv.fullName || 'CV').replace(/\s+/g, '_')}.pdf"`,
      },
    })

  } catch (error) {
    console.error('Error exporting Al-Qaeid CV:', error)
    return NextResponse.json(
      { error: 'Failed to export CV', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

function generateAlQaeidCVHTML(cv: any): string {
  const getSkillLevelText = (level: SkillLevel | null) => {
    if (!level) return 'NO'
    switch (level) {
      case SkillLevel.YES: return 'YES'
      case SkillLevel.NO: return 'NO'
      case SkillLevel.WILLING: return 'WILLING'
      default: return 'NO'
    }
  }

  const getMaritalStatusText = (status: MaritalStatus | null) => {
    if (!status) return 'SINGLE'
    switch (status) {
      case MaritalStatus.SINGLE: return 'SINGLE'
      case MaritalStatus.MARRIED: return 'MARRIED'
      case MaritalStatus.DIVORCED: return 'DIVORCED'
      case MaritalStatus.WIDOWED: return 'WIDOWED'
      default: return 'SINGLE'
    }
  }

  // Parse previous employment if it exists
  let previousEmploymentRows = ''
  if (cv.previousEmployment) {
    try {
      const employmentData = JSON.parse(cv.previousEmployment)
      employmentData.forEach((emp: any) => {
        previousEmploymentRows += `
          <tr>
            <td class="employment-cell">${emp.period || ''}</td>
            <td class="employment-cell">${emp.country || ''}</td>
            <td class="employment-cell">${emp.position || ''}</td>
          </tr>
        `
      })
    } catch (e) {
      // If parsing fails, add empty rows
    }
  }

  // Add empty rows to fill the table
  for (let i = previousEmploymentRows.split('<tr>').length - 1; i < 4; i++) {
    previousEmploymentRows += `
      <tr>
        <td class="employment-cell">&nbsp;</td>
        <td class="employment-cell">&nbsp;</td>
        <td class="employment-cell">&nbsp;</td>
      </tr>
    `
  }

  return `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>طلب توظيف - ${cv.fullName || 'CV'}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap');
            
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Noto Sans Arabic', Arial, sans-serif;
                font-size: 12px;
                line-height: 1.2;
                color: #000;
                background: #fff;
                direction: rtl;
            }
            
            .container {
                width: 100%;
                max-width: 210mm;
                margin: 0 auto;
                padding: 10px;
            }
            
            /* Header */
            .header {
                text-align: center;
                margin-bottom: 15px;
                border-bottom: 2px solid #1E3A8A;
                padding-bottom: 10px;
            }
            
            .company-logo {
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 8px;
            }
            
            .logo-circle {
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #1E3A8A, #3B82F6);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 24px;
                font-weight: bold;
                margin-left: 15px;
            }
            
            .company-info {
                text-align: right;
            }
            
            .company-name-ar {
                font-size: 18px;
                font-weight: 700;
                color: #1E3A8A;
                margin-bottom: 2px;
            }
            
            .company-name-en {
                font-size: 14px;
                font-weight: 600;
                color: #3B82F6;
            }
            
            .form-title {
                background: #1E3A8A;
                color: white;
                padding: 8px;
                margin: 10px 0;
                text-align: center;
                font-weight: bold;
                font-size: 14px;
            }
            
            /* Main Content */
            .content {
                display: flex;
                gap: 15px;
            }
            
            .left-section {
                width: 200px;
                flex-shrink: 0;
            }
            
            .profile-image {
                width: 180px;
                height: 220px;
                border: 2px solid #1E3A8A;
                border-radius: 8px;
                background: #f8f9fa;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 15px;
                overflow: hidden;
            }
            
            .profile-image img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .no-image {
                color: #666;
                text-align: center;
                font-size: 10px;
            }
            
            .right-section {
                flex: 1;
            }
            
            /* Tables */
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 10px;
                font-size: 11px;
            }
            
            th, td {
                border: 1px solid #333;
                padding: 4px 6px;
                text-align: center;
                vertical-align: middle;
            }
            
            th {
                background: #E5E7EB;
                font-weight: 600;
            }
            
            .section-header {
                background: #3B82F6;
                color: white;
                font-weight: bold;
                text-align: center;
                font-size: 12px;
            }
            
            .field-label {
                background: #F3F4F6;
                font-weight: 500;
                text-align: right;
                width: 120px;
            }
            
            .field-label-en {
                background: #F3F4F6;
                font-weight: 500;
                text-align: left;
                width: 120px;
            }
            
            .field-value {
                text-align: center;
                background: white;
            }
            
            .arabic-text {
                text-align: right;
                font-weight: 500;
            }
            
            .english-text {
                text-align: left;
                font-weight: 500;
            }
            
            /* Skills Table */
            .skills-table {
                width: 100%;
            }
            
            .skills-table td {
                padding: 3px 5px;
                font-size: 10px;
            }
            
            .skill-name-ar {
                background: #F3F4F6;
                text-align: right;
                font-weight: 500;
                width: 25%;
            }
            
            .skill-name-en {
                background: #F3F4F6;
                text-align: left;
                font-weight: 500;
                width: 25%;
            }
            
            .skill-value {
                background: white;
                text-align: center;
                width: 15%;
                font-weight: 600;
            }
            
            /* Employment History */
            .employment-cell {
                text-align: center;
                padding: 6px 4px;
                font-size: 10px;
            }
            
            /* Personal Data Section */
            .personal-data {
                margin-top: 15px;
            }
            
            .personal-data table {
                font-size: 10px;
            }
            
            .personal-data td {
                padding: 3px 5px;
            }
            
            /* Code Section */
            .code-section {
                position: absolute;
                top: 10px;
                left: 10px;
                background: #1E3A8A;
                color: white;
                padding: 5px 10px;
                border-radius: 4px;
                font-weight: bold;
                font-size: 12px;
            }
            
            @media print {
                body { 
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                .container { 
                    max-width: none; 
                    padding: 0;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            ${cv.referenceCode ? `<div class="code-section">CODE: ${cv.referenceCode}</div>` : ''}
            
            <!-- Header -->
            <div class="header">
                <div class="company-logo">
                    <div class="logo-circle">
                        <span>⚡</span>
                    </div>
                    <div class="company-info">
                        <div class="company-name-ar">القعيد للاستقدام</div>
                        <div class="company-name-en">AlGaeid Recruitment</div>
                    </div>
                </div>
                <div class="form-title">APPLICATION FOR EMPLOYMENT</div>
            </div>

            <div class="content">
                <!-- Left Section - Photo -->
                <div class="left-section">
                    <div class="profile-image">
                        ${cv.profileImage ? 
                          `<img src="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}${cv.profileImage}" alt="Profile Photo" />` :
                          `<div class="no-image">صورة شخصية<br>Personal Photo</div>`
                        }
                    </div>
                </div>

                <!-- Right Section - Information -->
                <div class="right-section">
                    <!-- Basic Info -->
                    <table>
                        <tr>
                            <td class="field-label-en">FULL NAME</td>
                            <td class="field-value">${cv.fullName || ''}</td>
                            <td class="arabic-text">الاسم الكامل</td>
                        </tr>
                    </table>

                    <!-- Employment Details -->
                    <table>
                        <tr>
                            <td class="field-label-en">MONTHLY SALARY</td>
                            <td class="field-value">${cv.monthlySalary || ''}</td>
                            <td class="arabic-text">الراتب الشهري</td>
                        </tr>
                        <tr>
                            <td class="field-label-en">CONTRACT PERIOD</td>
                            <td class="field-value">${cv.contractPeriod || ''}</td>
                            <td class="arabic-text">مدة العقد</td>
                        </tr>
                    </table>

                    <!-- Passport Details -->
                    <table>
                        <tr>
                            <td class="section-header" colspan="3">PASSPORT DETAILS - بيانات جواز السفر</td>
                        </tr>
                        <tr>
                            <td class="field-label-en">NUMBER</td>
                            <td class="field-value">${cv.passportNumber || ''}</td>
                            <td class="arabic-text">رقم الجواز</td>
                        </tr>
                        <tr>
                            <td class="field-label-en">DATE OF ISSUE</td>
                            <td class="field-value">${cv.passportIssueDate || ''}</td>
                            <td class="arabic-text">تاريخ الصدور</td>
                        </tr>
                        <tr>
                            <td class="field-label-en">DATE OF EXPIRY</td>
                            <td class="field-value">${cv.passportExpiryDate || ''}</td>
                            <td class="arabic-text">تاريخ الانتهاء</td>
                        </tr>
                        <tr>
                            <td class="field-label-en">PLACE OF ISSUE</td>
                            <td class="field-value">${cv.passportIssuePlace || ''}</td>
                            <td class="arabic-text">مكان الصدور</td>
                        </tr>
                    </table>

                    <!-- Languages -->
                    <table>
                        <tr>
                            <td class="section-header" colspan="3">LANGUAGES AND EDUCATION - اللغة والتعليم</td>
                        </tr>
                        <tr>
                            <td class="field-label-en">ENGLISH</td>
                            <td class="field-value">${getSkillLevelText(cv.englishLevel)}</td>
                            <td class="arabic-text">الإنجليزي</td>
                        </tr>
                        <tr>
                            <td class="field-label-en">ARABIC</td>
                            <td class="field-value">${getSkillLevelText(cv.arabicLevel)}</td>
                            <td class="arabic-text">العربي</td>
                        </tr>
                    </table>
                </div>
            </div>

            <!-- Previous Employment -->
            <table style="margin-top: 15px;">
                <tr>
                    <td class="section-header" colspan="3">PREVIOUS EMPLOYMENT ABROAD - الخبرة خارج البلاد</td>
                </tr>
                <tr>
                    <th>PERIOD</th>
                    <th>COUNTRY OF EMPLOYMENT</th>
                    <th>POSITION</th>
                </tr>
                ${previousEmploymentRows}
            </table>

            <!-- Skills and Experiences -->
            <div style="display: flex; gap: 15px; margin-top: 15px;">
                <!-- Skills Table -->
                <div style="flex: 1;">
                    <table class="skills-table">
                        <tr>
                            <td class="section-header" colspan="3">SKILLS AND EXPERIENCES - خبرة العمل</td>
                        </tr>
                        <tr>
                            <td class="skill-name-en">BABY SITTING</td>
                            <td class="skill-value">${getSkillLevelText(cv.babySitting)}</td>
                            <td class="skill-name-ar">عناية الرضع</td>
                        </tr>
                        <tr>
                            <td class="skill-name-en">CHILDREN CARE</td>
                            <td class="skill-value">${getSkillLevelText(cv.childrenCare)}</td>
                            <td class="skill-name-ar">عناية الأطفال</td>
                        </tr>
                        <tr>
                            <td class="skill-name-en">TUTORING</td>
                            <td class="skill-value">${getSkillLevelText(cv.tutoring)}</td>
                            <td class="skill-name-ar">تعليم الأطفال</td>
                        </tr>
                        <tr>
                            <td class="skill-name-en">DISABLED CARE</td>
                            <td class="skill-value">${getSkillLevelText(cv.disabledCare)}</td>
                            <td class="skill-name-ar">عناية العجزة</td>
                        </tr>
                        <tr>
                            <td class="skill-name-en">CLEANING</td>
                            <td class="skill-value">${getSkillLevelText(cv.cleaning)}</td>
                            <td class="skill-name-ar">التنظيف</td>
                        </tr>
                        <tr>
                            <td class="skill-name-en">WASHING</td>
                            <td class="skill-value">${getSkillLevelText(cv.washing)}</td>
                            <td class="skill-name-ar">الغسيل</td>
                        </tr>
                        <tr>
                            <td class="skill-name-en">IRONING</td>
                            <td class="skill-value">${getSkillLevelText(cv.ironing)}</td>
                            <td class="skill-name-ar">الكوي</td>
                        </tr>
                        <tr>
                            <td class="skill-name-en">ARABIC COOKING</td>
                            <td class="skill-value">${getSkillLevelText(cv.arabicCooking)}</td>
                            <td class="skill-name-ar">الطبخ العربي</td>
                        </tr>
                        <tr>
                            <td class="skill-name-en">SEWING</td>
                            <td class="skill-value">${getSkillLevelText(cv.sewing)}</td>
                            <td class="skill-name-ar">الخياطة</td>
                        </tr>
                        <tr>
                            <td class="skill-name-en">DRIVING</td>
                            <td class="skill-value">${getSkillLevelText(cv.driving)}</td>
                            <td class="skill-name-ar">القيادة</td>
                        </tr>
                    </table>
                </div>

                <!-- Personal Data -->
                <div class="personal-data" style="flex: 1;">
                    <table>
                        <tr>
                            <td class="section-header" colspan="2">PERSONAL DATA</td>
                        </tr>
                        <tr>
                            <td class="field-label">NATIONALITY</td>
                            <td class="field-value">${cv.nationality || ''}</td>
                            <td class="arabic-text">الجنسية</td>
                        </tr>
                        <tr>
                            <td class="field-label">RELIGION</td>
                            <td class="field-value">${cv.religion || ''}</td>
                            <td class="arabic-text">الديانة</td>
                        </tr>
                        <tr>
                            <td class="field-label">DATE OF BIRTH</td>
                            <td class="field-value">${cv.dateOfBirth || ''}</td>
                            <td class="arabic-text">تاريخ الميلاد</td>
                        </tr>
                        <tr>
                            <td class="field-label">PLACE OF BIRTH</td>
                            <td class="field-value">${cv.placeOfBirth || ''}</td>
                            <td class="arabic-text">مكان الميلاد</td>
                        </tr>
                        <tr>
                            <td class="field-label">LIVING TOWN</td>
                            <td class="field-value">${cv.livingTown || ''}</td>
                            <td class="arabic-text">مكان السكن</td>
                        </tr>
                        <tr>
                            <td class="field-label">MARITAL STATUS</td>
                            <td class="field-value">${getMaritalStatusText(cv.maritalStatus)}</td>
                            <td class="arabic-text">الحالة الاجتماعية</td>
                        </tr>
                        <tr>
                            <td class="field-label">CHILDREN</td>
                            <td class="field-value">${cv.numberOfChildren || 0}</td>
                            <td class="arabic-text">عدد الأطفال</td>
                        </tr>
                        <tr>
                            <td class="field-label">WEIGHT</td>
                            <td class="field-value">${cv.weight || ''}</td>
                            <td class="arabic-text">الوزن</td>
                        </tr>
                        <tr>
                            <td class="field-label">HEIGHT</td>
                            <td class="field-value">${cv.height || ''}</td>
                            <td class="arabic-text">الطول</td>
                        </tr>
                        <tr>
                            <td class="field-label">COMPLEXION</td>
                            <td class="field-value">${cv.complexion || ''}</td>
                            <td class="arabic-text">لون البشرة</td>
                        </tr>
                        <tr>
                            <td class="field-label">AGE</td>
                            <td class="field-value">${cv.age || ''}</td>
                            <td class="arabic-text">العمر</td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
    </body>
    </html>
  `
}
