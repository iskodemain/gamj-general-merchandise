import React, { useState } from "react";
import "./Settings.css";
import Navbar from "../components/Navbar";

function Settings() {
  const [businessLogo, setBusinessLogo] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [businessName, setBusinessName] = useState("GAMJ Merchandise");

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBusinessLogo(URL.createObjectURL(file));
    }
  };

  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    alert("Changes Saved Successfully!");
  };

  return (
    <>
    <Navbar TitleName="Settings"/>
      <div className="settings-container">
        {/* Business Logo Section */}
        <div className="section">
          <label className="section-title">Business Logo</label>
          <div className="logo-upload">
            <label htmlFor="logo-input" className="upload-box">
              {businessLogo ? (
                <img src={businessLogo} alt="Logo Preview" className="preview-image" />
              ) : (
                <div className="upload-placeholder">
                  <img src="https://cdn-icons-png.flaticon.com/512/685/685655.png" alt="Upload Icon" />
                </div>
              )}
            </label>
            <input
              type="file"
              id="logo-input"
              accept="image/*"
              onChange={handleLogoUpload}
              hidden
            />
            <p className="recommended-size">Recommended Size: 296 × 296</p>
          </div>
        </div>

        {/* Business Name Input */}
        <div className="section">
          <label className="label-title">Business Name</label>
          <input
            type="text"
            className="text-input"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />
        </div>

        {/* Home Page Cover */}
        <div className="section">
          <label className="label-title">Home Page Cover (Recommended Size: 2880 × 1939)</label>
          <label htmlFor="cover-input" className="cover-box large">
            {coverImage ? (
              <img src={coverImage} alt="Cover Preview" className="preview-image-large" />
            ) : (
              <div className="upload-placeholder large">
                <span>Upload Cover</span>
              </div>
            )}
          </label>
          <input
            type="file"
            id="cover-input"
            accept="image/*"
            onChange={handleCoverUpload}
            hidden
          />
        </div>

        {/* Save Changes Button */}
        <button className="save-button" onClick={handleSave}>
          Save Changes
        </button>
      </div>
    </>
  );
}

export default Settings;
