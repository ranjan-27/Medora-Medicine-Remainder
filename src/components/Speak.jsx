import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Speak.css";

const Speak = () => {
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const navigate = useNavigate();

  // Helper to speak text aloud
  const speakOut = (message, lang = "en-IN") => {
    try {
      speechSynthesis.cancel(); // stop any previous speech
      const utter = new SpeechSynthesisUtterance(message);
      utter.lang = lang;
      speechSynthesis.speak(utter);
    } catch (e) {
      console.error("TTS error:", e);
    }
  };

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Speech recognition not supported in this browser");
      return;
    }

    // Speak prompt immediately on button click (allowed by browser gesture)
    speakOut("Please say your medicine name and dosage.");
    speakOut("कृपया अपनी दवा का नाम और मात्रा बोलें", "hi-IN");

    const recognition = new SR();
    recognition.lang = "en-IN"; // works for English + Hindi
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();
    setIsListening(true);

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript.trim();
      setSpokenText(text);

      // Speak back confirmation in both languages
      speakOut(`You said ${text}.`);
      speakOut(`आपने कहा ${text}`, "hi-IN");

      // Parse into name + dosage
      const parts = text.split(/\s+/);
      const name = parts[0] || "";
      const dosage = parts.slice(1).join(" ") || "";

      // Redirect to AddMedicine with prefilled state
      navigate("/AddMedicine", { state: { name, dosage } });
    };

    recognition.onerror = (e) => {
      console.error("Speech recognition error:", e);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  return (
    <div className="speak">
      <h2>Speak Here</h2>

      {isListening && (
        <div className="listening-popup">
          🎤 Please say your medicine name and dosage <br />
          🎤 कृपया अपनी दवा का नाम और मात्रा बोलें
        </div>
      )}

      <button className="mic-btn" onClick={startListening}>
        🎤 Tap to Speak
      </button>

      {spokenText && (
        <div className="confirmation">
          ✅ You said: {spokenText} <br />
          ✅ आपने कहा: {spokenText}
        </div>
      )}
    </div>
  );
};

export default Speak;

