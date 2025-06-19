import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

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
  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch(`http://localhost:8000/rate`, {
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

export default function RatePage() {
  const { uuid } = useParams();
  const [interaction, setInteraction] = useState(null);

  useEffect(() => {
    if (!uuid) return;
    const fetchInteraction = async () => {
      const res = await fetch(`http://localhost:8000/interaction/by-uuid/${uuid}`);
      if (res.ok) {
        setInteraction(await res.json());
      }
    };
    fetchInteraction();
  }, [uuid]);

  if (!uuid) return <div>No interaction specified.</div>;
  if (!interaction) return <div>Loading...</div>;

  return (
    <div>
      <h2>Rate Interaction</h2>
      <div style={{ marginBottom: 16 }}>
        <b>{interaction.description}</b> <i>({new Date(interaction.date).toLocaleString()})</i>
        <RateInteraction interactionId={interaction.id} onRated={() => {}} />
      </div>
    </div>
  );
}


