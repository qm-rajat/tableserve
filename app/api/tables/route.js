// app/api/tables/route.js
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const tables = await prisma.table.findMany({
      orderBy: { number: 'asc' },
      include: {
        orders: {
          where: { isDelivered: false },
          select: { id: true, paymentStatus: true }
        }
      }
    })
    return NextResponse.json(tables)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const body = await req.json()
    const { number, capacity, locationLabel } = body

    if (!number || !capacity) {
      return NextResponse.json({ error: 'Table number and capacity are required' }, { status: 400 })
    }

    const table = await prisma.table.create({
      data: { number: parseInt(number), capacity: parseInt(capacity), locationLabel }
    })
    return NextResponse.json(table, { status: 201 })
  } catch (err) {
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'Table number already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create table' }, { status: 500 })
  }
}
