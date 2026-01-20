"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  created_at: string;
  meta: Record<string, string | number> | null;
}

export default function AuditLogPage({
  params
}: {
  params: { id: string };
}) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadLogs = async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("id, action, entity_type, created_at, meta")
        .eq("project_id", params.id)
        .order("created_at", { ascending: false });

      if (error) {
        setMessage(error.message);
      } else {
        setLogs(data ?? []);
      }
      setLoading(false);
    };

    loadLogs();
  }, [params.id]);

  return (
    <div className="stack">
      <header>
        <h1>Audit Log</h1>
      </header>
      <div className="card">
        <a href={`/projects/${params.id}`}>Back to project</a>
      </div>
      {loading && <p>Loading audit log...</p>}
      {message && <p>{message}</p>}
      {logs.length === 0 && !loading ? (
        <p>No audit entries yet.</p>
      ) : (
        <ul className="link-list">
          {logs.map((log) => (
            <li key={log.id} className="card">
              <p>
                <strong>{log.action}</strong> · {log.entity_type}
              </p>
              <p>{new Date(log.created_at).toLocaleString()}</p>
              {log.meta && (
                <pre>{JSON.stringify(log.meta, null, 2)}</pre>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
