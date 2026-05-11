// app/api/categories/route.js
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { menuItems: true } } }
    })
    return NextResponse.json(categories)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const body = await req.json()
    const { name, sortOrder } = body
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

    const maxOrder = await prisma.category.aggregate({ _max: { sortOrder: true } })
    const category = await prisma.category.create({
      data: { name, sortOrder: sortOrder ?? (maxOrder._max.sortOrder || 0) + 1 }
    })
    return NextResponse.json(category, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
