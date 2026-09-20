"use client";
import { useEffect, useState } from "react";
type User={id:string;name:string|null;email:string;phone:string|null;createdAt:string;_count:{orders:number;reviews:number}};
export default function AdminUsersPage(){
 const [users,setUsers]=useState<User[]>([]); const [loading,setLoading]=useState(true);
 async function load(){setLoading(true);const r=await fetch("/api/admin/users",{cache:"no-store"});const d=await r.json();if(r.ok)setUsers(d);setLoading(false);}
 useEffect(()=>{load()},[]);
 return <main className="adminPage"><header className="adminTop"><div><p className="eyebrow">CUSTOMERS</p><h1>Customers</h1><p>View registered customers and their activity.</p></div><button className="adminSecondary" onClick={load}>Refresh</button></header>
 <div className="adminTable"><div className="tableRow tableHead"><span>Customer</span><span>Contact</span><span>Orders</span><span>Reviews</span><span>Joined</span></div>
 {loading?<p>Loading customers...</p>:users.map(u=><div className="tableRow" key={u.id}><strong>{u.name||"Customer"}</strong><span>{u.email}{u.phone&&<><br/>{u.phone}</>}</span><span>{u._count.orders}</span><span>{u._count.reviews}</span><span>{new Date(u.createdAt).toLocaleDateString()}</span></div>)}{!loading&&!users.length&&<p>No customers yet.</p>}</div></main>;
}