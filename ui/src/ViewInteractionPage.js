import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "./config";

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
          data-testid={`star-${n}`}
        >★</span>
      ))}
    </span>
  );
}

function RateInteraction({ interactionId, onRated }) {
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5); // Default to 5 stars
  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch(`${API}/rate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interaction_id: interactionId, comment, rating }),
    });
    setComment("");
    setRating(5);
    onRated();
  };
  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 8 }}>
      <StarRating value={rating} onChange={setRating} />
      <input
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Leave a comment"
      />
      <button type="submit">Rate</button>
    </form>
  );
}

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

export default function ViewInteractionPage() {
  const { uuid } = useParams();
  const [interaction, setInteraction] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInteraction = async () => {
    setLoading(true);
    const res = await fetch(`${API}/interaction/by-uuid/${uuid}`);
    if (res.ok) {
      setInteraction(await res.json());
    }
    setLoading(false);
  };

  useEffect(() => { fetchInteraction(); }, [uuid]);

  if (loading) return <div>Loading...</div>;
  if (!interaction) return <div>Loading...</div>;

  return (
    <div>
      <h2 style={{ fontSize: "1.5em", fontWeight: 700, margin: "16px 0" }}>Interaction</h2>
      <div>
        <b>{interaction.description}</b> <i>({formatCentralTime(interaction.date)})</i>
        <div>
          <span>UUID: <code>{interaction.uuid}</code></span>
        </div>
        <ul>
          {interaction.rates.map(rate => (
            <li key={rate.id}>
              <b>Rating:</b> {rate.rating} {rate.comment ? `- ${rate.comment}` : <i>No comment</i>}
            </li>
          ))}
        </ul>
        <RateInteraction interactionId={interaction.id} onRated={fetchInteraction} />
      </div>
    </div>
  );
}
