import React, { useState, useEffect, useContext } from "react";
import "./Profile.css";
import { assets } from "../assets/assets.js";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import Navbar from "../components/Navbar.jsx";
import { AdminContext } from "../context/AdminContextProvider.jsx";
import { toast } from "react-toastify";
import Loading from "../components/Loading.jsx";

function Profile() {
  const { adminProfileInfo, toastError, handleSaveAdminProfile } =
    useContext(AdminContext);

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    ID: "",
    userName: "",
    identifier: "",
    password: "",
  });

  // -----------------------------------------------------
  // LOAD INITIAL VALUES (NO adminUser, use direct fields)
  // -----------------------------------------------------
  useEffect(() => {
    if (adminProfileInfo) {
      setForm({
        ID: adminProfileInfo.ID || "",
        userName: adminProfileInfo.userName || "",
        identifier:
          adminProfileInfo.emailAddress ||
          adminProfileInfo.phoneNumber ||
          "",
        password: "",
      });
    }
  }, [adminProfileInfo]);

  const togglePasswordVisibility = () =>
    setPasswordVisible((prev) => !prev);

  // ----------------------------
  // VALIDATORS
  // ----------------------------
  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isValidPhone = (phone) =>
    /^9\d{9}$/.test(phone);

  const validatePassword = (password) => {
    if (password.length < 8)
      return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(password))
      return "Password must contain an uppercase letter.";
    if (!/[a-z]/.test(password))
      return "Password must contain a lowercase letter.";
    if (!/[0-9]/.test(password))
      return "Password must contain a number.";
    if (!/[!@#$%^&*]/.test(password))
      return "Password must contain a special character.";
    return null;
  };

  // ----------------------------
  // SAVE PROFILE
  // ----------------------------
  const handleSave = async () => {
    setLoading(true);

    if (!form.userName.trim()) {
      toast.error("Username is required.", toastError);
      setLoading(false);
      return;
    }

    if (!form.identifier.trim()) {
      toast.error("Email or phone number is required.", toastError);
      setLoading(false);
      return;
    }

    if (!isValidEmail(form.identifier.trim()) && !isValidPhone(form.identifier.trim())) {
      toast.error(
        "Identifier must be a valid email or PH phone number.",
        toastError
      );
      setLoading(false);
      return;
    }

    if (form.password.trim() !== "") {
      const passwordError = validatePassword(form.password.trim());
      if (passwordError) {
        toast.error(passwordError, toastError);
        setLoading(false);
        return;
      }
    }

    const payload = {
      userName: form.userName.trim(),
      identifier: form.identifier.trim(),
      password: form.password.trim(),
    };

    const saved = await handleSaveAdminProfile(payload);

    setLoading(false);

    if (saved) {
      setTimeout(() => window.location.reload(), 500);
    }
  };

  return (
    <>
      <Navbar TitleName="Profile" />
      {loading && <Loading />}
      <div className="admin-profile-container">
        <div className="admin-profile-card">
          <div className="admin-profile-header">
            <h2 className="admin-profile-title">Profile Information</h2>
          </div>

          {/* ADMIN INFO */}
          <section className="admin-profile-section">
            <h3 className="admin-profile-section-title">Admin Information</h3>

            <div className="admin-profile-form-group">
              <label>Username</label>
              <input
                type="text"
                value={form.userName}
                placeholder="Enter your username"
                onChange={(e) =>
                  setForm({ ...form, userName: e.target.value })
                }
              />
            </div>
          </section>

          {/* ACCOUNT INFO */}
          <section className="admin-profile-section">
            <h3 className="admin-profile-section-title">User Account</h3>

            <div className="admin-profile-form-group">
              <label>Email or Phone Number</label>
              <input
                type="text"
                value={form.identifier}
                placeholder="Enter your email or phone number"
                onChange={(e) =>
                  setForm({ ...form, identifier: e.target.value })
                }
              />
            </div>

            <div className="admin-profile-form-group">
              <label>Change Your Password</label>
              <div className="admin-profile-password-input">
                <input
                  type={passwordVisible ? "text" : "password"}
                  placeholder="Enter your new password (optional)"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
                <button
                  className="admin-profile-toggle-password"
                  onClick={togglePasswordVisibility}
                >
                  {passwordVisible ? <FaRegEye /> : <FaRegEyeSlash />}
                </button>
              </div>
            </div>
          </section>

          <div className="admin-profile-action">
            <button className="admin-profile-btn-save" onClick={handleSave}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;