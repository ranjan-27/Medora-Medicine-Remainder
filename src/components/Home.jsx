import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [userName, setUserName] = useState("");

  const API_BASE = import.meta.env.VITE_API_BASE || (
    typeof window !== "undefined" && window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://1fee2aed-8698-49f5-8847-f331c376cc12-00-1iee6uea02ep9.pike.replit.dev:5000"
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok && data.user) {
          setIsLoggedIn(true);
          // ✅ Choose what to display: email or name
          setUserName(data.user.name || data.user.email);
        } else {
          // Token invalid → clear and redirect
          localStorage.removeItem("token");
          localStorage.removeItem("userName");
          setIsLoggedIn(false);
          navigate("/auth");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setIsLoggedIn(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  return (
    <div className='hero'>
      {!isLoggedIn ? (
        <>
          {/* Public welcome */}
          <div className='m1'>
            <h1>Welcome to Medora</h1>
            <h2>Medicine on time, without worry</h2>
            <h3>समय पर दवा, बिना चिंता</h3>
            <p className='p1'>
              Medora is your bilingual (Hindi/English) health reminder app. 
              It helps you manage your medicines with ease — add them manually or by voice, 
              get smart notifications, and keep your health on track without worry.
            </p> 
            <p className='p2'>
              मेडोरा आपका द्विभाषी (हिंदी/अंग्रेज़ी) स्वास्थ्य रिमाइंडर ऐप है। 
              यह आपको दवाओं को आसानी से मैनेज करने में मदद करता है — 
              दवा को मैन्युअल रूप से या आवाज़ से जोड़ें, 
              स्मार्ट नोटिफिकेशन पाएँ और बिना चिंता के अपनी सेहत का ध्यान रखें।
            </p>
            <button className='btn' onClick={() => navigate('/auth')}>Get Started</button>
          </div>

          {/* Section 2: Main Features */}
          <div className='m2'>
            <h2>Main Features / मुख्य विशेषताएँ</h2>
            <ul className='lists'>
              <li>🎤 Voice input in Hindi & English</li>
              <li>✍️ Manual medicine entry</li>
              <li>🔔 Smart reminders</li>
              <li>👨‍👩‍👧 Caregiver support</li>
              <li>💊 My Medicines list</li>
            </ul>
          </div>

          {/* Section 3: Why Choose Medora */}
          <div className='m3'>
            <h2>Why Choose Medora? / मेडोरा क्यों चुनें?</h2>
            <p className='p1'>
              Health matters for everyone. Medora ensures peace of mind for families, independence for elders, 
              and convenience for busy people.  
              It is designed to be simple, bilingual, and accessible — so anyone can use it with confidence.  
              With Medora, you never miss a dose, and your loved ones stay informed and reassured.
            </p>
            <p className='p2'>
              स्वास्थ्य सभी के लिए ज़रूरी है। मेडोरा परिवार को सुकून, बुजुर्गों को स्वतंत्रता और व्यस्त लोगों को सुविधा देता है।  
              यह सरल, द्विभाषी और सभी के लिए सुलभ बनाया गया है — ताकि हर कोई इसे भरोसे के साथ इस्तेमाल कर सके।  
              मेडोरा के साथ आप कभी दवा लेना नहीं भूलेंगे और आपके प्रियजन हमेशा निश्चिंत रहेंगे।
            </p>
          </div>
        </>
      ) : (
        <>
          {/* Logged-in welcome */}
          <h1>Welcome to Medora, {userName} 👋 </h1>
          <h1>मेडोरा में आपका स्वागत है</h1>
          <h2>Stay healthy, stay on track / स्वस्थ रहें, सही समय पर दवा लें</h2>

          <div className="actions">
            <button className="btn" onClick={()=> navigate('/AddMedicine')}>
              ➕ Add Medicine / दवा जोड़ें
            </button>
            <button className="mic-btn" onClick={()=> navigate('/Speak')}>
              🎤 Speak Here / यहाँ बोलिए
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;

