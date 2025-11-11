import axios from "axios"
import React, { useState } from 'react'
import { createContext } from 'react';
import { useNavigate } from "react-router-dom";
import { Bounce, toast } from "react-toastify";
import { TbCurrencyPeso } from "react-icons/tb";
import { io } from "socket.io-client"

export const AdminContext = createContext();
const AdminContextProvider = (props) => {
  const currency = <TbCurrencyPeso className="peso-sign"/>; 
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const socket = io(backendUrl);

  const [token, setToken] = useState(() => localStorage.getItem('adminAuthToken') || '');
  const [loginToken, setLoginToken] = useState(() => localStorage.getItem('adminLoginToken') || '');
  const [loginIdentifier, setLoginIdentifier] = useState(() => sessionStorage.getItem('adminLoginIdentifier') || '');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


  /*--------------------------ADMIN LOGIN---------------------------*/
  const adminLogin = async (identifier, password) => {
    try {
        const payload = {identifier, password};
        const response = await axios.post(backendUrl + "/api/admin/login", payload);

        if (response.data.success) {
          setLoginToken(response.data.loginToken);
          localStorage.setItem('adminLoginToken', response.data.loginToken);
          setLoginIdentifier(identifier);
          sessionStorage.setItem('adminLoginIdentifier', identifier)
          toast.success(response.data.message, { ...toastSuccess });
          navigate("/verify");
          return true;

        } else {
            toast.error(response.data.message, { ...toastError });
        }
    } catch (error) {
        console.log(error);
        toast.error(error.message, { ...toastError });
    }
  };

  /*--------------------------ADMIN LOGIN VERIFY---------------------------*/
  const adminLoginVerify = async (loginToken, code) => {
    try {
        const payload = {loginToken, code};
        const response = await axios.post(backendUrl + "/api/admin/login/verify", payload);

        if (response.data.success) {
          setLoginToken('');
          localStorage.removeItem('adminLoginToken');
          setLoginIdentifier('');
          sessionStorage.removeItem('adminLoginIdentifier');
          localStorage.setItem("adminAuthToken", response.data.token);
          setToken(response.data.token);
          toast.success(response.data.message, { ...toastSuccess });
          navigate("/overview");
          return true

        } else {
            toast.error(response.data.message, { ...toastError });
        }
    } catch (error) {
        console.log(error);
        toast.error(error.message, { ...toastError });
    }
  };


  
  /*-----------------------TOAST---------------------*/
  const toastSuccess = {
      position: "top-center", autoClose: 3000, hideProgressBar: true, closeOnClick: false, pauseOnHover: false, draggable: true, progress: 0, theme: "light", transition: Bounce
  }
  const toastError = {
      position: "top-center", autoClose: 3000, hideProgressBar: true, closeOnClick: false, pauseOnHover: false, draggable: true, progress: 0, theme: "light", transition: Bounce
  }

  const value = {
    navigate, toastSuccess, toastError, backendUrl, currency, adminLogin, loginIdentifier, setLoginIdentifier, loginToken, adminLoginVerify, isSidebarOpen, setIsSidebarOpen, setToken, token
  }  
  return (
    <AdminContext.Provider value={value}>
        {props.children}
    </AdminContext.Provider>
  )
}

export default AdminContextProvider
