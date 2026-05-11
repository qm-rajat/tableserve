// src/components/staff/PaymentBadge.js
export default function PaymentBadge({ status }) {
  const map = {
    PENDING_OFFLINE: <span className="badge-pending">💵 Pending Offline</span>,
    UPI_PENDING:     <span className="badge-upi-pending">📱 UPI Pending</span>,
    PAID_UPI:        <span className="badge-paid-upi">✓ Paid via UPI</span>,
    PAID_OFFLINE:    <span className="badge-paid-offline">✓ Paid Offline</span>,
  }
  return map[status] || <span className="badge-pending">Unknown</span>
}
