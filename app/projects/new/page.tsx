"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function NewProjectPage() {
  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) {
      setMessage("Please log in first.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("projects")
      .insert({
        name,
        client_name: clientName,
        client_email: clientEmail,
        owner_id: user.id
      })
      .select("id")
      .single();

    if (error) {
      setMessage(error.message);
    } else {
      window.location.href = `/projects/${data.id}`;
    }
    setLoading(false);
  };

  return (
    <div className="stack">
      <header>
        <h1>New Project</h1>
      </header>
      <form className="card" onSubmit={handleSubmit}>
        <label htmlFor="name">Project name</label>
        <input
          id="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
        <label htmlFor="clientName">Client name</label>
        <input
          id="clientName"
          value={clientName}
          onChange={(event) => setClientName(event.target.value)}
          required
        />
        <label htmlFor="clientEmail">Client email</label>
        <input
          id="clientEmail"
          type="email"
          value={clientEmail}
          onChange={(event) => setClientEmail(event.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Create project"}
        </button>
        {message && <p>{message}</p>}
      </form>
    </div>
  );
}
