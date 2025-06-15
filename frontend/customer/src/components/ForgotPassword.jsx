import React, { useContext, useState } from 'react'
import { ShopContext } from '../context/ShopContext.jsx'
import axios from 'axios'
import { toast } from "react-toastify";
import OurPolicy from '../components/OurPolicy.jsx'
import Infos from '../components/Infos.jsx'
import Footer from '../components/Footer.jsx'
import './ForgotPassword.css'

const ForgotPassword = () => {
  const {toastSuccess, toastError, navigate, setEmailVerification, backendUrl} = useContext(ShopContext);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async(event) => {
    event.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.", {...toastError});
      return;
    }

    setLoading(true); // LOADING

    try {
        const response = await axios.post(backendUrl + '/api/user/forgot-password/verify-email', {email});
        if (response.data.success) {
          toast.success(response.data.message, {...toastSuccess});
          sessionStorage.setItem('emailVerification', email);
          setEmailVerification(email);
          navigate('/verify-code')
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
  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] upthis-f'>
      <form onSubmit={handleSubmit} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
        <div className='inline-flex items-center gap-2 mb-3 mt-10 '>
          <p className='em-text'>Forgot Password</p>
        </div>
        <input onChange={(e)=>setEmail(e.target.value)} value={email} type="email" className='w-full px-3 py-2 input-email-page' placeholder='Enter your Email Address' required/>
        <button type='submit' className='SVC-button' disabled>{loading ? 'Sending...' : 'Send Verification Code'}</button>
        {loading && <div className="loaderFP"></div>}
      </form>
      <OurPolicy/>
      <Infos/>
      <Footer/>
    </div>
  )
}

export default ForgotPassword
