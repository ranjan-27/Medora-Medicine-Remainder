import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Notification.css";

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const API = (import.meta.env.VITE_API_BASE || (
    typeof window !== "undefined" && window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://1fee2aed-8698-49f5-8847-f331c376cc12-00-1iee6uea02ep9.pike.replit.dev:5000"
  ));

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Backend error:", text);
        setError("Failed to fetch notifications");
        return;
      }

      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error("Fetch failed:", err);
      setError("Something went wrong while fetching notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [token]);

  const speak = (text) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-IN";
    window.speechSynthesis.speak(utter);
  };

  // ✅ Mark medicine as Taken
  const markTaken = async (id) => {
    try {
      const res = await fetch(`${API}/api/medicines/${id}/taken`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        console.error("Mark taken failed");
        return;
      }
      await fetchNotifications();
    } catch (err) {
      console.error("Mark taken error:", err);
    }
  };

  // ✅ Mark medicine as Missed
  const markMissed = async (id) => {
    try {
      const res = await fetch(`${API}/api/medicines/${id}/missed`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        console.error("Mark missed failed");
        return;
      }
      await fetchNotifications();
    } catch (err) {
      console.error("Mark missed error:", err);
    }
  };

  return (
    <div className="notifications">
      <h2>Notifications</h2>

      {loading && <p>Loading notifications...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <>
          {items.length === 0 ? (
            <p>No notifications yet.</p>
          ) : (
            <div className="notes">
              {items.map((n) => (
                <div key={n._id} className="note">
                  <p>{n.message}</p>
                  <small>{new Date(n.createdAt).toLocaleString()}</small>

                  {/* ✅ Show status if backend includes it */}
                  {n.status && (
                    <span className={`status ${n.status.toLowerCase()}`}>
                      {n.status}
                    </span>
                  )}

                  <button onClick={() => speak(n.message)}>🔊 Speak</button>

                  {/* ✅ Show action buttons if Upcoming */}
                  {n.status === "Upcoming" && n.medicineId && (
                    <div className="actions">
                      <button onClick={() => markTaken(n.medicineId)}>✅ Taken</button>
                      <button onClick={() => markMissed(n.medicineId)}>❌ Missed</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <button className="back-btn" onClick={() => navigate("/")}>
        ⬅ Back
      </button>
    </div>
  );
}
