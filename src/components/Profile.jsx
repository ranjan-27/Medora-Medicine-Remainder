import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_BASE || (
    typeof window !== "undefined" && window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://1fee2aed-8698-49f5-8847-f331c376cc12-00-1iee6uea02ep9.pike.replit.dev:5000"
  );
  const BASE_URL = `${API_BASE}/api/auth`;

  // Fetch profile from backend
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please login first.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${BASE_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (data.error) {
          setError(data.error);
        } else {
          setProfile(data.user || data); // ✅ handle both shapes
        }
      } catch (err) {
        setError("Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Handle input changes (for editing profile locally)
  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // Save profile to backend
  const handleSave = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${BASE_URL}/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error || "Failed to update profile ❌");
      } else {
        alert("Profile updated successfully ✅");
      }
    } catch (err) {
      alert("Error updating profile");
    }
  };

  // Sign out
  const handleSignOut = () => {
    localStorage.removeItem("token");
    navigate("/auth");
  };

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!profile) return <p>No profile data found.</p>;

  return (
    <div className="profile">
      <h2>My Profile / मेरी प्रोफ़ाइल</h2>

      <label>
        Name:
        <input
          type="text"
          name="name"
          value={profile.name || ""}
          onChange={handleChange}
        />
      </label>

      <label>
        Email:
        <input
          type="email"
          name="email"
          value={profile.email || ""}
          readOnly
        />
      </label>

      <label>
        Age:
        <input
          type="number"
          name="age"
          value={profile.age || ""}
          onChange={handleChange}
        />
      </label>

      <label>
        Phone:
        <input
          type="tel"
          name="phone"
          value={profile.phone || ""}
          onChange={handleChange}
        />
      </label>

      <button className="btn" onClick={handleSave}>
        Save Profile
      </button>

      <button className="btn sign-btn" onClick={handleSignOut}>
        Sign Out
      </button>
    </div>
  );
};

export default Profile;
