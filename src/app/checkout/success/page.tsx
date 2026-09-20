"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function SuccessPage() {
  const params = useSearchParams();
  const order = params.get("order");
  return <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-5 text-center text-white">
    <div className="max-w-lg rounded-3xl border border-zinc-800 bg-zinc-900 p-10">
      <div className="text-5xl">✓</div><h1 className="mt-5 text-3xl font-bold">تم استلام طلبك</h1>
      <p className="mt-3 text-zinc-400">رقم الطلب: <strong className="text-white">{order}</strong></p>
      <Link href="/shop" className="mt-7 inline-block rounded-xl bg-amber-400 px-6 py-3 font-bold text-black">العودة للمتجر</Link>
    </div>
  </main>;
}
