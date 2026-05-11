// app/api/orders/route.js
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const tableId = searchParams.get('tableId')
    const delivered = searchParams.get('delivered')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where = {}
    if (status) where.paymentStatus = status
    if (tableId) where.tableId = tableId
    if (delivered !== null && delivered !== undefined) where.isDelivered = delivered === 'true'

    const orders = await prisma.order.findMany({
      where,
      include: {
        table: true,
        orderItems: {
          include: { menuItem: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
    return NextResponse.json(orders)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const body = await req.json()
    const { tableId, items, notes, paymentMethod } = body

    if (!tableId || !items || items.length === 0) {
      return NextResponse.json({ error: 'Table and items are required' }, { status: 400 })
    }

    // Validate and price items
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: items.map(i => i.menuItemId) } }
    })

    let totalAmount = 0
    const orderItemsData = items.map(item => {
      const menuItem = menuItems.find(m => m.id === item.menuItemId)
      if (!menuItem) throw new Error(`Menu item ${item.menuItemId} not found`)
      const unitPrice = menuItem.price
      totalAmount += unitPrice * item.quantity
      return { menuItemId: item.menuItemId, quantity: item.quantity, unitPrice }
    })

    const paymentStatus = paymentMethod === 'upi' ? 'UPI_PENDING' : 'PENDING_OFFLINE'

    const order = await prisma.order.create({
      data: {
        tableId,
        totalAmount,
        notes,
        paymentStatus,
        orderItems: { create: orderItemsData }
      },
      include: {
        table: true,
        orderItems: { include: { menuItem: true } }
      }
    })

    return NextResponse.json(order, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
