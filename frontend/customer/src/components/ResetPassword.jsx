import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext.jsx'
import axios from 'axios'
import { toast } from "react-toastify";
import OurPolicy from '../components/OurPolicy.jsx'
import Infos from '../components/Infos.jsx'
import Footer from '../components/Footer.jsx'
import './ResetPassword.css'
import { IoIosEye } from "react-icons/io";
import { IoIosEyeOff } from "react-icons/io";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { FaCheckCircle } from "react-icons/fa";
import Loading from './Loading.jsx';

const ResetPassword = () => {
  const {toastSuccess, toastError, navigate, backendUrl, fpIdentifier, setFpIdentifier,  resetPasswordToken, setResetPasswordToken} = useContext(ShopContext);

  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [passwordType, setPasswordType] = useState('password');
  const [hasMinLength, setHasMinLength] = useState(false);
  const [hasUpperCase, setHasUpperCase] = useState(false);
  const [hasLowerCase, setHasLowerCase] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecialCharacter, setHasSpecialCharacter] = useState(false);
  
  // VERIFY BUTTON
  const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialCharacter;

  const passedChecks = [
    hasMinLength,
    hasUpperCase,
    hasLowerCase,
    hasNumber,
    hasSpecialCharacter,
  ];
  
  const passedCount = passedChecks.filter(Boolean).length;

  const togglePassword = () => {
    setPasswordType((prevPasswordType) => 
      prevPasswordType === 'password' ? 'text' : 'password'
    );
  };
  

  const handleNewPassword  = async(e) => {
    e.preventDefault();

    if (!newPassword) {
      toast.error("Please enter your new password.", {...toastError});
      return;
    }

    setLoading(true); // LOADING

    try {
        const response = await axios.post(backendUrl + '/api/customer/forgot-password/confirm', {identifier: fpIdentifier, resetPasswordToken: resetPasswordToken, newPassword});

        if (response.data.success) {
          toast.success(response.data.message, {...toastSuccess});
          navigate('/login');
          
          setTimeout(() => {
            setFpIdentifier('');
            sessionStorage.removeItem('fpIdentifier');
            setResetPasswordToken('');
            localStorage.removeItem('resetPasswordToken');
          }, 200);
          
        } else {
            if (response.data.emptyUser) {
              setFpIdentifier('');
              sessionStorage.removeItem('fpIdentifier');
              setResetPasswordToken('');
              localStorage.removeItem('resetPasswordToken');
              navigate('/forgot-password');
              toast.error(response.data.message, { ...toastError });
              return;
            }
            if (response.data.codeExpired) {
              setFpIdentifier('');
              sessionStorage.removeItem('fpIdentifier');
              setResetPasswordToken('');
              localStorage.removeItem('resetPasswordToken');
              navigate('/forgot-password');
              toast.error(response.data.message, { ...toastError });
              return;
            }
            if (response.data.emptyResetToken) {
              setFpIdentifier('');
              sessionStorage.removeItem('fpIdentifier');
              setResetPasswordToken('');
              localStorage.removeItem('resetPasswordToken');
              navigate('/forgot-password');
              toast.error(response.data.message, { ...toastError });
              return;
            }
            if (response.data.differentResetToken) {
              setFpIdentifier('');
              sessionStorage.removeItem('fpIdentifier');
              setResetPasswordToken('');
              localStorage.removeItem('resetPasswordToken');
              navigate('/forgot-password');
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
      const minLength = newPassword.length >= 8;
      const hasUpper = /[A-Z]/.test(newPassword);
      const hasLower = /[a-z]/.test(newPassword);
      const hasNum = /[0-9]/.test(newPassword);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  
      setHasMinLength(minLength);
      setHasUpperCase(hasUpper);
      setHasLowerCase(hasLower);
      setHasNumber(hasNum);
      setHasSpecialCharacter(hasSpecial);
  
  }, [newPassword]);

  useEffect(() => {
    if (!resetPasswordToken || !fpIdentifier) {
      navigate('/forgot-password');
    }
  }, [resetPasswordToken, fpIdentifier]);

  return (
    <div className='rp-last-main'>
      {loading && <Loading />}
      <form onSubmit={handleNewPassword} className='rp-last-formsize'>
        <div className='rp-last-container'>
          <p className='rp-last-text'>Create New Password</p>
        </div>

        <div className={`rp-pass-tainer ${isPasswordFocused ? 'focused' : ''}`} onClick={() => setIsPasswordFocused(true)} onBlur={() => setIsPasswordFocused(false)} tabIndex={-1}>
          <input onChange={(e)=>setNewPassword(e.target.value)} value={newPassword} type={passwordType} placeholder='Enter your new password' required onBlur={() => setIsPasswordFocused(false)}/>
          <div onClick={togglePassword} className='rp-showHidePass'>
            {passwordType === 'password' ? <IoIosEyeOff className='rp-offPass'/> : <IoIosEye className='rp-onPass'/>}
          </div>
        </div>

        <div className='rp-password-validator'>
          {[...Array(5)].map((_, index) => (
            <span
              key={index}
              className={`rp-line-password ${passedCount > index ? 'valid' : ''}`}
            ></span>
          ))}
        </div>

        <div className="rp-password-rules">
          {isPasswordValid ? 
          <FaCheckCircle className='rp-password-infocon-valid'/> :
          <AiOutlineInfoCircle className='rp-password-infocon'/>
          }

          {!hasLowerCase ? 
            <p className='rp-password-rules-txt'>Must include at least one lowercase letter (a–z)</p> :!hasUpperCase ? 
            <p className='rp-password-rules-txt'>Must include at least one uppercase letter (A–Z)</p> : !hasMinLength ? 
            <p className='rp-password-rules-txt'>Password must be at least 8 characters long</p> : !hasNumber ? 
            <p className='rp-password-rules-txt'>Must include at least one number (0–9)</p> : !hasSpecialCharacter ? <p className='rp-password-rules-txt'>Must include at least one special character (e.g. !@#$%^&*())</p> : isPasswordValid && <p className='rp-password-rules-txt valid'>Strong password confirmed.</p> 
          }
        </div>

        <button className='RP-button' type="submit" disabled={!isPasswordValid || loading}>
        {loading ? 'Resetting...' : 'Reset Password'} </button>
      </form>
      <OurPolicy/>
      <Infos/>
      <Footer/>
    </div>
  )
}

export default ResetPassword
