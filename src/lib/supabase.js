// src/lib/supabase.js
// Single Supabase client used everywhere — no ORM, direct queries
import { createClient } from '@supabase/supabase-js'

// Server-side client (uses service role key — full access, never expose to browser)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Client-side client (uses anon key — safe for browser)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Upload a menu image to Supabase Storage, returns the public URL
export async function uploadMenuImage(file) {
  const fileExt = file.name.split('.').pop()
  const fileName = `menu-${Date.now()}.${fileExt}`

  const { error } = await supabaseAdmin.storage
    .from('menu-images')
    .upload(fileName, file, { upsert: true })

  if (error) throw error

  const { data } = supabaseAdmin.storage
    .from('menu-images')
    .getPublicUrl(fileName)

  return data.publicUrl
}
