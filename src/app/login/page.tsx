export default function LoginPage() {
  return (
    <main className="authPage">
      <div className="authCard">
        <p className="eyebrow">WELCOME BACK</p>
        <h1>Sign in</h1>
        <p>Access your Zeno Store account.</p>
        <form>
          <label>Email<input type="email" name="email" required /></label>
          <label>Password<input type="password" name="password" required /></label>
          <button type="submit">Sign in</button>
        </form>
        <small>Authentication will be connected to Auth.js in the next build stage.</small>
      </div>
    </main>
  );
}
