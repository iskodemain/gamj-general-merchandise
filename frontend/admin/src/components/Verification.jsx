import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets.js";
import "./Verification.css";
import { AdminContext } from "../context/AdminContextProvider.jsx";
import Loading from "../../../customer/src/components/Loading.jsx";

function Verification() {
  const { loginIdentifier, loginToken, adminLoginVerify } = useContext(AdminContext);
  const [loading, setLoading] = useState(false);
  const [loginVerificationCode, setLoginVerificationCode] = useState('');

  const handleVerifyCode = (e) => {
    let value = e.target.value;
    value = value.replace(/\D/g, ''); // Remove all non-digit characters
    if (value.length > 6) {
      value = value.slice(0, 6); // Limit to 6 digits max
    }
    setLoginVerificationCode(value);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const isSuccess = await adminLoginVerify(loginToken, loginVerificationCode);
    setLoading(false);
    if (isSuccess) {
      setLoginVerificationCode('');
    }
  };

  return (
    <div className="verification-bg">
      {loading && <Loading />}
      <div className="verification-card">
        <h2 className="verification-title">Verify Your Login Code</h2>
        <div className="verification-logo-row">
          <img src={assets.gamj_logo} alt="GAMJ SHOP Logo" className="verification-logo-img" />
          <span className="verification-logo-text">
            GAMJ<span className="logo-space"></span>
            <b className="logo-text">SHOP</b>
          </span>
        </div>
        <div className="note-identifier-ctn">
          <div className="note-title-idf">Enter the verification code sent to</div>
          <div className="verification-highlight">
            {loginIdentifier || 'gaga@gmail.com'} 
          </div>
        </div>
        <form className="verification-form" onSubmit={handleSubmit}>
          <input  type="text" inputMode="numeric" pattern="\d{6}" value={loginVerificationCode} onChange={handleVerifyCode} maxLength={6} className="verification-input" placeholder="Enter the 6-digit code" required/>
          
          <button className="verification-btn" type="submit"  disabled={loading || loginVerificationCode.length !== 6}>
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Verification;