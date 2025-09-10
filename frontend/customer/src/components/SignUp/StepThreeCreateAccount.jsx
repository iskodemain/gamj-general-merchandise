import React, { useContext, useEffect, useState } from 'react'
import './StepThreeCreateAccount.css'
import OurPolicy from '../OurPolicy.jsx'
import Infos from '../Infos.jsx'
import Loading from '../Loading.jsx'
import Footer from '../Footer.jsx'
import { ShopContext } from '../../context/ShopContext.jsx'
import { toast } from "react-toastify";
import { IoIosEye } from "react-icons/io";
import { IoIosEyeOff } from "react-icons/io";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { FaCheckCircle } from "react-icons/fa";
import axios from 'axios'

const StepThreeCreateAccount = () => {
  const {token, setToken, navigate, backendUrl, toastSuccess, toastError, signUpStep, setSignUpStep, signUpData, setSignUpData} = useContext(ShopContext);

  const [loading, setLoading] = useState(false);
  const [loginPhoneNum, setLoginPhoneNum] = useState(signUpData.loginPhoneNum || '');
  const [loginEmail, setLoginEmail] = useState(signUpData.loginEmail || '');
  const [loginPassword, setLoginPassword] = useState(signUpData.loginPassword || '');

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

  const [emailSelected, setEmailSelected] = useState(true);
  const [phoneSelected, setPhoneSelected] = useState(false);

  const togglePassword = () => {
    setPasswordType((prevPasswordType) => 
      prevPasswordType === 'password' ? 'text' : 'password'
    );
  };

  const handleBackBtn = () => {
    setSignUpStep(2);
  };

  const handleEmailBtn = () => {
    setEmailSelected(true);
    setPhoneSelected(false);
    // RESET
    setLoginPhoneNum('');
    setLoginPassword('');
  }

  const handlePhoneBtn = () => {
    setEmailSelected(false);
    setPhoneSelected(true);
    // RESET
    setLoginEmail('');
    setLoginPassword('');
  }

  const handlePhoneNumber = (e) => {
    let value = e.target.value;
    value = value.replace(/\D/g, '');
    // Limit to 10 digits max
    if (value.length > 10) {
      value = value.slice(0, 10);
    }

    // Must start with 9
    if (value && value[0] !== '9') {
      return; // Ignore input if first digit isn't 9
    }

    setLoginPhoneNum(value);
  };

  const handleStepThreeSubmit = async (e) => {
    e.preventDefault();

    if (!loginPhoneNum && !loginEmail) {
      toast.error("Email or phone number is required to create an account.", { ...toastError });
      return;
    }

    if (!loginPassword) {
      toast.error("Please enter your password.", { ...toastError });
      return;
    }

    setLoading(true);

    try {
      // CREATE ACCOUNT
      const formData = new FormData();
      formData.append('medicalInstitutionName', signUpData.medicalInstitutionName);
      formData.append('contactNumber', signUpData.contactNumber);
      formData.append('landlineNumber', signUpData.landlineNumber);
      formData.append('emailAddress', signUpData.emailAddress);
      formData.append('fullAddress', signUpData.fullAddress);
      formData.append('proofType', signUpData.proofType);
      formData.append('imageProof', signUpData.imageProof);

      formData.append('repFirstName', signUpData.repFirstName);
      formData.append('repLastName', signUpData.repLastName);
      formData.append('repContactNumber', signUpData.repContactNumber);
      formData.append('repEmailAddress', signUpData.repEmailAddress);
      formData.append('repJobPosition', signUpData.repJobPosition);

      formData.append('loginPhoneNum', loginPhoneNum);
      formData.append('loginEmail', loginEmail);
      formData.append('loginPassword', loginPassword);

      const response = await axios.post(backendUrl + "/api/customer/register", formData, {headers: {'Content-Type': 'multipart/form-data'}});
      if (response.data.success) {
        toast.success(response.data.message, {...toastSuccess});
        setSignUpData(prev => ({
          ...prev,
          loginPhoneNum,
          loginEmail,
          loginPassword,
          registerKey: response.data.registerKey,
        }));
        setSignUpStep(4);
      } else {
        toast.error(response.data.message, {...toastError});
      }
    } catch (error) {
        console.log(error);
        toast.error(error.message, {...toastError});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const minLength = loginPassword.length >= 8;
    const hasUpper = /[A-Z]/.test(loginPassword);
    const hasLower = /[a-z]/.test(loginPassword);
    const hasNum = /[0-9]/.test(loginPassword);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(loginPassword);

    setHasMinLength(minLength);
    setHasUpperCase(hasUpper);
    setHasLowerCase(hasLower);
    setHasNumber(hasNum);
    setHasSpecialCharacter(hasSpecial);

  }, [loginPassword]);

  return (
    <div className='sp3-main'>
      {loading && <Loading />}
      <form className='sp3-form' onSubmit={handleStepThreeSubmit}>
        <div className='sp3-progress-line'>
          <button type='button' className="stepOne sp3-line-password"></button>
          <button type='button' className="stepTwo sp3-line-password"></button>
          <button type='button' className="stepThree sp3-line-password"></button>
          <button type='button' className="stepFour sp3-line-password"></button>
        </div>
        <div className='sp2-tainer'>
          <p className='sp2-text'>Create Account</p>
          <p className='sp2-stepNum'>{signUpStep}/4</p>
        </div>
        <div className='identifier-btn'>
          <button type='button' onClick={handleEmailBtn} className={`email-btn ${emailSelected ? 'focused' : ''}`}>Email Address</button>
          <button type='button' onClick={handlePhoneBtn}  className={`phone-btn ${phoneSelected ? 'focused' : ''}`}>Phone Number</button>
        </div>
        
        {emailSelected && 
          <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className='sp2-input-info' placeholder='Email Address' required/>
        }

        {phoneSelected && 
          <div className='sp2-pnx-container'>
            <p className='sp3-pn-prefix'>+63</p> 
            <input type="number" value={loginPhoneNum} onChange={handlePhoneNumber} className='sp2-input-info' placeholder='Phone Number' required/>
          </div>
        }

        <div className={`sp3-pass-tainer ${isPasswordFocused ? 'focused' : ''}`} onClick={() => setIsPasswordFocused(true)} onBlur={() => setIsPasswordFocused(false)} tabIndex={-1}>
          <input onChange={(e)=>setLoginPassword(e.target.value)} value={loginPassword} type={passwordType} placeholder='Create Your Password' required onBlur={() => setIsPasswordFocused(false)}/>
          <div onClick={togglePassword} className='sp3-showHidePass'>
            {passwordType === 'password' ? <IoIosEyeOff className='sp3-offPass'/> : <IoIosEye className='sp3-onPass'/>}
          </div>
        </div>

        <div className='sp3-password-validator'>
          {[...Array(5)].map((_, index) => (
            <span
              key={index}
              className={`sp3-line-password ${passedCount > index ? 'valid' : ''}`}
            ></span>
          ))}
        </div>

        <div className="sp3-password-rules">
          {isPasswordValid ? 
          <FaCheckCircle className='password-infocon-valid'/> :
          <AiOutlineInfoCircle className='password-infocon'/>
          }

          {!hasLowerCase ? 
            <p className='password-rules-txt'>Must include at least one lowercase letter (a–z)</p> :!hasUpperCase ? 
            <p className='password-rules-txt'>Must include at least one uppercase letter (A–Z)</p> : !hasMinLength ? 
            <p className='password-rules-txt'>Password must be at least 8 characters long</p> : !hasNumber ? 
            <p className='password-rules-txt'>Must include at least one number (0–9)</p> : !hasSpecialCharacter ? <p className='password-rules-txt'>Must include at least one special character (e.g. !@#$%^&*())</p> : isPasswordValid && <p className='password-rules-txt valid'>Strong password confirmed.</p> 
          }
        </div>
        
        <button className='LC-button' type="submit" disabled={!isPasswordValid || loading}>
        {loading ? 'Verifying...' : 'Verify Account'}</button>
        <button type="button" onClick={handleBackBtn} className='LC-button-next'>Back</button>
      </form>
      <OurPolicy/>
      <Infos/>
      <Footer/>
    </div>
  )
}

export default StepThreeCreateAccount
