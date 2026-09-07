import { useState, useEffect } from "react";
import { motion } from "framer-motion";

// ✅ BACKEND URL
const API = "https://ai-code-reviewer-rbas.onrender.com";

export default function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [repo, setRepo] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [displayText, setDisplayText] = useState("");
  const [loading, setLoading] = useState(false);

  // ✨ Typing effect
  useEffect(() => {
    let i = 0;
    setDisplayText("");
    if (answer) {
      const interval = setInterval(() => {
        setDisplayText(prev => prev + answer.charAt(i));
        i++;
        if (i >= answer.length) clearInterval(interval);
      }, 20);
      return () => clearInterval(interval);
    }
  }, [answer]);

  // 🔐 SIGNUP
  const signup = async () => {
    try {
      const res = await fetch(`${API}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      console.log("Signup response:", data);

      if (res.ok) {
        alert("User created ✅");
      } else {
        alert(data.detail || "Signup failed ❌");
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("Server not responding ❌");
    }
  };

  // 🔓 LOGIN
  const login = async () => {
    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      console.log("Login response:", data);

      if (res.ok) {
        alert("Login success ✅");
      } else {
        alert(data.detail || "Login failed ❌");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Server not responding ❌");
    }
  };

  // 📂 ANALYZE
  const analyze = async () => {
    try {
      setLoading(true);

      console.log("Sending repo:", repo); // 🔥 DEBUG

      const res = await fetch(`${API}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo_url: repo })
      });

      const data = await res.json();
      console.log("Analyze response:", data); // 🔥 DEBUG

      if (res.ok) {
        alert(`✅ ${data.name} ⭐ ${data.stars}\n${data.description}`);
      } else {
        alert(data.detail || "Analyze failed ❌");
      }

      setLoading(false);
    } catch (error) {
      console.error("Analyze error:", error);
      setLoading(false);
      alert("Server not responding ❌");
    }
  };

  // 🤖 ASK
  const ask = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: question })
      });

      const data = await res.json();
      console.log("Ask response:", data);

      if (res.ok) {
        setAnswer(data.answer);
      } else {
        alert(data.detail || "Ask failed ❌");
      }

      setLoading(false);
    } catch (error) {
      console.error("Ask error:", error);
      setLoading(false);
      alert("Server not responding ❌");
    }
  };

  return (
    <div style={styles.bg}>
      <motion.h1 style={styles.title}>
        🚀 AI Code Reviewer
      </motion.h1>

      <div style={styles.container}>

        {/* AUTH */}
        <div style={styles.card}>
          <h2>🔐 Auth</h2>
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => {
              console.log("Username:", e.target.value);
              setUsername(e.target.value);
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              console.log("Password:", e.target.value);
              setPassword(e.target.value);
            }}
          />
          <button onClick={signup}>Signup</button>
          <button onClick={login}>Login</button>
        </div>

        {/* ANALYZE */}
        <div style={styles.card}>
          <h2>📂 Analyze</h2>
          <input
            placeholder="https://github.com/user/repo"
            value={repo}
            onChange={(e) => {
              console.log("Input value:", e.target.value); // 🔥 DEBUG
              setRepo(e.target.value);
            }}
          />
          <button onClick={analyze}>Analyze Repo</button>
        </div>

        {/* ASK */}
        <div style={styles.card}>
          <h2>🤖 Ask AI</h2>
          <input
            placeholder="Ask something..."
            value={question}
            onChange={(e) => {
              console.log("Question:", e.target.value);
              setQuestion(e.target.value);
            }}
          />
          <button onClick={ask}>Ask</button>

          {loading && <p>Loading...</p>}

          {displayText && (
            <div style={styles.answer}>
              {displayText}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

const styles: any = {
  bg: {
    minHeight: "100vh",
    background: "#0f2027",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: "50px",
    color: "white"
  },
  title: {
    fontSize: "40px",
    marginBottom: "30px"
  },
  container: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
    justifyContent: "center"
  },
  card: {
    background: "#203a43",
    padding: "20px",
    borderRadius: "10px",
    width: "280px",
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  answer: {
    marginTop: "10px",
    background: "#000",
    padding: "10px",
    borderRadius: "5px"
  }
};