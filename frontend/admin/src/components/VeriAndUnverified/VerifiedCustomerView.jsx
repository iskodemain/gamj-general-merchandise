import React, { useState } from 'react';
import './verifiedCustomerView.css';
import { FaUserLarge, FaRegEye, FaRegEyeSlash, FaEye } from "react-icons/fa6";

function VerifiedCustomerView({ customer, onClose }) {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className="verified-customer-view">
      <div className="profile-card">
        <div className="header-section">
          <h2 className="profile-title">Profile information</h2>
          <div className="avatar-circle">
            <FaUserLarge className="avatar-icon" />
          </div>
        </div>

        <section className="info-section">
          <h3 className="section-title">Medical Institution Information</h3>
          
          <div className="form-group">
            <label>Medical Institution Name</label>
            <input type="text" defaultValue={customer?.name || "Medical Hospital Cavite"} />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Contact Number</label>
              <div className="input-with-prefix">
                <span className="input-prefix">+63</span>
                <input type="text" defaultValue="9123456789" />
              </div>
            </div>
            <div className="form-group">
              <label>Landline Number (optional)</label>
              <input type="text" placeholder="(xxx) xxx-xxxx" />
            </div>
          </div>
          
          <div className="form-group">
            <label>Official Email Address</label>
            <input type="email" defaultValue={customer?.email || "sample@example.com"} />
          </div>
          
          <div className="form-group">
            <label>Official Full Address</label>
            <input 
              type="text" 
              defaultValue="123 Medical Center Blvd, Cavite City, Philippines 4100" 
            />
          </div>
          
          <div className="form-group">
            <div className="document-link">
              <FaEye className="document-icon" />
              <span className="document-label">Proof of the document you've uploaded</span>
            </div>
        
            <div className="document-box">
              <span>Business Permit (Mayor's Permit)</span>
            </div>
          </div>
        </section>

        <section className="info-section">
          <h3 className="section-title">Authorized Representative Details</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input type="text" defaultValue="John" />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input type="text" defaultValue="Marcolata" />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Work Contact Number</label>
              <input type="text" defaultValue="+63 9198765432" />
            </div>
            <div className="form-group">
              <label>Work Email Address</label>
              <input type="email" defaultValue="john.m@medicalhospital.com" />
            </div>
          </div>
          
          <div className="form-group">
            <label>Job Position/Designation</label>
            <input type="text" defaultValue="Manager" />
          </div>
        </section>

        <section className="info-section">
          <h3 className="section-title">User Account</h3>
          
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" defaultValue="sample@example.com" />
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

        <div className="action-buttons">
          <button className="btn-save1" onClick={onClose}>
            Save Changes
          </button>
          <button className="btn-delete" onClick={onClose}>
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerifiedCustomerView;