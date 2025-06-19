import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import RatePage from "./RatePage";
import AddInteractionPage from "./AddInteractionPage";
import ViewInteractionPage from "./ViewInteractionPage";
import ResultsPage from "./ResultsPage";

const API = "http://localhost:8000"; // Adjust API URL as needed

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
  return (
    <Router>
      <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
        <h1>Rate Me</h1>
        <nav style={{ marginBottom: 20 }}>
          <Link to="/" style={{ marginRight: 10 }}>Rate Interactions</Link>
          <Link to="/add" style={{ marginRight: 10 }}>Add Interaction</Link>
          <Link to="/results">Rating Results</Link>
        </nav>
        <Routes>
          <Route path="/" element={<RatePage />} />
          <Route path="/add" element={<AddInteractionPage />} />
          <Route path="/interaction/:uuid" element={<ViewInteractionPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/:uuid" element={<RatePage />} />
        </Routes>
      </div>
    </Router>
  );
}

