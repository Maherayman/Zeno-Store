"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form))
    });
    const data = await response.json();
    setLoading(false);
    if (response.ok) { router.push("/login?registered=1"); return; }
    setMessage(data.error ?? "Something went wrong.");
  }

  return (
    <main className="authPage">
      <div className="authCard">
        <p className="eyebrow">JOIN ZENO</p>
        <h1>Create account</h1>
        <p>Save your orders, wishlist and reviews.</p>
        <form onSubmit={submit}>
          <label>Name<input name="name" required /></label>
          <label>Email<input name="email" type="email" required /></label>
          <label>Phone<input name="phone" /></label>
          <label>Password<input name="password" type="password" minLength={8} required /></label>
          <button type="submit" disabled={loading}>{loading ? "Creating account..." : "Create account"}</button>
        </form>
        {message && <p className="formMessage">{message}</p>}
      </div>
    </main>
  );
}
