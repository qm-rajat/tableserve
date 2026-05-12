// src/lib/auth.js
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from './supabase'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const { data: staff, error } = await supabaseAdmin
          .from('staff')
          .select('*')
          .eq('email', credentials.email)
          .eq('is_active', true)
          .single()

        if (error || !staff) return null

        const isValid = await bcrypt.compare(credentials.password, staff.password_hash)
        if (!isValid) return null

        return {
          id:    staff.id,
          name:  staff.name,
          email: staff.email,
          role:  staff.role,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id   = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role
        session.user.id   = token.id
      }
      return session
    }
  },
  pages:   { signIn: '/login' },
  session: { strategy: 'jwt' },
  secret:  process.env.NEXTAUTH_SECRET,
}
