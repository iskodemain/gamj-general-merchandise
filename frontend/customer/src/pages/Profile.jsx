import React, { useState } from 'react';
import './Profile.css';
import { IoMdEye } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
import { FaFileUpload } from "react-icons/fa";
import { HiMiniTrash } from "react-icons/hi2";


const Profile = () => {
  const [showModal, setShowModal] = useState(false);
  const [activeStep, setActiveStep] = useState(0); // 0: Edit Profile, 1: Delivery Info, 2: Security

  return (
    <div className="profile-container">
      <div className="profile-steps">
        <div
          className={`step${activeStep === 0 ? ' active' : ''}`}
          onClick={() => setActiveStep(0)}
          style={{ cursor: 'pointer' }}
        >
          <span className="step-label">Edit Profile</span>
        </div>
        <div
          className={`step${activeStep === 1 ? ' active' : ''}`}
          onClick={() => setActiveStep(1)}
          style={{ cursor: 'pointer' }}
        >
          <span className="step-label">Delivery Info</span>
        </div>
        <div
          className={`step${activeStep === 2 ? ' active' : ''}`}
          onClick={() => setActiveStep(2)}
          style={{ cursor: 'pointer' }}
        >
          <span className="step-label">Security</span>
        </div>
      </div>

      {activeStep === 0 && (
        <>
          <h2 className="profile-title">Edit Profile</h2>
          <form className="profile-form">
            <section className="profile-section">
              <h3 className="section-title">Medical Institution Information</h3>
              <div className="form-group">
                <label>Medical Institution Name</label>
                <input type="text" placeholder="Enter institution name" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Contact Number</label>
                  <input type="text" placeholder="Enter contact number" />
                </div>
                <div className="form-group">
                  <label>Landline Number</label>
                  <input type="text" placeholder="Enter landline number" />
                </div>
              </div>
              <div className="form-group">
                <label>Official Email Address</label>
                <input type="email" placeholder="Enter official email" />
              </div>
              <div className="form-group">
                <label>Official Full Address</label>
                <input type="text" placeholder="Enter full address" />
              </div>
              <button
                type="button"
                className="review-proof-btn"
                onClick={() => setShowModal(true)}
              >
                <IoMdEye className="eye-icon" />
                Review Uploaded Proof
              </button>
            </section>
            <section className="profile-section">
              <h3 className="section-title">Authorized Representative Details</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input type="text" placeholder="Enter first name" />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input type="text" placeholder="Enter last name" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Work Contact Number</label>
                  <input type="text" placeholder="Enter work contact number" />
                </div>
                <div className="form-group">
                  <label>Work Email Address</label>
                  <input type="email" placeholder="Enter work email" />
                </div>
              </div>
              <div className="form-group">
                <label>Job Position/Designation</label>
                <input type="text" placeholder="Enter job position/designation" />
              </div>
            </section>
            <button type="submit" className="save-btn">
              Save Changes
            </button>
          </form>
        </>
      )}

      {activeStep === 1 && (
        <>
          <h2 className="profile-title">Delivery Information</h2>
          <form className="profile-form">
            <div className="form-group">
              <label>Medical Institution Name</label>
              <input type="text" placeholder="Medical Hospital Cavite" />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="sample@example.com" />
            </div>
            <div className="form-group">
              <label>Select Country</label>
              <input type="text" placeholder="Philippines" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Province</label>
                <select>
                  <option value="">Select Province</option>
                  <option value="Manila">Manila</option>
                  <option value="Cavite">Cavite</option>
                  <option value="Laguna">Laguna</option>
                </select>
              </div>
              <div className="form-group">
                <label>City</label>
                <select>
                  <option value="">Select City</option>
                  <option value="Quezon">Quezon</option>
                  <option value="Makati">Makati</option>
                  <option value="Tagaytay">Tagaytay</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Detailed Address</label>
              <input type="text" placeholder="1234 Medical Ave., Quezon City, Philippines 1100" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Zip Code</label>
                <input type="text" placeholder="1234" />
              </div>
              <div className="form-group">
                <label>Barangay</label>
                <select>
                  <option value="">Select Barangay</option>
                  <option value="Amihan">Amihan</option>
                  <option value="San Isidro">San Isidro</option>
                  <option value="Poblacion">Poblacion</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Contact Number</label>
              <input type="text" placeholder="+63 9876543210" />
            </div>
            <button type="submit" className="save-btn">
              Save Changes
            </button>
          </form>
        </>
      )}

      {activeStep === 2 && (
        <>
          <div className="security-header">
            <h2 className="profile-title" style={{ marginBottom: 0 }}>Account Security</h2>
            <button type="button" className="delete-account-btn">
              <HiMiniTrash size={20} style={{ marginRight: 2 }} />
              Delete Account
            </button>
          </div>
          <form className="profile-form">
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="sample@example.com" />
            </div>
            <div className="form-group">
              <label>Change Your Password</label>
              <div className="form-group">
                <input type="password" placeholder="password" />
                
              </div>
            </div>
            <button type="submit" className="save-btn">
              Save Changes
            </button>
          </form>
        </>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <button className="modal-close-btn" onClick={() => setShowModal(false)}>
              <IoMdClose size={22} />
            </button>
            <h3 className="modal-title">Successfully Uploaded(backend na ata to)</h3>
            <p className="modal-message">
              Image proof of legitimacy successfully uploaded. Review it and delete if necessary.
            </p>
            <div className="modal-proof-container">
              <div className="modal-proof-icon">
                <FaFileUpload size={32} />
              </div>
              <div className="modal-proof-filename">business_permit.png(example only)</div>
              <div className="modal-proof-size">Size: 15.7 MB(example only)</div>
              <select className="modal-proof-type" disabled>
                <option>Business Permit (Mayor’s Permit)</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="modal-remove-btn">Remove</button>
              <button className="modal-view-btn">View Image</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
