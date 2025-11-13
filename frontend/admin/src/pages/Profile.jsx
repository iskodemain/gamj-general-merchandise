import React, { useState } from 'react';
import './Profile.css';
import { assets } from "../assets/assets.js";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import Navbar from '../components/Navbar.jsx';

function Profile() {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <>
      <Navbar TitleName="Profile"/>
      <div className="profile-container">
        <div className="profile-card">
          <div className="header-section">
            <h2 className="profile-title">Profile Information</h2>
            <div className="icon-container">
              <img src={assets.admin_gamj_logo} alt="Profile Icon" className="profile-icon" />
            </div>
          </div>

          <section className="info-section">
            <h3 className="section-title">Admin Information</h3>
            
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" defaultValue="GAMJ Merchandise" />
            </div>
          </section>

          <section className="info-section">
            <h3 className="section-title">User Account</h3>
            
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" defaultValue="sample@example.com" />
            </div>
            
            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" defaultValue="0987654321" />
            </div>
            
            <div className="form-group">
              <label>Change Your Password</label>
              <div className="password-input">
                <input 
                  type={passwordVisible ? "text" : "password"}
                  defaultValue="password123"
                />
                <button 
                  className="toggle-password"
                  onClick={togglePasswordVisibility}
                  aria-label={passwordVisible ? "Hide password" : "Show password"}
                >
                  {passwordVisible ? <FaRegEyeSlash /> : <FaRegEye />}
                </button>
              </div>
            </div>
          </section>

          <div className="action-section">
            <button className="btn-save">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;