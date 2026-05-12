'use client'
// app/admin/upi/page.js
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FiCreditCard, FiSave } from 'react-icons/fi'

export default function AdminUPI() {
  const [form,    setForm]    = useState({ upiId: '', merchantName: '' })
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)

  useEffect(() => {
    fetch('/api/upi-config').then(r => r.json()).then(data => {
      setForm({ upiId: data.upi_id || '', merchantName: data.merchant_name || '' })
      setLoading(false)
    })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/upi-config', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) toast.success('UPI settings saved!')
    else toast.error('Failed to save')
  }

  const previewLink = form.upiId
    ? `upi://pay?pa=${form.upiId}&pn=${encodeURIComponent(form.merchantName)}&am=100&cu=INR`
    : ''

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-stone-800">UPI Settings</h1>
        <p className="text-stone-500 text-sm">Configure the UPI payment details shown to customers</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
          <FiCreditCard className="text-purple-600 text-2xl shrink-0" />
          <div>
            <p className="font-semibold text-purple-800 text-sm">UPI Deep Link Payment</p>
            <p className="text-xs text-purple-600">Customers tap "Pay via UPI" and are taken directly to their UPI app. No payment gateway needed.</p>
          </div>
        </div>

        <div>
          <label className="label">UPI ID *</label>
          <input type="text" className="input" placeholder="yourshop@upi or yourshop@okaxis"
            value={form.upiId} onChange={e => setForm(f => ({ ...f, upiId: e.target.value }))} required />
          <p className="text-xs text-stone-400 mt-1">The VPA (Virtual Payment Address) of your merchant account</p>
        </div>

        <div>
          <label className="label">Merchant / Shop Name *</label>
          <input type="text" className="input" placeholder="e.g. TableServe Cafe"
            value={form.merchantName} onChange={e => setForm(f => ({ ...f, merchantName: e.target.value }))} required />
          <p className="text-xs text-stone-400 mt-1">Shown on the customer's UPI payment screen</p>
        </div>

        {previewLink && (
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
            <p className="text-xs font-semibold text-stone-500 mb-2">Sample UPI link (₹100 test):</p>
            <p className="text-xs text-stone-600 break-all font-mono bg-white p-2 rounded-lg border">{previewLink}</p>
          </div>
        )}

        <button type="submit" disabled={saving || loading} className="w-full btn-primary flex items-center justify-center gap-2">
          <FiSave /> {saving ? 'Saving...' : 'Save UPI Settings'}
        </button>
      </form>

      <div className="mt-5 card bg-amber-50 border-amber-200">
        <h3 className="font-bold text-amber-800 text-sm mb-2">⚠️ How UPI Payment Works</h3>
        <ul className="text-xs text-amber-700 space-y-1.5 list-disc list-inside">
          <li>Customer taps "Pay via UPI" → their UPI app opens with pre-filled amount</li>
          <li>After payment, customer taps "I've Paid" → order status becomes UPI Pending</li>
          <li>Staff manually verifies the payment in their UPI app and confirms it</li>
          <li>No automatic callback — manual verification is simple and reliable</li>
        </ul>
      </div>
    </div>
  )
}
