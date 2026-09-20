const products = [
  { sku: "ZN-001", name: "Aurelius Classic", stock: 18, price: "5,950 EGP", status: "Active" },
  { sku: "ZN-002", name: "Noir Chronograph", stock: 7, price: "7,850 EGP", status: "Active" },
  { sku: "ZN-003", name: "Minimal Steel", stock: 3, price: "4,990 EGP", status: "Low stock" }
];

export default function AdminProductsPage() {
  return (
    <main className="adminPage">
      <header className="adminTop">
        <div><p className="eyebrow">CATALOG</p><h1>Products</h1><p>Manage watches, pricing and stock.</p></div>
        <button className="adminAction">+ Add product</button>
      </header>
      <div className="adminTable">
        <div className="tableRow tableHead"><span>Product</span><span>SKU</span><span>Stock</span><span>Price</span><span>Status</span></div>
        {products.map((p) => (
          <div className="tableRow" key={p.sku}>
            <strong>{p.name}</strong><span>{p.sku}</span><span>{p.stock}</span><span>{p.price}</span><span className={p.stock <= 5 ? "low" : ""}>{p.status}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
