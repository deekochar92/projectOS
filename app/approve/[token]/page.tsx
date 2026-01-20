"use client";

import { useEffect, useState } from "react";
import { formatSignedMoney } from "@/lib/format";

interface PublicChangeRequest {
  id: string;
  status: string;
  reason: string;
  delta_cents: number;
  delay_days: number;
  project_name: string;
  client_name: string;
}

export default function ApprovePage({
  params
}: {
  params: { token: string };
}) {
  const [changeRequest, setChangeRequest] = useState<PublicChangeRequest | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadChangeRequest = async () => {
    setLoading(true);
    const response = await fetch(
      `/api/public/change-request?token=${params.token}`
    );

    if (!response.ok) {
      setMessage("We couldn't find this change request.");
      setLoading(false);
      return;
    }

    const data = await response.json();
    setChangeRequest(data);
    setLoading(false);
  };

  useEffect(() => {
    loadChangeRequest();
  }, [params.token]);

  const handleAction = async (action: "approved" | "rejected") => {
    setMessage("");
    const response = await fetch("/api/public/approve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ token: params.token, action })
    });

    if (!response.ok) {
      const data = await response.json();
      setMessage(data.message || "Unable to update.");
      return;
    }

    await loadChangeRequest();
    setMessage(
      action === "approved"
        ? "Approved. We'll get to work."
        : "Rejected. The designer has been notified."
    );
  };

  if (loading) {
    return <p>Loading change request...</p>;
  }

  if (!changeRequest) {
    return <p>{message}</p>;
  }

  return (
    <div className="stack">
      <header>
        <h1>Change Approval</h1>
      </header>
      <div className="card">
        <h2>{changeRequest.project_name}</h2>
        <p>Client: {changeRequest.client_name}</p>
        <p>{changeRequest.reason}</p>
        <p>Cost impact: {formatSignedMoney(changeRequest.delta_cents)}</p>
        <p>Delay: {changeRequest.delay_days} days</p>
        <p>
          Status: <span className="badge">{changeRequest.status}</span>
        </p>
        {changeRequest.status === "pending" ? (
          <div className="stack">
            <button onClick={() => handleAction("approved")}>Approve</button>
            <button
              className="secondary"
              onClick={() => handleAction("rejected")}
            >
              Reject
            </button>
          </div>
        ) : (
          <p>This change request is already finalized.</p>
        )}
        {message && <p>{message}</p>}
      </div>
    </div>
  );
}
