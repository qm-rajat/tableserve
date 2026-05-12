// app/staff/layout.js
import StaffNav from '@/components/staff/StaffNav'

export const metadata = { title: 'Staff Dashboard - TableServe' }

export default function StaffLayout({ children }) {
  return (
    <div className="min-h-screen bg-stone-50">
      <StaffNav />
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
