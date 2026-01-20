"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { formatMoney, formatSignedMoney } from "@/lib/format";

interface Project {
  id: string;
  name: string;
  client_name: string;
  client_email: string;
}

interface BudgetItem {
  id: string;
  name: string;
  approved_cost_cents: number;
}

interface ChangeRequest {
  id: string;
  reason: string;
  delta_cents: number;
  delay_days: number;
  status: string;
}

export default function ProjectDetailPage({
  params
}: {
  params: { id: string };
}) {
  const [project, setProject] = useState<Project | null>(null);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [budgetName, setBudgetName] = useState("");
  const [budgetCost, setBudgetCost] = useState("");

  const loadProject = async () => {
    setLoading(true);
    const { data: projectData, error: projectError } = await supabase
      .from("projects")
      .select("id, name, client_name, client_email")
      .eq("id", params.id)
      .single();

    if (projectError) {
      setError(projectError.message);
      setLoading(false);
      return;
    }

    setProject(projectData);

    const { data: budgetData } = await supabase
      .from("budget_items")
      .select("id, name, approved_cost_cents")
      .eq("project_id", params.id)
      .order("created_at", { ascending: false });

    const { data: changeData } = await supabase
      .from("change_requests")
      .select("id, reason, delta_cents, delay_days, status")
      .eq("project_id", params.id)
      .order("created_at", { ascending: false });

    setBudgetItems(budgetData ?? []);
    setChangeRequests(changeData ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadProject();
  }, [params.id]);

  const handleAddBudgetItem = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    const costCents = Math.round(Number(budgetCost) * 100);
    const { error: insertError } = await supabase.from("budget_items").insert({
      project_id: params.id,
      name: budgetName,
      approved_cost_cents: costCents
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      setBudgetName("");
      setBudgetCost("");
      loadProject();
    }
  };

  const baseBudget = useMemo(
    () => budgetItems.reduce((sum, item) => sum + item.approved_cost_cents, 0),
    [budgetItems]
  );

  const approvedChanges = useMemo(
    () =>
      changeRequests
        .filter((cr) => cr.status === "approved")
        .reduce((sum, cr) => sum + cr.delta_cents, 0),
    [changeRequests]
  );

  if (loading) {
    return <p>Loading project...</p>;
  }

  if (!project) {
    return <p>{error || "Project not found."}</p>;
  }

  return (
    <div className="stack">
      <header>
        <div>
          <h1>{project.name}</h1>
          <p>
            Client: {project.client_name} · {project.client_email}
          </p>
        </div>
        <div className="stack">
          <a href={`/projects/${params.id}/audit`}>Audit log</a>
          <a href="/projects">Back to projects</a>
        </div>
      </header>

      <section className="card">
        <h2>Approved Money Snapshot</h2>
        <p>Base approved budget: {formatMoney(baseBudget)}</p>
        <p>Approved changes: {formatMoney(approvedChanges)}</p>
        <p>
          <strong>
            Current approved total: {formatMoney(baseBudget + approvedChanges)}
          </strong>
        </p>
      </section>

      <section className="card">
        <h2>Approved Budget Items</h2>
        <form onSubmit={handleAddBudgetItem}>
          <label htmlFor="budgetName">Item name</label>
          <input
            id="budgetName"
            value={budgetName}
            onChange={(event) => setBudgetName(event.target.value)}
            required
          />
          <label htmlFor="budgetCost">Approved cost (€)</label>
          <input
            id="budgetCost"
            type="number"
            step="0.01"
            min="0"
            value={budgetCost}
            onChange={(event) => setBudgetCost(event.target.value)}
            required
          />
          <button type="submit">Add budget item</button>
        </form>
        {budgetItems.length === 0 ? (
          <p>No approved items yet.</p>
        ) : (
          <ul className="link-list">
            {budgetItems.map((item) => (
              <li key={item.id}>
                {item.name} · {formatMoney(item.approved_cost_cents)}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h2>Change Requests</h2>
          <a href={`/projects/${params.id}/change/new`}>+ New change</a>
        </div>
        {changeRequests.length === 0 ? (
          <p>No change requests yet.</p>
        ) : (
          <ul className="link-list">
            {changeRequests.map((cr) => (
              <li key={cr.id} className="card">
                <h3>{cr.reason}</h3>
                <p>Delta: {formatSignedMoney(cr.delta_cents)}</p>
                <p>Delay: {cr.delay_days} days</p>
                <p>
                  Status: <span className="badge">{cr.status}</span>
                </p>
                {cr.status === "draft" && (
                  <a href={`/projects/${params.id}/change/${cr.id}/send`}>
                    Send to client
                  </a>
                )}
                {cr.status !== "draft" && (
                  <a href={`/projects/${params.id}/change/${cr.id}/send`}>
                    View approval link
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
        {error && <p>{error}</p>}
      </section>
    </div>
  );
}
