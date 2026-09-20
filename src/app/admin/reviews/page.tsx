"use client";
import { useEffect, useState } from "react";
type Review={id:string;rating:number;title:string|null;body:string;status:"PENDING"|"APPROVED"|"HIDDEN";createdAt:string;isVerifiedPurchase:boolean;user:{name:string|null;email:string};product:{name:string}};
const statusLabels={PENDING:"قيد المراجعة",APPROVED:"مقبول",HIDDEN:"مخفي"};
export default function AdminReviewsPage(){
 const [reviews,setReviews]=useState<Review[]>([]); const [loading,setLoading]=useState(true);
 async function load(){setLoading(true);const r=await fetch("/api/admin/reviews",{cache:"no-store"});const d=await r.json();if(r.ok)setReviews(d);setLoading(false);}
 useEffect(()=>{load()},[]);
 async function setStatus(id:string,status:Review["status"]){const r=await fetch("/api/admin/reviews",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,status})});if(r.ok)load();}
 const pending=reviews.filter(r=>r.status==="PENDING").length;
 return <main className="adminPage"><header className="adminTop"><div><p className="eyebrow">CUSTOMER FEEDBACK</p><h1>التقييمات</h1><p>مراجعة آراء العملاء قبل ظهورها في المتجر.</p></div><button className="adminSecondary" onClick={load}>تحديث</button></header>
 <section className="reviewStats"><div><strong>{reviews.length}</strong><span>كل التقييمات</span></div><div><strong>{pending}</strong><span>تحتاج مراجعة</span></div><div><strong>{reviews.filter(r=>r.isVerifiedPurchase).length}</strong><span>شراء موثق</span></div></section>
 <div className="reviewList">{loading?<p>جاري تحميل التقييمات...</p>:reviews.map(r=><article className="reviewCard" key={r.id}>
 <div className="reviewTop"><div><strong>{r.product.name}</strong><small>{r.user.name||r.user.email}</small></div><span className={`reviewStatus ${r.status.toLowerCase()}`}>{statusLabels[r.status]}</span></div>
 <div className="reviewStars">{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</div>{r.title&&<h3>{r.title}</h3>}<p>{r.body}</p>
 <small>{r.isVerifiedPurchase?"✓ شراء موثق":"غير موثق"} · {new Date(r.createdAt).toLocaleDateString("ar-EG")}</small>
 <div className="rowActions"><button onClick={()=>setStatus(r.id,"APPROVED")}>قبول</button><button onClick={()=>setStatus(r.id,"HIDDEN")}>إخفاء</button>{r.status!=="PENDING"&&<button onClick={()=>setStatus(r.id,"PENDING")}>إرجاع للمراجعة</button>}</div>
 </article>)}{!loading&&!reviews.length&&<p>مفيش تقييمات لسه.</p>}</div></main>;
}