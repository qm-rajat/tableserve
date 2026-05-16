// app/api/menu/[id]/route.js
import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function PATCH(req, { params }) {
  try {
    const body = await req.json()
    const update = {}
    if (body.name        !== undefined) update.name         = body.name
    if (body.categoryId  !== undefined) update.category_id  = body.categoryId
    if (body.description !== undefined) update.description  = body.description
    if (body.price       !== undefined) update.price        = parseFloat(body.price)
    if (body.imageUrl    !== undefined) update.image_url    = body.imageUrl
    if (body.isAvailable !== undefined) update.is_available = body.isAvailable
    if (body.foodType    !== undefined) update.food_type    = body.foodType

    const { data, error } = await supabaseAdmin
      .from('menu_items')
      .update(update)
      .eq('id', params.id)
      .select(`*, category:categories(id, name, sort_order)`)
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const { error } = await supabaseAdmin
      .from('menu_items')
      .delete()
      .eq('id', params.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
