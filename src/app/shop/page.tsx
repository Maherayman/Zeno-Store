const products = [
  { name: "Aurelius Classic", price: "5,950 EGP", category: "Classic" },
  { name: "Noir Chronograph", price: "7,850 EGP", category: "Chronograph" },
  { name: "Minimal Steel", price: "4,990 EGP", category: "Minimal" },
  { name: "Midnight Automatic", price: "8,400 EGP", category: "Automatic" }
];

export default function ShopPage() {
  return (
    <main className="shopPage">
      <header className="shopHeader">
        <p className="eyebrow">ZEN0 COLLECTION</p>
        <h1>All watches</h1>
        <p>Discover the collection and find the piece that fits your style.</p>
      </header>
      <div className="shopTools">
        <input placeholder="Search watches..." aria-label="Search watches" />
        <select aria-label="Filter by category" defaultValue="all">
          <option value="all">All categories</option>
          <option>Classic</option><option>Chronograph</option><option>Minimal</option><option>Automatic</option>
        </select>
      </div>
      <div className="shopGrid">
        {products.map((product) => (
          <article className="shopCard" key={product.name}>
            <div className="watchPlaceholder"><span>⌚</span></div>
            <p>{product.category}</p>
            <h2>{product.name}</h2>
            <strong>{product.price}</strong>
            <button>Add to cart</button>
          </article>
        ))}
      </div>
    </main>
  );
}
