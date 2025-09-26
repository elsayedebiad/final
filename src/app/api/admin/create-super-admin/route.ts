// اجبر التشغيل على Node.js (مش Edge) لأننا بنستخدم Prisma
export const runtime = 'nodejs'

// (اختياري) لو عندك مشاكل كاش أثناء التجربة
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

// لو عندك ملف prisma singleton استخدمه بدل السطرين دول
const prisma = new PrismaClient()

async function handler(req: Request) {
  const url = new URL(req.url)
  const secret = url.searchParams.get('secret') || (await getFromBody(req, 'secret'))
  const email = url.searchParams.get('email') || (await getFromBody(req, 'email'))
  const password = url.searchParams.get('password') || (await getFromBody(req, 'password'))
  const name = url.searchParams.get('name') || (await getFromBody(req, 'name')) || 'Super Admin'

  if (secret !== process.env.ADMIN_SETUP_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!email || !password) {
    return NextResponse.json({ error: 'email & password required' }, { status: 400 })
  }

  // عدّل أسماء الحقول هنا لو مختلفة في schema.prisma (مثلاً hashedPassword بدل password)
  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) {
    return NextResponse.json({ ok: true, message: 'Admin already exists' })
  }

  const hash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: {
      email,
      password: hash,     // غيّرها لـ hashedPassword لو سكيمتك كده
      name,
      role: 'ADMIN',      // أو isAdmin: true لو عندك boolean
    },
  })

  return NextResponse.json({ ok: true, id: user.id, email: user.email })
}

// دعم GET & POST عشان نتفادى 405
export async function GET(req: Request) {
  return handler(req)
}
export async function POST(req: Request) {
  return handler(req)
}

// مساعد بسيط لقراءة JSON من body في حالة POST
async function getFromBody(req: Request, key: string) {
  try {
    if (req.method !== 'POST') return null
    const ct = req.headers.get('content-type') || ''
    if (!ct.includes('application/json')) return null
    const body = await req.json()
    return body?.[key] ?? null
  } catch {
    return null
  }
}
