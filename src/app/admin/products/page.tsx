"use client";

import { FormEvent, useEffect, useState } from "react";

type ImageItem = { url: string; alt?: string; sortOrder?: number };
type Product = {
  id: string; name: string; slug: string; sku: string; description?: string | null;
  brand?: string | null; category?: string | null; price: string | number;
  compareAtPrice?: string | number | null; stock: number; lowStockAt: number;
  isActive: boolean; isFeatured: boolean; images: ImageItem[];
};

const emptyForm = {
  name: "", slug: "", sku: "", description: "", brand: "Zeno", category: "Watches",
  price: "", compareAtPrice: "", stock: "0", lowStockAt: "5",
  isActive: true, isFeatured: false, images: [""]
};

function formFromProduct(p: Product) {
  return {
    name: p.name, slug: p.slug, sku: p.sku, description: p.description ?? "",
    brand: p.brand ?? "", category: p.category ?? "", price: String(p.price),
    compareAtPrice: p.compareAtPrice == null ? "" : String(p.compareAtPrice),
    stock: String(p.stock), lowStockAt: String(p.lowStockAt),
    isActive: p.isActive, isFeatured: p.isFeatured,
    images: p.images.length ? p.images.map((x) => x.url) : [""]
  };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  async function loadProducts() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load products");
      setProducts(data);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not load products");
    } finally { setLoading(false); }
  }

  useEffect(() => { loadProducts(); }, []);

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function editProduct(p: Product) {
    setEditingId(p.id);
    setForm(formFromProduct(p));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateImage(index: number, value: string) {
    const images = [...form.images];
    images[index] = value;
    setForm({ ...form, images });
  }

  function removeImage(index: number) {
    setForm({ ...form, images: form.images.filter((_, i) => i !== index) });
  }

  function moveImage(index: number, direction: -1 | 1) {
    const next = index + direction;
    if (next < 0 || next >= form.images.length) return;
    const images = [...form.images];
    [images[index], images[next]] = [images[next], images[index]];
    setForm({ ...form, images });
  }

  async function saveProduct(e: FormEvent) {
    e.preventDefault();
    setSaving(true); setMessage("");
    const images = form.images.map((url) => url.trim()).filter(Boolean).map((url, i) => ({ url, sortOrder: i }));
    const payload = {
      name: form.name.trim(), slug: form.slug.trim(), sku: form.sku.trim(),
      description: form.description.trim(), brand: form.brand.trim(), category: form.category.trim(),
      price: Number(form.price), compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
      stock: Number(form.stock), lowStockAt: Number(form.lowStockAt),
      isActive: form.isActive, isFeatured: form.isFeatured, images
    };
    try {
      const res = await fetch(editingId ? `/api/admin/products/${editingId}` : "/api/admin/products", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save product");
      setMessage(editingId ? "Product updated successfully." : "Product added successfully.");
      resetForm();
      await loadProducts();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not save product");
    } finally { setSaving(false); }
  }

  async function uploadImage(file: File) {
    setUploading(true); setMessage("");
    try {
      const data = new FormData();
      data.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: data });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      setForm(current => ({ ...current, images: [...current.images.filter(Boolean), json.url] }));
      setMessage("Image uploaded successfully.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Image upload failed.");
    } finally { setUploading(false); }
  }

  async function toggleActive(p: Product) {
    const res = await fetch(`/api/admin/products/${p.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !p.isActive })
    });
    if (res.ok) loadProducts(); else setMessage("Could not change product status.");
  }

  async function deleteProduct(p: Product) {
    if (!window.confirm(`Hide "${p.name}" from the store?`)) return;
    const res = await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
    if (res.ok) loadProducts(); else setMessage("Could not hide product.");
  }

  return (
    <main className="adminPage">
      <header className="adminTop">
        <div>
          <p className="eyebrow">CATALOG</p>
          <h1>Products</h1>
          <p>إدارة الساعات والأسعار والمخزون والصور من الموبايل.</p>
        </div>
        <button className="adminAction" type="button" onClick={resetForm}>＋ إضافة ساعة</button>
      </header>

      {message && <div className="adminNotice">{message}</div>}

      <section className="adminCard productEditor">
        <div className="editorTitle">
          <div><h2>{editingId ? "تعديل الساعة" : "إضافة ساعة جديدة"}</h2><p>بيانات المنتج التي ستظهر في المتجر.</p></div>
          {editingId && <button type="button" className="adminSecondary" onClick={resetForm}>إلغاء</button>}
        </div>

        <form onSubmit={saveProduct} className="adminForm">
          <label>اسم الساعة<input required value={form.name} onChange={e => setForm({...form, name:e.target.value})} placeholder="Zeno Classic Black" /></label>
          <label>Slug<input required value={form.slug} onChange={e => setForm({...form, slug:e.target.value})} placeholder="zeno-classic-black" /></label>
          <label>SKU<input required value={form.sku} onChange={e => setForm({...form, sku:e.target.value})} placeholder="ZENO-001" /></label>
          <label>البراند<input value={form.brand} onChange={e => setForm({...form, brand:e.target.value})} /></label>
          <label>التصنيف<input value={form.category} onChange={e => setForm({...form, category:e.target.value})} /></label>
          <label>السعر (EGP)<input required type="number" min="0" step="0.01" value={form.price} onChange={e => setForm({...form, price:e.target.value})} /></label>
          <label>السعر قبل الخصم<input type="number" min="0" step="0.01" value={form.compareAtPrice} onChange={e => setForm({...form, compareAtPrice:e.target.value})} /></label>
          <label>المخزون<input required type="number" min="0" step="1" value={form.stock} onChange={e => setForm({...form, stock:e.target.value})} /></label>
          <label>تنبيه المخزون عند<input required type="number" min="0" step="1" value={form.lowStockAt} onChange={e => setForm({...form, lowStockAt:e.target.value})} /></label>
          <label className="full">الوصف<textarea rows={4} value={form.description} onChange={e => setForm({...form, description:e.target.value})} /></label>

          <div className="full imageFields">
            <strong>صور الساعة</strong>
            {form.images.map((url, i) => (
              <div className="imageInput" key={i}>
                <div className="imagePreview">{url ? <img src={url} alt="" /> : <span>صورة {i + 1}</span>}</div>
                <input type="url" value={url} onChange={e => updateImage(i, e.target.value)} placeholder="رابط الصورة https://..." />
                <div className="imageActions">
                  <button type="button" className="adminSecondary" onClick={() => moveImage(i, -1)} disabled={i === 0}>↑</button>
                  <button type="button" className="adminSecondary" onClick={() => moveImage(i, 1)} disabled={i === form.images.length - 1}>↓</button>
                  {form.images.length > 1 && <button type="button" className="adminSecondary" onClick={() => removeImage(i)}>حذف</button>}
                </div>
              </div>
            ))}
            <div className="imageUploadRow">
              <button type="button" className="adminSecondary" onClick={() => setForm({...form, images:[...form.images, ""]})}>＋ إضافة صورة</button>
              <label className="adminSecondary uploadButton">📷 رفع صورة<input type="file" accept="image/*" hidden disabled={uploading} onChange={e => { const file=e.target.files?.[0]; if(file) uploadImage(file); e.currentTarget.value=""; }} /></label>
              {uploading && <small>جاري رفع الصورة...</small>}
            </div>
            <small>يمكنك استخدام رابط الصورة أو رفعها عبر Cloudinary بعد ضبط بيانات Cloudinary.</small>
          </div>

          <div className="checks full">
            <label><input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive:e.target.checked})} /> ظاهر في المتجر</label>
            <label><input type="checkbox" checked={form.isFeatured} onChange={e => setForm({...form, isFeatured:e.target.checked})} /> ساعة مميزة</label>
          </div>

          <button className="adminAction full stickySave" disabled={saving}>{saving ? "جاري الحفظ..." : editingId ? "حفظ التعديلات" : "إنشاء المنتج"}</button>
        </form>
      </section>

      <section className="adminCard">
        <div className="editorTitle"><div><h2>كتالوج الساعات</h2><p>{products.length} منتجات</p></div><button className="adminSecondary" onClick={loadProducts}>تحديث</button></div>
        {loading ? <p>جاري تحميل المنتجات...</p> : (
          <div className="productAdminCards">
            {products.map(p => (
              <article className="productAdminCard" key={p.id}>
                <div className="productAdminImage">
                  {p.images[0]?.url ? <img src={p.images[0].url} alt={p.name} /> : <span>⌚</span>}
                  {!p.isActive && <b>مخفي</b>}
                  {p.isFeatured && <i>مميز</i>}
                </div>
                <div className="productAdminInfo">
                  <div className="productAdminTitle"><strong>{p.name}</strong><span>{p.sku}</span></div>
                  <div className="productAdminPrice">{Number(p.price).toLocaleString()} EGP</div>
                  <div className="productAdminMeta"><span>المخزون: <b className={p.stock <= p.lowStockAt ? "low" : ""}>{p.stock}</b></span><span>{p.images.length} صور</span></div>
                  <div className="rowActions productAdminActions">
                    <button onClick={() => editProduct(p)}>تعديل</button>
                    <button onClick={() => toggleActive(p)}>{p.isActive ? "إخفاء" : "إظهار"}</button>
                    {p.isActive && <button onClick={() => deleteProduct(p)}>حذف</button>}
                  </div>
                </div>
              </article>
            ))}
            {!products.length && <p>مفيش منتجات.</p>}
          </div>
        )}
      </section>
    </main>
  );
}
