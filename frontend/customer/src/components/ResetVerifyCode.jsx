import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext.jsx'
import axios from 'axios'
import { toast } from "react-toastify";
import Infos from './Infos.jsx'
import Footer from './Footer.jsx'
import './ResetVerifyCode.css'
import Loading from './Loading.jsx';
import { useOtpRateLimit } from '../hooks/useOtpRateLimit.js';

const ResetVerifyCode = () => {
  const {toastSuccess, toastError, navigate, backendUrl, fpIdentifier, setFpIdentifier, resetPasswordToken, setResetPasswordToken} = useContext(ShopContext);
  const [loading, setLoading] = useState(false);
  const [fpVerificationCode, setFpVerificationCode] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  const {
    isLocked, attemptsLeft, formattedTime, recordAttempt, reset: resetRateLimit
  } = useOtpRateLimit('otp_rl_customer_forgot');

  const handleResetVerify  = async(event) => {
    event.preventDefault();
    if (!fpVerificationCode) {
      toast.error("Please enter your verification code.", {...toastError});
      return;
    }

    setLoading(true); // LOADING

    try {
        const response = await axios.post(backendUrl + '/api/customer/forgot-password/verify', {identifier: fpIdentifier, code: fpVerificationCode});
        if (response.data.success) {
          resetRateLimit();
          setResetPasswordToken(response.data.resetPasswordToken);
          localStorage.setItem('resetPasswordToken', response.data.resetPasswordToken);
          toast.success(response.data.message, {...toastSuccess});
        } else {
            if (response.data.codeExpired) {
              setFpVerificationCode('')
              setFpIdentifier('');
              sessionStorage.removeItem('fpIdentifier');
              navigate('/forgot-password')
              toast.error(response.data.message, { ...toastError });
              return;
            }
            if (response.data.emptyUser) {
              setFpVerificationCode('')
              setFpIdentifier('');
              sessionStorage.removeItem('fpIdentifier');
              navigate('/forgot-password')
              toast.error(response.data.message, { ...toastError });
              return;
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

  useEffect(() => {
      if (resetPasswordToken) {
        navigate('/reset-password')
      }
    }, [resetPasswordToken])

  const handleResendCode = async () => {
    if (isLocked || resendLoading) return;
    setResendLoading(true);
    try {
      const response = await axios.post(backendUrl + '/api/customer/forgot-password/resend', { identifier: fpIdentifier });
      if (response.data.success) {
        recordAttempt();
        setFpVerificationCode('');
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
    setFpVerificationCode(value);
  };

  return (
    <div className='rvc-vc'>
      {loading && <Loading />}
      <form onSubmit={handleResetVerify} className='rvc-form'>
        <div className='rvc-main'>
          <p className='rvc-vc-text'>Verify Reset Code</p>
          <p className='rvc-vc-textsm'>
            Enter the verification code sent to:
            <br /> 
            <span className='rvc-valid-identifier'> 
              {fpIdentifier}
            </span>
          </p>
        </div>
        <input type="text" inputMode="numeric" pattern="\d{6}" value={fpVerificationCode} onChange={handleVerifyCode} maxLength={6}  className='rvc-input-code-page' placeholder='Enter the 6-digit code' required/>
        <button type='submit' className='rvc-vc-button' disabled={loading || fpVerificationCode.length !== 6}>{loading ? 'Verifying...' : 'Verify Code'}</button>

        {/* ── Resend / Rate-limit block ── */}
        <div className='rvc-resend-block'>
          {isLocked ? (
            <div className='rvc-lockout-box'>
              <span className='rvc-lockout-icon'>🔒</span>
              <p className='rvc-lockout-msg'>Too many resend attempts.</p>
              <p className='rvc-lockout-sub'>Please wait before requesting a new code.</p>
              <div className='rvc-countdown'>{formattedTime}</div>
            </div>
          ) : (
            <div className='rvc-resend-row'>
              <span className='rvc-resend-hint'>Didn't receive the code?</span>
              <button
                type='button'
                className='rvc-resend-btn'
                onClick={handleResendCode}
                disabled={resendLoading}
              >
                {resendLoading ? 'Sending...' : 'Resend Code'}
              </button>
              {attemptsLeft < 3 && (
                <span className='rvc-attempts-left'>
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

export default ResetVerifyCode
