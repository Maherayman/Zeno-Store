const reviews = [
  { product: "Aurelius Classic", rating: 5, text: "Beautiful finish and comfortable on the wrist.", status: "Pending" },
  { product: "Noir Chronograph", rating: 4, text: "Looks premium and arrived quickly.", status: "Approved" }
];

export default function AdminReviewsPage() {
  return (
    <main className="adminPage">
      <header><p className="eyebrow">CUSTOMER FEEDBACK</p><h1>Reviews</h1><p>Moderate customer feedback before it appears publicly.</p></header>
      <div className="reviewList">
        {reviews.map((review, index) => <article key={index}><div><strong>{review.product}</strong><span>{"★".repeat(review.rating)}</span></div><p>{review.text}</p><small>{review.status}</small></article>)}
      </div>
    </main>
  );
}
