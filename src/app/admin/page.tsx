"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Stats = {
  orders: number; products: number; customers: number; pendingReviews: number;
  revenue: number;
  recentOrders: { id:string; orderNumber:string; total:string|number; status:string; createdAt:string; user?:{name?:string|null;email?:string|null}|null }[];
  topProducts: { productId:string; name:string; sku:string; quantity:number }[];
  lowStockProducts: { id: string; name: string; sku: string; stock: number; lowStockAt: number }[];
};

const statusLabel: Record<string,string> = {
  PENDING: "جديد",
  CONFIRMED: "مؤكد",
  PROCESSING: "قيد التجهيز",
  SHIPPED: "تم الشحن",
  DELIVERED: "تم التسليم",
  CANCELLED: "ملغي"
};

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  async function load() {
    setError("");
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
        <p>إدارة المتجر من الموبايل.</p>
      </header>

      {error && <div className="adminNotice">{error}</div>}

      <section className="adminQuickActions">
        <Link href="/admin/products" className="adminAction">＋ إضافة منتج</Link>
        <Link href="/admin/orders" className="adminAction">📦 الطلبات</Link>
        <Link href="/admin/coupons" className="adminAction">🎟️ كوبون</Link>
      </section>

      <section className="adminGrid">
        <article><span>Orders</span><strong>{stats?.orders ?? "—"}</strong><p>كل الطلبات</p></article>
        <article><span>Products</span><strong>{stats?.products ?? "—"}</strong><p>المنتجات النشطة</p></article>
        <article><span>Customers</span><strong>{stats?.customers ?? "—"}</strong><p>العملاء</p></article>
        <article><span>Pending reviews</span><strong>{stats?.pendingReviews ?? "—"}</strong><p>تحتاج مراجعة</p></article>
        <article><span>Revenue</span><strong>{stats ? stats.revenue.toLocaleString() : "—"} EGP</strong><p>بدون الطلبات الملغاة</p></article>
      </section>

      {stats && <section className="adminCard">
        <div className="editorTitle">
          <div><h2>آخر الطلبات</h2><p>أحدث الطلبات غير الملغاة.</p></div>
          <Link href="/admin/orders" className="adminSecondary">كل الطلبات</Link>
        </div>
        <div className="adminMobileCards">
          {stats.recentOrders.length === 0 ? <p>مفيش طلبات لسه.</p> : stats.recentOrders.map(o => (
            <Link href="/admin/orders" className="adminOrderCard" key={o.id}>
              <div className="adminOrderTop"><strong>{o.orderNumber}</strong><span>{statusLabel[o.status] || o.status}</span></div>
              <p>{o.user?.name || o.user?.email || "عميل"}</p>
              <div className="adminOrderBottom"><span>{new Date(o.createdAt).toLocaleDateString("ar-EG")}</span><strong>{Number(o.total).toLocaleString()} EGP</strong></div>
            </Link>
          ))}
        </div>
      </section>}

      {stats && <section className="adminCard">
        <div className="editorTitle">
          <div><h2>الأكثر مبيعًا</h2><p>حسب إجمالي الكمية المباعة.</p></div>
        </div>
        {stats.topProducts.length === 0 ? <p>لسه مفيش مبيعات.</p> : (
          <div className="adminMobileCards">
            {stats.topProducts.map((p,i) => (
              <div className="adminTopProduct" key={p.productId}>
                <strong className="rank">#{i + 1}</strong>
                <div><strong>{p.name}</strong><small>{p.sku}</small></div>
                <b>{p.quantity} <small>مباع</small></b>
              </div>
            ))}
          </div>
        )}
      </section>}

      <section className="adminCard">
        <div className="editorTitle">
          <div><h2>مخزون منخفض</h2><p>المنتجات التي تحتاج متابعة.</p></div>
          <button className="adminSecondary" onClick={load}>تحديث</button>
        </div>
        {!stats ? <p>Loading dashboard...</p> : stats.lowStockProducts.length === 0 ? (
          <p>المخزون كله كويس حاليًا.</p>
        ) : (
          <div className="adminMobileCards">
            {stats.lowStockProducts.map(p => (
              <Link href="/admin/products" className="adminStockCard" key={p.id}>
                <div><strong>{p.name}</strong><small>{p.sku}</small></div>
                <div><b className="low">{p.stock}</b><small>تنبيه عند {p.lowStockAt}</small></div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
