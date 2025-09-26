import React from 'react'
import ReactCountryFlag from 'react-country-flag'
import { getCountryInfo } from '../lib/country-utils'

interface CountryFlagProps {
  nationality: string
  showName?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// خريطة الجنسيات إلى أكواد الدول
const nationalityToCountryCode: Record<string, string> = {
  'مصر': 'EG',
  'السعودية': 'SA',
  'الإمارات': 'AE',
  'الكويت': 'KW',
  'قطر': 'QA',
  'البحرين': 'BH',
  'عمان': 'OM',
  'الأردن': 'JO',
  'لبنان': 'LB',
  'سوريا': 'SY',
  'العراق': 'IQ',
  'المغرب': 'MA',
  'الجزائر': 'DZ',
  'تونس': 'TN',
  'ليبيا': 'LY',
  'السودان': 'SD',
  'فلسطين': 'PS',
  'اليمن': 'YE',
  'الهند': 'IN',
  'باكستان': 'PK',
  'بنجلاديش': 'BD',
  'سريلانكا': 'LK',
  'الفلبين': 'PH',
  'إندونيسيا': 'ID',
  'نيبال': 'NP',
  'إثيوبيا': 'ET',
  'كينيا': 'KE',
  'أوغندا': 'UG',
  'نيجيريا': 'NG',
  'غانا': 'GH',
  'الكاميرون': 'CM',
  'تايلاند': 'TH',
  'فيتنام': 'VN',
  'ميانمار': 'MM',
  'كمبوديا': 'KH'
}

const CountryFlag: React.FC<CountryFlagProps> = ({ 
  nationality, 
  showName = true, 
  size = 'md',
  className = '' 
}) => {
  const countryInfo = getCountryInfo(nationality)
  const countryCode = nationalityToCountryCode[nationality] || 'UN' // UN للدول غير المعروفة
  
  const sizeClasses = {
    sm: 16,
    md: 20, 
    lg: 28
  }
  
  const flagSize = sizeClasses[size]
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <ReactCountryFlag
        countryCode={countryCode}
        svg
        style={{
          width: `${flagSize}px`,
          height: `${flagSize * 0.75}px`,
          borderRadius: '2px'
        }}
        title={nationality}
      />
      {showName && (
        <span 
          className="font-medium text-sm"
          style={{ color: countryInfo.colors.primary }}
        >
          {nationality}
        </span>
      )}
    </div>
  )
}

export default CountryFlag
