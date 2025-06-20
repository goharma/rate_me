import React, { useEffect, useState } from "react";
import API from "./config";

export default function ResultsPage() {
  const [interactions, setInteractions] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);
  const [copyIdx, setCopyIdx] = useState(null);
  const [sortBy, setSortBy] = useState("date_desc");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const pageSize = 5;

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

  // Calculate overall average rating
  const allRatings = interactions.flatMap(inter => inter.rates.map(rate => rate.rating));
  const overallAvg = allRatings.length
    ? (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(2)
    : null;

  const handleCopy = (uuid, idx) => {
    const url = `${window.location.protocol}//${window.location.host}/${uuid}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopyIdx(idx);
      setTimeout(() => setCopyIdx(null), 1200);
    });
  };

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

  // Filter interactions by description or any rating comment
  const filteredInteractions = interactions.filter(inter => {
    const descMatch = inter.description.toLowerCase().includes(search.toLowerCase());
    const commentMatch = inter.rates.some(rate =>
      rate.comment && rate.comment.toLowerCase().includes(search.toLowerCase())
    );
    return descMatch || commentMatch;
  });

  // Sort interactions based on sortBy
  const sortedInteractions = [...filteredInteractions].sort((a, b) => {
    const avgA = a.rates.length ? a.rates.reduce((x, y) => x + y.rating, 0) / a.rates.length : 0;
    const avgB = b.rates.length ? b.rates.reduce((x, y) => x + y.rating, 0) / b.rates.length : 0;
    if (sortBy === "rating_desc") {
      return avgB - avgA;
    } else if (sortBy === "rating_asc") {
      return avgA - avgB;
    } else if (sortBy === "numratings_desc") {
      return b.rates.length - a.rates.length;
    } else if (sortBy === "numratings_asc") {
      return a.rates.length - b.rates.length;
    } else if (sortBy === "date_asc") {
      return new Date(a.date) - new Date(b.date);
    } else { // "date_desc"
      return new Date(b.date) - new Date(a.date);
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedInteractions.length / pageSize);
  const pagedInteractions = sortedInteractions.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <h2 style={{ fontSize: "1.5em", fontWeight: 700, margin: "16px 0" }}>
      {overallAvg && (
        <div>
          Overall Average Rating: {overallAvg} / 5
        </div>
      )}        
      </h2>

      <div style={{
        marginBottom: 16,
        background: document.body.classList.contains("light-mode") ? "#f5f5f5" : undefined,
        borderRadius: 8,
        padding: 8
      }}>
        <input
          type="text"
          placeholder="Search by description or comment"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{
            background: document.body.classList.contains("light-mode") ? "#f5f5f5" : "#23272a",
            color: document.body.classList.contains("light-mode") ? "#23272a" : "#e8e6e3",
            border: "1px solid #444",
            borderRadius: 4,
            padding: "6px 10px",
            width: "100%",
            maxWidth: 320,
            marginBottom: 8
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
          <option value="rating_desc">Average Rating (Highest First)</option>
          <option value="rating_asc">Average Rating (Lowest First)</option>
          <option value="numratings_desc">Number of Ratings (Highest First)</option>
          <option value="numratings_asc">Number of Ratings (Lowest First)</option>
          <option value="date_desc">Date (Newest First)</option>
          <option value="date_asc">Date (Oldest First)</option>
        </select>
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
          const ratings = inter.rates.map(rate => rate.rating);
          const avg = ratings.length
            ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2)
            : null;
          const isOpen = openIndex === idx;
          let sortValue = "";
          if (sortBy === "rating_desc" || sortBy === "rating_asc") {
            sortValue = avg !== null ? avg : "N/A";
          } else if (sortBy === "numratings_desc" || sortBy === "numratings_asc") {
            sortValue = inter.rates.length;
          } else if (sortBy === "date_desc" || sortBy === "date_asc") {
            sortValue = formatCentralTime(inter.date);
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
                  ({sortValue})
                </span>
              </div>
              {isOpen && (
                <div className="accordion-content" style={{ padding: "10px 20px", borderTop: "1px solid #444" }}>
                  <ul>
                    {inter.rates.length === 0 && <li><i>No ratings yet</i></li>}
                    {inter.rates.map(rate => (
                      <li key={rate.id}>
                        <b>Rating:</b> {rate.rating} {rate.comment ? `- ${rate.comment}` : <i>No comment</i>}
                      </li>
                    ))}
                  </ul>
                  <div style={{ marginTop: 4, fontStyle: "italic" }}>
                    {avg ? `Average Rating: ${avg} / 5` : "No ratings yet"}
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

