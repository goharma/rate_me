import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import RatePage from "./RatePage";
import AddInteractionPage from "./AddInteractionPage";
import ViewInteractionPage from "./ViewInteractionPage";
import ResultsPage from "./ResultsPage";
import API from "./config";

function AddInteraction({ onAdd }) {
  const [description, setDescription] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch(`${API}/interaction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
    });
    setDescription("");
    onAdd();
  };
  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
      <input
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Interaction description"
        required
      />
      <button type="submit">Add Interaction</button>
    </form>
  );
}

function RateInteraction({ interactionId, onRated }) {
  const [comment, setComment] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch(`${API}/rate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interaction_id: interactionId, comment }),
    });
    setComment("");
    onRated();
  };
  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 8 }}>
      <input
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Leave a comment"
      />
      <button type="submit">Rate</button>
    </form>
  );
}

function InteractionsList() {
  const [interactions, setInteractions] = useState([]);
  const fetchInteractions = async () => {
    // For demo, fetch first 20 interactions (no pagination in backend)
    let arr = [];
    for (let i = 1; i <= 20; ++i) {
      const res = await fetch(`${API}/interaction/${i}`);
      if (res.ok) {
        arr.push(await res.json());
      }
    }
    setInteractions(arr);
  };
  useEffect(() => { fetchInteractions(); }, []);
  return (
    <div>
      <h2>Interactions</h2>
      <AddInteraction onAdd={fetchInteractions} />
      <ul>
        {interactions.map(inter => (
          <li key={inter.id} style={{ marginBottom: 16 }}>
            <b>{inter.description}</b> <i>({new Date(inter.date).toLocaleString()})</i>
            <RateInteraction interactionId={inter.id} onRated={fetchInteractions} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <h1>Rate Me</h1>
      <nav
        style={{
          marginBottom: 24,
          display: "flex",
          gap: 16,
          background: "rgba(35,39,42,0.95)",
          borderRadius: 12,
          boxShadow: "0 2px 12px 0 rgba(0,0,0,0.15)",
          padding: "12px 24px",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 500,
          fontSize: "1.1em",
          position: "relative",
          zIndex: 2
        }}
      >
        <Link
          to="/"
          style={{
            color: "#8ab4f8",
            textDecoration: "none",
            padding: "8px 18px",
            borderRadius: 8,
            transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
            background: location.pathname === "/" ? "#23272a" : "transparent",
            boxShadow: location.pathname === "/" ? "0 2px 8px 0 rgba(138,180,248,0.08)" : "none",
            fontWeight: location.pathname === "/" ? 700 : 500,
            border: location.pathname === "/" ? "2px solid #8ab4f8" : "2px solid transparent"
          }}
        >
          Rate Interactions
        </Link>
        <Link
          to="/add"
          style={{
            color: "#8ab4f8",
            textDecoration: "none",
            padding: "8px 18px",
            borderRadius: 8,
            transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
            background: location.pathname === "/add" ? "#23272a" : "transparent",
            boxShadow: location.pathname === "/add" ? "0 2px 8px 0 rgba(138,180,248,0.08)" : "none",
            fontWeight: location.pathname === "/add" ? 700 : 500,
            border: location.pathname === "/add" ? "2px solid #8ab4f8" : "2px solid transparent"
          }}
        >
          Interactions
        </Link>
        <Link
          to="/results"
          style={{
            color: "#8ab4f8",
            textDecoration: "none",
            padding: "8px 18px",
            borderRadius: 8,
            transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
            background: location.pathname === "/results" ? "#23272a" : "transparent",
            boxShadow: location.pathname === "/results" ? "0 2px 8px 0 rgba(138,180,248,0.08)" : "none",
            fontWeight: location.pathname === "/results" ? 700 : 500,
            border: location.pathname === "/results" ? "2px solid #8ab4f8" : "2px solid transparent"
          }}
        >
          Results
        </Link>
      </nav>
      <Routes>
        <Route path="/" element={<RatePage />} />
        <Route path="/add" element={<AddInteractionPage />} />
        <Route path="/interaction/:uuid" element={<ViewInteractionPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/:uuid" element={<RatePage />} />
      </Routes>
    </div>
  );
}


