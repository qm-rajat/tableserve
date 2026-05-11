// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function uploadMenuImage(file) {
  const fileExt = file.name.split('.').pop()
  const fileName = `menu-${Date.now()}.${fileExt}`

  const { data, error } = await supabaseAdmin.storage
    .from('menu-images')
    .upload(fileName, file, { upsert: true })

  if (error) throw error

  const { data: urlData } = supabaseAdmin.storage
    .from('menu-images')
    .getPublicUrl(fileName)

  return urlData.publicUrl
}
