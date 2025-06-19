import React, { useEffect, useState } from "react";

const API = "http://localhost:8000";

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

  return (
    <div>
      <h2>Rating Results</h2>
      <ul>
        {interactions.map(inter => (
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
          </li>
        ))}
      </ul>
    </div>
  );
}
