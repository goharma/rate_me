import React, { useState } from "react";

const API = "http://localhost:8000";

export default function AddInteractionPage() {
  const [description, setDescription] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/interaction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
    });
    if (res.ok) {
      setDescription("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    }
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
      {success && <div style={{ color: "green", marginTop: 10 }}>Interaction added!</div>}
    </div>
  );
}
