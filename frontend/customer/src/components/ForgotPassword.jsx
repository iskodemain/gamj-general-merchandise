import React, { useContext, useState } from 'react'
import { ShopContext } from '../context/ShopContext.jsx'
import axios from 'axios'
import { toast } from "react-toastify";
import OurPolicy from '../components/OurPolicy.jsx'
import Infos from '../components/Infos.jsx'
import Footer from '../components/Footer.jsx'
import './ForgotPassword.css'
import Loading from './Loading.jsx';

const ForgotPassword = () => {
  const {toastSuccess, toastError, navigate, backendUrl, fpIdentifier, setFpIdentifier} = useContext(ShopContext);
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmitFp = async(e) => {
    e.preventDefault();
    if (!identifier) {
      toast.error("Please enter your email or phone number.", {...toastError});
      return;
    }

    setLoading(true); // LOADING

    try {
        const response = await axios.post(backendUrl + '/api/customer/forgot-password', {identifier});
        if (response.data.success) {
          setFpIdentifier(identifier);
          sessionStorage.setItem('fpIdentifier', identifier);
          toast.success(response.data.message, {...toastSuccess});
          navigate('/reset-verify-code');
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
    <div className='fp-main'>
      {loading && <Loading />}
      <form onSubmit={handleSubmitFp} className='fp-form'>
        <div className='fp-title'>
          <p className='em-text'>Forgot Password</p>
        </div>
        <input onChange={(e)=>setIdentifier(e.target.value)} value={identifier} type="text" className='fp-input-identifier-page' placeholder='Enter your email or phone number' required/>
        <button type='submit' className='fp-button' disabled={loading}>{loading ? 'Sending...' : 'Send Verification Code'}</button>
      </form>
      <OurPolicy/>
      <Infos/>
      <Footer/>
    </div>
  )
}

export default ForgotPassword
