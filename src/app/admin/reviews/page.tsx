"use client";
import { useEffect, useState } from "react";
type Review={id:string;rating:number;title:string|null;body:string;status:"PENDING"|"APPROVED"|"HIDDEN";createdAt:string;isVerifiedPurchase:boolean;user:{name:string|null;email:string};product:{name:string}};
export default function AdminReviewsPage(){
 const [reviews,setReviews]=useState<Review[]>([]); const [loading,setLoading]=useState(true);
 async function load(){setLoading(true);const r=await fetch("/api/admin/reviews",{cache:"no-store"});const d=await r.json();if(r.ok)setReviews(d);setLoading(false);}
 useEffect(()=>{load()},[]);
 async function setStatus(id:string,status:Review["status"]){const r=await fetch("/api/admin/reviews",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,status})});if(r.ok)load();}
 return <main className="adminPage"><header><p className="eyebrow">CUSTOMER FEEDBACK</p><h1>Reviews</h1><p>Moderate customer feedback before it appears publicly.</p></header>
 <div className="reviewList">{loading?<p>Loading reviews...</p>:reviews.map(r=><article key={r.id}><div><strong>{r.product.name}</strong><span>{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</span></div><p>{r.title&&<strong>{r.title}: </strong>}{r.body}</p><small>{r.user.name||r.user.email} · {r.isVerifiedPurchase?"Verified purchase · ":""}{r.status}</small><div className="rowActions"><button onClick={()=>setStatus(r.id,"APPROVED")}>Approve</button><button onClick={()=>setStatus(r.id,"HIDDEN")}>Hide</button>{r.status!=="PENDING"&&<button onClick={()=>setStatus(r.id,"PENDING")}>Pending</button>}</div></article>)}{!loading&&!reviews.length&&<p>No reviews yet.</p>}</div></main>;
}