import React, { useContext, useState, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext.jsx'
import axios from 'axios'
import { toast } from "react-toastify";
import OurPolicy from '../components/OurPolicy.jsx'
import Infos from '../components/Infos.jsx'
import Footer from '../components/Footer.jsx'
import './AccountVerifyCode.css'

const VerifyCode = () => {
  const {toastSuccess, toastError, navigate, backendUrl, emailAccountCreate, setEmailAccountCreate, setToken, token} = useContext(ShopContext);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState('');
  const handleVerify  = async(event) => {
    event.preventDefault();
    if (!code) {
      toast.error("Please enter your verification code.", {...toastError});
      return;
    }

    setLoading(true); // LOADING

    try {
        const response = await axios.post(backendUrl + '/api/user/register/verify', {email: emailAccountCreate, code});
        const codeExpired = response.data.message;
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem('token', response.data.token);
          toast.success(response.data.message, {...toastSuccess});
          setEmailAccountCreate('');
        } else if(codeExpired === 'Verification code expired. Please register again.') {
          toast.error(response.data.message, {...toastError});
          setEmailAccountCreate('');
          navigate('/login');
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

  useEffect(() => {
      if (token) {
        navigate('/')
      }
    }, [token])

  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] upthis-v'>
      <form onSubmit={handleVerify} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
        <div className='items-center mt-10 vc-container'>
          <p className='vc-text'>Verify Email Address</p>
          <p className='vc-textsm'>Enter the verification code sent to your email: <span className='valid-email'>{emailAccountCreate}</span></p>
        </div>
        <input onChange={(e)=>setCode(e.target.value)} value={code} type="number" className='w-full px-3 py-2 input-code-page' placeholder='Enter the 6-digit code sent to your email' required/>
        <button type='submit' className='VC-button' disabled={loading}>{loading ? 'Verifying...' : 'Verify Code'}</button>
        {loading && <div className="loaderVC"></div>}
      </form>
      <OurPolicy/>
      <Infos/>
      <Footer/>
    </div>
  )
}

export default VerifyCode
