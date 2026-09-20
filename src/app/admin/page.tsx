"use client";

import { useEffect, useState } from "react";

type Stats = {
  orders: number; products: number; customers: number; pendingReviews: number;
  revenue: number;
  recentOrders: { id:string; orderNumber:string; total:string|number; status:string; createdAt:string; user?:{name?:string|null;email?:string|null}|null }[];
  topProducts: { productId:string|null; _sum:{quantity:number|null} }[];
  lowStockProducts: { id: string; name: string; sku: string; stock: number; lowStockAt: number }[];
};

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/admin/dashboard", { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Could not load dashboard"); return; }
    setStats(data);
  }

  useEffect(() => { load(); }, []);

  return (
    <main className="adminPage">
      <header>
        <p className="eyebrow">ZENO ADMIN</p>
        <h1>Dashboard</h1>
        <p>Store control center.</p>
      </header>

      {error && <div className="adminNotice">{error}</div>}

      <section className="adminGrid">
        <article><span>Orders</span><strong>{stats?.orders ?? "—"}</strong><p>All incoming orders</p></article>
        <article><span>Products</span><strong>{stats?.products ?? "—"}</strong><p>Active catalog items</p></article>
        <article><span>Customers</span><strong>{stats?.customers ?? "—"}</strong><p>Registered customers</p></article>
        <article><span>Pending reviews</span><strong>{stats?.pendingReviews ?? "—"}</strong><p>Waiting for moderation</p></article>
        <article><span>Revenue</span><strong>{stats ? stats.revenue.toLocaleString() : "—"} EGP</strong><p>Non-cancelled orders</p></article>
      </section>


      {stats && <section className="adminCard"><div className="editorTitle"><div><h2>Recent orders</h2><p>آخر الطلبات غير الملغاة.</p></div></div><div className="adminTable"><div className="tableRow tableHead"><span>Order</span><span>Customer</span><span>Status</span><span>Total</span></div>{stats.recentOrders.map(o=><div className="tableRow" key={o.id}><strong>{o.orderNumber}</strong><span>{o.user?.name||o.user?.email||"Customer"}</span><span>{o.status}</span><span>{Number(o.total).toLocaleString()} EGP</span></div>)}</div></section>}
      {stats && <section className="adminCard"><div className="editorTitle"><div><h2>Top selling products</h2><p>حسب إجمالي الكمية المباعة.</p></div></div>{stats.topProducts.length===0?<p>لسه مفيش مبيعات.</p>:<div className="adminTable">{stats.topProducts.map((p,i)=><div className="tableRow" key={p.productId||i}><strong>#{i+1}</strong><span>{p.productId}</span><span>Sold</span><span>{p._sum.quantity??0}</span></div>)}</div>}</section>}
      <section className="adminCard">
        <div className="editorTitle">
          <div><h2>Low stock</h2><p>Products at or below the alert threshold.</p></div>
          <button className="adminSecondary" onClick={load}>Refresh</button>
        </div>
        {!stats ? <p>Loading dashboard...</p> : stats.lowStockProducts.length === 0 ? (
          <p>No low-stock products right now.</p>
        ) : (
          <div className="adminTable">
            <div className="tableRow tableHead"><span>Product</span><span>SKU</span><span>Stock</span><span>Alert at</span></div>
            {stats.lowStockProducts.map(p => (
              <div className="tableRow" key={p.id}>
                <strong>{p.name}</strong><span>{p.sku}</span><span className="low">{p.stock}</span><span>{p.lowStockAt}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
