"use client";

import { useState } from "react";

export default function SyncButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSync = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch('/api/sync-suite', {
        method: 'GET',
      });
      const data = await response.json();
      if (data.success) {
        setMessage(data.message);
      } else {
        setMessage("Fehler: " + data.error);
      }
    } catch (err: any) {
      setMessage("Unerwarteter Fehler: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "1rem" }}>
      <button
        onClick={handleSync}
        disabled={loading}
        style={{
          backgroundColor: loading ? "#718096" : "#cd1719",
          color: "white",
          border: "none",
          padding: "0.5rem 1rem",
          fontWeight: 600,
          borderRadius: "0.25rem",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Synchronisiere..." : "Jetzt mit Suite synchronisieren"}
      </button>
      {message && (
        <div style={{ marginTop: "1rem", fontSize: "0.9rem", color: message.includes("Fehler") ? "#e53e3e" : "#38a169", fontWeight: "bold" }}>
          {message}
        </div>
      )}
    </div>
  );
}
