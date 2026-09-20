"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Product={id:string;name:string;slug:string;brand?:string|null;category?:string|null;price:string|number;compareAtPrice?:string|number|null;stock:number;images:{id:string;url:string;alt?:string|null}[]};

export default function Home(){
 const {status}=useSession(); const [products,setProducts]=useState<Product[]>([]); const [cartCount,setCartCount]=useState(0); const [wishCount,setWishCount]=useState(0);
 useEffect(()=>{fetch("/api/products?featured=true").then(r=>r.ok?r.json():[]).then(setProducts);},[]);
 useEffect(()=>{if(status==="authenticated"){fetch("/api/cart").then(r=>r.ok?r.json():{items:[]}).then(d=>setCartCount((d.items??[]).reduce((n:any,x:any)=>n+x.quantity,0)));fetch("/api/wishlist").then(r=>r.ok?r.json():{items:[]}).then(d=>setWishCount((d.items??[]).length));}else if(status==="unauthenticated"){const c=JSON.parse(localStorage.getItem("zeno-cart")??"[]");setCartCount(c.reduce((n:any,x:any)=>n+x.quantity,0));}},[status]);
 return <main className="home">
  <nav className="nav"><Link href="/" className="brand">ZENO<span>STORE</span></Link><div className="navLinks"><Link href="/shop">Shop</Link><Link href="/wishlist">♡ {wishCount>0&&wishCount}</Link><Link href="/cart">Cart {cartCount>0&&`(${cartCount})`}</Link>{status==="authenticated"?<Link href="/admin">Account</Link>:<Link href="/login">Login</Link>}</div></nav>
  <section className="hero"><div><p className="eyebrow">TIME, REFINED.</p><h1>Wear your<br/><em>moment.</em></h1><p className="heroText">ساعات مختارة بعناية بتصميم عصري وأناقة هادئة. اختار ساعتك وخلي كل لحظة ليها طابعها.</p><Link className="button" href="/shop">تصفح الساعات →</Link></div><div className="heroCard">{products[0]?.images[0]?<img src={products[0].images[0].url} alt={products[0].name}/>:<div className="heroFallback">ZENO</div>}<div className="heroBadge">NEW COLLECTION</div></div></section>
  <section className="section"><div className="sectionHead"><div><p className="eyebrow">THE COLLECTION</p><h2>اختار ساعتك</h2></div><Link href="/shop">عرض الكل →</Link></div><div className="products">{products.slice(0,3).map(p=><Link href={"/shop/"+p.slug} className="product" key={p.id}><div className="productImage">{p.images[0]?<img src={p.images[0].url} alt={p.name}/>:<div className="heroFallback">ZENO</div>}<span className="wishlistHint">♡</span></div><div className="productMeta"><div><h3>{p.name}</h3><p>{p.brand??p.category??"Zeno Watch"}</p></div><strong>{Number(p.price).toLocaleString("en-EG")} EGP</strong></div></Link>)}</div></section>
  <section className="promo"><p className="eyebrow">LIMITED OFFER</p><h2>خصم 20% على أول طلب</h2><p>استخدم الكود <b>NEW20</b> عند إتمام الطلب.</p><Link className="button light" href="/shop">Shop the offer →</Link></section>
  <section className="feedback"><p className="eyebrow">CUSTOMER FEEDBACK</p><blockquote>“تصميم راقي، جودة ممتازة، والساعة شكلها أفخم من الصور.”</blockquote><p>— Zeno customer</p></section>
 </main>;
}