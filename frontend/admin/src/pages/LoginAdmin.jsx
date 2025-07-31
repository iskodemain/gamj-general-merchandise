import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // <-- Import
import "./LoginAdmin.css";
import { assets } from "../assets/assets.js";

function LoginAdmin() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate(); // <-- Add

  return (
    <div className="login-bg">
      <div className="login-card">
        <h2 className="login-title">Login</h2>
        <div className="login-logo">
          <div className="logo-icon">
            <img src={assets.gamj_logo} alt="Gamj shop" />
          </div>
          <span className="brand-name">
            GAMJ <b className="shop-name">SHOP</b>
          </span>
        </div>
        <form className="login-form">
          <label className="login-label">
            
            <input
              type="text"
              className="login-input"
              placeholder="Enter your email or phone"
              autoComplete="username"
            />
          </label>
          <label className="login-label password-label">
            
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                className="login-input"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
              </button>
            </div>
          </label>
          <div className="forgot-link">
            <a href="#" className="forgot-password">
              Forgot your password?
            </a>
          </div>
          <button className="sign-in-btn" type="submit">
            Sign In
          </button>
          <button
            className="create-account-btn"
            type="button"
            onClick={() => navigate("/signup")}
          >
            Create an Account
          </button>
        </form>
      </div>
    </div>
  );
}
export default LoginAdmin;