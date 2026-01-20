"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Project {
  id: string;
  name: string;
  client_name: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        setLoading(false);
        setError("Please log in first.");
        return;
      }
      setUserEmail(sessionData.session.user.email ?? null);

      const { data, error: projectError } = await supabase
        .from("projects")
        .select("id, name, client_name")
        .order("created_at", { ascending: false });

      if (projectError) {
        setError(projectError.message);
      } else {
        setProjects(data ?? []);
      }
      setLoading(false);
    };

    loadProjects();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="stack">
      <header>
        <div>
          <h1>Your Projects</h1>
          {userEmail && <p>{userEmail}</p>}
        </div>
        <button className="secondary" onClick={handleLogout}>
          Log out
        </button>
      </header>
      <div className="card">
        <a href="/projects/new">+ New project</a>
      </div>
      {loading && <p>Loading projects...</p>}
      {error && <p>{error}</p>}
      <ul className="link-list">
        {projects.map((project) => (
          <li key={project.id} className="card">
            <h3>{project.name}</h3>
            <p>Client: {project.client_name}</p>
            <a href={`/projects/${project.id}`}>Open project</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
