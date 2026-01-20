"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const generateToken = () => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
};

export default function NewChangeRequestPage({
  params
}: {
  params: { id: string };
}) {
  const [reason, setReason] = useState("");
  const [delta, setDelta] = useState("");
  const [delayDays, setDelayDays] = useState("0");
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

    const deltaCents = Math.round(Number(delta) * 100);
    const delay = Number.parseInt(delayDays, 10) || 0;

    const { data, error } = await supabase
      .from("change_requests")
      .insert({
        project_id: params.id,
        created_by: user.id,
        reason,
        delta_cents: deltaCents,
        delay_days: delay,
        status: "draft",
        client_token: generateToken()
      })
      .select("id")
      .single();

    if (error) {
      setMessage(error.message);
    } else {
      window.location.href = `/projects/${params.id}/change/${data.id}/send`;
    }

    setLoading(false);
  };

  return (
    <div className="stack">
      <header>
        <h1>New Change Request</h1>
      </header>
      <form className="card" onSubmit={handleSubmit}>
        <label htmlFor="reason">Why is this change needed?</label>
        <textarea
          id="reason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          rows={4}
          required
        />
        <label htmlFor="delta">Cost delta (€)</label>
        <input
          id="delta"
          type="number"
          step="0.01"
          value={delta}
          onChange={(event) => setDelta(event.target.value)}
          required
        />
        <label htmlFor="delay">Delay (days)</label>
        <input
          id="delay"
          type="number"
          min="0"
          value={delayDays}
          onChange={(event) => setDelayDays(event.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save draft"}
        </button>
        {message && <p>{message}</p>}
      </form>
    </div>
  );
}
