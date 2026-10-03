import { useState } from "react";
import type { FormEvent } from "react";
import "./App.css";

// Backend URL (FastAPI on Render). Override with VITE_API_URL in Vercel if it changes.
const API: string =
  (import.meta as any).env?.VITE_API_URL || "https://ai-code-reviewer-rbas.onrender.com";

type Repo = { name: string; description: string | null; stars: number };
type Notice = { kind: "ok" | "error"; text: string } | null;

async function post(path: string, body: unknown) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  let data: any = {};
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }
  if (!res.ok) throw new Error(data.detail || `Request failed (${res.status})`);
  return data;
}

const EXAMPLES = [
  "What does this project do?",
  "Which tech stack does it use?",
  "How do I run it locally?",
];

export default function App() {
  // auth
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<string | null>(null);
  const [authNote, setAuthNote] = useState<Notice>(null);

  // repo + Q&A
  const [repoUrl, setRepoUrl] = useState("");
  const [repo, setRepo] = useState<Repo | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [note, setNote] = useState<Notice>(null);
  const [busy, setBusy] = useState<"" | "auth" | "analyze" | "ask">("");

  const submitAuth = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setAuthNote({ kind: "error", text: "Enter a username and password." });
      return;
    }
    setBusy("auth");
    setAuthNote(null);
    try {
      await post(mode === "login" ? "/login" : "/signup", { username, password });
      if (mode === "signup") {
        setAuthNote({ kind: "ok", text: "Account created. You can sign in now." });
        setMode("login");
      } else {
        setUser(username.trim());
        setPassword("");
      }
    } catch (err: any) {
      setAuthNote({ kind: "error", text: friendly(err) });
    } finally {
      setBusy("");
    }
  };

  const analyze = async (e: FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;
    setBusy("analyze");
    setNote(null);
    setAnswer("");
    try {
      const data = await post("/analyze", { repo_url: repoUrl.trim() });
      setRepo({ name: data.name, description: data.description, stars: data.stars });
    } catch (err: any) {
      setRepo(null);
      setNote({ kind: "error", text: friendly(err) });
    } finally {
      setBusy("");
    }
  };

  const ask = async (q: string) => {
    if (!q.trim()) return;
    setQuestion(q);
    setBusy("ask");
    setNote(null);
    try {
      const data = await post("/ask", { q });
      setAnswer(String(data.answer || "").trim());
    } catch (err: any) {
      setNote({ kind: "error", text: friendly(err) });
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="page">
      <header className="top">
        <div className="brand">
          <span className="logo" aria-hidden>
            {"</>"}
          </span>
          <span>AI Code Reviewer</span>
        </div>
        {user ? (
          <div className="who">
            <span className="avatar">{user[0]?.toUpperCase()}</span>
            <span>{user}</span>
            <button className="link" onClick={() => setUser(null)}>
              Sign out
            </button>
          </div>
        ) : (
          <a className="link" href="https://github.com/Praneethchowdary07/AI-Code-Reviewer" target="_blank" rel="noreferrer">
            Source on GitHub
          </a>
        )}
      </header>

      <main className="main">
        <section className="intro">
          <h1>Understand any GitHub repository</h1>
          <p>Paste a public repository link to see its details, then ask questions about it.</p>
        </section>

        {!user ? (
          <section className="card narrow">
            <div className="tabs" role="tablist">
              <button className={mode === "login" ? "tab active" : "tab"} onClick={() => { setMode("login"); setAuthNote(null); }}>
                Sign in
              </button>
              <button className={mode === "signup" ? "tab active" : "tab"} onClick={() => { setMode("signup"); setAuthNote(null); }}>
                Create account
              </button>
            </div>
            <form onSubmit={submitAuth} className="stack">
              <label>
                Username
                <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
              </label>
              <button className="primary" disabled={busy === "auth"}>
                {busy === "auth" ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
              </button>
              {authNote && <p className={`notice ${authNote.kind}`}>{authNote.text}</p>}
              <p className="hint">The free server may take up to a minute to wake up on the first request.</p>
            </form>
          </section>
        ) : (
          <>
            <section className="card">
              <form onSubmit={analyze} className="row">
                <input
                  className="grow"
                  placeholder="https://github.com/owner/repository"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                />
                <button className="primary" disabled={busy === "analyze" || !repoUrl.trim()}>
                  {busy === "analyze" ? "Analyzing…" : "Analyze"}
                </button>
              </form>

              {repo && (
                <div className="repo">
                  <div className="repo-head">
                    <h2>{repo.name}</h2>
                    <span className="pill">★ {repo.stars ?? 0}</span>
                  </div>
                  <p className="muted">{repo.description || "No description provided."}</p>
                </div>
              )}
            </section>

            {repo && (
              <section className="card">
                <h3>Ask about {repo.name}</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    ask(question);
                  }}
                  className="row"
                >
                  <input
                    className="grow"
                    placeholder="Ask a question about this repository"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                  />
                  <button className="primary" disabled={busy === "ask" || !question.trim()}>
                    {busy === "ask" ? "Thinking…" : "Ask"}
                  </button>
                </form>
                <div className="chips">
                  {EXAMPLES.map((q) => (
                    <button key={q} className="chip" onClick={() => ask(q)} disabled={busy === "ask"}>
                      {q}
                    </button>
                  ))}
                </div>
                {answer && <pre className="answer">{answer}</pre>}
              </section>
            )}

            {note && <p className={`notice ${note.kind}`}>{note.text}</p>}
          </>
        )}
      </main>

      <footer className="foot">
        React · FastAPI · GitHub REST API — built by Korrapati Praneeth Chowdary
      </footer>
    </div>
  );
}

function friendly(err: any): string {
  const msg = String(err?.message || err);
  if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
    return "Can't reach the server. It may be waking up — try again in a few seconds.";
  }
  return msg;
}
