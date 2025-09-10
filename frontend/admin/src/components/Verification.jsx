import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets.js";
import "./verification.css";

// Helper to check if identifier is email
const isEmail = (str) => /\S+@\S+\.\S+/.test(str);

function Verification() {
  const [identifier, setIdentifier] = useState("");
  const [mode, setMode] = useState("mobile");
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Get identifier from sessionStorage or use demo values
    const stored = sessionStorage.getItem("loginIdentifier");
    if (stored) {
      setIdentifier(stored);
      setMode(isEmail(stored) ? "email" : "mobile");
    } else {
      // Demo 
      setIdentifier("09876543210");
      setMode("mobile");
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code === "123123") {
      navigate("/Admin");  
    } else {
      alert("Invalid code. Try again.");
    }
  };

  return (
    <div className="verification-bg">
      <div className="verification-card">
        <h2 className="verification-title">
          {mode === "mobile" ? "Verify Mobile Number" : "Verify Email Address"}
        </h2>
        <div className="verification-logo-row">
          <img src={assets.gamj_logo} alt="GAMJ SHOP Logo" className="verification-logo-img" />
          <span className="verification-logo-text">
            GAMJ<span className="logo-space"></span>
            <b className="logo-text">SHOP</b>
          </span>
        </div>
        <div className="  ">
          <div>
            {mode === "mobile"
              ? "Enter the verification code sent to your number:"
              : "Enter the verification code sent to your email:"}
          </div>
          <div className="verification-highlight">
            {identifier}
          </div>
        </div>
        <form className="verification-form" onSubmit={handleSubmit}>
          <input
            type="text"
            maxLength={6}
            className="verification-input"
            placeholder={
              mode === "mobile"
                ? "Enter the 6-digit code sent via SMS"
                : "Enter the 6-digit code sent via Email"
            }
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          <button className="verification-btn" type="submit">
            Verify Code
          </button>
        </form>
      </div>
    </div>
  );
}

export default Verification;