import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets.js";
import "./AdminSignup.css";

function AdminSignUp() {
  const [password, setPassword] = useState("");
  const [strength, setStrength] = useState(0);
  const navigate = useNavigate();

  // Simple password logic
  const checkStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (pwd.length >= 12) score++;
    return score;
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    setStrength(checkStrength(val));
  };

  return (
    <div className="admin-signup-bg">
      <div className="admin-signup-container">
        <h2 className="admin-signup-heading">Admin Sign Up</h2>
        <div className="admin-signup-logo">
          <img src={assets.gamj_logo} alt="Logo" />
          <span className="admin-signup-logo-text">GAMJ <b className="logo-text">SHOP</b></span>
        </div>
        <form className="admin-signup-form">
          <input
            type="text"
            placeholder="Full Name"
            className="admin-signup-input"
            required
          />
          <input
            type="email"
            placeholder="Email Address"
            className="admin-signup-input"
            required
          />
          <div className="admin-signup-phone-group">
            <span className="admin-signup-phone-prefix">+63</span>
            <input
              type="tel"
              placeholder="Phone Number"
              className="admin-signup-input phone"
              required
            />
          </div>
          <select className="admin-signup-input" defaultValue="Admin">
            <option value="Admin">Admin</option>
            <option value="Admin">Staff</option>
          </select>
          <input
            type="password"
            placeholder="Password"
            className="admin-signup-input"
            value={password}
            onChange={handlePasswordChange}
            required
          />
          <div className="admin-signup-strength-bars">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`strength-bar ${i < strength ? "filled" : ""}`}
              ></div>
            ))}
          </div>
          <div className="admin-signup-helper">
            Password must be at least 8 characters long
            <br />
            Password must contain at least one uppercase letter
            <br />
            Password must contain at least one number
            <br />
            Password must contain at least one special character
          </div>
          <button type="submit" className="admin-signup-btn primary">
            Create Admin Account
          </button>
          <button
            type="button"
            className="admin-signup-btn secondary"
            onClick={() => navigate("/")}
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminSignUp;