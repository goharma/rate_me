import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function StarRating({ value, onChange }) {
  return (
    <span>
      {[1,2,3,4,5].map(n => (
        <span
          key={n}
          style={{
            cursor: "pointer",
            color: n <= value ? "#FFD700" : "#444",
            fontSize: "1.5em",
            marginRight: 2
          }}
          onClick={() => onChange(n)}
        >★</span>
      ))}
    </span>
  );
}

function RateInteraction({ interactionId, onRated }) {
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [thankYou, setThankYou] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch(`http://localhost:8000/rate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interaction_id: interactionId, comment, rating }),
    });
    setComment("");
    setRating(5);
    setThankYou(true);
    setTimeout(() => {
      setThankYou(false);
      navigate("/");
    }, 3000);
    if (onRated) onRated();
  };

  if (thankYou) {
    return (
      <div style={{ color: "green", marginTop: 16, fontWeight: "bold" }}>
        Thank you for your rating
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 8 }}>
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Leave a comment"
        rows={4}
        style={{ width: "100%", maxWidth: 400, marginTop: 8, marginBottom: 8, resize: "vertical" }}
      />
      <br />
      <StarRating value={rating} onChange={setRating} />
      <br />
      <button type="submit">Rate</button>
    </form>
  );
}

export default function RatePage() {
  const { uuid } = useParams();
  const [interaction, setInteraction] = useState(null);
  const [allInteractions, setAllInteractions] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [openIndex, setOpenIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const pageSize = 5;
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    if (!uuid) {
      // Fetch all interactions from a paginated or list endpoint instead of guessing IDs
      const fetchAll = async () => {
        let arr = [];
        // Try to use a list endpoint if available
        const res = await fetch(`http://localhost:8000/interactions`);
        if (res.ok) {
          arr = await res.json();
        }
        setAllInteractions(arr);
        setLoading(false);
      };
      fetchAll();
      return;
    }
    const fetchInteraction = async () => {
      const res = await fetch(`http://localhost:8000/interaction/by-uuid/${uuid}`);
      if (res.ok) {
        setInteraction(await res.json());
      }
      setLoading(false);
    };
    fetchInteraction();
  }, [uuid]);

  if (!uuid) {
    const filtered = allInteractions.filter(inter =>
      inter.description.toLowerCase().includes(search.toLowerCase())
    );
    const totalPages = Math.ceil(filtered.length / pageSize);
    const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

    if (loading) return <div>Loading...</div>;
    return (
      <div>
        <input
          type="text"
          placeholder="Search by description"
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setPage(1);
          }}
          style={{
            background: "#23272a",
            color: "#e8e6e3",
            border: "1px solid #444",
            borderRadius: 4,
            padding: "6px 10px",
            width: "100%",
            maxWidth: 320,
            marginBottom: 12
          }}
        />
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
          {paged.map((inter, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={inter.id}
                style={{
                  marginBottom: 12,
                  borderRadius: 6,
                  background: "#23272a",
                  border: "1px solid #444"
                }}
              >
                <div
                  style={{
                    cursor: "pointer",
                    padding: "10px 20px",
                    fontWeight: "bold",
                    background: isOpen ? "#30363d" : "#23272a",
                    borderRadius: "6px 6px 0 0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                >
                  <span
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "block",
                      maxWidth: "80vw"
                    }}
                    title={inter.description}
                  >
                    {inter.description}
                  </span>
                  <span>{isOpen ? "▲" : "▼"}</span>
                </div>
                {isOpen && (
                  <div style={{ padding: "10px 20px", borderTop: "1px solid #444" }}>
                    <div style={{
                      marginBottom: 8,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "block",
                      maxWidth: "80vw"
                    }}
                      title={inter.description}
                    >
                      <b>{inter.description}</b>
                    </div>
                    <button
                      style={{
                        background: "#30363d",
                        color: "#8ab4f8",
                        border: "1px solid #444",
                        borderRadius: 4,
                        cursor: "pointer"
                      }}
                      onClick={() => navigate(`/${inter.uuid}`)}
                    >
                      Rate
                    </button>
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

  if (loading) return <div>Loading...</div>;
  if (!interaction) return <div>Loading...</div>;

  // Helper for US Central time formatting
  const formatCentralTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      timeZone: "America/Chicago",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <b>Interaction Description</b>
        <div>{interaction.description}</div>
        <div style={{ marginTop: 8 }}>
          <b>Date of Interaction:</b> {formatCentralTime(interaction.date)}
        </div>
        <RateInteraction interactionId={interaction.id} onRated={() => {}} />
      </div>
    </div>
  );
}



