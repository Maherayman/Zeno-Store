"use client";
import { useEffect, useState } from "react";

type Settings={storeName:string;logoUrl:string|null;contactPhone:string|null;contactEmail:string|null;whatsapp:string|null;shippingPolicy:string|null;paymentMethods:string[]};
export default function SettingsPage(){
 const [s,setS]=useState<Settings>({storeName:"",logoUrl:"",contactPhone:"",contactEmail:"",whatsapp:"",shippingPolicy:"",paymentMethods:["Cash on Delivery"]});
 const [loading,setLoading]=useState(true);const [saving,setSaving]=useState(false);const [message,setMessage]=useState("");
 async function load(){const r=await fetch("/api/admin/settings",{cache:"no-store"});const d=await r.json();if(r.ok&&d)setS({...d,paymentMethods:Array.isArray(d.paymentMethods)?d.paymentMethods:[]});setLoading(false)}
 useEffect(()=>{load()},[]);
 async function save(){setSaving(true);setMessage("");const r=await fetch("/api/admin/settings",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)});const d=await r.json();setSaving(false);setMessage(r.ok?"Settings saved successfully.":d.error||"Could not save settings.");if(r.ok)setS({...d,paymentMethods:Array.isArray(d.paymentMethods)?d.paymentMethods:[]})}
 return <main className="adminPage"><header><p className="eyebrow">STORE CONTROL</p><h1>Store Settings</h1><p>Manage the information customers see across the store.</p></header>
 {loading?<p>Loading settings...</p>:<section className="adminCard"><div className="adminForm">
 <label>Store name<input value={s.storeName} onChange={e=>setS({...s,storeName:e.target.value})}/></label>
 <label>Logo URL<input type="url" value={s.logoUrl||""} onChange={e=>setS({...s,logoUrl:e.target.value})}/></label>
 <label>Contact phone<input value={s.contactPhone||""} onChange={e=>setS({...s,contactPhone:e.target.value})}/></label>
 <label>Contact email<input type="email" value={s.contactEmail||""} onChange={e=>setS({...s,contactEmail:e.target.value})}/></label>
 <label>WhatsApp<input value={s.whatsapp||""} onChange={e=>setS({...s,whatsapp:e.target.value})}/></label>
 <label className="full">Shipping policy<textarea rows={5} value={s.shippingPolicy||""} onChange={e=>setS({...s,shippingPolicy:e.target.value})}/></label>
 <div className="full"><strong>Payment methods</strong>{s.paymentMethods.map((m,i)=><div className="imageInput" key={i}><input value={m} onChange={e=>{const x=[...s.paymentMethods];x[i]=e.target.value;setS({...s,paymentMethods:x})}}/><button type="button" onClick={()=>setS({...s,paymentMethods:s.paymentMethods.filter((_,x)=>x!==i)})}>Remove</button></div>)}<button type="button" className="adminSecondary" onClick={()=>setS({...s,paymentMethods:[...s.paymentMethods,""]})}>+ Add payment method</button></div>
 {message&&<p className="adminNotice full">{message}</p>}<button className="adminAction full" onClick={save} disabled={saving}>{saving?"Saving...":"Save settings"}</button>
 </div></section>}</main>
}