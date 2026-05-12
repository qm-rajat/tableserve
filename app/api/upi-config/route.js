// app/api/upi-config/route.js
import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('upi_config')
    .select('*')
    .limit(1)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || { upi_id: '', merchant_name: '' })
}

export async function PATCH(req) {
  const body = await req.json()
  const { upiId, merchantName } = body

  // Check if a row exists
  const { data: existing } = await supabaseAdmin
    .from('upi_config')
    .select('id')
    .limit(1)
    .maybeSingle()

  let result
  if (existing) {
    const { data, error } = await supabaseAdmin
      .from('upi_config')
      .update({ upi_id: upiId, merchant_name: merchantName })
      .eq('id', existing.id)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    result = data
  } else {
    const { data, error } = await supabaseAdmin
      .from('upi_config')
      .insert({ upi_id: upiId, merchant_name: merchantName })
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    result = data
  }

  return NextResponse.json(result)
}
