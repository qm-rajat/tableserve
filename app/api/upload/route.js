// app/api/upload/route.js
import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const bytes     = await file.arrayBuffer()
    const buffer    = Buffer.from(bytes)
    const fileExt   = file.name.split('.').pop()
    const fileName  = `menu-${Date.now()}.${fileExt}`

    const { error } = await supabaseAdmin.storage
      .from('menu-images')
      .upload(fileName, buffer, { contentType: file.type, upsert: true })

    if (error) throw error

    const { data } = supabaseAdmin.storage
      .from('menu-images')
      .getPublicUrl(fileName)

    return NextResponse.json({ url: data.publicUrl })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
