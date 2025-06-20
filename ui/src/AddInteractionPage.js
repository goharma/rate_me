import React, { useState, useEffect } from "react";
import API from "./config";

export default function AddInteractionPage() {
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => {
    // Default to now in US Central time, formatted for input[type="datetime-local"]
    const now = new Date();
    const central = new Date(now.toLocaleString("en-US", { timeZone: "America/Chicago" }));
    central.setSeconds(0, 0);
    const pad = n => n.toString().padStart(2, "0");
    const yyyy = central.getFullYear();
    const MM = pad(central.getMonth() + 1);
    const dd = pad(central.getDate());
    const hh = pad(central.getHours());
    const mm = pad(central.getMinutes());
    return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
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
  const [editingIdx, setEditingIdx] = useState(null);
  const [editValue, setEditValue] = useState("");

  // State to control the visibility of the add interaction section
  const [showAddInteraction, setShowAddInteraction] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [copiedPos, setCopiedPos] = useState({ x: 0, y: 0 });
  const [sortBy, setSortBy] = useState("date_desc");

  // Fetch all interactions
  const fetchInteractions = async () => {
    setLoading(true);
    let arr = [];
    // Fetch all interactions from the backend in one request
    const res = await fetch(`${API}/interactions`);
    if (res.ok) {
      arr = await res.json();
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

  // Sorting logic
  const sortedInteractions = [...filteredInteractions].sort((a, b) => {
    if (sortBy === "date_desc") {
      return new Date(b.date) - new Date(a.date);
    } else if (sortBy === "date_asc") {
      return new Date(a.date) - new Date(b.date);
    } else if (sortBy === "numratings_desc") {
      return (b.rates?.length || 0) - (a.rates?.length || 0);
    } else if (sortBy === "numratings_asc") {
      return (a.rates?.length || 0) - (b.rates?.length || 0);
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedInteractions.length / pageSize);
  const pagedInteractions = sortedInteractions.slice((page - 1) * pageSize, page * pageSize);

  // Helper for US Central time formatting
  const formatCentralTime = (dateStr) => {
    const utc = new Date(dateStr + "Z");
    return utc.toLocaleString("en-US", {
      timeZone: "America/Chicago",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    });
  };

  return (
    <div>
      <h2>Interaction</h2>
      {/* ...existing code for search and pagination above accordion... */}
      <div style={{
        marginBottom: 16,
        background: document.body.classList.contains("light-mode") ? "#f5f5f5" : undefined,
        borderRadius: 8,
        padding: 8
      }}>
        <input
          type="text"
          placeholder="Search by description"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{
            background: document.body.classList.contains("light-mode") ? "#f5f5f5" : "#23272a",
            color: document.body.classList.contains("light-mode") ? "#23272a" : "#e8e6e3",
            border: "1px solid #444",
            borderRadius: 4,
            padding: "6px 10px",
            width: "100%",
            maxWidth: 320
          }}
        />
        <br />
        <label htmlFor="sortBy" style={{ marginRight: 8, color: document.body.classList.contains("light-mode") ? "#23272a" : undefined }}>Sort By:</label>
        <select
          id="sortBy"
          value={sortBy}
          onChange={e => { setSortBy(e.target.value); setPage(1); }}
          style={{
            background: document.body.classList.contains("light-mode") ? "#f5f5f5" : "#23272a",
            color: document.body.classList.contains("light-mode") ? "#23272a" : "#e8e6e3",
            border: "1px solid #444",
            borderRadius: 4
          }}
        >
          <option value="date_desc">Date (Newest First)</option>
          <option value="date_asc">Date (Oldest First)</option>
          <option value="numratings_desc">Number of Ratings (Highest First)</option>
          <option value="numratings_asc">Number of Ratings (Lowest First)</option>
        </select>
      </div>
      <div>
        {pagedInteractions.map((inter, idx) => {
          const isOpen = openIndex === idx;
          const isEditing = editingIdx === idx;

          const handleEdit = async (e) => {
            e.stopPropagation();
            if (isEditing && editValue !== inter.description) {
              await fetch(`${API}/interaction/${inter.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ description: editValue })
              });
              fetchInteractions();
            }
            if (!isEditing) {
              setEditValue(inter.description);
              setEditingIdx(idx);
            } else {
              setEditingIdx(null);
            }
          };

          const handleEditKeyDown = async (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (isEditing && editValue !== inter.description) {
                await fetch(`${API}/interaction/${inter.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ description: editValue })
                });
                fetchInteractions();
              }
              setEditingIdx(null);
            }
          };

          let sortValue = "";
          let avg = inter.rates && inter.rates.length
            ? (inter.rates.reduce((a, b) => a + (b.rating || 0), 0) / inter.rates.length).toFixed(2)
            : null;
          if (sortBy === "numratings_desc" || sortBy === "numratings_asc") {
            sortValue = `${inter.rates?.length || 0} ratings`;
          } else if (sortBy === "date_desc" || sortBy === "date_asc") {
            sortValue = formatCentralTime(inter.date);
          } else if (sortBy === "rating_desc" || sortBy === "rating_asc") {
            sortValue = avg !== null ? `Avg: ${avg} / 5` : "No ratings";
          }

          return (
            <div key={inter.id} style={{ marginBottom: 12, borderRadius: 6, background: "#23272a", border: "1px solid #444" }}>
              <div
                className="accordion-summary"
                style={{
                  cursor: "pointer",
                  padding: "10px 20px",
                  fontWeight: "bold",
                  background: isOpen ? "#30363d" : "#23272a",
                  borderRadius: "6px 6px 0 0",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "center",
                  minHeight: 32,
                  position: "relative",
                  width: "100%",
                  boxSizing: "border-box",
                  overflow: "hidden"
                }}
                onClick={() => setOpenIndex(isOpen ? null : idx)}
              >
                <div style={{ display: "flex", width: "100%", alignItems: "center" }}>
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      display: "block",
                      flex: 1,
                      minWidth: 0
                    }}
                    title={inter.description}
                  >
                    {inter.description}
                  </span>
                  <span style={{ marginLeft: 12, flexShrink: 0 }}>{isOpen ? "▲" : "▼"}</span>
                </div>
                <span
                  style={{
                    fontWeight: 400,
                    fontSize: "0.95em",
                    color: "#8ab4f8",
                    marginTop: 2
                  }}
                >
                  ({sortValue}{avg && sortBy !== "rating_desc" && sortBy !== "rating_asc" ? `, Avg: ${avg} / 5` : ""})
                </span>
              </div>
              {isOpen && (
                <div style={{ padding: "10px 20px", borderTop: "1px solid #444" }}>
                  <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
                    <b>UUID:</b>{" "}
                    <a
                      href={`/${inter.uuid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#8ab4f8", marginLeft: 4 }}
                    >
                      {`${window.location.protocol}//${window.location.host}/${inter.uuid}`}
                    </a>
                    <button
                      onClick={e => {
                        navigator.clipboard.writeText(`${window.location.protocol}//${window.location.host}/${inter.uuid}`);
                        setCopiedIdx(idx);
                        setCopiedPos({ x: e.clientX, y: e.clientY });
                        setTimeout(() => setCopiedIdx(null), 1200);
                      }}
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
                    {copiedIdx === idx && (
                      <div
                        style={{
                          position: "fixed",
                          left: copiedPos.x + 12,
                          top: copiedPos.y - 24,
                          background: "#23272a",
                          color: "#8ab4f8",
                          padding: "6px 14px",
                          borderRadius: 6,
                          fontSize: "1em",
                          pointerEvents: "none",
                          zIndex: 9999,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.18)"
                        }}
                      >
                        Copied!
                      </div>
                    )}
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
      <div id="vspace" style={{ height: 10 }}></div>
      {!showAddInteraction ? (
        <div
          style={{
            border: "1.5px dashed #444",
            borderRadius: 8,
            padding: 20,
            marginBottom: 24,
            background: document.body.classList.contains("light-mode") ? "#f5f5f5" : "#23272a",
            color: document.body.classList.contains("light-mode") ? "#23272a" : "#e8e6e3",
            textAlign: "center",
            cursor: "pointer"
          }}
          onClick={() => setShowAddInteraction(true)}
        >
          Click to add interaction
        </div>
      ) : (
        <div
          id="add-interaction"
          style={{
            border: "1.5px solid #444",
            borderRadius: 8,
            padding: 20,
            marginBottom: 24,
            background: document.body.classList.contains("light-mode") ? "#f5f5f5" : "#23272a",
            position: "relative"
          }}
        >
          <span
            onClick={() => setShowAddInteraction(false)}
            style={{
              position: "absolute",
              top: 8,
              right: 16,
              color: "#8ab4f8",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: "1em"
            }}
            title="Hide"
          >
            Hide
          </span>
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
              <span style={{ fontSize: "0.9em", marginLeft: 8, color: "#888" }}>
                (US Central Time)
              </span>
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
      )}
    </div>
  );
}


