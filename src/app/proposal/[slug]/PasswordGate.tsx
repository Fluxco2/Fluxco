"use client";

import { useState } from "react";
import { Zap, Lock, ArrowRight } from "lucide-react";

export function PasswordGate({ slug }: { slug: string }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/proposal/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, password }),
      });

      if (res.ok) {
        // Cookie is set by the API — reload to access the proposal
        window.location.reload();
      } else {
        const data = await res.json();
        setError(data.error || "Invalid password");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="pg-container">
        <div className="pg-glow pg-glow-1" />
        <div className="pg-glow pg-glow-2" />
        <div className="pg-card">
          <div className="pg-logo">
            <div className="pg-logo-icon">
              <Zap className="w-6 h-6" />
            </div>
            <span>FLUXCO</span>
          </div>
          <div className="pg-lock">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="pg-title">Protected Proposal</h1>
          <p className="pg-subtitle">
            Enter the access code to view this proposal.
          </p>
          <form onSubmit={handleSubmit} className="pg-form">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Access code"
              className="pg-input"
              autoFocus
            />
            {error && <p className="pg-error">{error}</p>}
            <button type="submit" disabled={loading} className="pg-btn">
              {loading ? "Verifying…" : "View Proposal"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

const styles = `
  :root {
    --pg-blue: #2d8cff;
    --pg-bg: #08090a;
    --pg-surface: rgba(255,255,255,0.04);
    --pg-border: rgba(255,255,255,0.08);
    --pg-text: rgba(255,255,255,0.7);
    --pg-text-dim: rgba(255,255,255,0.4);
  }

  *, *::before, *::after { box-sizing: border-box; }
  html, body { background: var(--pg-bg) !important; margin: 0; padding: 0; }

  .pg-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    font-family: 'Inter', -apple-system, sans-serif;
  }

  .pg-glow {
    position: absolute;
    border-radius: 50%;
    filter: blur(120px);
    pointer-events: none;
  }
  .pg-glow-1 { width: 500px; height: 500px; top: -100px; right: -100px; background: rgba(45,140,255,0.08); }
  .pg-glow-2 { width: 400px; height: 400px; bottom: -50px; left: 10%; background: rgba(230,57,70,0.05); }

  .pg-card {
    position: relative;
    z-index: 1;
    background: var(--pg-surface);
    border: 1px solid var(--pg-border);
    border-radius: 16px;
    padding: 48px;
    max-width: 400px;
    width: 100%;
    text-align: center;
    backdrop-filter: blur(20px);
  }

  .pg-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    font-family: 'Oswald', sans-serif;
    font-weight: 700;
    font-size: 20px;
    color: #fff;
    letter-spacing: 3px;
    text-transform: uppercase;
    margin-bottom: 32px;
  }
  .pg-logo-icon {
    width: 36px; height: 36px;
    border-radius: 8px;
    background: linear-gradient(135deg, var(--pg-blue), rgba(45,140,255,0.3));
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
  }

  .pg-lock {
    color: var(--pg-text-dim);
    margin-bottom: 16px;
    display: flex;
    justify-content: center;
  }

  .pg-title {
    font-family: 'Inter', sans-serif;
    font-size: 22px;
    font-weight: 600;
    color: #fff;
    margin: 0 0 8px 0;
  }

  .pg-subtitle {
    font-size: 14px;
    color: var(--pg-text-dim);
    margin: 0 0 32px 0;
    line-height: 1.5;
  }

  .pg-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .pg-input {
    width: 100%;
    padding: 12px 16px;
    border-radius: 10px;
    border: 1px solid var(--pg-border);
    background: rgba(255,255,255,0.03);
    color: #fff;
    font-size: 15px;
    font-family: 'Inter', sans-serif;
    outline: none;
    transition: border-color 0.2s;
  }
  .pg-input:focus {
    border-color: var(--pg-blue);
    box-shadow: 0 0 0 3px rgba(45,140,255,0.1);
  }
  .pg-input::placeholder {
    color: var(--pg-text-dim);
  }

  .pg-error {
    color: #e63946;
    font-size: 13px;
    margin: 0;
  }

  .pg-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 12px;
    border-radius: 10px;
    border: none;
    background: var(--pg-blue);
    color: #fff;
    font-size: 15px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    transition: opacity 0.2s;
  }
  .pg-btn:hover { opacity: 0.9; }
  .pg-btn:disabled { opacity: 0.5; cursor: not-allowed; }
`;
