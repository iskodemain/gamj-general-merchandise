import React, { useContext, useEffect, useState } from 'react'
import OurPolicy from '../OurPolicy.jsx'
import Infos from '../Infos.jsx'
import Footer from '../Footer.jsx'
import Loading from '../Loading.jsx'
import './StepFourVerifyEmail.css'
import { ShopContext } from '../../context/ShopContext';
import axios from 'axios'
import { toast } from 'react-toastify'

const StepFourVerifyEmail = () => {
  const {token, setToken, navigate, backendUrl, toastSuccess, toastError, signUpData, setVerifiedUser, setShowImportantNote} = useContext(ShopContext);

  const [loading, setLoading] = useState(false);

  const [verificationCode, setVerificationCode] = useState('');

  const handleVerifyCode = (e) => {
    let value = e.target.value;
    value = value.replace(/\D/g, ''); // Remove all non-digit characters
    if (value.length > 6) {
      value = value.slice(0, 6); // Limit to 6 digits max
    }
    setVerificationCode(value);
  };

  const handleVerifyForm = async(e) => {
    e.preventDefault();

    if (!signUpData.registerKey) {
      toast.error("Verification expired or not initiated. Please try again", {...toastError});
      return;
    }

    if (!verificationCode) {
      toast.error("Please enter your verification code.", {...toastError});
      return;
    }

    setLoading(true); 

    try {
      const response = await axios.post(backendUrl + "/api/customer/register/verify", {registerKey: signUpData.registerKey, code: verificationCode});
      if (response.data.success) {
        localStorage.setItem("authToken", response.data.token);
        setToken(response.data.token);

        const isVerified = false;
        setVerifiedUser(isVerified);

        if (isVerified === false) {
          setShowImportantNote(true);
        }

        toast.success(response.data.message, {...toastSuccess});
      } else {
        toast.error(response.data.message, {...toastError});
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message, {...toastError});
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (token) {
      navigate('/')
    }
  }, [token])

  return (
    <div className='sp4-vc'>
      {loading && <Loading />}
      <form onSubmit={handleVerifyForm} className='sp4-form'>
        <div className='sp4-progress-line'>
          <button type='button' className="stepOne sp4-line-password"></button>
          <button type='button' className="stepTwo sp4-line-password"></button>
          <button type='button' className="stepThree sp4-line-password"></button>
          <button type='button' className="stepFour sp4-line-password"></button>
        </div>
        <div className='sp4-main'>
          {signUpData.loginPhoneNum ? 
          <p className='sp2-vc-text'>Verify Phone Number</p> : 
          <p className='sp2-vc-text'>Verify Email Address</p>
          }
          <p className='sp4-vc-textsm'>
            Enter the verification code sent to your {signUpData.loginPhoneNum ? 'phone number' : 'email'}: 
            <br /> 
            <span className='sp4-valid-identifier'> 
              {signUpData.loginPhoneNum || signUpData.loginEmail}
            </span>
          </p>
        </div>
        <input type="text" inputMode="numeric" pattern="\d{6}" value={verificationCode} onChange={handleVerifyCode} maxLength={6}  className='sp4-input-code-page' placeholder='Enter the 6-digit code' required/>
        <button type='submit' className='sp4-vc-button' disabled={loading || verificationCode.length !== 6}>{loading ? 'Verifying...' : 'Verify Code'}</button>
      </form>
      <OurPolicy/>
      <Infos/>
      <Footer/>
    </div>
  )
}

export default StepFourVerifyEmail
