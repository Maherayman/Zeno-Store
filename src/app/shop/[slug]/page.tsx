"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";

type Product = {
  id: string; name: string; slug: string; description?: string | null;
  brand?: string | null; category?: string | null; price: string | number;
  compareAtPrice?: string | number | null; stock: number;
  images: { id: string; url: string; alt?: string | null }[];
  reviews: { id: string; rating: number; title?: string | null; body: string; user: { name: string | null } }[];
};

export default function ProductPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [selected, setSelected] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const { status } = useSession();
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${encodeURIComponent(params.slug)}`)
      .then((r) => r.ok ? r.json() : null)
      .then(setProduct)
      .finally(() => setLoading(false));
  }, [params.slug]);

  if (loading) return <main className="min-h-screen bg-zinc-950 p-10 text-white">جاري تحميل الساعة...</main>;
  useEffect(() => { if (status === "authenticated") fetch("/api/wishlist").then(r => r.ok ? r.json() : { items: [] }).then(d => setWishlisted((d.items ?? []).some((x: any) => x.productId === product?.id))); }, [status, product?.id]);

  async function toggleWishlist() { if (status !== "authenticated") { router.push("/login"); return; } const method = wishlisted ? "DELETE" : "POST"; const res = await fetch("/api/wishlist", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: product.id }) }); if (res.ok) setWishlisted(!wishlisted); }

  if (!product) return <main className="min-h-screen bg-zinc-950 p-10 text-white">الساعة غير موجودة.</main>;

  const addToCart = async () => {
    const cart = JSON.parse(localStorage.getItem("zeno-cart") ?? "[]");
    const existing = cart.find((item: { productId: string }) => item.productId === product.id);
    if (existing) existing.quantity = Math.min(existing.quantity + quantity, product.stock);
    else cart.push({ productId: product.id, name: product.name, price: Number(product.price), image: product.images[0]?.url ?? "", quantity });
    localStorage.setItem("zeno-cart", JSON.stringify(cart));
    if (status === "authenticated") await fetch("/api/cart", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: cart.map((item: { productId: string; quantity: number }) => ({ productId: item.productId, quantity: item.quantity })) }) });
    setMessage("تمت إضافة الساعة للسلة ✓");
  };

  return (
    <main className="min-h-screen bg-zinc-950 px-5 py-10 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-3xl bg-zinc-900">
            {product.images[selected] ? <img src={product.images[selected].url} alt={product.images[selected].alt ?? product.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-zinc-500">No image</div>}
          </div>
          {product.images.length > 1 && <div className="mt-3 flex gap-3 overflow-auto">{product.images.map((image, i) => <button key={image.id} onClick={() => setSelected(i)} className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border ${selected === i ? "border-amber-400" : "border-zinc-800"}`}><img src={image.url} alt="" className="h-full w-full object-cover" /></button>)}</div>}
        </div>

        <section className="flex flex-col justify-center">
          <p className="text-sm uppercase tracking-[0.25em] text-amber-400">{product.brand ?? product.category ?? "Zeno Watch"}</p>
          <h1 className="mt-3 text-4xl font-bold md:text-5xl">{product.name}</h1>
          <div className="mt-6 flex items-end gap-3">
            <span className="text-3xl font-bold">{Number(product.price).toLocaleString("en-EG")} EGP</span>
            {product.compareAtPrice && <span className="text-lg text-zinc-500 line-through">{Number(product.compareAtPrice).toLocaleString("en-EG")} EGP</span>}
          </div>
          <p className="mt-6 leading-8 text-zinc-400">{product.description}</p>
          <p className="mt-5 text-sm text-zinc-400">{product.stock > 0 ? `متاح في المخزون: ${product.stock}` : "غير متاح حاليًا"}</p>

          <div className="mt-6 flex gap-3">
            <div className="flex items-center rounded-xl border border-zinc-700">
              <button disabled={quantity <= 1} onClick={() => setQuantity(q => q - 1)} className="px-4 py-3 disabled:opacity-40">−</button>
              <span className="w-10 text-center">{quantity}</span>
              <button disabled={quantity >= product.stock} onClick={() => setQuantity(q => q + 1)} className="px-4 py-3 disabled:opacity-40">+</button>
            </div>
            <div className="flex gap-3"><button onClick={toggleWishlist} className="rounded-xl border border-zinc-700 px-5 py-3 text-2xl" aria-label="المفضلة">{wishlisted ? "♥" : "♡"}</button><button disabled={!product.stock} onClick={addToCart} className="flex-1 rounded-xl bg-amber-400 px-6 py-3 font-bold text-black disabled:cursor-not-allowed disabled:opacity-40">أضف للسلة</button>
          </div>
          {message && <p className="mt-3 text-sm text-emerald-400">{message}</p>}
          <button onClick={() => router.push("/cart")} className="mt-3 rounded-xl border border-zinc-700 px-6 py-3">عرض السلة</button>

          {product.reviews.length > 0 && <div className="mt-10 border-t border-zinc-800 pt-8"><h2 className="text-2xl font-bold">آراء العملاء</h2><div className="mt-5 space-y-4">{product.reviews.map(r => <article key={r.id} className="rounded-2xl bg-zinc-900 p-4"><div className="flex justify-between"><strong>{r.user.name ?? "عميل"}</strong><span className="text-amber-400">{"★".repeat(r.rating)}</span></div><p className="mt-2 text-zinc-400">{r.body}</p></article>)}</div></div>}
        </section>
      </div>
    </main>
  );
}
