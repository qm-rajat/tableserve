// app/api/upi-config/route.js
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const config = await prisma.upiConfig.findFirst()
    return NextResponse.json(config || { upiId: '', merchantName: '' })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch UPI config' }, { status: 500 })
  }
}

export async function PATCH(req) {
  try {
    const body = await req.json()
    const { upiId, merchantName } = body

    const existing = await prisma.upiConfig.findFirst()

    let config
    if (existing) {
      config = await prisma.upiConfig.update({
        where: { id: existing.id },
        data: { upiId, merchantName }
      })
    } else {
      config = await prisma.upiConfig.create({ data: { upiId, merchantName } })
    }

    return NextResponse.json(config)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update UPI config' }, { status: 500 })
  }
}
