import Image from "next/image";

const featured = [
  { name: "Aurelius Classic", price: "$189", image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=80" },
  { name: "Noir Chronograph", price: "$249", image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=900&q=80" },
  { name: "Minimal Steel", price: "$159", image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80" }
];

export default function Home() {
  return (
    <main>
      <nav className="nav">
        <div className="brand">ZENO<span>STORE</span></div>
        <div className="navLinks"><a href="#shop">Shop</a><a href="#feedback">Feedback</a><a href="/login">Account</a><a href="/cart">Cart</a></div>
      </nav>

      <section className="hero">
        <div>
          <p className="eyebrow">TIME, REFINED.</p>
          <h1>Wear your<br /><em>moment.</em></h1>
          <p className="heroText">Curated watches with a clean, modern character. Designed to make every second count.</p>
          <a className="button" href="#shop">Explore watches →</a>
        </div>
        <div className="heroCard">
          <Image src={featured[0].image} alt={featured[0].name} fill priority sizes="(max-width: 768px) 100vw, 50vw" />
          <div className="heroBadge">NEW COLLECTION</div>
        </div>
      </section>

      <section id="shop" className="section">
        <div className="sectionHead"><div><p className="eyebrow">THE COLLECTION</p><h2>Featured watches</h2></div><a href="/shop">View all →</a></div>
        <div className="products">
          {featured.map((product) => (
            <article className="product" key={product.name}>
              <div className="productImage"><Image src={product.image} alt={product.name} fill sizes="(max-width: 768px) 90vw, 30vw" /></div>
              <div className="productMeta"><div><h3>{product.name}</h3><p>Automatic · Stainless steel</p></div><strong>{product.price}</strong></div>
            </article>
          ))}
        </div>
      </section>

      <section id="feedback" className="feedback">
        <p className="eyebrow">CUSTOMER FEEDBACK</p>
        <blockquote>“The design feels premium without trying too hard. Exactly what I wanted.”</blockquote>
        <p>— Zeno customer</p>
      </section>
    </main>
  );
}
