// app/api/staff/route.js
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const staff = await prisma.staff.findMany({
      select: { id: true, name: true, email: true, role: true, phone: true, isActive: true, createdAt: true, pin: true },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(staff)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const body = await req.json()
    const { name, email, password, pin, role, phone } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const staff = await prisma.staff.create({
      data: { name, email, passwordHash, pin, role: role || 'STAFF', phone },
      select: { id: true, name: true, email: true, role: true, phone: true, isActive: true, createdAt: true }
    })
    return NextResponse.json(staff, { status: 201 })
  } catch (err) {
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create staff' }, { status: 500 })
  }
}
