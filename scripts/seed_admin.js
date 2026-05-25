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

  const email = 'rajatdash2004@gmail.com'
  const password = 'Guddu2004'
  const name = 'Rajat Kumar Dash'
  const role = 'ADMIN'
  const pin = '2004'

  console.log(`Generating bcrypt hash for ${email}...`)
  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(password, salt)

  const baseRestUrl = `${url.replace(/\/$/, '')}/rest/v1/staff`

  // 1. Check if user exists
  console.log(`Checking if ${email} already exists...`)
  const checkRes = await fetch(`${baseRestUrl}?select=id&email=eq.${encodeURIComponent(email)}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: 'application/json'
    }
  })

  if (!checkRes.ok) {
    console.error('Failed to query Supabase staff table', checkRes.status, await checkRes.text())
    process.exit(2)
  }

  const existing = await checkRes.json()

  if (existing.length > 0) {
    // 2. Update existing user
    const userId = existing[0].id
    console.log(`Found existing user with id: ${userId}. Updating password and role to ADMIN...`)
    const updateRes = await fetch(`${baseRestUrl}?id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify({
        password_hash: hash,
        role: role,
        is_active: true
      })
    })

    if (!updateRes.ok) {
      console.error('Failed to update staff record', updateRes.status, await updateRes.text())
      process.exit(2)
    }

    console.log(`Successfully updated admin user: ${email}`)
  } else {
    // 3. Insert new user
    console.log(`User does not exist. Creating new admin user: ${email}...`)
    const insertRes = await fetch(baseRestUrl, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify({
        name,
        email,
        password_hash: hash,
        role,
        pin,
        is_active: true
      })
    })

    if (!insertRes.ok) {
      console.error('Failed to insert new admin record', insertRes.status, await insertRes.text())
      process.exit(2)
    }

    console.log(`Successfully created new admin user: ${email}`)
  }
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(2)
})
