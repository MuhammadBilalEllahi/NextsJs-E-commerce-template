export default function OrdersPage() {
  const orders = [
    { id: "DM123456", date: "2025-08-01", total: 39.98, status: "Delivered" },
    { id: "DM123355", date: "2025-07-20", total: 19.99, status: "Shipped" },
  ]
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Order History</h1>
      <div className="overflow-x-auto rounded border">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-50 dark:bg-neutral-900/40">
            <tr>
              <th className="text-left p-3">Order</th>
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Total</th>
              <th className="text-left p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="p-3">{o.id}</td>
                <td className="p-3">{o.date}</td>
                <td className="p-3">Rs. {o.total.toFixed(2)}</td>
                <td className="p-3">{o.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
