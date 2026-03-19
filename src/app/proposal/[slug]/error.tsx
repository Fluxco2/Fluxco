"use client";

export default function ProposalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ padding: 40, fontFamily: "monospace", color: "#fff", background: "#0a0a0a", minHeight: "100vh" }}>
      <h2 style={{ color: "#e63946" }}>Proposal Error</h2>
      <p><strong>Message:</strong> {error.message}</p>
      <p><strong>Digest:</strong> {error.digest}</p>
      <pre style={{ whiteSpace: "pre-wrap", color: "#999", fontSize: 12 }}>{error.stack}</pre>
      <button
        onClick={reset}
        style={{ marginTop: 20, padding: "8px 16px", background: "#2d8cff", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}
      >
        Try Again
      </button>
    </div>
  );
}
