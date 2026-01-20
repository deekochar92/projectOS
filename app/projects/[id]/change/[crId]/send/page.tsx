"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface ChangeRequest {
  id: string;
  status: string;
  client_token: string;
  reason: string;
}

export default function SendChangeRequestPage({
  params
}: {
  params: { id: string; crId: string };
}) {
  const [changeRequest, setChangeRequest] = useState<ChangeRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");

  useEffect(() => {
    const loadChangeRequest = async () => {
      const { data, error } = await supabase
        .from("change_requests")
        .select("id, status, client_token, reason")
        .eq("id", params.crId)
        .single();

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      setChangeRequest(data);
      setLink(`${window.location.origin}/approve/${data.client_token}`);

      if (data.status === "draft") {
        const { error: updateError } = await supabase
          .from("change_requests")
          .update({ status: "pending" })
          .eq("id", data.id);

        if (updateError) {
          setMessage(updateError.message);
        } else {
          setChangeRequest({ ...data, status: "pending" });
        }
      }

      setLoading(false);
    };

    loadChangeRequest();
  }, [params.crId]);

  const handleCopy = async () => {
    if (!link) {
      return;
    }
    await navigator.clipboard.writeText(link);
    setMessage("Link copied.");
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!changeRequest) {
    return <p>{message || "Change request not found."}</p>;
  }

  return (
    <div className="stack">
      <header>
        <h1>Send to Client</h1>
      </header>
      <div className="card">
        <p>
          Status: <span className="badge">{changeRequest.status}</span>
        </p>
        <p>{changeRequest.reason}</p>
        <label htmlFor="link">Approval link</label>
        <input id="link" value={link} readOnly />
        <button type="button" onClick={handleCopy}>
          Copy link
        </button>
        <a href={`/projects/${params.id}`}>Back to project</a>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
}
