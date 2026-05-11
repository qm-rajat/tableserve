// app/api/categories/[id]/route.js
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PATCH(req, { params }) {
  try {
    const body = await req.json()
    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
      }
    })
    return NextResponse.json(category)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    await prisma.category.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
