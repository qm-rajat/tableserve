// app/api/menu/route.js
import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('menu_items')
    .select(`*, category:categories(id, name, sort_order)`)
    .order('name', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req) {
  const body = await req.json()
  const { name, categoryId, description, price, imageUrl, isAvailable, foodType } = body

  if (!name || !categoryId || !price)
    return NextResponse.json({ error: 'Name, category and price are required' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('menu_items')
    .insert({
      name,
      category_id:  categoryId,
      description,
      price:        parseFloat(price),
      image_url:    imageUrl || null,
      is_available: isAvailable ?? true,
      food_type:    foodType || 'VEG',
    })
    .select(`*, category:categories(id, name, sort_order)`)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
