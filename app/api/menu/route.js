// app/api/menu/route.js
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const items = await prisma.menuItem.findMany({
      include: { category: true },
      orderBy: [{ category: { sortOrder: 'asc' } }, { name: 'asc' }]
    })
    return NextResponse.json(items)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const body = await req.json()
    const { name, categoryId, description, price, imageUrl, isAvailable, foodType } = body

    if (!name || !categoryId || !price) {
      return NextResponse.json({ error: 'Name, category and price are required' }, { status: 400 })
    }

    const item = await prisma.menuItem.create({
      data: {
        name,
        categoryId,
        description,
        price: parseFloat(price),
        imageUrl,
        isAvailable: isAvailable ?? true,
        foodType: foodType || 'VEG',
      },
      include: { category: true }
    })
    return NextResponse.json(item, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 })
  }
}
