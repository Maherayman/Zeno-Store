"use client";
import { useEffect, useState } from "react";
type User={id:string;name:string|null;email:string;phone:string|null;createdAt:string;_count:{orders:number;reviews:number}};
export default function AdminUsersPage(){
 const [users,setUsers]=useState<User[]>([]); const [loading,setLoading]=useState(true);
 async function load(){setLoading(true);const r=await fetch("/api/admin/users",{cache:"no-store"});const d=await r.json();if(r.ok)setUsers(d);setLoading(false);}
 useEffect(()=>{load()},[]);
 return <main className="adminPage"><header className="adminTop"><div><p className="eyebrow">CUSTOMERS</p><h1>العملاء</h1><p>العملاء المسجلين ونشاطهم داخل المتجر.</p></div><button className="adminSecondary" onClick={load}>تحديث</button></header>
 <section className="customerStats"><div><strong>{users.length}</strong><span>إجمالي العملاء</span></div><div><strong>{users.reduce((n,u)=>n+u._count.orders,0)}</strong><span>إجمالي الطلبات</span></div><div><strong>{users.reduce((n,u)=>n+u._count.reviews,0)}</strong><span>التقييمات</span></div></section>
 {loading?<div className="adminCard"><p>جاري تحميل العملاء...</p></div>:<div className="customerCards">{users.map(u=><article className="customerCard" key={u.id}>
 <div className="customerAvatar">{(u.name||"C").charAt(0).toUpperCase()}</div><div className="customerInfo"><strong>{u.name||"عميل"}</strong><span>{u.email}</span>{u.phone&&<span>📞 {u.phone}</span>}<small>انضم {new Date(u.createdAt).toLocaleDateString("ar-EG")}</small></div>
 <div className="customerCounts"><b>{u._count.orders}</b><span>طلبات</span><b>{u._count.reviews}</b><span>تقييمات</span></div>
 </article>)}{!users.length&&<div className="adminCard"><p>مفيش عملاء لسه.</p></div>}</div>}
 </main>;
}