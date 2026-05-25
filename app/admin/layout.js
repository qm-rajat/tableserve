import AdminNav from '@/components/admin/AdminNav'

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-stone-50 text-stone-900">
      <AdminNav />
      <div className="flex-1">{children}</div>
    </div>
  )
}
