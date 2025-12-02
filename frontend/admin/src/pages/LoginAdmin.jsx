import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginAdmin.css";
import { assets } from "../assets/assets.js";
import { AdminContext } from "../context/AdminContextProvider.jsx";
import { IoIosEye } from "react-icons/io";
import { IoIosEyeOff } from "react-icons/io";
import Loading from "../../../customer/src/components/Loading.jsx";


function LoginAdmin() {
  const {adminLogin, loginIdentifier, setLoginIdentifier} = useContext(AdminContext);
  const [passwordType, setPasswordType] = useState('password')
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);



  const togglePassword = () => {
    setPasswordType((prevPasswordType) => 
      prevPasswordType === 'password' ? 'text' : 'password'
    );
  };

  const resetSignUpForm = () => {
    setPassword('');
    setLoginIdentifier('');
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    const isSuccess = await adminLogin(loginIdentifier, password);
    setLoading(false);
    if (isSuccess) {
      resetSignUpForm();
    }
    
  };


  return (
    <div className="login-bg">
      {loading && <Loading />}
      <div className="login-card">
        <h2 className="login-title">Log In</h2>
        <div className="login-logo">
          <div className="logo-icon">
            <img src={assets.gamj_logo} alt="Gamj shop" />
          </div>
          <span className="brand-name">
            GAMJ <b className="shop-name">SHOP</b>
          </span>
        </div>

        {/*  Login Form  */}
        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-label">
            <input type="text" className="login-input" placeholder="Enter your email or phone" autoComplete="username" value={loginIdentifier} onChange={(e) => setLoginIdentifier(e.target.value)} required/>
          </label>
          <label className="login-label">
            <div className="password-input-wrapper">
              <input type={passwordType} className="pass-input" placeholder="Enter you password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)}required/>
              <div onClick={togglePassword} className='login-showHidePass'>
                {passwordType === 'password' ? <IoIosEyeOff className='login-offPass'/> : <IoIosEye className='login-onPass'/>}
              </div>
            </div>
          </label>
          <button className="sign-in-btn" type="submit">Log In</button>
        </form>
      </div>
    </div>
  );
}
export default LoginAdmin;