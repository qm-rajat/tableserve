// app/api/menu/[id]/route.js
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PATCH(req, { params }) {
  try {
    const body = await req.json()
    const item = await prisma.menuItem.update({
      where: { id: params.id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.categoryId && { categoryId: body.categoryId }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.price && { price: parseFloat(body.price) }),
        ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
        ...(body.isAvailable !== undefined && { isAvailable: body.isAvailable }),
        ...(body.foodType && { foodType: body.foodType }),
      },
      include: { category: true }
    })
    return NextResponse.json(item)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update menu item' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    await prisma.menuItem.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 })
  }
}
