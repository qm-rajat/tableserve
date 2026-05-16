// src/lib/supabase.js
// Single Supabase client used everywhere — no ORM, direct queries
import { createClient } from '@supabase/supabase-js'

let _supabaseAdmin = null
let _supabase = null

/**
 * Gets the Supabase Admin client with lazy initialization.
 * Throws a clear error if keys are missing ONLY when called.
 */
export function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
      throw new Error('Supabase Admin keys missing. Please configure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Settings.')
    }
    _supabaseAdmin = createClient(url, key)
  }
  return _supabaseAdmin
}

/**
 * Gets the standard Supabase client with lazy initialization.
 */
export function getSupabase() {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) {
      throw new Error('Supabase Public keys missing. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Settings.')
    }
    _supabase = createClient(url, key)
  }
  return _supabase
}

// Fallback exports for backward compatibility, using proxies to maintain lazy behavior
export const supabaseAdmin = new Proxy({}, {
  get: (target, prop) => getSupabaseAdmin()[prop]
})

export const supabase = new Proxy({}, {
  get: (target, prop) => getSupabase()[prop]
})

// Upload a menu image to Supabase Storage, returns the public URL
export async function uploadMenuImage(file) {
  const fileExt = file.name.split('.').pop()
  const fileName = `menu-${Date.now()}.${fileExt}`
  const admin = getSupabaseAdmin()

  const { error } = await admin.storage
    .from('menu-images')
    .upload(fileName, file, { upsert: true })

  if (error) throw error

  const { data } = admin.storage
    .from('menu-images')
    .getPublicUrl(fileName)

  return data.publicUrl
}
