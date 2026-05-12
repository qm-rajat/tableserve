// app/admin/layout.js
import AdminNav from '@/components/admin/AdminNav'

export const metadata = { title: 'Admin - TableServe' }

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-stone-50 flex">
      <AdminNav />
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  )
}
