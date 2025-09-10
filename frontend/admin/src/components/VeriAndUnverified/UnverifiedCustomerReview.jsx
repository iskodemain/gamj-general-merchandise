import React, { useState } from 'react';
import './unverifiedCustomerReview.css';
import { FaRegEye, FaRegEyeSlash, FaFileDownload } from "react-icons/fa";
import { FaUserLarge } from "react-icons/fa6";

function UnverifiedCustomerReview({ customer, onClose }) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [requestStatus, setRequestStatus] = useState(customer?.status || "Pending Request...");
  const [isRejected, setIsRejected] = useState(customer?.status === "Rejected");

  const handleReject = () => {
    setRequestStatus("Request rejected");
    setIsRejected(true);
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className="unverified-customer-review">
      <div className="review-card">
        <div className="header-section">
          <h2 className={isRejected ? "rejected-status" : "pending-status"}>
            {requestStatus}
          </h2>
          <div className="avatar-circle">
            <FaUserLarge className="avatar-icon" />
          </div>
        </div>

        <section className="info-section">
          <h3 className="section-title">Medical Institution Information</h3>
          
          <div className="form-group">
            <label>Medical Institution Name</label>
            <input type="text" value={customer?.name || "Medical Hospital Cavite"} readOnly />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Contact Number</label>
              <div className="input-with-prefix">
                <span className="input-prefix">+63</span>
                <input type="text" value="9123456789" readOnly />
              </div>
            </div>
            <div className="form-group">
              <label>Landline Number (optional)</label>
              <input type="text" placeholder="(xxx) xxx-xxxx" readOnly />
            </div>
          </div>
          
          <div className="form-group">
            <label>Official Email Address</label>
            <input type="email" value={customer?.email || "sample@example.com"} readOnly />
          </div>
          
          <div className="form-group">
            <label>Official Full Address</label>
            <input 
              type="text" 
              value="123 Medical Center Blvd, Cavite City, Philippines 4100" 
              readOnly 
            />
          </div>
          
          <div className="form-group">
            
            <div className="document-link">
              <FaRegEye className="document-icon" />
              <span className="document-name">Proof of the document you've uploaded</span>
            </div>
          </div>
        </section>

        <section className="info-section">
          <h3 className="section-title">Authorized Representative Details</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input type="text" value="John" readOnly />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input type="text" value="Marcolata" readOnly />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Work Contact Number</label>
              <input type="text" value="+63 9198765432" readOnly />
            </div>
            <div className="form-group">
              <label>Work Email Address</label>
              <input type="email" value="john.m@medicalhospital.com" readOnly />
            </div>
          </div>
          
          <div className="form-group">
            <label>Job Position/Designation</label>
            <input type="text" value="Manager" readOnly />
          </div>
        </section>

        <section className="info-section">
          <h3 className="section-title">User Account</h3>
          
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" value="sample@example.com" readOnly />
          </div>
          
          <div className="form-group">
            <label>Change Your Password</label>
            <div className="password-input">
              <input 
                type={passwordVisible ? "text" : "password"}
                value="•••••••••••"
                readOnly
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
          {isRejected ? (
            <button className="btn-delete" onClick={onClose}>
              Delete
            </button>
          ) : (
            <>
              <button className="btn-verify" onClick={onClose}>
                Verify User
              </button>
              <button className="btn-reject" onClick={handleReject}>
                Reject User
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default UnverifiedCustomerReview;