const fs = require('fs')
const path = require('path')
const bcrypt = require('bcryptjs')

function parseEnv(envPath) {
  const txt = fs.readFileSync(envPath, 'utf8')
  const lines = txt.split(/\r?\n/)
  const env = {}
  for (const line of lines) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(.*))\s*$/i)
    if (m) env[m[1]] = m[2] ?? m[3] ?? m[4]
  }
  return env
}

async function main() {
  const [,, email, password] = process.argv
  if (!email || !password) {
    console.error('Usage: node scripts/check_creds.js <email> <password>')
    process.exit(2)
  }

  const envPath = path.resolve(__dirname, '..', '.env')
  if (!fs.existsSync(envPath)) {
    console.error('.env not found at', envPath)
    process.exit(2)
  }

  const env = parseEnv(envPath)
  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const key = env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('Supabase URL or service role key missing in .env')
    process.exit(2)
  }

  const fetchUrl = `${url.replace(/\/$/, '')}/rest/v1/staff?select=*&email=eq.${encodeURIComponent(email)}`

  try {
    const res = await fetch(fetchUrl, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: 'application/json'
      }
    })

    if (!res.ok) {
      console.error('Supabase request failed', res.status, await res.text())
      process.exit(2)
    }

    const data = await res.json()
    if (!Array.isArray(data) || data.length === 0) {
      console.log('No staff found with that email')
      process.exit(0)
    }

    const staff = data[0]
    const hash = staff.password_hash || staff.password || staff.passwordHash
    if (!hash) {
      console.log('No password hash present for user; cannot verify')
      process.exit(1)
    }

    const ok = await bcrypt.compare(password, hash)
    console.log(`${email} -> ${ok ? 'VALID' : 'INVALID'} (role=${staff.role}, is_active=${staff.is_active})`)
    process.exit(ok ? 0 : 1)
  } catch (err) {
    console.error('Error:', err)
    process.exit(2)
  }
}

main()
