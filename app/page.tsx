export default function HomePage() {
  return (
    <div className="stack">
      <header>
        <h1>Project OS</h1>
      </header>
      <div className="card">
        <h2>Execution-first change approvals.</h2>
        <p>
          Create change requests, send a magic approval link, and keep an
          immutable audit trail.
        </p>
        <div className="stack">
          <a href="/login">Designer login</a>
          <a href="/projects">Go to projects</a>
        </div>
      </div>
    </div>
  );
}
