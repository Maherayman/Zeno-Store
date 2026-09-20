"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Item = { productId: string; name: string; price: number; image: string; quantity: number };

export default function CartPage() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    setItems(JSON.parse(localStorage.getItem("zeno-cart") ?? "[]"));
  }, []);

  function save(next: Item[]) {
    setItems(next);
    localStorage.setItem("zeno-cart", JSON.stringify(next));
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return <main className="min-h-screen bg-zinc-950 px-5 py-10 text-white">
    <div className="mx-auto max-w-5xl">
      <h1 className="text-4xl font-bold">سلة المشتريات</h1>
      {items.length === 0 ? <div className="mt-10 rounded-2xl border border-zinc-800 p-8 text-zinc-400">السلة فاضية. <Link className="text-amber-400" href="/shop">تصفح الساعات</Link></div> : <div className="mt-8 grid gap-8 md:grid-cols-[1fr_320px]">
        <div className="space-y-4">{items.map(item => <div key={item.productId} className="flex gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <img src={item.image} alt="" className="h-24 w-24 rounded-xl object-cover" />
          <div className="flex-1"><h2 className="font-semibold">{item.name}</h2><p className="mt-1 text-zinc-400">{item.price.toLocaleString("en-EG")} EGP</p>
            <div className="mt-3 flex items-center gap-3"><button onClick={() => save(items.map(x => x.productId === item.productId ? {...x, quantity: Math.max(1, x.quantity - 1)} : x))} className="rounded-lg border px-3">−</button><span>{item.quantity}</span><button onClick={() => save(items.map(x => x.productId === item.productId ? {...x, quantity: x.quantity + 1} : x))} className="rounded-lg border px-3">+</button><button onClick={() => save(items.filter(x => x.productId !== item.productId))} className="ml-3 text-sm text-red-400">حذف</button></div>
          </div>
        </div>)}</div>
        <aside className="h-fit rounded-2xl border border-zinc-800 bg-zinc-900 p-6"><p className="text-zinc-400">الإجمالي</p><p className="mt-2 text-3xl font-bold">{total.toLocaleString("en-EG")} EGP</p><Link href="/checkout" className="mt-6 block rounded-xl bg-amber-400 px-5 py-3 text-center font-bold text-black">إتمام الطلب</Link></aside>
      </div>}
    </div>
  </main>;
}
