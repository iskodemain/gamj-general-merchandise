import React, { useContext, useState, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext.jsx'
import axios from 'axios'
import { toast } from "react-toastify";
import Infos from '../components/Infos.jsx'
import Footer from '../components/Footer.jsx'
import './LoginCodeVerification.css'
import Loading from './Loading.jsx';
import { useOtpRateLimit } from '../hooks/useOtpRateLimit.js';

const LoginCodeVerification = () => {
  const {toastSuccess, toastError, navigate, backendUrl, loginToken, setLoginToken, loginIdentifier, setLoginIdentifier, token, setToken, setVerifiedUser, setShowImportantNote} = useContext(ShopContext);
  const [loading, setLoading] = useState(false);
  const [loginVerificationCode, setLoginVerificationCode] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  const {
    isLocked, attemptsLeft, formattedTime, recordAttempt, reset: resetRateLimit
  } = useOtpRateLimit('otp_rl_customer_login');

  const handleLoginVerify  = async(event) => {
    event.preventDefault();
    if (!loginVerificationCode) {
      toast.error("Please enter your verification code.", {...toastError});
      return;
    }

    setLoading(true); // LOADING

    try {
        // LAST STEP LOGIN PROCESS 
        const response = await axios.post(backendUrl + '/api/customer/login/verify', {loginToken, code: loginVerificationCode});

        if (response.data.success) {
          resetRateLimit();
          setLoginToken('');
          localStorage.removeItem('loginToken');
          setLoginIdentifier('');
          sessionStorage.removeItem('loginIdentifier');
          localStorage.setItem("authToken", response.data.token);
          setToken(response.data.token);
          
          const isVerified = response.data.verifiedCustomer;
          setVerifiedUser(isVerified);

          if (isVerified === false) {
            setShowImportantNote(true);
          }

          toast.success(response.data.message, { ...toastSuccess });

        } else {
            if (response.data.codeExpired) {
              setLoginToken('');
              localStorage.removeItem('loginToken');
              setLoginIdentifier('');
              sessionStorage.removeItem('loginIdentifier');
              toast.error(response.data.message, { ...toastError });
            }
          toast.error(response.data.message, { ...toastError });
        }
    } catch (error) {
      console.log(error);
      toast.error(error.message, {...toastError});
    } finally {
      setLoading(false);
    }
  }
  
  const handleResendCode = async () => {
    if (isLocked || resendLoading) return;
    setResendLoading(true);
    try {
      const response = await axios.post(backendUrl + '/api/customer/login/resend', { loginToken });
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

  const handleVerifyCode = (e) => {
    let value = e.target.value;
    value = value.replace(/\D/g, ''); // Remove all non-digit characters
    if (value.length > 6) {
      value = value.slice(0, 6); // Limit to 6 digits max
    }
    setLoginVerificationCode(value);
  };

  useEffect(() => {
      if (token) {
        navigate('/');
      }
  }, [token]);

  useEffect(() => {
    if (!loginToken || !loginIdentifier) {
      navigate('/login');
    }
  }, [loginToken, loginIdentifier]);

  return (
    <div className='lcv-vc'>
      {loading && <Loading />}
      <form onSubmit={handleLoginVerify} className='lcv-form'>
        <div className='lcv-main'>
          <p className='lcv-vc-text'>Verify Your Sign-In Code</p>
          <p className='lcv-vc-textsm'>
            Enter the verification code sent to:
            <br /> 
            <span className='lcv-valid-identifier'> 
              {loginIdentifier}
            </span>
          </p>
        </div>
        <input type="text" inputMode="numeric" pattern="\d{6}" value={loginVerificationCode} onChange={handleVerifyCode} maxLength={6}  className='lcv-input-code-page' placeholder='Enter the 6-digit code' required/>
        <button type='submit' className='lcv-vc-button' disabled={loading || loginVerificationCode.length !== 6}>{loading ? 'Verifying...' : 'Verify Code'}</button>

        {/* ── Resend / Rate-limit block ── */}
        <div className='lcv-resend-block'>
          {isLocked ? (
            <div className='lcv-lockout-box'>
              <span className='lcv-lockout-icon'>🔒</span>
              <p className='lcv-lockout-msg'>Too many resend attempts.</p>
              <p className='lcv-lockout-sub'>Please wait before requesting a new code.</p>
              <div className='lcv-countdown'>{formattedTime}</div>
            </div>
          ) : (
            <div className='lcv-resend-row'>
              <span className='lcv-resend-hint'>Didn't receive the code?</span>
              <button
                type='button'
                className='lcv-resend-btn'
                onClick={handleResendCode}
                disabled={resendLoading}
              >
                {resendLoading ? 'Sending...' : 'Resend Code'}
              </button>
              {attemptsLeft < 3 && (
                <span className='lcv-attempts-left'>
                  {attemptsLeft} resend{attemptsLeft !== 1 ? 's' : ''} left
                </span>
              )}
            </div>
          )}
        </div>
      </form>
      <Infos/>
      <Footer/>
    </div>
  )
}

export default LoginCodeVerification
