import React, { useState } from "react";
import API from "./config";

export default function AddInteractionPage() {
  const [description, setDescription] = useState("");
  const [success, setSuccess] = useState(false);
  const [createdUuid, setCreatedUuid] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/interaction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
    });
    if (res.ok) {
      const data = await res.json();
      setDescription("");
      setSuccess(true);
      setCreatedUuid(data.uuid); // assuming backend returns uuid
    }
  };

  const handleCopy = () => {
    if (!createdUuid) return;
    const url = `${window.location.protocol}//${window.location.host}/${createdUuid}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 1500);
    });
  };

  return (
    <div>
      <h2>Add Interaction</h2>
      <form onSubmit={handleSubmit}>
        <input
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Interaction description"
          required
        />
        <button type="submit">Add Interaction</button>
      </form>
      {success && (
        <div style={{ color: "green", marginTop: 10 }}>
          Interaction added!<br />
          {createdUuid && (
            <span>
              UUID:{" "}
              <a
                href={`/${createdUuid}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#8ab4f8" }}
              >
                {`${window.location.protocol}//${window.location.host}/${createdUuid}`}
              </a>
              <button
                onClick={handleCopy}
                title="Copy link"
                style={{
                  marginLeft: 8,
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  color: "#8ab4f8",
                  fontSize: "1em",
                  verticalAlign: "middle"
                }}
                type="button"
              >
                📋
              </button>
              {copySuccess && (
                <span style={{ marginLeft: 6, color: "#8ab4f8" }}>Copied!</span>
              )}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
