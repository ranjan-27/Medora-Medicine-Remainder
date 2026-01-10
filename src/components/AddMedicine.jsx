import React, { useState, useEffect } from "react";
import "./AddMed.css";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

const AddMedicine = () => {
  // Helpers: sanitize and validate caregiver phone numbers
  const sanitizePhone = (v) => String(v || "").replace(/\D/g, "");
  const isValidIndianPhone = (digits) => {
    // Accept 10-digit local (auto-prefixed backend) or 12-digit with 91
    return digits.length === 10 || (digits.length === 12 && digits.startsWith("91"));
  };
  const [formData, setFormData] = useState({
    _id: null,
    name: "",
    type: "",
    dosage: "",
    time: "",
    frequency: "",
    notes: "",
    caregivers: [{ name: "", phone: "" }],
    status: "Upcoming"
  });

  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_BASE || (
    typeof window !== "undefined" && window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://1fee2aed-8698-49f5-8847-f331c376cc12-00-1iee6uea02ep9.pike.replit.dev:5000"
  );
  const BASE_URL = `${API_BASE}/api/medicines`;

  // Speech recognition handler (unchanged)
  const startListening = (field, lang = "en-IN", index = null) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Speech recognition not supported in this browser");
      return;
    }
    const recognition = new SR();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();
    setIsListening(true);

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript.trim();
      if (index !== null) {
        const updatedCaregivers = [...formData.caregivers];
        updatedCaregivers[index][field] = spokenText;
        setFormData({ ...formData, caregivers: updatedCaregivers });
      } else {
        setFormData({ ...formData, [field]: spokenText });
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  // Handle manual typing
  const handleChange = (e, index = null) => {
    if (index !== null) {
      const updatedCaregivers = [...formData.caregivers];
      if (e.target.name === "phone") {
        updatedCaregivers[index][e.target.name] = sanitizePhone(e.target.value);
      } else {
        updatedCaregivers[index][e.target.name] = e.target.value;
      }
      setFormData({ ...formData, caregivers: updatedCaregivers });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  // Add caregiver
  const addCaregiver = () => {
    if (formData.caregivers.length < 4) {
      setFormData({
        ...formData,
        caregivers: [...formData.caregivers, { name: "", phone: "" }]
      });
    } else {
     // alert("You can add up to 4 caregivers only.");
      toast.info("You can add up to 4 caregivers only.");

    }
  };

  // ✅ Submit handler (backend integration)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    setLoading(true);

    try {
      // Clean and validate caregiver phones before sending to backend
      const cleanedCaregivers = Array.isArray(formData.caregivers)
        ? formData.caregivers
            .map((cg) => ({ ...cg, phone: sanitizePhone(cg.phone) }))
            .filter((cg) => cg.name || cg.phone) // drop completely empty rows
        : [];

      const invalidPhones = cleanedCaregivers
        .filter((cg) => cg.phone)
        .filter((cg) => !isValidIndianPhone(cg.phone));

      if (invalidPhones.length > 0) {
        toast.error("Please enter valid caregiver phone numbers (10 digits or start with 91)");
        setLoading(false);
        return;
      }

      const payload = { ...formData, caregivers: cleanedCaregivers };

      let res;
      if (formData._id) {
        // Editing existing medicine
        res = await fetch(`${BASE_URL}/${formData._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        // Adding new medicine
        res = await fetch(BASE_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (res.ok) {
        //alert(formData._id ? "Medicine updated successfully ✅" : "Medicine added successfully ✅");

        toast.success(formData._id ? "Medicine updated successfully ✅" : "Medicine added successfully ✅");

        navigate("/MyMed"); // redirect to medicine list
      } else {
       // alert(data.error || "Failed to save medicine ❌");
        toast.error(data.error || "Failed to save medicine ❌");

      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to backend");
    } finally{
      setLoading(false);
    }
  };

  // Prefill from Speak.jsx or Edit
  useEffect(() => {
    if (location.state) {
      setFormData((prev) => ({
        ...prev,
        _id: location.state._id || prev._id, // ✅ use backend _id
        name: location.state.name || prev.name,
        dosage: location.state.dosage || prev.dosage,
        type: location.state.type || prev.type,
        time: location.state.time || prev.time,
        frequency: location.state.frequency || prev.frequency,
        notes: location.state.notes || prev.notes,
        caregivers: location.state.caregivers || prev.caregivers
      }));
    }
  }, [location.state]);

  return (
    <div className="add-medicine">
      <h2>{formData._id ? "Edit Medicine / दवा संपादित करें" : "Add Medicine / दवा जोड़ें"}</h2>

      {isListening && (
        <div className="listening-popup">
          🎤 Listening... Please speak <br />
          🎤 सुनिए... कृपया बोलें
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* All your existing form fields remain unchanged */}
          <label>
            Medicine Name / दवा का नाम:
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <div className="mic-buttons">
              <button
                type="button"
                className="mic-btn-en"
                onClick={() => startListening("name", "en-IN")}
              >
                🎤 English
              </button>
              <button
                type="button"
                className="mic-btn-hi"
                onClick={() => startListening("name", "hi-IN")}
              >
                🎤 Hindi
              </button>
            </div>
          </label>

          {/* Type */}
          <label>
            Type / प्रकार:
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option value="Tablet">Tablet</option>
              <option value="Capsule">Capsule</option>
              <option value="Syrup">Syrup</option>
              <option value="Injection">Injection</option>
              <option value="Other">Other</option>
            </select>
          </label>

          {/* Dosage */}
          <label>
            Dosage / मात्रा:
            <input
              type="text"
              name="dosage"
              value={formData.dosage}
              onChange={handleChange}
            />
            <div className="mic-buttons">
              <button
                type="button"
                className="mic-btn-en"
                onClick={() => startListening("dosage", "en-IN")}
              >
                🎤 English
              </button>
              <button
                type="button"
                className="mic-btn-hi"
                onClick={() => startListening("dosage", "hi-IN")}
              >
                🎤 Hindi
              </button>
            </div>
          </label>

          {/* Time */}
          <label>
            Time / समय:
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
            />
          </label>

          {/* Frequency */}
          <label>
            Frequency / कितनी बार:
            <select
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option value="Once a day">Once a day</option>
              <option value="Twice a day">Twice a day</option>
              <option value="Thrice a day">Thrice a day</option>
              <option value="Every 8 hours">Every 8 hours</option>
              <option value="Custom">Custom</option>
            </select>
          </label>

          {/* Notes */}
          <label>
            Notes / नोट्स:
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
            ></textarea>
            <div className="mic-buttons">
              <button
                type="button"
                className="mic-btn-en"
                onClick={() => startListening("notes", "en-IN")}
              >
                🎤 English
              </button>
              <button
                type="button"
                className="mic-btn-hi"
                onClick={() => startListening("notes", "hi-IN")}
              >
                🎤 Hindi
              </button>
            </div>
          </label>

          {/* Caregivers */}
           <h3>Your Phone & Caregiver Details / आपका फोन और देखभालकर्ता का विवरण:</h3>
           <p style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}>
            First enter your own phone number, then add caregiver details below.<br />
            पहले अपना फोन नंबर दर्ज करें, फिर नीचे देखभालकर्ता का विवरण जोड़ें।
          </p>
          {formData.caregivers.map((cg, index) => (
            <div key={index} className="caregiver">
              <label>
                Name:
                <input
                  type="text"
                  name="name"
                  value={cg.name}
                  onChange={(e) => handleChange(e, index)}
                />
              </label>
              <label>
                Phone:
                <input
                  type="tel"
                  name="phone"
                  value={cg.phone}
                  onChange={(e) => handleChange(e, index)}
                  placeholder="e.g., 9876543210"
                  title="Enter 10-digit mobile or 91-prefixed number"
                />
              </label>
            </div>
          ))}
          <button type="button" className="add-btn" onClick={addCaregiver}>
            ➕ Add Caregiver
          </button>



        <button type="submit" className="btn" disabled={loading}>
          {loading ? (
            <>
              Saving medicine <span className="spinner"></span>
            </>
          ) : (
            formData._id ? "Update Medicine" : "Save Medicine"
          )}
        </button>

      </form>


    </div>
  );
};

export default AddMedicine;
