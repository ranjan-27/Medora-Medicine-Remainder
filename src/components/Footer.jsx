import React, { useState } from 'react';
import './Footer.css';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const Footer = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const API_BASE = import.meta.env.VITE_API_BASE || (
    typeof window !== "undefined" && window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://1fee2aed-8698-49f5-8847-f331c376cc12-00-1iee6uea02ep9.pike.replit.dev:5000"
  );

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/contact/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.success) {
       // alert("✅ Thank you for contacting us! We will get back to you soon.");
        toast.success("✅ Thank you for contacting us! We will get back to you soon.");
        setFormData({
          name: "",
          email: "",
          phone: "",
          message: ""
        });
      } else {
        alert("❌ " + (data.error || "Failed to send message"));
      }
    } catch (err) {
      alert("❌ Error sending message. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="footer">
      {/* Contact Form */}
      <div className="fill">
        <h2>Contact Us</h2>
        <form className="f1" onSubmit={handleSubmit}>
          <input 
            type="text" 
            name="name" 
            placeholder="Name" 
            value={formData.name}
            onChange={handleChange}
            required 
          />
          <input 
            type="email" 
            name="email" 
            placeholder="Enter your Email" 
            value={formData.email}
            onChange={handleChange}
            required 
          />
          <input 
            type="tel" 
            name="phone" 
            placeholder="Phone Number" 
            value={formData.phone}
            onChange={handleChange}
          />
          <textarea 
            name="message" 
            placeholder="Message" 
            rows="4" 
            value={formData.message}
            onChange={handleChange}
            required
          ></textarea>
          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Submit"}
          </button>
        </form>
      </div>

      {/* Static Info */}
      <div className="contact">
        <h2>Medora</h2>
        <p>Email: medora@gmail.com</p>
        <p>© 2025 Medora. All rights reserved.</p>
        <p>Made with ❤️ in India</p>
        <p>मेडोरा: आपकी सेहत, आपकी ज़िम्मेदारी</p>
      </div>
    </footer>
  );
};

export default Footer;