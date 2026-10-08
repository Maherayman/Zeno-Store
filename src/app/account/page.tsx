"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Order = {
  id: string; orderNumber: string; status: string; total: string | number; createdAt: string;
  items: { productName: string; quantity: number; unitPrice: string | number }[];
};

const labels: Record<string, string> = {
  PENDING: "قيد المراجعة", CONFIRMED: "تم تأكيد الطلب", PROCESSING: "جاري التجهيز",
  SHIPPED: "تم الشحن", DELIVERED: "تم التوصيل", CANCELLED: "ملغي"
};
const steps = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

export default function Account() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/orders/my")
        .then((response) => response.ok ? response.json() : [])
        .then(setOrders)
        .catch(() => setOrders([]))
        .finally(() => setLoading(false));
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  if (status === "loading" || loading) {
    return <main className="min-h-screen bg-zinc-950 p-8 text-white">جاري التحميل...</main>;
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-zinc-950 p-8 text-white">
        <div className="mx-auto max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <h1 className="text-3xl font-bold">حسابي</h1>
          <p className="mt-3 text-zinc-400">سجل الدخول لمتابعة طلباتك.</p>
          <Link href="/login" className="mt-6 inline-block rounded-xl bg-amber-400 px-6 py-3 font-bold text-black">تسجيل الدخول</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-5 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-400">Zeno Store</p>
          <h1 className="mt-2 text-4xl font-bold">حسابي</h1>
          <p className="mt-2 text-zinc-400">{session.user?.name || session.user?.email}</p>
        </header>
        <div className="mb-6 flex gap-3">
          <Link href="/shop" className="rounded-xl border border-zinc-700 px-5 py-3">تصفح الساعات</Link>
          <Link href="/cart" className="rounded-xl bg-amber-400 px-5 py-3 font-bold text-black">السلة</Link>
        </div>
        <h2 className="mb-4 text-2xl font-bold">طلباتي</h2>
        {orders.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center text-zinc-400">لسه مفيش طلبات.</div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link href={"/account/orders/" + order.id} key={order.id} className="block rounded-2xl border border-zinc-800 bg-zinc-900 p-5 transition hover:border-amber-400/50">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-bold">{order.orderNumber}</p>
                    <p className="text-sm text-zinc-500">{new Date(order.createdAt).toLocaleDateString("ar-EG")}</p>
                  </div>
                  <span className="rounded-full border border-amber-400/30 px-3 py-1 text-sm text-amber-300">{labels[order.status] ?? order.status}</span>
                </div>
                {order.status !== "CANCELLED" && (
                  <div className="mt-5 flex items-center gap-1" aria-label="حالة الطلب">
                    {steps.map((step, index) => (
                      <div key={step} className="flex flex-1 items-center">
                        <div className={"h-2 w-full rounded-full " + (steps.indexOf(order.status) >= index ? "bg-amber-400" : "bg-zinc-700")} />
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4 space-y-2 border-t border-zinc-800 pt-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between gap-4 text-sm">
                      <span>{item.productName} × {item.quantity}</span>
                      <span>{(Number(item.unitPrice) * item.quantity).toLocaleString("en-EG")} EGP</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-between border-t border-zinc-800 pt-4 font-bold">
                  <span>الإجمالي</span><span>{Number(order.total).toLocaleString("en-EG")} EGP</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
