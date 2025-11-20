import React, {useContext, useEffect, useState}from 'react'
import './Login.css'
import OurPolicy from '../components/OurPolicy.jsx'
import Infos from '../components/Infos.jsx'
import Footer from '../components/Footer.jsx'
import { ShopContext } from '../context/ShopContext.jsx'
import axios from 'axios'
import { toast } from "react-toastify";
import { IoIosEye } from "react-icons/io";
import { IoIosEyeOff } from "react-icons/io";
import Loading from '../components/Loading.jsx'

function Login() {
  const {loginToken, setLoginToken, loginIdentifier, setLoginIdentifier, navigate, backendUrl, toastSuccess, toastError} = useContext(ShopContext)

  // USERS ACCOUNT VARIABLES
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [passwordType, setPasswordType] = useState('password')
  const [password, setPassword] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);

  const signInComplete = identifier && password;

  const resetSignUpForm = () => {
    setPassword('');
    setIdentifier('');
  };

  const handleStateSignUp = () => {
    resetSignUpForm();  // Clear the form fields when switching states
    navigate('/signup')
  };

  const togglePassword = () => {
    setPasswordType((prevPasswordType) => 
      prevPasswordType === 'password' ? 'text' : 'password'
    );
  };
  
  const onSubmitHandler = async(e) => {
      e.preventDefault();

      setLoading(true);

      try {
        // LOGIN ACCOUNT
        const response = await axios.post(backendUrl + "/api/customer/login", {identifier, password});
        if (response.data.success) {
          setLoginToken(response.data.loginToken);
          localStorage.setItem('loginToken', response.data.loginToken);
          setLoginIdentifier(identifier);
          sessionStorage.setItem('loginIdentifier', identifier)
          toast.success(response.data.message, {...toastSuccess});
          navigate('/login-verification')

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

  return (
    <div className='signIn-main'>
      {loading && <Loading />}
      <form onSubmit={onSubmitHandler} className='signin-form'>
        <div className='signIn-tainer'>
          <p className='cs-text'>Sign In</p>
          <hr className='ca-color'/>
        </div>
        <input onChange={(e)=>setIdentifier(e.target.value)} value={identifier} type="text" className='li-input-account-page' placeholder='Email or phone' required/>
        
        <div className={`li-pass-tainer ${isPasswordFocused ? 'focused' : ''}`} onClick={() => setIsPasswordFocused(true)} onBlur={() => setIsPasswordFocused(false)} tabIndex={-1}>
          <input onChange={(e)=>setPassword(e.target.value)} value={password} type={passwordType} placeholder='Password' required onBlur={() => setIsPasswordFocused(false)}/>
          <div onClick={togglePassword} className='login-showHidePass'>
            {passwordType === 'password' ? <IoIosEyeOff className='login-offPass'/> : <IoIosEye className='login-onPass'/>}
          </div>
        </div>
        <div className='li-fp-main'>
            <button onClick={() => navigate('/forgot-password')}  className='li-fp-button'>Forgot Password?</button>
        </div>
        <button className='LI-button' disabled={loading || !signInComplete}>{loading ? 'Signing in…' : 'Sign In'}</button>
        <button type="button"  onClick={() => handleStateSignUp()} className='LI-button-next'>Create an Account</button>
      </form>
      <OurPolicy/>
      <Infos/>
      <Footer/>
    </div>
  )
}

export default Login
