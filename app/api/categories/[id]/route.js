// app/api/categories/[id]/route.js
import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function PATCH(req, { params }) {
  const body = await req.json()
  const update = {}
  if (body.name      !== undefined) update.name       = body.name
  if (body.sortOrder !== undefined) update.sort_order = body.sortOrder

  const { data, error } = await supabaseAdmin
    .from('categories')
    .update(update)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req, { params }) {
  const { error } = await supabaseAdmin
    .from('categories')
    .delete()
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
