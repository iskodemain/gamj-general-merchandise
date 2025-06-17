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


// NOTE: MAKE SURE NA SAME YUNG VARIABLE NAME NG (USERS ACCOUNT VARIABLES) SA BACKEND MO HANGGANG DITO. FROM DATABASE, VARIABLE SA SERVER HANGGANG DITO SA FRONTEND.
function Login() {
  const [currentState, setCurrentState] = useState('Login');
  const {token, setToken, navigate, backendUrl, toastSuccess, toastError, setEmailAccountCreate} = useContext(ShopContext)

  // USERS ACCOUNT VARIABLES
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [passwordType, setPasswordType] = useState('password')
  const [user_name, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setEmail('');
  };
  
  const onSubmitHandler = async(event) => {
      event.preventDefault();

      setLoading(true);

      try {
        if (currentState === "Create Account") {
          // CREATE ACCOUNT
          const response = await axios.post(backendUrl + "/api/user/register", {user_name, email, password});
          if (response.data.success) {
            setEmailAccountCreate(email);
            toast.success(response.data.message, {...toastSuccess});
            navigate('/account-verification')
          } else {
            toast.error(response.data.message, {...toastError});
          }
        } else {
          // LOGIN ACCOUNT
          const response = await axios.post(backendUrl + "/api/user/login", {email, password})
          if (response.data.success) {
            window.location.reload()
            setToken(response.data.token);
            localStorage.setItem('token', response.data.token);
            toast.success(response.data.message, {...toastSuccess});
          } else {
            toast.error(response.data.message, {...toastError});
          }

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

  const handleStateSwitch = (newState) => {
    setCurrentState(newState);
    resetForm();  // Clear the form fields when switching states
  };

  const togglePassword = () => {
    setPasswordType((prevPasswordType) => 
      prevPasswordType === 'password' ? 'text' : 'password'
    );
  };

  return (
    
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] upthis'>
      <form onSubmit={onSubmitHandler} className='flex flex-col items-center w-[90%] m-auto gap-4 text-gray-800 formsize'>
        <div className='inline-flex items-center gap-2 mb-2 mt-10 '>
          <p className='cs-text'>{currentState}</p>
          <hr className='border-none h-[3px] w-8 ml-1 ca-color'/>
        </div>
        {currentState === "Login" ? "" : <input onChange={(e)=>setUsername(e.target.value)} value={user_name} type="text" className='w-full px-3 py-2 input-account-page' placeholder='Username' required/>}
        <input onChange={(e)=>setEmail(e.target.value)} value={email} type="email" className='w-full px-3 py-2 input-account-page' placeholder='Email' required/>


      <div className={`w-full px-3 py-2 pass-tainer ${isPasswordFocused ? 'focused' : ''}`} onClick={() => setIsPasswordFocused(true)} onBlur={() => setIsPasswordFocused(false)} tabIndex={-1}>
        <input onChange={(e)=>setPassword(e.target.value)} value={password} type={passwordType} placeholder='Password' required onBlur={() => setIsPasswordFocused(false)}/>
        <div onClick={togglePassword} className='showHidePass'>
          {passwordType === 'password' ? <IoIosEyeOff /> : <IoIosEye />}
        </div>
      </div>


        <div className='w-full flex justify-between text-sm button-bottom'>
          {
            currentState === "Create Account" ? 
            <div>
              <p className='nt-text'>Minimum of 8 characters and includes the following:</p>
              <p className='required'>• Include at least one uppercase letter (A-Z) <br />• Include at least one lowercase letter (a-z) <br />• Include at least one number (0-9) <br />• Include at least one special character (e.g., !, @, #, $)</p>
            </div>
            : ""
          }
          {currentState === 'Login' && (
            <button 
              onClick={() => navigate('/forgot-password')} 
              className='ft-button'
            >
              Forgot Password?
            </button>
          )}
        </div>
        {currentState === "Create Account" ? (
          <>
            <button className='LC-button' disabled>{loading ? 'Verifying...' : 'Create an Account'}</button>
            {loading && <div className="loaderCA"></div>}
            <button onClick={() => handleStateSwitch("Login")} className='LC-button-next'>Login Here</button>
          </>
        ) : (
          <>
            <button className='LC-button' disabled>Sign In</button>
            <button onClick={() => handleStateSwitch("Create Account")} className='LC-button-next'>Create an Account</button>
          </>
        )}
      </form>
      <OurPolicy/>
      <Infos/>
      <Footer/>
    </div>
  )
}

export default Login
