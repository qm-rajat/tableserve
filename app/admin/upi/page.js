'use client'
// app/admin/upi/page.js
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FiSave, FiCreditCard } from 'react-icons/fi'

const initialForm = { upiId: '', merchantName: '' }

export default function AdminUpiPage() {
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch('/api/upi-config')
        if (!res.ok) throw new Error('Failed to load UPI settings')
        const data = await res.json()
        setForm({ upiId: data.upi_id || '', merchantName: data.merchant_name || '' })
      } catch (err) {
        toast.error(err.message || 'Could not load UPI config')
      } finally {
        setLoading(false)
      }
    }
    loadConfig()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/upi-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')
      setForm({ upiId: data.upi_id || form.upiId, merchantName: data.merchant_name || form.merchantName })
      toast.success('UPI settings saved')
    } catch (err) {
      toast.error(err.message || 'Unable to save settings')
    } finally {
      setSaving(false)
    }
  }

  const previewLink = form.upiId
    ? `upi://pay?pa=${encodeURIComponent(form.upiId)}&pn=${encodeURIComponent(form.merchantName)}&am=100&cu=INR`
    : ''

  return (
    <main className="p-8 flex-1">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-black text-stone-800">UPI Settings</h1>
          <p className="text-stone-500 text-sm">Configure your merchant UPI ID and display name for online payments.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-xl max-w-3xl">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-stone-900">Payment receiver details</h2>
          <p className="text-sm text-stone-500 mt-1">These values are used when customers pay through UPI.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="label">UPI ID</label>
              <input
                value={form.upiId}
                onChange={(e) => setForm(prev => ({ ...prev, upiId: e.target.value }))}
                placeholder="tableserve@upi"
                className="input w-full"
                required
              />
            </div>
            <div>
              <label className="label">Merchant Name</label>
              <input
                value={form.merchantName}
                onChange={(e) => setForm(prev => ({ ...prev, merchantName: e.target.value }))}
                placeholder="TableServe Cafe"
                className="input w-full"
                required
              />
            </div>
          </div>

          {previewLink && (
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
              <p className="text-xs font-semibold text-stone-500 mb-2">Sample UPI Deep Link (₹100 test):</p>
              <p className="text-xs text-stone-600 break-all font-mono bg-white p-2 rounded-lg border">{previewLink}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-stone-200">
            <p className="text-sm text-stone-500">Last loaded UPI details are shown above. Save to update the configuration.</p>
            <button type="submit" disabled={saving || loading} className="btn-primary inline-flex items-center gap-2 px-5 py-3">
              <FiSave /> {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
