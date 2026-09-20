"use client";

import { useEffect, useState } from "react";

type Order = {
  id: string; orderNumber: string; status: string; total: string | number; createdAt: string;
  shippingName: string; shippingPhone: string; addressLine1?: string | null; city?: string | null; governorate?: string | null;
  latitude?: number | null; longitude?: number | null;
  items: { productName: string; quantity: number; unitPrice: string | number }[];
  user?: { name: string | null; email: string; phone: string | null } | null;
};

const statuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
const statusLabels: Record<string,string> = {
  PENDING:"جديد", CONFIRMED:"مؤكد", PROCESSING:"قيد التجهيز", SHIPPED:"تم الشحن", DELIVERED:"تم التسليم", CANCELLED:"ملغي"
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/orders", { cache: "no-store" });
    if (res.ok) setOrders(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: string) {
    setSaving(id);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status })
    });
    if (res.ok) setOrders(current => current.map(o => o.id === id ? { ...o, status } : o));
    setSaving("");
  }

  if (loading) return <main className="adminPage"><p>جاري تحميل الطلبات...</p></main>;

  return (
    <main className="adminPage">
      <header className="ordersHeader">
        <div><p className="eyebrow">ORDERS</p><h1>الطلبات</h1><p>متابعة الطلبات وتحديث حالتها من الموبايل.</p></div>
        <button onClick={load} className="adminSecondary">تحديث</button>
      </header>

      <section className="orderStats">
        <div><strong>{orders.length}</strong><span>كل الطلبات</span></div>
        <div><strong>{orders.filter(o=>o.status==="PENDING").length}</strong><span>جديدة</span></div>
        <div><strong>{orders.filter(o=>["PROCESSING","SHIPPED"].includes(o.status)).length}</strong><span>قيد التنفيذ</span></div>
      </section>

      <div className="adminMobileCards orderCards">
        {orders.length === 0 ? <div className="adminCard"><p>لا توجد طلبات حتى الآن.</p></div> : orders.map(order => (
          <article key={order.id} className={`orderAdminCard ${order.status === "CANCELLED" ? "cancelled" : ""}`}>
            <div className="orderCardTop">
              <div><strong>{order.orderNumber}</strong><small>{new Date(order.createdAt).toLocaleString("ar-EG")}</small></div>
              <span className="orderStatus">{statusLabels[order.status] || order.status}</span>
            </div>

            <div className="orderCustomer">
              <strong>{order.shippingName}</strong>
              <span>📞 {order.shippingPhone}</span>
              {order.user?.email && <span>✉️ {order.user.email}</span>}
            </div>

            <div className="orderItems">
              {order.items.map((item, i) => (
                <div key={i}><span>{item.productName} × {item.quantity}</span><b>{Number(item.unitPrice).toLocaleString()} EGP</b></div>
              ))}
            </div>

            <div className="orderDelivery">
              <div><small>التوصيل</small><p>{order.addressLine1 || [order.city, order.governorate].filter(Boolean).join(" — ") || "موقع محدد على الخريطة"}</p></div>
              {order.latitude != null && order.longitude != null && (
                <a className="mapButton" target="_blank" rel="noreferrer" href={`https://www.google.com/maps?q=${order.latitude},${order.longitude}`}>📍 فتح الموقع</a>
              )}
            </div>

            <div className="orderCardBottom">
              <strong>{Number(order.total).toLocaleString()} EGP</strong>
              <select disabled={saving === order.id} value={order.status} onChange={e => updateStatus(order.id, e.target.value)}>
                {statuses.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
              </select>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
