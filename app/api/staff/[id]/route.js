// app/api/staff/[id]/route.js
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'

export async function PATCH(req, { params }) {
  try {
    const body = await req.json()
    const updateData = {}

    if (body.name) updateData.name = body.name
    if (body.email) updateData.email = body.email
    if (body.phone !== undefined) updateData.phone = body.phone
    if (body.role) updateData.role = body.role
    if (body.pin !== undefined) updateData.pin = body.pin
    if (body.isActive !== undefined) updateData.isActive = body.isActive
    if (body.password) updateData.passwordHash = await bcrypt.hash(body.password, 10)

    const staff = await prisma.staff.update({
      where: { id: params.id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, phone: true, isActive: true, createdAt: true }
    })
    return NextResponse.json(staff)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update staff' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    await prisma.staff.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete staff' }, { status: 500 })
  }
}
