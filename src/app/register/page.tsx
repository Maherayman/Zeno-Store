"use client";

import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form))
    });
    const data = await response.json();
    setMessage(response.ok ? "Account created successfully." : data.error ?? "Something went wrong.");
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
          <button type="submit">Create account</button>
        </form>
        {message && <p className="formMessage">{message}</p>}
      </div>
    </main>
  );
}
