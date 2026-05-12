// app/api/orders/route.js
import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const status    = searchParams.get('status')
  const tableId   = searchParams.get('tableId')
  const delivered = searchParams.get('delivered')
  const limit     = parseInt(searchParams.get('limit') || '50')

  let query = supabaseAdmin
    .from('orders')
    .select(`
      *,
      table:tables(id, number, location_label, capacity),
      order_items(
        id, quantity, unit_price,
        menu_item:menu_items(id, name, food_type)
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (status)    query = query.eq('payment_status', status)
  if (tableId)   query = query.eq('table_id', tableId)
  if (delivered !== null && delivered !== '') {
    query = query.eq('is_delivered', delivered === 'true')
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req) {
  try {
    const body = await req.json()
    const { tableId, items, notes, paymentMethod } = body

    if (!tableId || !items || items.length === 0)
      return NextResponse.json({ error: 'Table and items are required' }, { status: 400 })

    // Fetch current prices from DB (never trust client prices)
    const menuItemIds = items.map(i => i.menuItemId)
    const { data: menuItems, error: menuError } = await supabaseAdmin
      .from('menu_items')
      .select('id, price, name, is_available')
      .in('id', menuItemIds)

    if (menuError) throw menuError

    // Validate all items exist and are available
    for (const item of items) {
      const found = menuItems.find(m => m.id === item.menuItemId)
      if (!found)           throw new Error(`Item not found: ${item.menuItemId}`)
      if (!found.is_available) throw new Error(`"${found.name}" is currently unavailable`)
    }

    // Calculate total
    let totalAmount = 0
    const orderItemsData = items.map(item => {
      const menuItem = menuItems.find(m => m.id === item.menuItemId)
      totalAmount += menuItem.price * item.quantity
      return {
        menu_item_id: item.menuItemId,
        quantity:     item.quantity,
        unit_price:   menuItem.price,
      }
    })

    const paymentStatus = paymentMethod === 'upi' ? 'UPI_PENDING' : 'PENDING_OFFLINE'

    // Create order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        table_id:       tableId,
        total_amount:   totalAmount,
        notes:          notes || null,
        payment_status: paymentStatus,
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Create order items
    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItemsData.map(i => ({ ...i, order_id: order.id })))

    if (itemsError) throw itemsError

    // Return full order with items
    const { data: fullOrder, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        table:tables(id, number, location_label, capacity),
        order_items(
          id, quantity, unit_price,
          menu_item:menu_items(id, name, food_type)
        )
      `)
      .eq('id', order.id)
      .single()

    if (fetchError) throw fetchError
    return NextResponse.json(fullOrder, { status: 201 })

  } catch (err) {
    console.error('POST /api/orders error:', err)
    return NextResponse.json({ error: err.message || 'Failed to create order' }, { status: 500 })
  }
}
