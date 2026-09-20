"use client";

import { useEffect, useState } from "react";

type Order = {
  id: string; orderNumber: string; status: string; total: string | number; createdAt: string;
  shippingName: string; shippingPhone: string; city?: string | null; governorate?: string | null;
  items: { productName: string; quantity: number; unitPrice: string | number }[];
  user?: { name: string | null; email: string; phone: string | null } | null;
};

const statuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");

  async function load() {
    const res = await fetch("/api/admin/orders");
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

  if (loading) return <main className="min-h-screen bg-zinc-950 p-8 text-white">جاري تحميل الطلبات...</main>;

  return <main className="min-h-screen bg-zinc-950 px-5 py-8 text-white">
    <div className="mx-auto max-w-7xl">
      <div className="flex items-end justify-between gap-4"><div><p className="text-sm uppercase tracking-widest text-amber-400">Admin</p><h1 className="text-4xl font-bold">الطلبات</h1></div><button onClick={load} className="rounded-xl border border-zinc-700 px-4 py-2">تحديث</button></div>
      <div className="mt-8 space-y-4">
        {orders.length === 0 ? <div className="rounded-2xl border border-zinc-800 p-8 text-zinc-400">لا توجد طلبات حتى الآن.</div> : orders.map(order => (
          <article key={order.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div><h2 className="text-xl font-bold">{order.orderNumber}</h2><p className="text-sm text-zinc-400">{new Date(order.createdAt).toLocaleString("ar-EG")}</p></div>
              <div className="text-xl font-bold">{Number(order.total).toLocaleString("en-EG")} EGP</div>
              <select disabled={saving === order.id} value={order.status} onChange={e => updateStatus(order.id, e.target.value)} className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3">
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="mt-5 grid gap-4 border-t border-zinc-800 pt-5 md:grid-cols-2">
              <div><p className="font-semibold">{order.shippingName}</p><p className="text-sm text-zinc-400">{order.shippingPhone} — {order.city ?? ""} {order.governorate ?? ""}</p><p className="mt-1 text-sm text-zinc-400">{order.user?.email ?? "Guest"}</p></div>
              <div>{order.items.map((item, i) => <p key={i} className="text-sm text-zinc-300">{item.productName} × {item.quantity} — {Number(item.unitPrice).toLocaleString("en-EG")} EGP</p>)}</div>
            </div>
          </article>
        ))}
      </div>
    </div>
  </main>;
}
