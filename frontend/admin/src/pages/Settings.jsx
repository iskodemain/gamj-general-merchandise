import React, { useState, useEffect, useContext } from "react";
import "./Settings.css";
import Navbar from "../components/Navbar";
import { AdminContext } from "../context/AdminContextProvider.jsx";
import Loading from "../components/Loading.jsx";
import { toast } from 'react-toastify';

function Settings() {
  const { settingsData, handleChangeSettingsData, toastError } = useContext(AdminContext);
  const [loading, setLoading] = useState(false);

  const [businessName, setBusinessName] = useState("");
  const [businessLogoPreview, setBusinessLogoPreview] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);

  const [businessLogoFile, setBusinessLogoFile] = useState(null);
  const [coverImageFile, setCoverImageFile] = useState(null);

  useEffect(() => {
    if (settingsData && settingsData.length > 0) {
      const s = settingsData[0];

      setBusinessName(s.businessName || "");
      setBusinessLogoPreview(s.businessLogo || null);
      setCoverImagePreview(s.homeCoverImage || null);

      setBusinessLogoFile(null);
      setCoverImageFile(null);
    }
  }, [settingsData]);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBusinessLogoFile(file);
      setBusinessLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImageFile(file);
      setCoverImagePreview(URL.createObjectURL(file));
    }
  };

  // -----------------------------
  // SAVE SETTINGS
  // -----------------------------
  const handleSave = async () => {
    if (!businessName.trim()) {
      toast.error("Business name is required.", toastError);
      return;
    }

    setLoading(true);
    
    const formData = new FormData();

    // Only send changed fields
    formData.append("businessName", businessName);

    if (businessLogoFile) formData.append("businessLogo", businessLogoFile);
    if (coverImageFile) formData.append("homeCoverImage", coverImageFile);

    const saved = await handleChangeSettingsData(formData);

    setLoading(false);
  };

  return (
    <>
      {loading && <Loading />}
      <Navbar TitleName="Settings" />
      <div className="settings-container">

        {/* Business Logo Section */}
        <div className="section">
          <label className="section-title">Business Logo</label>
          <div className="logo-upload">
            <label htmlFor="logo-input" className="upload-box">
              {businessLogoPreview ? (
                <img
                  src={businessLogoPreview}
                  alt="Logo Preview"
                  className="preview-image"
                />
              ) : (
                <div className="upload-placeholder">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/685/685655.png"
                    alt="Upload Icon"
                  />
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
            <p className="recommended-size">For Better Resolution: 296 × 296</p>
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
          <label className="label-title">
            Home Page Cover (For Better Resolution: 1920 × 1138)
          </label>

          <label htmlFor="cover-input" className="cover-box large">
            {coverImagePreview ? (
              <img
                src={coverImagePreview}
                alt="Cover Preview"
                className="preview-image-large"
              />
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
