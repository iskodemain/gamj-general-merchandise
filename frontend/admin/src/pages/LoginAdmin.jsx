import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginAdmin.css";
import { assets } from "../assets/assets.js";

function LoginAdmin() {
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Temporary login credentials
  const validCredentials = {
    email: "admin@gmail.com",
    phone: "09062320087",
    password: "admin",
  };

  useEffect(() => {
    sessionStorage.removeItem("loginIdentifier");
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Identifier entered:", identifier);
    console.log("Password entered:", password);

    // Check if credentials match our temporary login
    const isValidIdentifier =
      identifier === validCredentials.email ||
      identifier === validCredentials.phone;

    console.log("isValidIdentifier:", isValidIdentifier);
    console.log("isValidPassword:", password === validCredentials.password);

    if (isValidIdentifier && password === validCredentials.password) {
      setError("");
      sessionStorage.setItem("loginIdentifier", identifier);
      navigate("/verify");
    } else {
      setError(
        "Invalid email/phone or password. Try admin@gmail.com / 09062320087 with password 'admin' nigga"
      );
    }
  };

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

        {/* Show error message if credentials are invalid */}
        {error && <div className="login-error">{error}</div>}

        {/*  Login Form  */}
        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-label">
            <input
              type="text"
              className="login-input"
              placeholder="Enter your email or phone"
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </label>
          <label className="login-label password-label">
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                className="login-input"
                placeholder="Password: admin"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              ></button>
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