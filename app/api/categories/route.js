// app/api/categories/route.js
import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*, menu_items(id)')
      .order('sort_order', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Attach count
    const result = data.map(c => ({ ...c, _count: { menuItems: c.menu_items?.length || 0 } }))
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const body = await req.json()
    if (!body.name)
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })

    // Get max sort_order
    const { data: existing } = await supabaseAdmin
      .from('categories')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)

    const nextOrder = (existing?.[0]?.sort_order || 0) + 1

    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert({ 
        name: body.name, 
        sort_order: body.sortOrder ?? nextOrder,
        image_url: body.imageUrl || null
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
