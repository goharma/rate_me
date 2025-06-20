import React, { useState, useEffect } from "react";
import API from "./config";

export default function AddInteractionPage() {
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => {
    const now = new Date();
    now.setSeconds(0, 0);
    return now.toISOString().slice(0, 16);
  });
  const [success, setSuccess] = useState(false);
  const [createdUuid, setCreatedUuid] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [search, setSearch] = useState("");

  // New state for interactions list and pagination
  const [interactions, setInteractions] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [loading, setLoading] = useState(true);

  // Fetch all interactions
  const fetchInteractions = async () => {
    setLoading(true);
    let arr = [];
    for (let i = 1; i <= 100; ++i) {
      const res = await fetch(`${API}/interaction/${i}`);
      if (res.ok) {
        arr.push(await res.json());
      }
    }
    setInteractions(arr);
    setLoading(false);
  };

  useEffect(() => { fetchInteractions(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/interaction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description, date }),
    });
    if (res.ok) {
      const data = await res.json();
      setDescription("");
      setSuccess(true);
      setCreatedUuid(data.uuid);
      fetchInteractions();
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

  // Delete interaction
  const handleDelete = async (id) => {
    await fetch(`${API}/interaction/${id}`, { method: "DELETE" });
    fetchInteractions();
  };

  // Filter and paginate interactions
  const filteredInteractions = interactions
    .filter(inter => inter.description.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filteredInteractions.length / pageSize);
  const pagedInteractions = filteredInteractions
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice((page - 1) * pageSize, page * pageSize);

  // Helper for US Central time formatting
  const formatCentralTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      timeZone: "America/Chicago",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };

  return (
    <div>
      <h2>Interaction</h2>
      <div
        id="add-interaction"
        style={{
          border: "1.5px solid #444",
          borderRadius: 8,
          padding: 20,
          marginBottom: 24,
          background: "#23272a"
        }}
      >
        <form onSubmit={handleSubmit}>
          <div>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Interaction description"
              required
              rows={3}
              style={{
                width: "100%",
                maxWidth: 400,
                marginBottom: 8,
                resize: "vertical"
              }}
            />
          </div>
          <div>
            <input
              type="datetime-local"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
              style={{ marginBottom: 8 }}
            />
          </div>
          <div style={{ textAlign: "right" }}>
            <button type="submit">Add</button>
          </div>
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
                  {/* Modern copy icon: two overlapping squares */}
                  <svg width="18" height="18" viewBox="0 0 20 20" style={{ verticalAlign: "middle" }}>
                    <rect x="5" y="7" width="9" height="9" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/>
                    <rect x="8" y="4" width="9" height="9" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
                {copySuccess && (
                  <span style={{ marginLeft: 6, color: "#8ab4f8" }}>Copied!</span>
                )}
              </span>
            )}
          </div>
        )}
      </div>
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search by description"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{
            background: "#23272a",
            color: "#e8e6e3",
            border: "1px solid #444",
            borderRadius: 4,
            padding: "6px 10px",
            width: "100%",
            maxWidth: 320
          }}
        />
      </div>
      {totalPages > 1 && (
        <div style={{ marginBottom: 12, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            style={{ marginRight: 8 }}
          >
            Prev
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            style={{ marginLeft: 8 }}
          >
            Next
          </button>
        </div>
      )}
      <div>
        {pagedInteractions.map((inter, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={inter.id} style={{ marginBottom: 12, borderRadius: 6, background: "#23272a", border: "1px solid #444" }}>
              <div
                style={{
                  cursor: "pointer",
                  padding: "10px 20px",
                  fontWeight: "bold",
                  background: isOpen ? "#30363d" : "#23272a",
                  borderRadius: "6px 6px 0 0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  minHeight: 32
                }}
                onClick={() => setOpenIndex(isOpen ? null : idx)}
              >
                <span
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "block",
                    maxWidth: "calc(100% - 48px)",
                    flex: 1
                  }}
                  title={inter.description}
                >
                  {inter.description}
                </span>
                <span style={{ display: "flex", alignItems: "center", marginLeft: 12, flexShrink: 0 }}>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleDelete(inter.id);
                    }}
                    title="Delete interaction"
                    style={{
                      marginRight: 8,
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      color: "#e57373",
                      fontSize: "1.2em"
                    }}
                    type="button"
                  >
                    🗑️
                  </button>
                  {isOpen ? "▲" : "▼"}
                </span>
              </div>
              {isOpen && (
                <div style={{ padding: "10px 20px", borderTop: "1px solid #444" }}>
                  <div>
                    <b>UUID:</b> <code>{inter.uuid}</code>
                  </div>
                  <div>
                    <b>Date:</b> {formatCentralTime(inter.date)}
                  </div>
                  <div>
                    <b>ID:</b> {inter.id}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {totalPages > 1 && (
        <div style={{ marginTop: 20, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            style={{ marginRight: 8 }}
          >
            Prev
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            style={{ marginLeft: 8 }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
