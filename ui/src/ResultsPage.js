import React, { useEffect, useState } from "react";
import API from "./config";

export default function ResultsPage() {
  const [interactions, setInteractions] = useState([]);

  const fetchInteractions = async () => {
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

  // Calculate overall average rating
  const allRatings = interactions.flatMap(inter => inter.rates.map(rate => rate.rating));
  const overallAvg = allRatings.length
    ? (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(2)
    : null;

  return (
    <div>
      <h2>Rating Results</h2>
      {overallAvg && (
        <div style={{ marginBottom: 16, fontWeight: "bold" }}>
          Overall Average Rating: {overallAvg} / 5
        </div>
      )}
      <ul>
        {interactions.map(inter => {
          const ratings = inter.rates.map(rate => rate.rating);
          const avg = ratings.length
            ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2)
            : null;
          return (
            <li key={inter.id} style={{ marginBottom: 16 }}>
              <b>{inter.description}</b> <i>({new Date(inter.date).toLocaleString()})</i>
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
            </li>
          );
        })}
      </ul>
    </div>
  );
}
