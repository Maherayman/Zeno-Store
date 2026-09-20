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
  const [location, setLocation] = useState<{latitude:number;longitude:number}|null>(null);
  const [locating, setLocating] = useState(false);
  function getLocation(){ setLocating(true); setError(""); if(!navigator.geolocation){setError("المتصفح لا يدعم تحديد الموقع");setLocating(false);return} navigator.geolocation.getCurrentPosition(p=>{setLocation({latitude:p.coords.latitude,longitude:p.coords.longitude});setLocating(false)},()=>{setError("اسمح للموقع من إعدادات المتصفح ثم حاول مرة أخرى.");setLocating(false)},{enableHighAccuracy:true,timeout:10000}); }

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
      body: JSON.stringify({ items: items.map(i => ({ productId: i.productId, quantity: i.quantity })), ...form, addressLine1: form.addressLine1 || (location ? "موقع محدد على الخريطة" : ""), latitude: location?.latitude, longitude: location?.longitude })
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
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4"><p className="font-semibold">📍 مكان التوصيل</p><p className="mt-1 text-sm text-zinc-400">{location ? `تم تحديد موقعك: ${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}` : "ممكن تحدد مكانك بدل كتابة العنوان بالتفصيل."}</p><button type="button" onClick={getLocation} className="mt-3 rounded-xl border border-amber-400 px-4 py-2 text-amber-300">{locating ? "جاري تحديد الموقع..." : location ? "تحديث موقعي" : "حدد موقعي على الخريطة"}</button></div>
          {Object.entries(form).map(([key, value]) => key !== "couponCode" && <input key={key} value={value} onChange={e => setForm({...form, [key]: e.target.value})} placeholder={key === "shippingName" ? "الاسم بالكامل" : key === "shippingPhone" ? "رقم الهاتف" : key === "addressLine1" ? "العنوان بالتفصيل" : key === "city" ? "المدينة" : key === "governorate" ? "المحافظة" : "ملاحظات"} className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-amber-400" required={!["notes","addressLine1","city","governorate"].includes(key)} />)}
          <input value={form.couponCode} onChange={e => setForm({...form, couponCode: e.target.value})} placeholder="كود الخصم — مثل NEW20" className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3" />
          {error && <p className="text-red-400">{error}</p>}
        </div>
        <aside className="h-fit rounded-2xl border border-zinc-800 bg-zinc-900 p-6"><p className="text-zinc-400">الإجمالي</p><p className="mt-2 text-3xl font-bold">{subtotal.toLocaleString("en-EG")} EGP</p><button disabled={loading} className="mt-6 w-full rounded-xl bg-amber-400 px-5 py-3 font-bold text-black disabled:opacity-50">{loading ? "جاري إنشاء الطلب..." : "تأكيد الطلب"}</button></aside>
      </form>
    </div>
  </main>;
}
