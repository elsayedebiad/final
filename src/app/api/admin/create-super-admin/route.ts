import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const secret = searchParams.get('secret')
  const email = searchParams.get('email')
  const password = searchParams.get('password')
  const name = searchParams.get('name') || 'Super Admin'

  if (secret !== process.env.ADMIN_SETUP_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!email || !password) {
    return NextResponse.json({ error: 'email & password required' }, { status: 400 })
  }

  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) {
    return NextResponse.json({ ok: true, message: 'Admin already exists' })
  }

  const hash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: {
      email,
      password: hash,   // غيّرها لو العمود عندك اسمه hashedPassword
      name,
      role: 'ADMIN',    // أو isAdmin: true لو سكيمتك كده
    },
  })

  return NextResponse.json({ ok: true, id: user.id, email: user.email })
}
