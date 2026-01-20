"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/projects`
      }
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Magic link sent. Check your email.");
    }

    setLoading(false);
  };

  return (
    <div className="stack">
      <header>
        <h1>Designer Login</h1>
      </header>
      <form className="card" onSubmit={handleLogin}>
        <label htmlFor="email">Work email</label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@studio.com"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send magic link"}
        </button>
        {message && <p>{message}</p>}
      </form>
    </div>
  );
}
