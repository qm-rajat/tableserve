// app/api/staff/route.js
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('staff')
      .select('id, name, email, role, phone, pin, is_active, created_at')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const body = await req.json()
    const { name, email, password, pin, role, phone } = body

    if (!name || !email || !password)
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 })

    const passwordHash = await bcrypt.hash(password, 10)

    const { data, error } = await supabaseAdmin
      .from('staff')
      .insert({ name, email, password_hash: passwordHash, pin: pin || null, role: role || 'STAFF', phone: phone || null })
      .select('id, name, email, role, phone, pin, is_active, created_at')
      .single()

    if (error) {
      if (error.code === '23505')
        return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
