// مكتبة الأعلام وألوان الدول
export interface CountryInfo {
  name: string
  nameAr: string
  flag: string
  colors: {
    primary: string
    secondary: string
    accent?: string
  }
  gradientClass: string
  borderClass: string
  textClass: string
}

export const countryData: Record<string, CountryInfo> = {
  'مصر': {
    name: 'Egypt',
    nameAr: 'مصر',
    flag: '🇪🇬',
    colors: {
      primary: '#CE1126', // أحمر
      secondary: '#FFFFFF', // أبيض
      accent: '#000000' // أسود
    },
    gradientClass: 'from-red-600 via-white to-black',
    borderClass: 'border-red-600',
    textClass: 'text-red-700'
  },
  'السعودية': {
    name: 'Saudi Arabia',
    nameAr: 'السعودية',
    flag: '🇸🇦',
    colors: {
      primary: '#006C35', // أخضر
      secondary: '#FFFFFF' // أبيض
    },
    gradientClass: 'from-green-600 to-green-700',
    borderClass: 'border-green-600',
    textClass: 'text-green-700'
  },
  'الإمارات': {
    name: 'UAE',
    nameAr: 'الإمارات',
    flag: '🇦🇪',
    colors: {
      primary: '#CE1126', // أحمر
      secondary: '#009639', // أخضر
      accent: '#000000' // أسود
    },
    gradientClass: 'from-red-600 via-green-600 to-black',
    borderClass: 'border-red-600',
    textClass: 'text-red-700'
  },
  'الكويت': {
    name: 'Kuwait',
    nameAr: 'الكويت',
    flag: '🇰🇼',
    colors: {
      primary: '#007A3D', // أخضر
      secondary: '#CE1126', // أحمر
      accent: '#000000' // أسود
    },
    gradientClass: 'from-green-600 via-red-600 to-black',
    borderClass: 'border-green-600',
    textClass: 'text-green-700'
  },
  'قطر': {
    name: 'Qatar',
    nameAr: 'قطر',
    flag: '🇶🇦',
    colors: {
      primary: '#8D1B3D', // عنابي
      secondary: '#FFFFFF' // أبيض
    },
    gradientClass: 'from-red-800 to-red-900',
    borderClass: 'border-red-800',
    textClass: 'text-red-800'
  },
  'البحرين': {
    name: 'Bahrain',
    nameAr: 'البحرين',
    flag: '🇧🇭',
    colors: {
      primary: '#CE1126', // أحمر
      secondary: '#FFFFFF' // أبيض
    },
    gradientClass: 'from-red-600 to-red-700',
    borderClass: 'border-red-600',
    textClass: 'text-red-700'
  },
  'عمان': {
    name: 'Oman',
    nameAr: 'عمان',
    flag: '🇴🇲',
    colors: {
      primary: '#CE1126', // أحمر
      secondary: '#FFFFFF', // أبيض
      accent: '#009639' // أخضر
    },
    gradientClass: 'from-red-600 via-white to-green-600',
    borderClass: 'border-red-600',
    textClass: 'text-red-700'
  },
  'الأردن': {
    name: 'Jordan',
    nameAr: 'الأردن',
    flag: '🇯🇴',
    colors: {
      primary: '#000000', // أسود
      secondary: '#FFFFFF', // أبيض
      accent: '#007A3D' // أخضر
    },
    gradientClass: 'from-black via-white to-green-600',
    borderClass: 'border-black',
    textClass: 'text-gray-800'
  },
  'لبنان': {
    name: 'Lebanon',
    nameAr: 'لبنان',
    flag: '🇱🇧',
    colors: {
      primary: '#ED1C24', // أحمر
      secondary: '#FFFFFF' // أبيض
    },
    gradientClass: 'from-red-600 via-white to-red-600',
    borderClass: 'border-red-600',
    textClass: 'text-red-700'
  },
  'سوريا': {
    name: 'Syria',
    nameAr: 'سوريا',
    flag: '🇸🇾',
    colors: {
      primary: '#CE1126', // أحمر
      secondary: '#FFFFFF', // أبيض
      accent: '#000000' // أسود
    },
    gradientClass: 'from-red-600 via-white to-black',
    borderClass: 'border-red-600',
    textClass: 'text-red-700'
  },
  'العراق': {
    name: 'Iraq',
    nameAr: 'العراق',
    flag: '🇮🇶',
    colors: {
      primary: '#CE1126', // أحمر
      secondary: '#FFFFFF', // أبيض
      accent: '#000000' // أسود
    },
    gradientClass: 'from-red-600 via-white to-black',
    borderClass: 'border-red-600',
    textClass: 'text-red-700'
  },
  'المغرب': {
    name: 'Morocco',
    nameAr: 'المغرب',
    flag: '🇲🇦',
    colors: {
      primary: '#C1272D', // أحمر
      secondary: '#006233' // أخضر
    },
    gradientClass: 'from-red-600 to-red-700',
    borderClass: 'border-red-600',
    textClass: 'text-red-700'
  },
  'الجزائر': {
    name: 'Algeria',
    nameAr: 'الجزائر',
    flag: '🇩🇿',
    colors: {
      primary: '#006233', // أخضر
      secondary: '#FFFFFF' // أبيض
    },
    gradientClass: 'from-green-600 to-green-700',
    borderClass: 'border-green-600',
    textClass: 'text-green-700'
  },
  'تونس': {
    name: 'Tunisia',
    nameAr: 'تونس',
    flag: '🇹🇳',
    colors: {
      primary: '#E70013', // أحمر
      secondary: '#FFFFFF' // أبيض
    },
    gradientClass: 'from-red-600 to-red-700',
    borderClass: 'border-red-600',
    textClass: 'text-red-700'
  },
  'ليبيا': {
    name: 'Libya',
    nameAr: 'ليبيا',
    flag: '🇱🇾',
    colors: {
      primary: '#E70013', // أحمر
      secondary: '#000000', // أسود
      accent: '#239E46' // أخضر
    },
    gradientClass: 'from-red-600 via-black to-green-600',
    borderClass: 'border-red-600',
    textClass: 'text-red-700'
  },
  'السودان': {
    name: 'Sudan',
    nameAr: 'السودان',
    flag: '🇸🇩',
    colors: {
      primary: '#D21034', // أحمر
      secondary: '#FFFFFF', // أبيض
      accent: '#000000' // أسود
    },
    gradientClass: 'from-red-600 via-white to-black',
    borderClass: 'border-red-600',
    textClass: 'text-red-700'
  },
  'فلسطين': {
    name: 'Palestine',
    nameAr: 'فلسطين',
    flag: '🇵🇸',
    colors: {
      primary: '#CE1126', // أحمر
      secondary: '#FFFFFF', // أبيض
      accent: '#000000' // أسود
    },
    gradientClass: 'from-red-600 via-white to-black',
    borderClass: 'border-red-600',
    textClass: 'text-red-700'
  },
  'اليمن': {
    name: 'Yemen',
    nameAr: 'اليمن',
    flag: '🇾🇪',
    colors: {
      primary: '#CE1126', // أحمر
      secondary: '#FFFFFF', // أبيض
      accent: '#000000' // أسود
    },
    gradientClass: 'from-red-600 via-white to-black',
    borderClass: 'border-red-600',
    textClass: 'text-red-700'
  },
  // دول أخرى
  'الهند': {
    name: 'India',
    nameAr: 'الهند',
    flag: '🇮🇳',
    colors: {
      primary: '#FF9933', // برتقالي
      secondary: '#FFFFFF', // أبيض
      accent: '#138808' // أخضر
    },
    gradientClass: 'from-orange-500 via-white to-green-600',
    borderClass: 'border-orange-500',
    textClass: 'text-orange-600'
  },
  'باكستان': {
    name: 'Pakistan',
    nameAr: 'باكستان',
    flag: '🇵🇰',
    colors: {
      primary: '#01411C', // أخضر داكن
      secondary: '#FFFFFF' // أبيض
    },
    gradientClass: 'from-green-800 to-green-900',
    borderClass: 'border-green-800',
    textClass: 'text-green-800'
  },
  'بنجلاديش': {
    name: 'Bangladesh',
    nameAr: 'بنجلاديش',
    flag: '🇧🇩',
    colors: {
      primary: '#006A4E', // أخضر
      secondary: '#F42A41' // أحمر
    },
    gradientClass: 'from-green-700 to-green-800',
    borderClass: 'border-green-700',
    textClass: 'text-green-700'
  },
  'سريلانكا': {
    name: 'Sri Lanka',
    nameAr: 'سريلانكا',
    flag: '🇱🇰',
    colors: {
      primary: '#FFBE29', // أصفر
      secondary: '#E4002B' // أحمر
    },
    gradientClass: 'from-yellow-500 to-red-600',
    borderClass: 'border-yellow-500',
    textClass: 'text-yellow-600'
  },
  'الفلبين': {
    name: 'Philippines',
    nameAr: 'الفلبين',
    flag: '🇵🇭',
    colors: {
      primary: '#0038A8', // أزرق
      secondary: '#CE1126' // أحمر
    },
    gradientClass: 'from-blue-700 to-red-600',
    borderClass: 'border-blue-700',
    textClass: 'text-blue-700'
  },
  'إندونيسيا': {
    name: 'Indonesia',
    nameAr: 'إندونيسيا',
    flag: '🇮🇩',
    colors: {
      primary: '#FF0000', // أحمر
      secondary: '#FFFFFF' // أبيض
    },
    gradientClass: 'from-red-600 to-red-700',
    borderClass: 'border-red-600',
    textClass: 'text-red-700'
  },
  'نيبال': {
    name: 'Nepal',
    nameAr: 'نيبال',
    flag: '🇳🇵',
    colors: {
      primary: '#DC143C', // أحمر
      secondary: '#003893' // أزرق
    },
    gradientClass: 'from-red-600 to-blue-700',
    borderClass: 'border-red-600',
    textClass: 'text-red-700'
  },
  'إثيوبيا': {
    name: 'Ethiopia',
    nameAr: 'إثيوبيا',
    flag: '🇪🇹',
    colors: {
      primary: '#009639', // أخضر
      secondary: '#FEDD00', // أصفر
      accent: '#DA020E' // أحمر
    },
    gradientClass: 'from-green-600 via-yellow-400 to-red-600',
    borderClass: 'border-green-600',
    textClass: 'text-green-700'
  },
  'كينيا': {
    name: 'Kenya',
    nameAr: 'كينيا',
    flag: '🇰🇪',
    colors: {
      primary: '#000000', // أسود
      secondary: '#FF0000', // أحمر
      accent: '#00A651' // أخضر
    },
    gradientClass: 'from-black via-red-600 to-green-600',
    borderClass: 'border-black',
    textClass: 'text-gray-800'
  },
  'أوغندا': {
    name: 'Uganda',
    nameAr: 'أوغندا',
    flag: '🇺🇬',
    colors: {
      primary: '#000000', // أسود
      secondary: '#FCDC04', // أصفر
      accent: '#D90000' // أحمر
    },
    gradientClass: 'from-black via-yellow-400 to-red-600',
    borderClass: 'border-black',
    textClass: 'text-gray-800'
  }
}

// دالة للحصول على معلومات الدولة
export function getCountryInfo(nationality: string): CountryInfo {
  return countryData[nationality] || {
    name: 'Unknown',
    nameAr: nationality,
    flag: '🌍',
    colors: {
      primary: '#6B7280',
      secondary: '#FFFFFF'
    },
    gradientClass: 'from-gray-500 to-gray-600',
    borderClass: 'border-gray-500',
    textClass: 'text-gray-600'
  }
}

// دالة للحصول على لون الخلفية حسب الجنسية
export function getCountryGradient(nationality: string): string {
  const country = getCountryInfo(nationality)
  return `bg-gradient-to-r ${country.gradientClass}`
}

// دالة للحصول على لون الحدود
export function getCountryBorder(nationality: string): string {
  const country = getCountryInfo(nationality)
  return country.borderClass
}

// دالة للحصول على لون النص
export function getCountryTextColor(nationality: string): string {
  const country = getCountryInfo(nationality)
  return country.textClass
}
