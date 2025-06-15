import React, { useContext, useState } from 'react'
import { ShopContext } from '../context/ShopContext.jsx'
import axios from 'axios'
import { toast } from "react-toastify";
import OurPolicy from '../components/OurPolicy.jsx'
import Infos from '../components/Infos.jsx'
import Footer from '../components/Footer.jsx'
import './ResetPassword.css'
import { IoIosEye } from "react-icons/io";
import { IoIosEyeOff } from "react-icons/io";

const ResetPassword = () => {
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [passwordType, setPasswordType] = useState('password')

  const {toastSuccess, toastError, navigate, emailVerification, setEmailVerification, backendUrl, code, setCode} = useContext(ShopContext);

  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  

  const handleNewPassword  = async(event) => {
    event.preventDefault();
    if (!newPassword) {
      toast.error("Please enter your new password.", {...toastError});
      return;
    }

    setLoading(true); // LOADING

    try {
        const response = await axios.post(backendUrl + '/api/user/forgot-password/reset-password', {email: emailVerification, code, newPassword});
        const codeExpired = response.data.message;
        if (response.data.success) {
          toast.success(response.data.message, {...toastSuccess});
          setEmailVerification('');
          setCode('');
          sessionStorage.removeItem('emailVerification');
          sessionStorage.removeItem('code');
          navigate('/login')
        } else if(codeExpired === 'Verification code has expired. Please request a new one.') {
          toast.error(response.data.message, { ...toastError });
          setCode('');
          setEmailVerification('');
          sessionStorage.removeItem('emailVerification');
          sessionStorage.removeItem('code');
        }
        else {
          toast.error(response.data.message, { ...toastError });
        }
    } catch (error) {
      console.log(error);
      toast.error(error.message, {...toastError});
    } finally {
      setLoading(false);
    }
  }

  const togglePassword = () => {
    setPasswordType((prevPasswordType) => 
      prevPasswordType === 'password' ? 'text' : 'password'
    );
  };

  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] upthis-p'>
      <form onSubmit={handleNewPassword} className='flex flex-col items-center w-[90%] m-auto mt-14 gap-4 text-gray-800
      formsizerp'>
        <div className='items-center mt-10 rp-container'>
          <p className='rp-text'>Choose New Password</p>
          <p className='rp-textsm'>Choose a new Strong Password for Your Account:</p>
        </div>

    

        <div className={`w-full px-3 py-2 input-password-page ${isPasswordFocused ? 'focused' : ''}`}   onClick={() => setIsPasswordFocused(true)} onBlur={() => setIsPasswordFocused(false)}  tabIndex={-1}>
          <input onChange={(e)=>setNewPassword(e.target.value)}  value={newPassword} type={passwordType} placeholder='Enter New Password (at least 8 characters)' onBlur={() => setIsPasswordFocused(false)} required/>
          <div onClick={togglePassword} className='showHidePassC'>
            {passwordType === 'password' ? <IoIosEyeOff /> : <IoIosEye />}
          </div>
        </div>

        <div className='required-container'>
          <p className='ntrp-text'>Minimum of 8 characters and includes the following:</p>
          <p className='required-rp'>• Include at least one uppercase letter (A-Z) <br />• Include at least one lowercase letter (a-z) <br />• Include at least one number (0-9) <br />• Include at least one special character (e.g., !, @, #, $)</p>
        </div>

        <button type='submit' className='RP-button' disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</button>
        {loading && <div className="loaderRP"></div>}
      </form>
      <OurPolicy/>
      <Infos/>
      <Footer/>
    </div>
  )
}

export default ResetPassword
