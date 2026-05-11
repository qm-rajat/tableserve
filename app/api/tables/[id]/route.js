// app/api/tables/[id]/route.js
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PATCH(req, { params }) {
  try {
    const body = await req.json()
    const table = await prisma.table.update({
      where: { id: params.id },
      data: {
        ...(body.number && { number: parseInt(body.number) }),
        ...(body.capacity && { capacity: parseInt(body.capacity) }),
        ...(body.locationLabel !== undefined && { locationLabel: body.locationLabel }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      }
    })
    return NextResponse.json(table)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update table' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    await prisma.table.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete table' }, { status: 500 })
  }
}
