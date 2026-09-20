"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Product = {
  id: string; name: string; slug: string; brand?: string | null; category?: string | null;
  price: string | number; compareAtPrice?: string | number | null; stock: number;
  images: { id: string; url: string; alt?: string | null }[];
};

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadProducts(search = "") {
    setLoading(true);
    const res = await fetch(`/api/products${search ? `?q=${encodeURIComponent(search)}` : ""}`);
    if (res.ok) setProducts(await res.json());
    setLoading(false);
  }

  useEffect(() => { loadProducts(); }, []);

  return (
    <main className="min-h-screen bg-zinc-950 px-5 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.3em] text-amber-400">Zeno Store</p>
            <h1 className="text-4xl font-bold md:text-6xl">Our Watches</h1>
            <p className="mt-3 text-zinc-400">اختار ساعتك من المنتجات المتاحة حاليًا.</p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); loadProducts(q); }} className="flex gap-2">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث عن ساعة..." className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-amber-400 md:w-72" />
            <button className="rounded-xl bg-amber-400 px-5 font-semibold text-black">بحث</button>
          </form>
        </div>

        {loading ? <p className="text-zinc-400">جاري تحميل المنتجات...</p> : products.length === 0 ? <p className="text-zinc-400">مفيش منتجات مطابقة.</p> : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Link key={product.id} href={`/shop/${product.slug}`} className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 transition hover:-translate-y-1 hover:border-amber-400/50">
                <div className="aspect-[4/3] overflow-hidden bg-zinc-800">
                  {product.images[0] ? <img src={product.images[0].url} alt={product.images[0].alt ?? product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-zinc-500">No image</div>}
                </div>
                <div className="p-5">
                  <p className="text-xs uppercase tracking-widest text-amber-400">{product.brand ?? product.category ?? "Watch"}</p>
                  <h2 className="mt-2 text-xl font-semibold">{product.name}</h2>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-2xl font-bold">{Number(product.price).toLocaleString("en-EG")} EGP</span>
                    <span className="text-sm text-zinc-400">{product.stock > 0 ? `متاح: ${product.stock}` : "نفد"}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
