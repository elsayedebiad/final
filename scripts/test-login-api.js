const fetch = require('node-fetch')

async function testLoginAPI() {
  try {
    console.log('🔐 اختبار API تسجيل الدخول...')
    
    const loginData = {
      email: 'engelsayedebaid@gmail.com',
      password: 'Engelsayedebaid24112002'
    }

    console.log('📧 البريد الإلكتروني:', loginData.email)
    console.log('🔑 كلمة المرور:', loginData.password)
    
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    })

    console.log('📊 حالة الاستجابة:', response.status)
    console.log('📋 رؤوس الاستجابة:', Object.fromEntries(response.headers))

    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ تم تسجيل الدخول بنجاح!')
      console.log('👤 بيانات المستخدم:', result.user)
      console.log('🔑 الرمز المميز:', result.token ? 'موجود' : 'غير موجود')
    } else {
      console.log('❌ فشل تسجيل الدخول!')
      console.log('📝 رسالة الخطأ:', result.error)
      console.log('📋 تفاصيل الاستجابة:', result)
    }

  } catch (error) {
    console.error('❌ خطأ في الاتصال:', error.message)
    
    if (error.code === 'ECONNREFUSED') {
      console.log('⚠️  الخادم غير متاح. تأكد من تشغيل الخادم بـ npm run dev')
    }
  }
}

testLoginAPI()
