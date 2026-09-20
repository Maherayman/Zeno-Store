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

  async function loadProducts() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load products");
      setProducts(data);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadProducts(); }, []);

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function editProduct(p: Product) {
    setEditingId(p.id);
    setForm(formFromProduct(p));
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      isActive: form.isActive, isFeatured: form.isFeatured, ...(editingId ? { images } : {})
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
          <p>Manage watches, pricing, stock, visibility and product images.</p>
        </div>
        <button className="adminAction" type="button" onClick={resetForm}>+ Add product</button>
      </header>

      {message && <div className="adminNotice">{message}</div>}

      <section className="adminCard productEditor">
        <div className="editorTitle">
          <div><h2>{editingId ? "Edit watch" : "Add a new watch"}</h2><p>Enter the product information used by the storefront.</p></div>
          {editingId && <button type="button" className="adminSecondary" onClick={resetForm}>Cancel edit</button>}
        </div>
        <form onSubmit={saveProduct} className="adminForm">
          <label>Name<input required value={form.name} onChange={e => setForm({...form, name:e.target.value})} placeholder="Zeno Classic Black" /></label>
          <label>Slug<input required value={form.slug} onChange={e => setForm({...form, slug:e.target.value})} placeholder="zeno-classic-black" /></label>
          <label>SKU<input required value={form.sku} onChange={e => setForm({...form, sku:e.target.value})} placeholder="ZENO-001" /></label>
          <label>Brand<input value={form.brand} onChange={e => setForm({...form, brand:e.target.value})} /></label>
          <label>Category<input value={form.category} onChange={e => setForm({...form, category:e.target.value})} /></label>
          <label>Price (EGP)<input required type="number" min="0" step="0.01" value={form.price} onChange={e => setForm({...form, price:e.target.value})} /></label>
          <label>Compare-at price<input type="number" min="0" step="0.01" value={form.compareAtPrice} onChange={e => setForm({...form, compareAtPrice:e.target.value})} /></label>
          <label>Stock<input required type="number" min="0" step="1" value={form.stock} onChange={e => setForm({...form, stock:e.target.value})} /></label>
          <label>Low-stock alert at<input required type="number" min="0" step="1" value={form.lowStockAt} onChange={e => setForm({...form, lowStockAt:e.target.value})} /></label>
          <label className="full">Description<textarea rows={4} value={form.description} onChange={e => setForm({...form, description:e.target.value})} /></label>
          <div className="full imageFields">
            <strong>Product image URLs</strong>
            {form.images.map((url, i) => (
              <div className="imageInput" key={i}>
                <input type="url" value={url} onChange={e => { const images=[...form.images]; images[i]=e.target.value; setForm({...form, images}); }} placeholder="https://..." />
                {form.images.length > 1 && <button type="button" onClick={() => setForm({...form, images:form.images.filter((_,x)=>x!==i)})}>Remove</button>}
              </div>
            ))}
            <button type="button" className="adminSecondary" onClick={() => setForm({...form, images:[...form.images, ""]})}>+ Add image</button>
            {!editingId && <small>Images are added when the product is edited; Cloudinary upload will be added next.</small>}
          </div>
          <div className="checks full">
            <label><input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive:e.target.checked})} /> Visible in store</label>
            <label><input type="checkbox" checked={form.isFeatured} onChange={e => setForm({...form, isFeatured:e.target.checked})} /> Featured watch</label>
          </div>
          <button className="adminAction full" disabled={saving}>{saving ? "Saving..." : editingId ? "Save changes" : "Create product"}</button>
        </form>
      </section>

      <section className="adminCard">
        <div className="editorTitle"><div><h2>Watch catalog</h2><p>{products.length} products</p></div><button className="adminSecondary" onClick={loadProducts}>Refresh</button></div>
        {loading ? <p>Loading products...</p> : (
          <div className="adminTable">
            <div className="tableRow tableHead"><span>Product</span><span>SKU</span><span>Stock</span><span>Price</span><span>Status</span><span>Actions</span></div>
            {products.map(p => (
              <div className="tableRow" key={p.id}>
                <strong>{p.name}</strong><span>{p.sku}</span><span className={p.stock <= p.lowStockAt ? "low" : ""}>{p.stock}</span><span>{Number(p.price).toLocaleString()} EGP</span>
                <span className={p.isActive ? "" : "low"}>{p.isActive ? (p.stock <= p.lowStockAt ? "Low stock" : "Active") : "Hidden"}</span>
                <span className="rowActions"><button onClick={() => editProduct(p)}>Edit</button><button onClick={() => toggleActive(p)}>{p.isActive ? "Hide" : "Show"}</button>{p.isActive && <button onClick={() => deleteProduct(p)}>Remove</button>}</span>
              </div>
            ))}
            {!products.length && <p>No products found.</p>}
          </div>
        )}
      </section>
    </main>
  );
}
