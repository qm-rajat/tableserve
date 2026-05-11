// app/api/orders/[id]/route.js
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req, { params }) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        table: true,
        orderItems: { include: { menuItem: true } }
      }
    })
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    return NextResponse.json(order)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}

export async function PATCH(req, { params }) {
  try {
    const body = await req.json()
    const order = await prisma.order.update({
      where: { id: params.id },
      data: {
        ...(body.paymentStatus && { paymentStatus: body.paymentStatus }),
        ...(body.isDelivered !== undefined && { isDelivered: body.isDelivered }),
      },
      include: {
        table: true,
        orderItems: { include: { menuItem: true } }
      }
    })
    return NextResponse.json(order)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
