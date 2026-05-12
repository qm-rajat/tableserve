// app/api/tables/route.js
import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('tables')
    .select(`
      *,
      orders(id, payment_status, is_delivered)
    `)
    .order('number', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req) {
  const body = await req.json()
  const { number, capacity, locationLabel } = body

  if (!number || !capacity)
    return NextResponse.json({ error: 'Table number and capacity are required' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('tables')
    .insert({ number: parseInt(number), capacity: parseInt(capacity), location_label: locationLabel })
    .select()
    .single()

  if (error) {
    if (error.code === '23505')
      return NextResponse.json({ error: 'Table number already exists' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}
