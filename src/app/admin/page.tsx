"use client";

import { useEffect, useState } from "react";

type Stats = {
  orders: number; products: number; customers: number; pendingReviews: number;
  revenue: number;
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
