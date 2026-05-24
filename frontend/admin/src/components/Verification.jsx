import React, { useState, useContext } from "react";
import { assets } from "../assets/assets.js";
import "./Verification.css";
import { AdminContext } from "../context/AdminContextProvider.jsx";
import Loading from "../../../customer/src/components/Loading.jsx";
import axios from "axios";
import { toast } from "react-toastify";
import { useOtpRateLimit } from "../hooks/useOtpRateLimit.js";

function Verification() {
  const { loginIdentifier, loginToken, adminLoginVerify, backendUrl, toastSuccess, toastError } = useContext(AdminContext);
  const [loading, setLoading] = useState(false);
  const [loginVerificationCode, setLoginVerificationCode] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  const {
    isLocked, attemptsLeft, formattedTime, recordAttempt, reset: resetRateLimit
  } = useOtpRateLimit('otp_rl_admin_login');

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
    if (isSuccess) resetRateLimit();
    setLoading(false);
    if (isSuccess) {
      setLoginVerificationCode('');
    }
  };

  const handleResendCode = async () => {
    if (isLocked || resendLoading) return;
    setResendLoading(true);
    try {
      const response = await axios.post(backendUrl + '/api/admin/login/resend', { loginToken });
      if (response.data.success) {
        recordAttempt();
        setLoginVerificationCode('');
        toast.success(response.data.message, { ...toastSuccess });
      } else {
        toast.error(response.data.message, { ...toastError });
      }
    } catch (error) {
      toast.error(error.message, { ...toastError });
    } finally {
      setResendLoading(false);
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
            {loginIdentifier} 
          </div>
        </div>
        <form className="verification-form" onSubmit={handleSubmit}>
          <input  type="text" inputMode="numeric" pattern="\d{6}" value={loginVerificationCode} onChange={handleVerifyCode} maxLength={6} className="verification-input" placeholder="Enter the 6-digit code" required/>
          
          <button className="verification-btn" type="submit"  disabled={loading || loginVerificationCode.length !== 6}>
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>

          {/* ── Resend / Rate-limit block ── */}
          <div className="vf-resend-block">
            {isLocked ? (
              <div className="vf-lockout-box">
                <span className="vf-lockout-icon">🔒</span>
                <p className="vf-lockout-msg">Too many resend attempts.</p>
                <p className="vf-lockout-sub">Please wait before requesting a new code.</p>
                <div className="vf-countdown">{formattedTime}</div>
              </div>
            ) : (
              <div className="vf-resend-row">
                <span className="vf-resend-hint">Didn't receive the code?</span>
                <button
                  type="button"
                  className="vf-resend-btn"
                  onClick={handleResendCode}
                  disabled={resendLoading}
                >
                  {resendLoading ? 'Sending...' : 'Resend Code'}
                </button>
                {attemptsLeft < 3 && (
                  <span className="vf-attempts-left">
                    {attemptsLeft} resend{attemptsLeft !== 1 ? 's' : ''} left
                  </span>
                )}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default Verification;