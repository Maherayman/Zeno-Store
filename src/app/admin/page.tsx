const cards = [
  ["Orders", "0", "Manage incoming orders"],
  ["Products", "0", "Catalog & inventory"],
  ["Customers", "0", "Customer accounts"],
  ["Reviews", "0", "Moderation queue"]
];

export default function AdminPage() {
  return (
    <main className="adminPage">
      <header><p className="eyebrow">ZEN0 ADMIN</p><h1>Dashboard</h1><p>Store control center.</p></header>
      <section className="adminGrid">
        {cards.map(([title, value, text]) => <article key={title}><span>{title}</span><strong>{value}</strong><p>{text}</p></article>)}
      </section>
    </main>
  );
}
