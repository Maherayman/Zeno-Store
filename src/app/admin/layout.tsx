import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="adminShell">
      <nav className="adminMobileNav" aria-label="Admin navigation">
        <Link href="/admin">⌂<span>الرئيسية</span></Link>
        <Link href="/admin/products">⌚<span>المنتجات</span></Link>
        <Link href="/admin/orders">📦<span>الطلبات</span></Link>
        <Link href="/admin/coupons">🎟️<span>الكوبونات</span></Link>
        <Link href="/admin/settings">⚙️<span>الإعدادات</span></Link>
      </nav>
      <div className="adminContent">{children}</div>
    </div>
  );
}
