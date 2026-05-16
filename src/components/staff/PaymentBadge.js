export default function PaymentBadge({ status }) {
  const normalized = String(status || '').toUpperCase()

  const badgeStyles = {
    'UPI_PENDING': 'bg-amber-100 text-amber-700 border-amber-200',
    'PENDING_OFFLINE': 'bg-amber-100 text-amber-700 border-amber-200',
    'PAID_UPI': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'PAID_OFFLINE': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'PAID': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  }

  const labelMap = {
    'UPI_PENDING': 'UPI Pending',
    'PENDING_OFFLINE': 'Offline Pending',
    'PAID_UPI': 'Paid',
    'PAID_OFFLINE': 'Paid',
    'PAID': 'Paid',
  }

  const label = labelMap[normalized] || normalized.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
  const style = badgeStyles[normalized] || 'bg-stone-100 text-stone-700 border-stone-200'

  return (
    <span className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.26em] ${style}`}>
      {label}
    </span>
  )
}
