const orders = [
  { id: "#ZN-1001", customer: "New customer", total: "5,950 EGP", status: "Pending" },
  { id: "#ZN-1002", customer: "Customer", total: "7,850 EGP", status: "Confirmed" }
];

export default function AdminOrdersPage() {
  return (
    <main className="adminPage">
      <header><p className="eyebrow">SALES</p><h1>Orders</h1><p>Track and process customer orders.</p></header>
      <div className="adminTable">
        <div className="tableRow tableHead"><span>Order</span><span>Customer</span><span>Total</span><span>Status</span></div>
        {orders.map((order) => <div className="tableRow" key={order.id}><strong>{order.id}</strong><span>{order.customer}</span><span>{order.total}</span><span>{order.status}</span></div>)}
      </div>
    </main>
  );
}
