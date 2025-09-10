import React, { useState } from "react";
import './verifiedStaffView.css';
import { FaUserLarge, FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

function UnverifiedStaffView() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [requestStatus, setRequestStatus] = useState("Pending Request...");
  const [isRejected, setIsRejected] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleReject = () => {
    setRequestStatus("Request Rejected");
    setIsRejected(true);
  };

  const handleVerify = () => {
    // Handle verify logic here (e.g., API call)
    alert("User verified!");
  };

  const handleDelete = () => {
    // Handle delete logic here (e.g., API call)
    alert("Account deleted!");
  };

  return (
    <div className="verified-staff-view">
      <div className="profile-card">
        <div className="header-section">
          <h2 className={isRejected ? "rejected-title" : "pending-title"}>
            {requestStatus}
          </h2>
          <div className="avatar-circle">
            <FaUserLarge className="avatar-icon" />
          </div>
        </div>

        <section className="info-section">
          <h3 className="section-title">Staff Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input type="text" defaultValue="John" />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input type="text" defaultValue="Miller" />
            </div>
          </div>
          
          <div className="form-group">
            <label>Full Address</label>
            <input 
              type="text" 
              defaultValue="1234 Medical Ave., Quezon City, Philippines 1100" 
            />
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
          {isRejected ? (
            <button className="btn-delete" onClick={handleDelete}>
              Delete
            </button>
          ) : (
            <>
              <button className="btn-save1" onClick={handleVerify}>
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

export default UnverifiedStaffView;