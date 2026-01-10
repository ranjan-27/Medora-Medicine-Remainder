import React, { useState, useEffect } from "react";
import './Navbar.css'

import { useNavigate,Link } from 'react-router-dom';
const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const savedProfile = JSON.parse(localStorage.getItem("profile")); if (savedProfile) { setUser(savedProfile); } }, []);
  
  return (
    <div className='nav'>
  
      
        <svg width="80" height="80" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#667eea" stopOpacity="1">
                <animate attributeName="stop-color" values="#667eea;#764ba2;#667eea" dur="4s" repeatCount="indefinite"/>
              </stop>
              <stop offset="100%" stopColor="#f093fb" stopOpacity="1">
                <animate attributeName="stop-color" values="#f093fb;#fa709a;#f093fb" dur="4s" repeatCount="indefinite"/>
              </stop>
            </linearGradient>

            <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff6b6b" stopOpacity="1"/>
              <stop offset="100%" stopColor="#ee5a6f" stopOpacity="1"/>
            </linearGradient>

            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            <filter id="shadow">
              <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.3"/>
            </filter>
          </defs>

          <circle cx="150" cy="150" r="140" fill="url(#mainGradient)" opacity="0.15">
            <animate attributeName="r" values="140;145;140" dur="3s" repeatCount="indefinite"/>
          </circle>

          <circle cx="150" cy="150" r="120" fill="none" stroke="url(#mainGradient)" strokeWidth="4" opacity="0.6">
            <animate attributeName="stroke-dasharray" values="0,753;753,0;0,753" dur="6s" repeatCount="indefinite"/>
          </circle>

          <circle cx="150" cy="150" r="100" fill="url(#mainGradient)" filter="url(#shadow)">
            <animate attributeName="r" values="100;102;100" dur="2s" repeatCount="indefinite"/>
          </circle>

          <g transform="translate(150, 150)">
            <rect x="-12" y="-45" width="24" height="90" rx="12" fill="white" opacity="0.95">
              <animate attributeName="opacity" values="0.95;1;0.95" dur="2s" repeatCount="indefinite"/>
            </rect>

            <rect x="-45" y="-12" width="90" height="24" rx="12" fill="white" opacity="0.95">
              <animate attributeName="opacity" values="0.95;1;0.95" dur="2s" repeatCount="indefinite" begin="0.5s"/>
            </rect>

            <g transform="scale(0.5)">
              <path d="M0,-15 C-5,-25 -20,-25 -20,-12 C-20,0 0,20 0,20 C0,20 20,0 20,-12 C20,-25 5,-25 0,-15 Z" 
                    fill="url(#heartGradient)" filter="url(#glow)">
                <animate attributeName="d" 
                         values="M0,-15 C-5,-25 -20,-25 -20,-12 C-20,0 0,20 0,20 C0,20 20,0 20,-12 C20,-25 5,-25 0,-15 Z;
                                 M0,-15 C-5,-25 -20,-25 -20,-12 C-20,0 0,22 0,22 C0,22 20,0 20,-12 C20,-25 5,-25 0,-15 Z;
                                 M0,-15 C-5,-25 -20,-25 -20,-12 C-20,0 0,20 0,20 C0,20 20,0 20,-12 C20,-25 5,-25 0,-15 Z" 
                         dur="1.5s" repeatCount="indefinite"/>
              </path>
            </g>
          </g>

          <text x="150" y="275" fontFamily="Arial, sans-serif" fontSize="38" fontWeight="bold" 
                fill="url(#mainGradient)" textAnchor="middle" filter="url(#glow)">
            MEDORA
            <animate attributeName="opacity" values="1;0.8;1" dur="3s" repeatCount="indefinite"/>
          </text>
        </svg>
      

      <div className='nav-links'>
        <ul className='n1'>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/MyMed">My Medicines</Link></li>
        </ul>
      </div>

      <div className='n2'>
        {/* <button
          className="notify"
          data-count="3"   // dynamic unread count
          onClick={() => navigate("/Notification")}
        ></button> */}

        <button className="user" onClick={() => navigate("/Profile")}
          >
            {user && user.name ? '' : ""}
          </button>


    </div>
    </div>
  )
}

export default Navbar
