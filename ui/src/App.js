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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "light"
      ? false
      : true;
  });

  React.useEffect(() => {
    if (darkMode) {
      document.body.classList.remove("light-mode");
      document.body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-mode");
      document.body.classList.add("light-mode");
      localStorage.setItem("theme", "light");
    }
    // Force update to re-render menu with correct colors
    // eslint-disable-next-line
    setForceUpdate(v => v + 1);
  }, [darkMode]);

  // Add this state to force re-render
  const [forceUpdate, setForceUpdate] = useState(0);

  // Hide menu if URL contains a uuid (simple check for /xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
  const hideMenu = /\/[0-9a-fA-F\-]{36}/.test(location.pathname);

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <h1 style={{ margin: 0 }}>Rate Me</h1>
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setSettingsOpen(v => !v)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 24,
              color: "#8ab4f8",
              padding: 4
            }}
            title="Settings"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 8a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09A1.65 1.65 0 0 0 16 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 8c.14.31.22.65.22 1v.09A1.65 1.65 0 0 0 21 12c0 .35-.08.69-.22 1v.09A1.65 1.65 0 0 0 19.4 15z" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
          </button>
          {settingsOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 36,
                background: darkMode ? "#23272a" : "#fff",
                color: darkMode ? "#e8e6e3" : "#23272a",
                border: "1px solid #444",
                borderRadius: 8,
                boxShadow: "0 2px 12px 0 rgba(0,0,0,0.15)",
                padding: "16px 24px",
                zIndex: 10,
                minWidth: 180
              }}
            >
              <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={() => setDarkMode(v => !v)}
                  style={{ marginRight: 8 }}
                />
                Dark / Light mode
              </label>
            </div>
          )}
        </div>
      </div>
      {!hideMenu && (
        <nav
          style={{
            marginBottom: 24,
            display: "flex",
            gap: 16,
            background: document.body.classList.contains("light-mode") ? "#f5f5f5" : "rgba(35,39,42,0.95)",
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
            className={location.pathname === "/" ? "menu-link-active" : ""}
            style={{
              color: document.body.classList.contains("light-mode") ? "#1976d2" : "#8ab4f8",
              textDecoration: "none",
              padding: "8px 18px",
              borderRadius: 8,
              transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
              background: location.pathname === "/" 
                ? (document.body.classList.contains("light-mode") ? "#e3e8ef" : "#23272a")
                : "transparent",
              boxShadow: location.pathname === "/" ? "0 2px 8px 0 rgba(138,180,248,0.08)" : "none",
              fontWeight: location.pathname === "/" ? 700 : 500,
              border: location.pathname === "/" 
                ? (document.body.classList.contains("light-mode") ? "2px solid #1976d2" : "2px solid #8ab4f8")
                : "2px solid transparent"
            }}
          >
            Rate Interactions
          </Link>
          <Link
            to="/add"
            className={location.pathname === "/add" ? "menu-link-active" : ""}
            style={{
              color: document.body.classList.contains("light-mode") ? "#1976d2" : "#8ab4f8",
              textDecoration: "none",
              padding: "8px 18px",
              borderRadius: 8,
              transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
              background: location.pathname === "/add" 
                ? (document.body.classList.contains("light-mode") ? "#e3e8ef" : "#23272a")
                : "transparent",
              boxShadow: location.pathname === "/add" ? "0 2px 8px 0 rgba(138,180,248,0.08)" : "none",
              fontWeight: location.pathname === "/add" ? 700 : 500,
              border: location.pathname === "/add" 
                ? (document.body.classList.contains("light-mode") ? "2px solid #1976d2" : "2px solid #8ab4f8")
                : "2px solid transparent"
            }}
          >
            Interactions
          </Link>
          <Link
            to="/results"
            className={location.pathname === "/results" ? "menu-link-active" : ""}
            style={{
              color: document.body.classList.contains("light-mode") ? "#1976d2" : "#8ab4f8",
              textDecoration: "none",
              padding: "8px 18px",
              borderRadius: 8,
              transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
              background: location.pathname === "/results" 
                ? (document.body.classList.contains("light-mode") ? "#e3e8ef" : "#23272a")
                : "transparent",
              boxShadow: location.pathname === "/results" ? "0 2px 8px 0 rgba(138,180,248,0.08)" : "none",
              fontWeight: location.pathname === "/results" ? 700 : 500,
              border: location.pathname === "/results" 
                ? (document.body.classList.contains("light-mode") ? "2px solid #1976d2" : "2px solid #8ab4f8")
                : "2px solid transparent"
            }}
          >
            Results
          </Link>
        </nav>
      )}
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


