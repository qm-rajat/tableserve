// app/api/orders/[id]/route.js
import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(req, { params }) {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        table:tables(id, number, location_label, capacity),
        order_items(
          id, quantity, unit_price,
          menu_item:menu_items(id, name, food_type)
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }
}

export async function PATCH(req, { params }) {
  try {
    const body = await req.json()
    const update = {}
    if (body.paymentStatus !== undefined) update.payment_status = body.paymentStatus
    if (body.isDelivered   !== undefined) update.is_delivered   = body.isDelivered

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update(update)
      .eq('id', params.id)
      .select(`
        *,
        table:tables(id, number, location_label, capacity),
        order_items(
          id, quantity, unit_price,
          menu_item:menu_items(id, name, food_type)
        )
      `)
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
