"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type Item = { productId: string; name: string; price: number; quantity: number };

export default function CheckoutPage() {
  const router = useRouter();
  const { status } = useSession();
  const [items, setItems] = useState<Item[]>([]);
  const [form, setForm] = useState({ shippingName: "", shippingPhone: "", addressLine1: "", city: "المنصورة", governorate: "الدقهلية", notes: "", couponCode: "" });
  const [loading, setLoading] = useState(false);
  const [loadingCart, setLoadingCart] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (status === "authenticated") {
      fetch("/api/cart")
        .then(r => r.ok ? r.json() : { items: [] })
        .then(data => setItems((data.items ?? []).map((x: any) => ({
          productId: x.productId,
          name: x.product.name,
          price: Number(x.product.price),
          quantity: x.quantity
        }))))
        .finally(() => setLoadingCart(false));
    } else if (status === "unauthenticated") {
      setItems(JSON.parse(localStorage.getItem("zeno-cart") ?? "[]"));
      setLoadingCart(false);
    }
  }, [status]);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: items.map(i => ({ productId: i.productId, quantity: i.quantity })), ...form })
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "تعذر إنشاء الطلب"); setLoading(false); return; }

    localStorage.removeItem("zeno-cart");
    if (status === "authenticated") {
      await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [] })
      });
    }
    router.push(`/checkout/success?order=${encodeURIComponent(data.orderNumber)}`);
  }

  if (loadingCart) return <main className="min-h-screen bg-zinc-950 p-10 text-white">جاري تجهيز السلة...</main>;
  if (!items.length) return <main className="min-h-screen bg-zinc-950 p-10 text-white">السلة فاضية. <button onClick={() => router.push("/shop")} className="text-amber-400">تصفح الساعات</button></main>;

  return <main className="min-h-screen bg-zinc-950 px-5 py-10 text-white">
    <div className="mx-auto max-w-4xl"><h1 className="text-4xl font-bold">إتمام الطلب</h1>
      <form onSubmit={submit} className="mt-8 grid gap-8 md:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          {Object.entries(form).map(([key, value]) => key !== "couponCode" && <input key={key} value={value} onChange={e => setForm({...form, [key]: e.target.value})} placeholder={key === "shippingName" ? "الاسم بالكامل" : key === "shippingPhone" ? "رقم الهاتف" : key === "addressLine1" ? "العنوان بالتفصيل" : key === "city" ? "المدينة" : key === "governorate" ? "المحافظة" : "ملاحظات"} className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-amber-400" required={!["notes"].includes(key)} />)}
          <input value={form.couponCode} onChange={e => setForm({...form, couponCode: e.target.value})} placeholder="كود الخصم — مثل NEW20" className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3" />
          {error && <p className="text-red-400">{error}</p>}
        </div>
        <aside className="h-fit rounded-2xl border border-zinc-800 bg-zinc-900 p-6"><p className="text-zinc-400">الإجمالي</p><p className="mt-2 text-3xl font-bold">{subtotal.toLocaleString("en-EG")} EGP</p><button disabled={loading} className="mt-6 w-full rounded-xl bg-amber-400 px-5 py-3 font-bold text-black disabled:opacity-50">{loading ? "جاري إنشاء الطلب..." : "تأكيد الطلب"}</button></aside>
      </form>
    </div>
  </main>;
}
