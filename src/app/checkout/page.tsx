export default function CheckoutPage() {
  return (
    <main className="checkoutPage">
      <div className="checkoutCard">
        <p className="eyebrow">SECURE CHECKOUT</p>
        <h1>Complete your order</h1>
        <form>
          <label>Full name<input required /></label>
          <label>Phone<input required /></label>
          <label>Address<input required /></label>
          <label>City<input required /></label>
          <label>Coupon code<input placeholder="Try NEW20" /></label>
          <button className="button" type="submit">Place order</button>
        </form>
      </div>
    </main>
  );
}
