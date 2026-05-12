'use client'
// app/admin/staff/page.js
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi'

const ROLES     = ['STAFF', 'MANAGER', 'ADMIN']
const emptyForm = { name: '', email: '', password: '', pin: '', role: 'STAFF', phone: '' }

export default function AdminStaff() {
  const [staff,    setStaff]    = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing,  setEditing]  = useState(null)
  const [form,     setForm]     = useState(emptyForm)

  const fetch_ = () => fetch('/api/staff').then(r => r.json()).then(setStaff)
  useEffect(() => { fetch_() }, [])

  const openEdit = (s) => { setEditing(s.id); setForm({ name: s.name, email: s.email, password: '', pin: s.pin || '', role: s.role, phone: s.phone || '' }); setShowForm(true) }
  const openNew  = () => { setEditing(null); setForm(emptyForm); setShowForm(true) }
  const close    = () => { setShowForm(false); setEditing(null) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const method = editing ? 'PATCH' : 'POST'
    const url    = editing ? `/api/staff/${editing}` : '/api/staff'
    const body   = { ...form }
    if (editing && !body.password) delete body.password
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.ok) { toast.success(editing ? 'Staff updated' : 'Staff added'); close(); fetch_() }
    else { const d = await res.json(); toast.error(d.error) }
  }

  const toggleActive = async (s) => {
    await fetch(`/api/staff/${s.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !s.is_active }) })
    fetch_()
  }

  const deleteStaff = async (id) => {
    if (!confirm('Delete this staff member?')) return
    const res = await fetch(`/api/staff/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Deleted'); fetch_() }
    else toast.error('Delete failed')
  }

  const ROLE_COLORS = { STAFF: 'bg-blue-100 text-blue-700', MANAGER: 'bg-purple-100 text-purple-700', ADMIN: 'bg-orange-100 text-orange-700' }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-stone-800">Staff</h1>
          <p className="text-stone-500 text-sm">{staff.length} members</p>
        </div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2 text-sm"><FiPlus /> Add Staff</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="font-bold text-stone-800 text-lg mb-4">{editing ? 'Edit Staff' : 'Add Staff'}</h2>
            <div className="space-y-3">
              <div><label className="label">Name *</label><input type="text" className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
              <div><label className="label">Email *</label><input type="email" className="input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required /></div>
              <div><label className="label">{editing ? 'New Password (leave blank to keep)' : 'Password *'}</label><input type="password" className="input" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required={!editing} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">PIN</label><input type="text" maxLength={6} className="input" value={form.pin} onChange={e => setForm(f => ({ ...f, pin: e.target.value }))} /></div>
                <div><label className="label">Role</label>
                  <select className="input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                    {ROLES.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div><label className="label">Phone</label><input type="tel" className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
            </div>
            <div className="flex gap-3 mt-5">
              <button type="button" onClick={close} className="flex-1 btn-secondary text-sm">Cancel</button>
              <button type="submit" className="flex-1 btn-primary text-sm">{editing ? 'Update' : 'Add Staff'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {staff.map(s => (
          <div key={s.id} className={`card flex items-center gap-4 ${!s.is_active ? 'opacity-60' : ''}`}>
            <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center font-bold text-stone-600 shrink-0">
              {s.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-bold text-stone-800 text-sm">{s.name}</p>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_COLORS[s.role]}`}>{s.role}</span>
              </div>
              <p className="text-xs text-stone-400">{s.email}{s.phone && ` · ${s.phone}`}</p>
              {s.pin && <p className="text-xs text-stone-400">PIN: {s.pin}</p>}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => toggleActive(s)} className={s.is_active ? 'text-green-500' : 'text-stone-300'}>
                {s.is_active ? <FiToggleRight className="text-2xl" /> : <FiToggleLeft className="text-2xl" />}
              </button>
              <button onClick={() => openEdit(s)} className="btn-secondary text-xs py-1.5 px-3"><FiEdit2 /></button>
              <button onClick={() => deleteStaff(s.id)} className="bg-red-50 text-red-500 hover:bg-red-100 text-xs py-1.5 px-3 rounded-xl"><FiTrash2 /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
