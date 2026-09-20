export default function CartPage() {
  return (
    <main className="cartPage">
      <div className="cartCard">
        <p className="eyebrow">YOUR BAG</p>
        <h1>Cart</h1>
        <div className="emptyCart">
          <span>01</span>
          <div><h2>Your cart is ready.</h2><p>Add a watch from the collection and it will appear here.</p></div>
        </div>
        <a className="button" href="/shop">Continue shopping →</a>
      </div>
    </main>
  );
}
