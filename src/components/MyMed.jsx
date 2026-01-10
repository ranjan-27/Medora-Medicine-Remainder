import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MyMed.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';


const MyMed = () => {
  const [medicines, setMedicines] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_BASE || (
    typeof window !== "undefined" && window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://1fee2aed-8698-49f5-8847-f331c376cc12-00-1iee6uea02ep9.pike.replit.dev:5000"
  );
  const BASE_URL = `${API_BASE}/api/medicines`;

  // Fetch medicines from backend
  useEffect(() => {
    const fetchMedicines = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please login first.");
        return;
      }

      try {
        const res = await fetch(BASE_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setMedicines(data.medicines || []);
        } else {
          setError(data.error || "Failed to fetch medicines ❌");
        }
      } catch (err) {
        setError("Error connecting to backend");
      }
    };

    fetchMedicines();
    // Refresh status every minute
    const interval = setInterval(fetchMedicines, 60000);
    return () => clearInterval(interval);
  }, []);

  // Check if medicine time has passed
  const getMedicineStatus = (medicineTime) => {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTime = currentHours * 100 + currentMinutes; // e.g., 1430 for 2:30 PM

    const [hours, minutes] = medicineTime.split(":").map(Number);
    const medicineTimeInMinutes = hours * 100 + minutes;

    if (currentTime >= medicineTimeInMinutes) {
      return "Overdue"; // Time has passed
    } else if (currentTime >= medicineTimeInMinutes - 30) {
      return "Due Soon"; // 30 mins before
    } else {
      return "Upcoming";
    }
  };

  // Edit medicine
  const handleEdit = (med) => {
    navigate("/AddMedicine", { state: med });
  };

  // Delete medicine
  const handleDelete = (id) => {
    confirmAlert({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this medicine?',
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            const token = localStorage.getItem("token");
            try {
              const res = await fetch(`${BASE_URL}/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              });
              const data = await res.json();
              if (res.ok) {
                setMedicines(medicines.filter((m) => m._id !== id));
                toast.success("Medicine deleted successfully ✅");
              } else {
                toast.error(data.error || "Failed to delete medicine ❌");
              }
            } catch (err) {
              toast.error("Error deleting medicine");
            }
          }
        },
        {
          label: 'Cancel'
        }
      ]
    });
  };

  const handleNotify = (med) => {
    toast.success(`Notification sent for ${med.name} to caregiver(s)!`);
  };

  return (
    <div className="my-med">
      <h2>My Medicines</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {medicines.length === 0 ? (
        <div className="empty-state">
          <p>No medicines added yet.</p>
          <button className="add-btn" onClick={() => navigate("/AddMedicine")}>
            ➕ Add Medicine
          </button>
        </div>
      ) : (
        <div className="med-list">
          {medicines.map((med) => {
            const status = getMedicineStatus(med.time);
            const statusClass = 
              status === "Overdue" ? "overdue" : 
              status === "Due Soon" ? "due-soon" : 
              "upcoming";

            return (
              <div key={med._id} className={`med-card ${statusClass}`}>
                <div className="med-header">
                  <h3>{med.name}</h3>
                  <span className={`status-badge ${statusClass}`}>{status}</span>
                </div>
                <p><strong>Dosage:</strong> {med.dosage}</p>
                <p><strong>Frequency:</strong> {med.frequency}</p>
                <p><strong>Next dose:</strong> {med.time}</p>
                
                <div className="actions">
                  <button onClick={() => handleEdit(med)}>✏️ Edit</button>
                  <button onClick={() => handleDelete(med._id)}>🗑️ Delete</button>
                  <button onClick={() => handleNotify(med)}>🔔 Notify</button>
                  {status === "Overdue" && (
                    <button className="btn-mark-done">✓ Taken</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default MyMed;