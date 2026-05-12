// app/api/staff/[id]/route.js
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'

export async function PATCH(req, { params }) {
  const body = await req.json()
  const update = {}
  if (body.name      !== undefined) update.name      = body.name
  if (body.email     !== undefined) update.email     = body.email
  if (body.phone     !== undefined) update.phone     = body.phone
  if (body.role      !== undefined) update.role      = body.role
  if (body.pin       !== undefined) update.pin       = body.pin
  if (body.isActive  !== undefined) update.is_active = body.isActive
  if (body.password)                update.password_hash = await bcrypt.hash(body.password, 10)

  const { data, error } = await supabaseAdmin
    .from('staff')
    .update(update)
    .eq('id', params.id)
    .select('id, name, email, role, phone, pin, is_active, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req, { params }) {
  const { error } = await supabaseAdmin
    .from('staff')
    .delete()
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
