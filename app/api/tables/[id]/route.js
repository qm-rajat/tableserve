// app/api/tables/[id]/route.js
import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function PATCH(req, { params }) {
  const body = await req.json()
  const update = {}
  if (body.number        !== undefined) update.number         = parseInt(body.number)
  if (body.capacity      !== undefined) update.capacity       = parseInt(body.capacity)
  if (body.locationLabel !== undefined) update.location_label = body.locationLabel
  if (body.isActive      !== undefined) update.is_active      = body.isActive

  const { data, error } = await supabaseAdmin
    .from('tables')
    .update(update)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req, { params }) {
  const { error } = await supabaseAdmin
    .from('tables')
    .delete()
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
